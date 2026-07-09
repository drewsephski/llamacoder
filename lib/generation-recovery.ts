import { getPrisma } from "@/lib/prisma";
import type { Prisma, PrismaClient } from "@prisma/client";

type GenerationRecoveryClient = PrismaClient | Prisma.TransactionClient;

export const GENERATION_LOCK_STALE_AFTER_MS = 30 * 60 * 1000;

export async function recoverStaleGenerationLocks({
  client,
  now = new Date(),
  staleAfterMs = GENERATION_LOCK_STALE_AFTER_MS,
}: {
  client?: GenerationRecoveryClient;
  now?: Date;
  staleAfterMs?: number;
} = {}) {
  const prisma = client ?? getPrisma();
  const staleBefore = new Date(now.getTime() - staleAfterMs);

  const result = await prisma.chat.updateMany({
    where: {
      hasCode: false,
      generationStatus: "in_progress",
      generationStartedAt: { lte: staleBefore },
    },
    data: {
      generationStatus: "idle",
      generationStartedAt: null,
    },
  });

  return { recoveredLocks: result.count };
}
