import { getPrisma } from "@/lib/prisma";
import type { Prisma, PrismaClient } from "@prisma/client";
import {
  FREE_PROJECT_LIMIT,
  canTierUseModel,
  estimateOutputTokensFromText,
  estimateModelCostUsd,
  getCostBasedCreditCharge,
  getGenerationSizeBand,
  getModelCreditHoldCost,
  getModelCreditCost,
  hasModelPricing,
  MODEL_COST_OVERHEAD_MULTIPLIER,
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

export type CreditHoldResult =
  | {
      success: true;
      holdId: string;
      creditsUsed: number;
      remainingCredits: number;
    }
  | {
      success: false;
      error: "INSUFFICIENT_CREDITS" | "FORBIDDEN_MODEL" | "USER_NOT_FOUND";
    };

export type ExpiredCreditHoldsResult = {
  expiredHolds: number;
  creditsRestored: number;
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

export const CREDIT_HOLD_EXPIRES_AFTER_MS = 30 * 60 * 1000;

type CreditGrantForConsumption = {
  id: string;
  type: string;
  remainingAmount: number;
  expiresAt: Date | null;
  createdAt: Date;
  unitRevenueUsd?: number | null;
};

type CreditAllocation = {
  grantId: string;
  amount: number;
  unitRevenueUsd?: number;
};

function getHasPurchasedCredits(user: {
  creditGrants?: { id: string }[] | null;
}) {
  return Boolean(user.creditGrants?.length);
}

function isGrantUsable(grant: CreditGrantForConsumption, now = new Date()) {
  if (grant.remainingAmount <= 0) return false;
  return !grant.expiresAt || grant.expiresAt > now;
}

function sortConsumableGrants(grants: CreditGrantForConsumption[]) {
  return [...grants].sort((a, b) => {
    const priority = (grant: CreditGrantForConsumption) =>
      grant.type === "subscription" ? 0 : 1;
    const priorityDiff = priority(a) - priority(b);
    if (priorityDiff !== 0) return priorityDiff;

    const aExpiry = a.expiresAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bExpiry = b.expiresAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
    if (aExpiry !== bExpiry) return aExpiry - bExpiry;

    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

async function getUsableCreditGrants({
  client,
  userId,
}: {
  client: BillingClient;
  userId: string;
}) {
  await releaseExpiredCreditHolds({ client, userId });

  const expiredGrants =
    (await client.creditGrant.findMany({
      where: {
        userId,
        remainingAmount: { gt: 0 },
        expiresAt: { lte: new Date() },
      },
      select: { id: true, remainingAmount: true },
    })) ?? [];
  const expiredTotal = expiredGrants.reduce(
    (total, grant) => total + grant.remainingAmount,
    0,
  );

  if (expiredTotal > 0) {
    for (const grant of expiredGrants) {
      await client.creditGrant.update({
        where: { id: grant.id },
        data: { remainingAmount: 0 },
      });
    }

    await client.user.updateMany({
      where: { id: userId, credits: { gte: expiredTotal } },
      data: { credits: { decrement: expiredTotal } },
    });
  }

  const grants =
    (await client.creditGrant.findMany({
      where: {
        userId,
        remainingAmount: { gt: 0 },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: {
        id: true,
        type: true,
        remainingAmount: true,
        expiresAt: true,
        createdAt: true,
        unitRevenueUsd: true,
      },
    })) ?? [];

  return sortConsumableGrants(
    grants.filter((candidate) => isGrantUsable(candidate)),
  );
}

async function getUsableCreditBalance({
  client,
  userId,
}: {
  client: BillingClient;
  userId: string;
}) {
  const grants = await getUsableCreditGrants({ client, userId });
  return grants.reduce((total, grant) => total + grant.remainingAmount, 0);
}

async function getUsableCreditBreakdown({
  client,
  userId,
}: {
  client: BillingClient;
  userId: string;
}) {
  const grants = await getUsableCreditGrants({ client, userId });

  return grants.reduce(
    (totals, grant) => {
      if (grant.type === "purchase") {
        totals.purchasedCredits += grant.remainingAmount;
      } else if (grant.type === "subscription") {
        totals.subscriptionCredits += grant.remainingAmount;
      } else {
        totals.otherCredits += grant.remainingAmount;
      }

      totals.totalCredits += grant.remainingAmount;
      return totals;
    },
    {
      totalCredits: 0,
      subscriptionCredits: 0,
      purchasedCredits: 0,
      otherCredits: 0,
    },
  );
}

async function decrementUsableCreditGrants({
  client,
  userId,
  amount,
}: {
  client: BillingClient;
  userId: string;
  amount: number;
}) {
  const grants = await getUsableCreditGrants({ client, userId });
  const available = grants.reduce(
    (total, grant) => total + grant.remainingAmount,
    0,
  );

  if (available < amount) {
    return null;
  }

  let remaining = amount;
  const allocations: CreditAllocation[] = [];

  for (const grant of grants) {
    if (remaining <= 0) break;

    const decrement = Math.min(remaining, grant.remainingAmount);
    const updateResult = await client.creditGrant.updateMany({
      where: { id: grant.id, remainingAmount: { gte: decrement } },
      data: { remainingAmount: { decrement } },
    });

    if (updateResult.count === 0) {
      throw new Error("CREDIT_GRANT_RACE");
    }

    allocations.push({
      grantId: grant.id,
      amount: decrement,
      unitRevenueUsd: grant.unitRevenueUsd ?? 0,
    });
    remaining -= decrement;
  }

  return allocations;
}

async function incrementCreditGrantAllocations({
  client,
  allocations,
}: {
  client: BillingClient;
  allocations: CreditAllocation[];
}) {
  for (const allocation of allocations) {
    await client.creditGrant.update({
      where: { id: allocation.grantId },
      data: { remainingAmount: { increment: allocation.amount } },
    });
  }
}

function parseCreditAllocations(value: Prisma.JsonValue): CreditAllocation[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (
      item &&
      typeof item === "object" &&
      "grantId" in item &&
      "amount" in item &&
      typeof item.grantId === "string" &&
      typeof item.amount === "number" &&
      item.amount > 0
    ) {
      return [
        {
          grantId: item.grantId,
          amount: item.amount,
          unitRevenueUsd:
            "unitRevenueUsd" in item &&
            typeof item.unitRevenueUsd === "number"
              ? item.unitRevenueUsd
              : 0,
        },
      ];
    }

    return [];
  });
}

function refundUnusedAllocations(
  allocations: CreditAllocation[],
  amountToRefund: number,
) {
  let remaining = amountToRefund;
  const refunds: CreditAllocation[] = [];

  for (const allocation of [...allocations].reverse()) {
    if (remaining <= 0) break;

    const amount = Math.min(remaining, allocation.amount);
    refunds.push({
      grantId: allocation.grantId,
      amount,
      unitRevenueUsd: allocation.unitRevenueUsd,
    });
    remaining -= amount;
  }

  return refunds;
}

function subtractAllocationRefunds(
  allocations: CreditAllocation[],
  refunds: CreditAllocation[],
) {
  const refundedByGrant = new Map<string, number>();
  for (const refund of refunds) {
    refundedByGrant.set(
      refund.grantId,
      (refundedByGrant.get(refund.grantId) ?? 0) + refund.amount,
    );
  }

  return allocations.flatMap((allocation) => {
    const capturedAmount =
      allocation.amount - (refundedByGrant.get(allocation.grantId) ?? 0);
    return capturedAmount > 0
      ? [{ ...allocation, amount: capturedAmount }]
      : [];
  });
}

function getAllocationRevenueUsd(allocations: CreditAllocation[]) {
  return allocations.reduce(
    (total, allocation) =>
      total + allocation.amount * (allocation.unitRevenueUsd ?? 0),
    0,
  );
}

async function checkCreditAccess({
  client,
  userId,
  modelId,
  requiredCredits,
}: {
  client: BillingClient;
  userId: string;
  modelId: string;
  requiredCredits?: number;
}): Promise<CreditCheckResult> {
  if (!hasModelPricing(modelId)) {
    return { success: false, error: "FORBIDDEN_MODEL" };
  }

  const creditCost = requiredCredits ?? getModelCreditHoldCost(modelId);

  const user = await client.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      credits: true,
      creditGrants: {
        where: {
          type: "purchase",
          remainingAmount: { gt: 0 },
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        select: { id: true },
        take: 1,
      },
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

  const isAllowed = canTierUseModel(tier, modelId, {
    hasPurchasedCredits: getHasPurchasedCredits(user),
  });
  if (!isAllowed) {
    return { success: false, error: "FORBIDDEN_MODEL" };
  }

  const usableCredits = await getUsableCreditBalance({ client, userId });
  if (usableCredits < creditCost) {
    return { success: false, error: "INSUFFICIENT_CREDITS" };
  }

  return {
    success: true,
    creditsUsed: creditCost,
    remainingCredits: usableCredits,
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
  const modelCost = hasModelPricing(modelId)
    ? getModelCreditHoldCost(modelId)
    : 0;

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
          creditGrants: {
            where: {
              type: "purchase",
              remainingAmount: { gt: 0 },
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
            select: { id: true },
            take: 1,
          },
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
      credits: 0,
      modelCost,
      hasActiveSubscription,
    };
    const usableCredits = await getUsableCreditBalance({
      client: prisma,
      userId,
    });
    base.credits = usableCredits;

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
    const isAllowed = canTierUseModel(tier, modelId, {
      hasPurchasedCredits: getHasPurchasedCredits(user),
    });
    if (!isAllowed) {
      return {
        success: false,
        error: "FORBIDDEN_MODEL",
        ...base,
      };
    }

    if (usableCredits < modelCost) {
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

function getGenerationChargeDetails({
  modelId,
  inputTokens,
  outputTokens,
  generatedText,
  providerCostUsd,
}: {
  modelId: string;
  inputTokens?: number;
  outputTokens?: number;
  generatedText?: string;
  providerCostUsd?: number;
}) {
  const actualOutputTokens =
    outputTokens ??
    (generatedText ? estimateOutputTokensFromText(generatedText) : undefined);
  const sizeBasedCreditCost = getModelCreditCost(modelId, {
    outputTokens: actualOutputTokens,
  });
  const creditCost = Math.max(
    sizeBasedCreditCost,
    getCostBasedCreditCharge(providerCostUsd ?? 0),
  );
  const estimatedCreditCost = getModelCreditHoldCost(modelId);
  const costOutputTokens =
    actualOutputTokens ??
    (generatedText ? estimateOutputTokensFromText(generatedText) : 1);
  const costEstimate = estimateModelCostUsd({
    modelId,
    inputTokens,
    outputTokens: costOutputTokens,
  });
  if (providerCostUsd !== undefined && providerCostUsd >= 0) {
    costEstimate.estimatedModelCostUsd = providerCostUsd;
    costEstimate.riskAdjustedModelCostUsd =
      providerCostUsd * MODEL_COST_OVERHEAD_MULTIPLIER;
  }
  const generationSize = getGenerationSizeBand(costOutputTokens);

  return {
    creditCost,
    estimatedCreditCost,
    costEstimate,
    generationSize,
  };
}

async function createUsageAuditRecords({
  client,
  userId,
  modelId,
  creditCost,
  estimatedCreditCost,
  costEstimate,
  generationSize,
  chatId,
  description,
  phase,
  status,
  tokensUsed,
  reasoningTokens,
  provider,
  actualModelCostUsd,
  upstreamInferenceCostUsd,
  estimatedRevenueUsd,
  refundedCredits = 0,
}: {
  client: BillingClient;
  userId: string;
  modelId: string;
  creditCost: number;
  estimatedCreditCost: number;
  costEstimate: ReturnType<typeof estimateModelCostUsd>;
  generationSize: string;
  chatId?: string;
  description?: string;
  phase?: string;
  status: string;
  tokensUsed?: number;
  reasoningTokens?: number;
  provider?: string;
  actualModelCostUsd?: number;
  upstreamInferenceCostUsd?: number;
  estimatedRevenueUsd?: number;
  refundedCredits?: number;
}) {
  const reason =
    description || `AI generation - ${modelId.split("/").pop() || modelId}`;

  await client.creditHistory.create({
    data: {
      userId,
      amount: -creditCost,
      type: "usage",
      description: reason,
      chatId: chatId || null,
    },
  });

  await client.generationLog.create({
    data: {
      userId,
      modelId,
      creditsUsed: creditCost,
      estimatedCredits: estimatedCreditCost,
      actualCredits: creditCost,
      refundedCredits,
      reason,
      phase,
      tokensUsed,
      inputTokens: costEstimate.inputTokens,
      outputTokens: costEstimate.outputTokens,
      reasoningTokens,
      generationSize,
      estimatedModelCostUsd: costEstimate.estimatedModelCostUsd,
      riskAdjustedModelCostUsd: costEstimate.riskAdjustedModelCostUsd,
      actualModelCostUsd,
      upstreamInferenceCostUsd,
      provider,
      estimatedRevenueUsd,
      estimatedGrossMarginUsd:
        estimatedRevenueUsd !== undefined && actualModelCostUsd !== undefined
          ? estimatedRevenueUsd - actualModelCostUsd
          : undefined,
      chatId: chatId || null,
      status,
    },
  });
}

export async function reserveCreditHold({
  userId,
  modelId,
  chatId,
  amount,
  reason,
  phase = "generation",
}: {
  userId: string;
  modelId: string;
  chatId?: string;
  amount?: number;
  reason?: string;
  phase?: string;
}): Promise<
  CreditHoldResult
> {
  const prisma = getPrisma();

  try {
    if (!hasModelPricing(modelId)) {
      return { success: false, error: "FORBIDDEN_MODEL" };
    }
    const holdAmount = amount ?? getModelCreditHoldCost(modelId);

    return await prisma.$transaction(async (tx) => {
      const access = await checkCreditAccess({
        client: tx,
        userId,
        modelId,
        requiredCredits: holdAmount,
      });

      if (!access.success) return access;

      const allocations = await decrementUsableCreditGrants({
        client: tx,
        userId,
        amount: holdAmount,
      });

      if (!allocations) {
        return { success: false, error: "INSUFFICIENT_CREDITS" } as const;
      }

      const updateResult = await tx.user.updateMany({
        where: { id: userId, credits: { gte: holdAmount } },
        data: { credits: { decrement: holdAmount } },
      });

      if (updateResult.count === 0) {
        await incrementCreditGrantAllocations({ client: tx, allocations });
        return { success: false, error: "INSUFFICIENT_CREDITS" } as const;
      }

      const hold = await tx.creditHold.create({
        data: {
          userId,
          chatId: chatId || null,
          modelId,
          amountHeld: holdAmount,
          amountCaptured: 0,
          status: "active",
          reason,
          phase,
          allocations: JSON.parse(JSON.stringify(allocations)),
          expiresAt: new Date(Date.now() + CREDIT_HOLD_EXPIRES_AFTER_MS),
        },
        select: { id: true },
      });

      const remainingCredits = await getUsableCreditBalance({
        client: tx,
        userId,
      });

      return {
        success: true,
        holdId: hold.id,
        creditsUsed: holdAmount,
        remainingCredits,
      };
    });
  } catch (error) {
    console.error("[CreditEngine] Error in reserveCreditHold:", error);
    return { success: false, error: "INSUFFICIENT_CREDITS" };
  }
}

async function releaseExpiredCreditHoldsWithClient({
  client,
  userId,
  now,
  limit,
}: {
  client: BillingClient;
  userId?: string;
  now: Date;
  limit: number;
}): Promise<ExpiredCreditHoldsResult> {
  const expiredHolds =
    (await client.creditHold.findMany({
      where: {
        status: "active",
        expiresAt: { lte: now },
        ...(userId ? { userId } : {}),
      },
      select: {
        id: true,
        userId: true,
        amountHeld: true,
        allocations: true,
      },
      orderBy: { expiresAt: "asc" },
      take: limit,
    })) ?? [];

  let expiredCount = 0;
  let creditsRestored = 0;

  for (const hold of expiredHolds) {
    const updateResult = await client.creditHold.updateMany({
      where: {
        id: hold.id,
        status: "active",
        expiresAt: { lte: now },
      },
      data: { status: "expired" },
    });

    if (updateResult.count === 0) continue;

    const allocations = parseCreditAllocations(hold.allocations);
    await incrementCreditGrantAllocations({ client, allocations });
    await client.user.update({
      where: { id: hold.userId },
      data: { credits: { increment: hold.amountHeld } },
    });

    expiredCount += 1;
    creditsRestored += hold.amountHeld;
  }

  return { expiredHolds: expiredCount, creditsRestored };
}

export async function releaseExpiredCreditHolds({
  client,
  userId,
  now = new Date(),
  limit = 100,
}: {
  client?: BillingClient;
  userId?: string;
  now?: Date;
  limit?: number;
} = {}): Promise<ExpiredCreditHoldsResult> {
  const boundedLimit = Math.max(1, Math.min(limit, 500));

  if (client) {
    return releaseExpiredCreditHoldsWithClient({
      client,
      userId,
      now,
      limit: boundedLimit,
    });
  }

  const prisma = getPrisma();
  return prisma.$transaction((tx) =>
    releaseExpiredCreditHoldsWithClient({
      client: tx,
      userId,
      now,
      limit: boundedLimit,
    }),
  );
}

export async function releaseCreditHold({
  holdId,
}: {
  holdId: string;
}): Promise<{ success: boolean }> {
  const prisma = getPrisma();

  try {
    await prisma.$transaction(async (tx) => {
      const hold = await tx.creditHold.findUnique({
        where: { id: holdId },
        select: {
          id: true,
          userId: true,
          amountHeld: true,
          status: true,
          allocations: true,
        },
      });

      if (!hold || hold.status !== "active") return;

      const claimResult = await tx.creditHold.updateMany({
        where: { id: hold.id, status: "active" },
        data: { status: "releasing" },
      });
      if (claimResult.count === 0) return;

      const allocations = parseCreditAllocations(hold.allocations);
      await incrementCreditGrantAllocations({ client: tx, allocations });
      await tx.user.update({
        where: { id: hold.userId },
        data: { credits: { increment: hold.amountHeld } },
      });
      await tx.creditHold.update({
        where: { id: hold.id },
        data: { status: "released" },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("[CreditEngine] Error in releaseCreditHold:", error);
    return { success: false };
  }
}

export async function captureCreditHold({
  client,
  holdId,
  userId,
  modelId,
  chatId,
  description,
  status = "completed",
  phase = "generation",
  tokensUsed,
  inputTokens,
  outputTokens,
  generatedText,
  providerCostUsd,
  upstreamInferenceCostUsd,
  reasoningTokens,
  provider,
}: {
  client: Prisma.TransactionClient;
  holdId: string;
  userId: string;
  modelId: string;
  chatId?: string;
  description?: string;
  status?: string;
  phase?: string;
  tokensUsed?: number;
  inputTokens?: number;
  outputTokens?: number;
  generatedText?: string;
  providerCostUsd?: number;
  upstreamInferenceCostUsd?: number;
  reasoningTokens?: number;
  provider?: string;
}): Promise<CreditCheckResult> {
  const hold = await client.creditHold.findUnique({
    where: { id: holdId },
    select: {
      id: true,
      userId: true,
      modelId: true,
      amountHeld: true,
      status: true,
      allocations: true,
      providerCostUsd: true,
      upstreamInferenceCostUsd: true,
      inputTokens: true,
      outputTokens: true,
      reasoningTokens: true,
      totalTokens: true,
      provider: true,
    },
  });

  if (
    !hold ||
    hold.status !== "active" ||
    hold.userId !== userId ||
    hold.modelId !== modelId
  ) {
    return { success: false, error: "INSUFFICIENT_CREDITS" };
  }

  const { creditCost, estimatedCreditCost, costEstimate, generationSize } =
    getGenerationChargeDetails({
      modelId,
      inputTokens: hold.inputTokens || inputTokens,
      outputTokens: hold.outputTokens || outputTokens,
      generatedText,
      providerCostUsd:
        hold.providerCostUsd > 0 ? hold.providerCostUsd : providerCostUsd,
    });

  if (creditCost > hold.amountHeld) {
    return { success: false, error: "INSUFFICIENT_CREDITS" };
  }

  const claimResult = await client.creditHold.updateMany({
    where: {
      id: hold.id,
      userId,
      modelId,
      status: "active",
    },
    data: { status: "capturing" },
  });
  if (claimResult.count === 0) {
    return { success: false, error: "INSUFFICIENT_CREDITS" };
  }

  const allocations = parseCreditAllocations(hold.allocations);
  const refundAmount = hold.amountHeld - creditCost;
  let refunds: CreditAllocation[] = [];
  if (refundAmount > 0) {
    refunds = refundUnusedAllocations(allocations, refundAmount);
    await incrementCreditGrantAllocations({ client, allocations: refunds });
    await client.user.update({
      where: { id: userId },
      data: { credits: { increment: refundAmount } },
    });
  }
  const capturedAllocations = subtractAllocationRefunds(allocations, refunds);
  const estimatedRevenueUsd = getAllocationRevenueUsd(capturedAllocations);

  await createUsageAuditRecords({
    client,
    userId,
    modelId,
    creditCost,
    estimatedCreditCost: hold.amountHeld || estimatedCreditCost,
    costEstimate,
    generationSize,
    chatId,
    description,
    phase,
    status,
    tokensUsed: hold.totalTokens || tokensUsed,
    reasoningTokens: hold.reasoningTokens || reasoningTokens,
    provider: hold.provider || provider,
    actualModelCostUsd:
      hold.providerCostUsd > 0 ? hold.providerCostUsd : providerCostUsd,
    upstreamInferenceCostUsd:
      hold.upstreamInferenceCostUsd > 0
        ? hold.upstreamInferenceCostUsd
        : upstreamInferenceCostUsd,
    estimatedRevenueUsd,
    refundedCredits: refundAmount,
  });

  await client.creditHold.update({
    where: { id: hold.id },
    data: {
      amountCaptured: creditCost,
      status: "captured",
    },
  });

  const remainingCredits = await getUsableCreditBalance({ client, userId });

  return {
    success: true,
    creditsUsed: creditCost,
    remainingCredits,
  };
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
  inputTokens,
  outputTokens,
  generatedText,
  providerCostUsd,
  upstreamInferenceCostUsd,
  reasoningTokens,
  provider,
}: {
  userId: string;
  modelId: string;
  chatId?: string;
  description?: string;
  status?: string;
  phase?: string;
  tokensUsed?: number;
  inputTokens?: number;
  outputTokens?: number;
  generatedText?: string;
  providerCostUsd?: number;
  upstreamInferenceCostUsd?: number;
  reasoningTokens?: number;
  provider?: string;
}): Promise<CreditCheckResult> {
  const prisma = getPrisma();
  const { creditCost, estimatedCreditCost, costEstimate, generationSize } =
    getGenerationChargeDetails({
      modelId,
      inputTokens,
      outputTokens,
      generatedText,
      providerCostUsd,
    });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const access = await checkCreditAccess({
        client: tx,
        userId,
        modelId,
        requiredCredits: creditCost,
      });

      if (!access.success) {
        return access;
      }

      const allocations = await decrementUsableCreditGrants({
        client: tx,
        userId,
        amount: creditCost,
      });

      if (!allocations) {
        return { success: false, error: "INSUFFICIENT_CREDITS" } as const;
      }

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
        await incrementCreditGrantAllocations({ client: tx, allocations });
        return { success: false, error: "INSUFFICIENT_CREDITS" } as const;
      }

      await createUsageAuditRecords({
        client: tx,
        userId,
        modelId,
        creditCost,
        estimatedCreditCost,
        costEstimate,
        generationSize,
        chatId,
        description,
        phase,
        status,
        tokensUsed,
        reasoningTokens,
        provider,
        actualModelCostUsd: providerCostUsd,
        upstreamInferenceCostUsd,
        estimatedRevenueUsd: getAllocationRevenueUsd(allocations),
      });

      const remainingCredits = await getUsableCreditBalance({
        client: tx,
        userId,
      });

      return {
        success: true,
        creditsUsed: creditCost,
        remainingCredits,
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
  creditHoldId,
  tokensUsed,
  inputTokens,
  outputTokens,
  generatedText,
  providerCostUsd,
  upstreamInferenceCostUsd,
  reasoningTokens,
  provider,
}: {
  client: Prisma.TransactionClient;
  userId: string;
  modelId: string;
  chatId?: string;
  description?: string;
  status?: string;
  phase?: string;
  creditHoldId?: string;
  tokensUsed?: number;
  inputTokens?: number;
  outputTokens?: number;
  generatedText?: string;
  providerCostUsd?: number;
  upstreamInferenceCostUsd?: number;
  reasoningTokens?: number;
  provider?: string;
}): Promise<CreditCheckResult> {
  if (creditHoldId) {
    return captureCreditHold({
      client,
      holdId: creditHoldId,
      userId,
      modelId,
      chatId,
      description,
      status,
      phase,
      tokensUsed,
      inputTokens,
      outputTokens,
      generatedText,
      providerCostUsd,
      upstreamInferenceCostUsd,
      reasoningTokens,
      provider,
    });
  }

  const { creditCost, estimatedCreditCost, costEstimate, generationSize } =
    getGenerationChargeDetails({
      modelId,
      inputTokens,
      outputTokens,
      generatedText,
      providerCostUsd,
    });
  const access = await checkCreditAccess({
    client,
    userId,
    modelId,
    requiredCredits: creditCost,
  });

  if (!access.success) {
    return access;
  }

  const allocations = await decrementUsableCreditGrants({
    client,
    userId,
    amount: creditCost,
  });

  if (!allocations) {
    return { success: false, error: "INSUFFICIENT_CREDITS" };
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
    await incrementCreditGrantAllocations({ client, allocations });
    return { success: false, error: "INSUFFICIENT_CREDITS" };
  }

  await createUsageAuditRecords({
    client,
    userId,
    modelId,
    creditCost,
    estimatedCreditCost,
    costEstimate,
    generationSize,
    chatId,
    description,
    phase,
    status,
    tokensUsed,
    reasoningTokens,
    provider,
    actualModelCostUsd: providerCostUsd,
    upstreamInferenceCostUsd,
    estimatedRevenueUsd: getAllocationRevenueUsd(allocations),
  });

  const remainingCredits = await getUsableCreditBalance({
    client,
    userId,
  });

  return {
    success: true,
    creditsUsed: creditCost,
    remainingCredits,
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

      await tx.creditGrant.create({
        data: {
          userId,
          amount,
          remainingAmount: amount,
          type,
          description,
          dedupeKey: `manual:${type}:${userId}:${Date.now()}`,
          grossRevenueUsd: 0,
          netRevenueUsd: 0,
          unitRevenueUsd: 0,
        },
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
      creditGrants: {
        where: {
          type: "purchase",
          remainingAmount: { gt: 0 },
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        select: { id: true },
        take: 1,
      },
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

  const creditBreakdown = await getUsableCreditBreakdown({
    client: prisma,
    userId,
  });

  return {
    credits: creditBreakdown.totalCredits,
    creditBreakdown,
    tier,
    hasActiveSubscription,
    hasPurchasedCredits: getHasPurchasedCredits(user),
    subscriptionEndsAt:
      user.subscription?.currentPeriodEnd?.toISOString() || null,
  };
}
