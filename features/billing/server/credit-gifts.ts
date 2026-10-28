import "server-only";

import { getPrisma } from "@/lib/prisma";

// Operator-approved gifts. Keep recipient addresses on the server.
const gifts = new Map([
  [
    "samstehno@outlook.com",
    { key: "drew-sam-2026-10-28", amount: 25, sender: "Drew" },
  ],
]);

export async function claimCreditGift(userId: string) {
  const prisma = getPrisma();
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { email: true, emailVerified: true },
    });
    if (!user?.emailVerified) return null;
    const gift = gifts.get(user.email.trim().toLowerCase());
    if (!gift) return null;

    const description = `${gift.sender} personally gave you ${gift.amount} free credits.`;
    const inserted = await tx.creditGrant.createMany({
      data: [
        {
          userId,
          amount: gift.amount,
          remainingAmount: gift.amount,
          type: "bonus",
          description,
          dedupeKey: `gift:${gift.key}`,
          grossRevenueUsd: 0,
          netRevenueUsd: 0,
          unitRevenueUsd: 0,
        },
      ],
      skipDuplicates: true,
    });
    if (inserted.count === 1) {
      await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: gift.amount } },
      });
      await tx.creditHistory.create({
        data: { userId, amount: gift.amount, type: "bonus", description },
      });
    }
    return {
      id: gift.key,
      amount: gift.amount,
      sender: gift.sender,
      message: description,
    };
  });
}
