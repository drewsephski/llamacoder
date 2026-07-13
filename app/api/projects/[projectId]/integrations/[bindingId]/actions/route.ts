import { NextResponse } from "next/server";

import { getCurrentSession } from "@/features/auth/server/session";
import { integrationActionInputSchema } from "@/features/integrations/contracts";
import {
  executeIntegrationAction,
  refreshIntegrationOperation,
} from "@/features/integrations/server/actions";
import { integrationErrorResponse } from "@/features/integrations/server/http";
import { consumeRateLimit } from "@/features/security/server/rate-limit";

type RouteContext = {
  params: Promise<{ projectId: string; bindingId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Sign in to use integrations." },
      { status: 401 },
    );
  }
  const operationId = new URL(request.url).searchParams.get("operationId");
  if (!operationId) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Operation ID is required." },
      { status: 400 },
    );
  }
  try {
    const { projectId, bindingId } = await context.params;
    const operation = await refreshIntegrationOperation({
      projectId,
      bindingId,
      operationId,
      userId: session.user.id,
    });
    return NextResponse.json({ operation });
  } catch (error) {
    return integrationErrorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Sign in to use integrations." },
      { status: 401 },
    );
  }
  const rateLimit = await consumeRateLimit({
    userId: session.user.id,
    operation: "integration",
    limit: 10,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "RATE_LIMITED",
        message: "Too many provider operations. Try again shortly.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }
  const parsed = integrationActionInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid provider action." },
      { status: 400 },
    );
  }
  try {
    const { projectId, bindingId } = await context.params;
    const operation = await executeIntegrationAction({
      projectId,
      bindingId,
      userId: session.user.id,
      action: parsed.data,
    });
    return NextResponse.json({ operation });
  } catch (error) {
    return integrationErrorResponse(error);
  }
}
