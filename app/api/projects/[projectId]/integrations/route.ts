import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createProjectIntegrationSchema } from "@/features/integrations/contracts";
import { integrationErrorResponse } from "@/features/integrations/server/http";
import {
  createProjectIntegration,
  getIntegrationWorkspace,
} from "@/features/integrations/server/service";
import { consumeRateLimit } from "@/features/security/server/rate-limit";
import { auth } from "@/lib/auth";

type RouteContext = { params: Promise<{ projectId: string }> };

async function getSessionUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Sign in to manage integrations." },
      { status: 401 },
    );
  }

  try {
    const { projectId } = await context.params;
    return NextResponse.json(
      await getIntegrationWorkspace({ projectId, userId }),
    );
  } catch (error) {
    return integrationErrorResponse(error);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Sign in to manage integrations." },
      { status: 401 },
    );
  }

  const rateLimit = await consumeRateLimit({
    userId,
    operation: "integration",
    limit: 30,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "RATE_LIMITED",
        message: "Too many integration changes. Try again shortly.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const parsed = createProjectIntegrationSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid integration setup." },
      { status: 400 },
    );
  }

  try {
    const { projectId } = await context.params;
    const integration = await createProjectIntegration({
      projectId,
      userId,
      ...parsed.data,
    });
    return NextResponse.json({ integration }, { status: 201 });
  } catch (error) {
    return integrationErrorResponse(error);
  }
}
