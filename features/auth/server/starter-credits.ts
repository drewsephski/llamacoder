import "server-only";

import { getPrisma } from "@/lib/prisma";

export const STARTER_CREDITS = 5;

export async function grantStarterCredits(userId: string) {
  const prisma = getPrisma();
  const dedupeKey = `welcome:${userId}`;

  return prisma.$transaction(async (tx) => {
    const existingGrant = await tx.creditGrant.findUnique({
      where: { dedupeKey },
      select: { id: true },
    });
    if (existingGrant) return false;

    await tx.creditGrant.create({
      data: {
        userId,
        amount: STARTER_CREDITS,
        remainingAmount: STARTER_CREDITS,
        type: "bonus",
        dedupeKey,
        description: "Welcome bonus - verified account credits",
      },
    });
    await tx.user.update({
      where: { id: userId },
      data: { credits: { increment: STARTER_CREDITS } },
    });
    await tx.creditHistory.create({
      data: {
        userId,
        amount: STARTER_CREDITS,
        type: "subscription",
        description: "Welcome bonus - verified account credits",
      },
    });
    return true;
  });
}
