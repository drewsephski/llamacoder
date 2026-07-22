import { NextResponse } from "next/server";

import {
  chatSupabaseSetupActionSchema,
  chatSupabaseSetupViewSchema,
} from "@/features/integrations/chat-supabase-setup";
import {
  executeChatSupabaseSetupAction,
  getChatSupabaseSetupView,
} from "@/features/integrations/server/chat-supabase-setup";
import { integrationErrorResponse } from "@/features/integrations/server/http";
import { getCurrentSession } from "@/features/auth/server/session";
import { consumeRateLimit } from "@/features/security/server/rate-limit";

type RouteContext = {
  params: Promise<{ projectId: string; interactionId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Sign in to continue setup." },
      { status: 401 },
    );
  }
  try {
    const { projectId, interactionId } = await context.params;
    const view = await getChatSupabaseSetupView({
      projectId,
      interactionId,
      userId: session.user.id,
    });
    return NextResponse.json(chatSupabaseSetupViewSchema.parse(view));
  } catch (error) {
    return integrationErrorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Sign in to continue setup." },
      { status: 401 },
    );
  }
  const parsed = chatSupabaseSetupActionSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid setup action." },
      { status: 400 },
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
      { error: "RATE_LIMITED", message: "Too many setup actions." },
      { status: 429 },
    );
  }
  try {
    const { projectId, interactionId } = await context.params;
    const operation = await executeChatSupabaseSetupAction({
      projectId,
      interactionId,
      userId: session.user.id,
      action: parsed.data,
    });
    return NextResponse.json({ operation });
  } catch (error) {
    return integrationErrorResponse(error);
  }
}
