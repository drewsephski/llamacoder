import { getPrisma } from "@/lib/prisma";
import {
  MODEL_PRICING,
  TIERS,
  getModelCreditCost,
  normalizeTier,
  type TierKey,
} from "./config";

export type CreditCheckResult =
  | {
      success: true;
      creditsUsed: number;
      remainingCredits: number;
    }
  | {
      success: false;
      error: "INSUFFICIENT_CREDITS" | "FORBIDDEN_MODEL" | "USER_NOT_FOUND";
    };

/**
 * Check and consume credits for a generation.
 * This is the ONLY place where credits should be modified.
 *
 * All operations happen in a single atomic transaction to prevent race conditions.
 * Credits can never go negative due to the `credits: { gte: cost }` constraint.
 */
export async function checkAndConsumeCredits({
  userId,
  modelId,
  chatId,
  description,
}: {
  userId: string;
  modelId: string;
  chatId?: string;
  description?: string;
}): Promise<CreditCheckResult> {
  const prisma = getPrisma();
  const creditCost = getModelCreditCost(modelId);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Fetch user with subscription for model access check
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          credits: true,
          subscription: {
            select: {
              status: true,
              tier: true,
            },
          },
        },
      });

      if (!user) {
        return { success: false, error: "USER_NOT_FOUND" } as const;
      }

      // Determine effective tier
      const hasActiveSubscription = user.subscription?.status === "active";
      const tier = hasActiveSubscription
        ? normalizeTier(user.subscription?.tier)
        : "free";

      // Check if tier allows this model
      const tierConfig = TIERS[tier];
      if (tierConfig.allowedModels !== "all") {
        const isAllowed = tierConfig.allowedModels.includes(modelId);
        if (!isAllowed) {
          return { success: false, error: "FORBIDDEN_MODEL" } as const;
        }
      }

      // Check and deduct credits atomically
      // The updateMany with `credits: { gte: creditCost }` ensures no negative balances
      const updateResult = await tx.user.updateMany({
        where: {
          id: userId,
          credits: { gte: creditCost },
        },
        data: {
          credits: { decrement: creditCost },
        },
      });

      if (updateResult.count === 0) {
        return { success: false, error: "INSUFFICIENT_CREDITS" } as const;
      }

      // Create credit history record
      await tx.creditHistory.create({
        data: {
          userId,
          amount: -creditCost,
          type: "usage",
          description:
            description || `AI generation - ${modelId.split("/").pop() || modelId}`,
          chatId: chatId || null,
        },
      });

      // Log generation for analytics
      await tx.generationLog.create({
        data: {
          userId,
          modelId,
          creditsUsed: creditCost,
          chatId: chatId || null,
          status: "pending", // Will be updated after generation completes
        },
      });

      // Return new credit balance
      const updatedUser = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });

      return {
        success: true,
        creditsUsed: creditCost,
        remainingCredits: updatedUser?.credits ?? 0,
      } as const;
    });

    return result;
  } catch (error) {
    console.error("[CreditEngine] Error in checkAndConsumeCredits:", error);
    return { success: false, error: "INSUFFICIENT_CREDITS" };
  }
}

/**
 * Add credits to a user (for purchases, subscriptions, etc.).
 * Also creates a credit history record.
 */
export async function addCredits({
  userId,
  amount,
  type,
  description,
}: {
  userId: string;
  amount: number;
  type: "purchase" | "subscription" | "refund" | "bonus";
  description: string;
}): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const prisma = getPrisma();

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Add credits
      const user = await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: amount } },
        select: { credits: true },
      });

      // Create history record
      await tx.creditHistory.create({
        data: {
          userId,
          amount,
          type,
          description,
        },
      });

      return { success: true, newBalance: user.credits };
    });

    return result;
  } catch (error) {
    console.error("[CreditEngine] Error in addCredits:", error);
    return { success: false, error: "Failed to add credits" };
  }
}

/**
 * Get credit balance and tier info for a user.
 */
export async function getUserCreditInfo(userId: string) {
  const prisma = getPrisma();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      credits: true,
      subscription: {
        select: {
          status: true,
          tier: true,
          currentPeriodEnd: true,
        },
      },
    },
  });

  if (!user) return null;

  const hasActiveSubscription = user.subscription?.status === "active";
  const tier = hasActiveSubscription
    ? normalizeTier(user.subscription?.tier)
    : "free";

  return {
    credits: user.credits,
    tier,
    hasActiveSubscription,
    subscriptionEndsAt: user.subscription?.currentPeriodEnd?.toISOString() || null,
  };
}
