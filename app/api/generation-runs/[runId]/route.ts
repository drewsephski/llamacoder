import { z } from "zod";

import { getCurrentSession } from "@/features/auth/server/session";
import { releaseCreditHold } from "@/lib/billing";
import { getPrisma } from "@/lib/prisma";

const updateSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("cancel") }),
  z.object({
    action: z.literal("complete"),
    assistantMessageId: z.string().min(1),
  }),
]);

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
  });
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

  if (parsed.data.action === "cancel") {
    if (run.creditHoldId) await releaseCreditHold({ holdId: run.creditHoldId });
    await getPrisma().generationRun.update({
      where: { id: run.id },
      data: { status: "cancelled", completedAt: new Date() },
    });
    return Response.json({ status: "cancelled" });
  }

  await getPrisma().generationRun.update({
    where: { id: run.id },
    data: {
      status: "completed",
      assistantMessageId: parsed.data.assistantMessageId,
      completedAt: new Date(),
    },
  });
  return Response.json({ status: "completed" });
}
