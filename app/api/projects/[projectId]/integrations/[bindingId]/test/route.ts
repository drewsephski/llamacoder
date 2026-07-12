import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { integrationErrorResponse } from "@/features/integrations/server/http";
import { testProjectIntegration } from "@/features/integrations/server/service";
import { consumeRateLimit } from "@/features/security/server/rate-limit";
import { auth } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ projectId: string; bindingId: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Sign in to test integrations." },
      { status: 401 },
    );
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
        message: "Too many integration checks. Try again shortly.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  try {
    const { projectId, bindingId } = await context.params;
    const integration = await testProjectIntegration({
      projectId,
      bindingId,
      userId: session.user.id,
    });
    return NextResponse.json({ integration });
  } catch (error) {
    return integrationErrorResponse(error);
  }
}
