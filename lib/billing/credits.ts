import { getPrisma } from "@/lib/prisma";
import { FREE_MODEL } from "@/lib/constants";
import type { Prisma, PrismaClient } from "@prisma/client";
import {
  FREE_PROJECT_LIMIT,
  TIERS,
  getModelCreditCost,
  normalizeTier,
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

export type ProjectCreationEligibility =
  | {
      success: true;
      projectCount: number;
      projectLimit: number | null;
      projectsRemaining: number | null;
      credits: number;
      modelCost: number;
      hasActiveSubscription: boolean;
    }
  | {
      success: false;
      error:
        | "PROJECT_LIMIT_REACHED"
        | "INSUFFICIENT_CREDITS"
        | "FORBIDDEN_MODEL"
        | "USER_NOT_FOUND";
      projectCount: number;
      projectLimit: number | null;
      projectsRemaining: number | null;
      credits: number;
      modelCost: number;
      hasActiveSubscription: boolean;
    };

type BillingClient = PrismaClient | Prisma.TransactionClient;

async function checkCreditAccess({
  client,
  userId,
  modelId,
}: {
  client: BillingClient;
  userId: string;
  modelId: string;
}): Promise<CreditCheckResult> {
  const creditCost = getModelCreditCost(modelId);

  const user = await client.user.findUnique({
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
    return { success: false, error: "USER_NOT_FOUND" };
  }

  const hasActiveSubscription = user.subscription?.status === "active";
  const tier = hasActiveSubscription
    ? normalizeTier(user.subscription?.tier)
    : "free";

  const tierConfig = TIERS[tier];
  if (tierConfig.allowedModels !== "all") {
    const isAllowed = tierConfig.allowedModels.includes(modelId);
    if (!isAllowed) {
      return { success: false, error: "FORBIDDEN_MODEL" };
    }
  }

  if (user.credits < creditCost) {
    return { success: false, error: "INSUFFICIENT_CREDITS" };
  }

  return {
    success: true,
    creditsUsed: creditCost,
    remainingCredits: user.credits,
  };
}

export async function checkCreditAvailability({
  userId,
  modelId,
}: {
  userId: string;
  modelId: string;
}): Promise<CreditCheckResult> {
  const prisma = getPrisma();

  try {
    return await checkCreditAccess({ client: prisma, userId, modelId });
  } catch (error) {
    console.error("[CreditEngine] Error in checkCreditAvailability:", error);
    return { success: false, error: "INSUFFICIENT_CREDITS" };
  }
}

export async function checkProjectCreationEligibility({
  client,
  userId,
  modelId,
}: {
  client?: BillingClient;
  userId: string;
  modelId: string;
}): Promise<ProjectCreationEligibility> {
  const prisma = client ?? getPrisma();
  const modelCost = getModelCreditCost(modelId);

  try {
    const [projectCount, user] = await Promise.all([
      prisma.chat.count({
        where: { userId },
      }),
      prisma.user.findUnique({
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
      }),
    ]);

    if (!user) {
      return {
        success: false,
        error: "USER_NOT_FOUND",
        projectCount,
        projectLimit: null,
        projectsRemaining: null,
        credits: 0,
        modelCost,
        hasActiveSubscription: false,
      };
    }

    const hasActiveSubscription = user.subscription?.status === "active";
    const projectLimit = hasActiveSubscription ? null : FREE_PROJECT_LIMIT;
    const projectsRemaining =
      projectLimit === null ? null : Math.max(0, projectLimit - projectCount);

    const base = {
      projectCount,
      projectLimit,
      projectsRemaining,
      credits: user.credits,
      modelCost,
      hasActiveSubscription,
    };

    if (projectLimit !== null && projectCount >= projectLimit) {
      return {
        success: false,
        error: "PROJECT_LIMIT_REACHED",
        ...base,
      };
    }

    const tier = hasActiveSubscription
      ? normalizeTier(user.subscription?.tier)
      : "free";
    const tierConfig = TIERS[tier];

    if (tierConfig.allowedModels !== "all") {
      const isAllowed = tierConfig.allowedModels.includes(modelId);
      if (!isAllowed) {
        return {
          success: false,
          error: "FORBIDDEN_MODEL",
          ...base,
        };
      }
    }

    if (projectCount === 0 && tier === "free" && modelId === FREE_MODEL) {
      return {
        success: true,
        ...base,
      };
    }

    if (user.credits < modelCost) {
      return {
        success: false,
        error: "INSUFFICIENT_CREDITS",
        ...base,
      };
    }

    return {
      success: true,
      ...base,
    };
  } catch (error) {
    console.error(
      "[CreditEngine] Error in checkProjectCreationEligibility:",
      error,
    );
    return {
      success: false,
      error: "INSUFFICIENT_CREDITS",
      projectCount: 0,
      projectLimit: null,
      projectsRemaining: null,
      credits: 0,
      modelCost,
      hasActiveSubscription: false,
    };
  }
}

/**
 * Check and consume credits for a completed generation.
 *
 * All operations happen in a single atomic transaction to prevent race conditions.
 * Credits can never go negative due to the `credits: { gte: cost }` constraint.
 */
export async function checkAndConsumeCredits({
  userId,
  modelId,
  chatId,
  description,
  status = "pending",
  phase = "generation",
  tokensUsed,
}: {
  userId: string;
  modelId: string;
  chatId?: string;
  description?: string;
  status?: string;
  phase?: string;
  tokensUsed?: number;
}): Promise<CreditCheckResult> {
  const prisma = getPrisma();
  const creditCost = getModelCreditCost(modelId);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const access = await checkCreditAccess({
        client: tx,
        userId,
        modelId,
      });

      if (!access.success) {
        return access;
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
            description ||
            `AI generation - ${modelId.split("/").pop() || modelId}`,
          chatId: chatId || null,
        },
      });

      // Log generation for analytics
      await tx.generationLog.create({
        data: {
          userId,
          modelId,
          creditsUsed: creditCost,
          estimatedCredits: creditCost,
          actualCredits: creditCost,
          refundedCredits: 0,
          reason:
            description ||
            `AI generation - ${modelId.split("/").pop() || modelId}`,
          phase,
          tokensUsed,
          chatId: chatId || null,
          status,
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

export async function consumeCreditsForGeneration({
  client,
  userId,
  modelId,
  chatId,
  description,
  status = "completed",
  phase = "generation",
  tokensUsed,
}: {
  client: Prisma.TransactionClient;
  userId: string;
  modelId: string;
  chatId?: string;
  description?: string;
  status?: string;
  phase?: string;
  tokensUsed?: number;
}): Promise<CreditCheckResult> {
  const creditCost = getModelCreditCost(modelId);
  const access = await checkCreditAccess({ client, userId, modelId });

  if (!access.success) {
    return access;
  }

  const updateResult = await client.user.updateMany({
    where: {
      id: userId,
      credits: { gte: creditCost },
    },
    data: {
      credits: { decrement: creditCost },
    },
  });

  if (updateResult.count === 0) {
    return { success: false, error: "INSUFFICIENT_CREDITS" };
  }

  await client.creditHistory.create({
    data: {
      userId,
      amount: -creditCost,
      type: "usage",
      description:
        description || `AI generation - ${modelId.split("/").pop() || modelId}`,
      chatId: chatId || null,
    },
  });

  await client.generationLog.create({
    data: {
      userId,
      modelId,
      creditsUsed: creditCost,
      estimatedCredits: creditCost,
      actualCredits: creditCost,
      refundedCredits: 0,
      reason:
        description || `AI generation - ${modelId.split("/").pop() || modelId}`,
      phase,
      tokensUsed,
      chatId: chatId || null,
      status,
    },
  });

  const updatedUser = await client.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  return {
    success: true,
    creditsUsed: creditCost,
    remainingCredits: updatedUser?.credits ?? 0,
  };
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
    subscriptionEndsAt:
      user.subscription?.currentPeriodEnd?.toISOString() || null,
  };
}
