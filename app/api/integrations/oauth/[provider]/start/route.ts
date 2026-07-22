import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { integrationEnvironmentSchema } from "@/features/integrations/contracts";
import { integrationErrorResponse } from "@/features/integrations/server/http";
import {
  buildOAuthAuthorizationUrl,
  getOAuthProviderConfig,
  isOAuthProviderId,
} from "@/features/integrations/server/oauth-provider";
import {
  createOAuthState,
  createPkcePair,
  oauthCookieName,
} from "@/features/integrations/server/oauth-state";
import { assertIntegrationProjectAccess } from "@/features/integrations/server/service";
import { getChatSupabaseSetupView } from "@/features/integrations/server/chat-supabase-setup";
import { consumeRateLimit } from "@/features/security/server/rate-limit";
import { auth } from "@/lib/auth";

type RouteContext = { params: Promise<{ provider: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Sign in to connect integrations." },
      { status: 401 },
    );
  }

  const { provider: providerParam } = await context.params;
  if (!isOAuthProviderId(providerParam)) {
    return NextResponse.json(
      { error: "UNSUPPORTED_PROVIDER", message: "OAuth is not supported." },
      { status: 404 },
    );
  }
  const projectId = request.nextUrl.searchParams.get("projectId")?.trim();
  const interactionId = request.nextUrl.searchParams
    .get("interactionId")
    ?.trim();
  const environment = integrationEnvironmentSchema.safeParse(
    request.nextUrl.searchParams.get("environment"),
  );
  if (!projectId || !environment.success) {
    return NextResponse.json(
      {
        error: "INVALID_REQUEST",
        message: "Project and environment are required.",
      },
      { status: 400 },
    );
  }
  const config = getOAuthProviderConfig(providerParam);
  if (!config) {
    const providerDisplayName =
      providerParam === "github"
        ? "GitHub"
        : providerParam === "vercel"
          ? "Vercel"
          : "Supabase";
    return NextResponse.json(
      {
        error: "OAUTH_NOT_CONFIGURED",
        message: `${providerDisplayName} OAuth is not configured for this Squid environment.`,
      },
      { status: 503 },
    );
  }

  try {
    await assertIntegrationProjectAccess({
      projectId,
      userId: session.user.id,
    });
    if (providerParam === "supabase" && interactionId) {
      const setup = await getChatSupabaseSetupView({
        projectId,
        interactionId,
        userId: session.user.id,
      });
      if (
        setup.continuationStatus !== "pending" ||
        (setup.state !== "connection_required" &&
          setup.state !== "authorization_required" &&
          setup.state !== "failed")
      ) {
        return NextResponse.json(
          {
            error: "SETUP_STATE_CHANGED",
            message: "Supabase authorization is no longer required.",
          },
          { status: 409 },
        );
      }
    }
    const rateLimit = await consumeRateLimit({
      userId: session.user.id,
      operation: "integration",
      limit: 30,
      windowMs: 60_000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          message: "Too many integration authorization attempts.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        },
      );
    }

    const oauthState = createOAuthState({
      userId: session.user.id,
      projectId,
      providerId: providerParam,
      environment: environment.data,
      ...(providerParam === "supabase" && interactionId
        ? { interactionId }
        : {}),
    });
    const pkce = config.mode === "oauth_app" ? createPkcePair() : null;
    const response = NextResponse.redirect(
      buildOAuthAuthorizationUrl({
        config,
        state: oauthState.state,
        codeChallenge: pkce?.challenge,
      }),
    );
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 10 * 60,
      path: "/api/integrations/oauth",
    };
    response.cookies.set(
      oauthCookieName(providerParam, "nonce"),
      oauthState.nonce,
      cookieOptions,
    );
    if (pkce) {
      response.cookies.set(
        oauthCookieName(providerParam, "verifier"),
        pkce.verifier,
        cookieOptions,
      );
    }
    return response;
  } catch (error) {
    return integrationErrorResponse(error);
  }
}
