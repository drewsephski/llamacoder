import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  exchangeOAuthCode,
  getOAuthProviderConfig,
  isOAuthProviderId,
} from "@/features/integrations/server/oauth-provider";
import {
  oauthCookieName,
  verifyOAuthState,
} from "@/features/integrations/server/oauth-state";
import {
  completeOAuthProjectIntegration,
  testProjectIntegration,
} from "@/features/integrations/server/service";
import { auth } from "@/lib/auth";
import { domain } from "@/lib/domain";

type RouteContext = { params: Promise<{ provider: string }> };

function projectRedirect(
  projectId: string | null,
  result: "connected" | "attention" | "denied" | "failed",
) {
  const url = new URL(
    projectId ? `/chats/${encodeURIComponent(projectId)}` : "/dashboard",
    domain,
  );
  if (result === "connected" || result === "attention") {
    url.searchParams.set("integration", result);
  } else {
    url.searchParams.set("integration_error", result);
  }
  return url;
}

function clearOAuthCookies(
  response: NextResponse,
  providerId: "github" | "vercel",
) {
  response.cookies.set(oauthCookieName(providerId, "nonce"), "", {
    maxAge: 0,
    path: "/api/integrations/oauth",
  });
  response.cookies.set(oauthCookieName(providerId, "verifier"), "", {
    maxAge: 0,
    path: "/api/integrations/oauth",
  });
  return response;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { provider: providerParam } = await context.params;
  if (!isOAuthProviderId(providerParam)) {
    return NextResponse.redirect(projectRedirect(null, "failed"));
  }

  let projectId: string | null = null;
  try {
    const suppliedState = request.nextUrl.searchParams.get("state");
    if (!suppliedState) throw new Error("OAuth state is missing.");
    const state = verifyOAuthState(suppliedState);
    projectId = state.projectId;
    if (state.providerId !== providerParam) {
      throw new Error("OAuth provider does not match the signed state.");
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.id !== state.userId) {
      throw new Error("OAuth session does not match the signed state.");
    }
    const expectedNonce = request.cookies.get(
      oauthCookieName(providerParam, "nonce"),
    )?.value;
    if (!expectedNonce || expectedNonce !== state.nonce) {
      throw new Error("OAuth request cookie does not match the signed state.");
    }

    const providerError = request.nextUrl.searchParams.get("error");
    if (providerError) {
      return clearOAuthCookies(
        NextResponse.redirect(projectRedirect(projectId, "denied")),
        providerParam,
      );
    }
    const config = getOAuthProviderConfig(providerParam);
    if (!config) throw new Error("OAuth provider is not configured.");
    const installationId = request.nextUrl.searchParams.get("installation_id");
    const isGitHubAppInstallation =
      providerParam === "github" &&
      config.mode === "github_app" &&
      Boolean(installationId);
    const code = request.nextUrl.searchParams.get("code");
    if (!code && !isGitHubAppInstallation) {
      throw new Error("OAuth authorization code is missing.");
    }
    const codeVerifier = request.cookies.get(
      oauthCookieName(providerParam, "verifier"),
    )?.value;
    if (
      providerParam === "github" &&
      config.mode === "oauth_app" &&
      !codeVerifier
    ) {
      throw new Error("GitHub PKCE verifier is missing.");
    }

    const token = isGitHubAppInstallation
      ? { accessToken: undefined, scopes: [], metadata: {} }
      : await exchangeOAuthCode({ config, code: code!, codeVerifier });
    const tokenMetadata = token.metadata as Record<
      string,
      string | null | undefined
    >;
    const callbackMetadata: Record<string, string | null> =
      providerParam === "vercel"
        ? {
            teamId:
              request.nextUrl.searchParams.get("teamId") ??
              tokenMetadata.teamId ??
              null,
            configurationId:
              request.nextUrl.searchParams.get("configurationId") ?? null,
            vercelUserId: tokenMetadata.vercelUserId ?? null,
          }
        : isGitHubAppInstallation
          ? { installationId: installationId! }
          : {};
    const binding = await completeOAuthProjectIntegration({
      projectId: state.projectId,
      userId: state.userId,
      providerId: providerParam,
      environment: state.environment,
      accessToken: token.accessToken,
      scopes: token.scopes,
      metadata: callbackMetadata,
    });
    const tested = isGitHubAppInstallation
      ? binding
      : await testProjectIntegration({
          projectId: state.projectId,
          bindingId: binding.id,
          userId: state.userId,
        });
    return clearOAuthCookies(
      NextResponse.redirect(
        projectRedirect(
          projectId,
          tested.status === "ready" ? "connected" : "attention",
        ),
      ),
      providerParam,
    );
  } catch (error) {
    console.error(
      "Integration OAuth callback failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return clearOAuthCookies(
      NextResponse.redirect(projectRedirect(projectId, "failed")),
      providerParam,
    );
  }
}
