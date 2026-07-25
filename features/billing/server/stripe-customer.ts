import "server-only";

import { getPrisma } from "@/lib/prisma";

export function resolveExistingStripeCustomerId(user: {
  stripeCustomerId?: string | null;
  subscription?: { stripeCustomerId?: string | null } | null;
}) {
  return user.stripeCustomerId ?? user.subscription?.stripeCustomerId ?? null;
}

export async function persistStripeCustomerId({
  userId,
  customerId,
  subscriptionId,
}: {
  userId: string;
  customerId: string;
  subscriptionId?: string | null;
}) {
  const prisma = getPrisma();

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customerId },
  });

  if (subscriptionId) {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { stripeCustomerId: customerId },
    });
  }
}
