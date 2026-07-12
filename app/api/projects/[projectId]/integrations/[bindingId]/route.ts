import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { updateProjectIntegrationSchema } from "@/features/integrations/contracts";
import { integrationErrorResponse } from "@/features/integrations/server/http";
import {
  disconnectProjectIntegration,
  updateProjectIntegration,
} from "@/features/integrations/server/service";
import { consumeRateLimit } from "@/features/security/server/rate-limit";
import { auth } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ projectId: string; bindingId: string }>;
};

async function getAuthorizedUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const rateLimit = await consumeRateLimit({
    userId: session.user.id,
    operation: "integration",
    limit: 30,
    windowMs: 60_000,
  });
  return { userId: session.user.id, rateLimit };
}

function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      error: "RATE_LIMITED",
      message: "Too many integration changes. Try again shortly.",
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    },
  );
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authorized = await getAuthorizedUser();
  if (!authorized) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Sign in to manage integrations." },
      { status: 401 },
    );
  }
  if (!authorized.rateLimit.allowed) {
    return rateLimitResponse(authorized.rateLimit.retryAfterSeconds);
  }

  const parsed = updateProjectIntegrationSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid integration update." },
      { status: 400 },
    );
  }

  try {
    const { projectId, bindingId } = await context.params;
    const integration = await updateProjectIntegration({
      projectId,
      bindingId,
      userId: authorized.userId,
      ...parsed.data,
    });
    return NextResponse.json({ integration });
  } catch (error) {
    return integrationErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const authorized = await getAuthorizedUser();
  if (!authorized) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Sign in to manage integrations." },
      { status: 401 },
    );
  }
  if (!authorized.rateLimit.allowed) {
    return rateLimitResponse(authorized.rateLimit.retryAfterSeconds);
  }

  try {
    const { projectId, bindingId } = await context.params;
    await disconnectProjectIntegration({
      projectId,
      bindingId,
      userId: authorized.userId,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return integrationErrorResponse(error);
  }
}
