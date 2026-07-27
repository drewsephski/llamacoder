import { z } from "zod";

import { getCurrentSession } from "@/features/auth/server/session";
import {
  finalizeOwnedGenerationRun,
  GenerationWorkflowError,
} from "@/features/generation/server/workflow";
import { releaseCreditHold } from "@/lib/billing";
import { getPrisma } from "@/lib/prisma";

const updateSchema = z.object({ action: z.literal("cancel") }).strict();

async function getOwnedRun(runId: string, userId: string) {
  return getPrisma().generationRun.findFirst({
    where: { id: runId, userId },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const session = await getCurrentSession();
  if (!session) return Response.json({ message: "Unauthorized" }, { status: 401 });

  const { runId } = await params;
  const run = await getOwnedRun(runId, session.user.id);
  if (!run) return Response.json({ message: "Run not found" }, { status: 404 });

  return Response.json({
    id: run.id,
    messageId: run.messageId,
    status: run.status,
    phase: run.phase,
    label: run.label,
    partialText: run.partialText,
    creditHoldId: run.creditHoldId,
    errorMessage: run.errorMessage,
    assistantMessageId: run.assistantMessageId,
  });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const session = await getCurrentSession();
  if (!session) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { runId } = await params;
  try {
    const message = await finalizeOwnedGenerationRun({
      runId,
      userId: session.user.id,
    });
    return Response.json({ message });
  } catch (error) {
    if (error instanceof GenerationWorkflowError) {
      const status =
        error.code === "RUN_NOT_FOUND"
          ? 404
          : error.code === "RUN_FINALIZING"
            ? 409
            : error.code === "INSUFFICIENT_CREDITS"
              ? 402
              : 422;
      return Response.json(
        { error: error.code, message: error.message },
        { status },
      );
    }

    const message =
      error instanceof Error ? error.message : "Unable to finalize generation";
    return Response.json({ message }, { status: 422 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const session = await getCurrentSession();
  if (!session) return Response.json({ message: "Unauthorized" }, { status: 401 });

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ message: "Invalid request" }, { status: 400 });

  const { runId } = await params;
  const run = await getOwnedRun(runId, session.user.id);
  if (!run) return Response.json({ message: "Run not found" }, { status: 404 });

  if (run.creditHoldId) await releaseCreditHold({ holdId: run.creditHoldId });
  await getPrisma().generationRun.update({
    where: { id: run.id },
    data: { status: "cancelled", completedAt: new Date() },
  });
  return Response.json({ status: "cancelled" });
}
