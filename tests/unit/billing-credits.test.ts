import { beforeEach, describe, expect, it, vi } from "vitest";
import { FREE_MODEL, LEGACY_QWEN_MAX_MODEL } from "@/lib/constants";
import { buildSubscription, buildUser } from "../fixtures/builders";
import { createPrismaTransactionMock } from "../helpers/mock-prisma";

const prismaMock = vi.hoisted(() => {
  const delegate = (methods: string[]) =>
    Object.fromEntries(methods.map((method) => [method, vi.fn()]));

  return {
    $transaction: vi.fn(),
    user: delegate(["findUnique", "update", "updateMany"]),
    creditGrant: delegate(["create", "findMany", "update", "updateMany"]),
    creditHold: delegate(["create", "findMany", "findUnique", "update", "updateMany"]),
  };
});

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => prismaMock,
}));

import {
  addCredits,
  captureCreditHold,
  checkAndConsumeCredits,
  checkCreditAvailability,
  checkProjectCreationEligibility,
  consumeCreditsForGeneration,
  getUserCreditInfo,
  releaseExpiredCreditHolds,
  reserveCreditHold,
} from "@/lib/billing/credits";

describe("billing credit engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.creditGrant.findMany.mockReset();
    prismaMock.creditGrant.findMany.mockResolvedValue([]);
    prismaMock.creditHold.findMany.mockReset();
    prismaMock.creditHold.findMany.mockResolvedValue([]);
  });

  function grant(amount: number, overrides: Record<string, unknown> = {}) {
    return {
      id: `grant_${amount}`,
      type: "subscription",
      remainingAmount: amount,
      expiresAt: null,
      createdAt: new Date("2026-07-01T00:00:00.000Z"),
      ...overrides,
    };
  }

  it("reports missing users, forbidden models, and insufficient credits", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    await expect(
      checkCreditAvailability({ userId: "missing", modelId: FREE_MODEL }),
    ).resolves.toEqual({ success: false, error: "USER_NOT_FOUND" });

    prismaMock.user.findUnique.mockResolvedValueOnce(
      buildUser({ credits: 10 }),
    );
    await expect(
      checkCreditAvailability({ userId: "user_1", modelId: "openai/gpt-5.4" }),
    ).resolves.toEqual({ success: false, error: "FORBIDDEN_MODEL" });

    prismaMock.user.findUnique.mockResolvedValueOnce(buildUser({ credits: 0 }));
    await expect(
      checkCreditAvailability({ userId: "user_1", modelId: FREE_MODEL }),
    ).resolves.toEqual({ success: false, error: "INSUFFICIENT_CREDITS" });
  });

  it("allows paid models for active tiers while still requiring credits", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(
      buildUser({
        credits: 8,
        subscription: buildSubscription({ tier: "pro_plus" }),
      }),
    );
    prismaMock.creditGrant.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([grant(8)]);

    await expect(
      checkCreditAvailability({
        userId: "user_1",
        modelId: LEGACY_QWEN_MAX_MODEL,
      }),
    ).resolves.toMatchObject({
      success: true,
      creditsUsed: 3,
      remainingCredits: 8,
    });
  });

  it("rejects aggregate credits that are not backed by usable grants", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(
      buildUser({
        credits: 100,
        subscription: buildSubscription({ tier: "pro_plus" }),
      }),
    );
    prismaMock.creditGrant.findMany
      .mockResolvedValueOnce([
        grant(50, {
          id: "expired_sub",
          expiresAt: new Date("2026-01-01T00:00:00.000Z"),
        }),
      ])
      .mockResolvedValueOnce([
        grant(2, {
          id: "purchase_1",
          type: "purchase",
          remainingAmount: 2,
        }),
      ]);

    await expect(
      checkCreditAvailability({
        userId: "user_1",
        modelId: LEGACY_QWEN_MAX_MODEL,
      }),
    ).resolves.toEqual({ success: false, error: "INSUFFICIENT_CREDITS" });
  });

  it("does not unlock efficient models from spent historical purchases", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(
      buildUser({
        credits: 10,
        creditGrants: [],
      }),
    );
    prismaMock.creditGrant.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        grant(10, { id: "bonus_1", type: "bonus", remainingAmount: 10 }),
      ]);

    await expect(
      checkCreditAvailability({
        userId: "user_1",
        modelId: "deepseek/deepseek-v4-pro",
      }),
    ).resolves.toEqual({ success: false, error: "FORBIDDEN_MODEL" });
  });

  it("rejects a second hold when grant allocation loses the race", async () => {
    const tx = createPrismaTransactionMock();
    prismaMock.$transaction.mockImplementationOnce(async (callback) =>
      callback(tx),
    );
    tx.user.findUnique.mockResolvedValueOnce(
      buildUser({
        credits: 42,
        subscription: buildSubscription({ tier: "pro_plus" }),
      }),
    );
    tx.creditGrant.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([grant(42)])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([grant(42)]);
    tx.creditGrant.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      reserveCreditHold({
        userId: "user_1",
        modelId: "anthropic/claude-opus-4.8",
      }),
    ).resolves.toEqual({ success: false, error: "INSUFFICIENT_CREDITS" });

    expect(tx.creditHold.create).not.toHaveBeenCalled();
  });

  it("enforces free project limits before checking credits for project creation", async () => {
    const client = {
      chat: { count: vi.fn().mockResolvedValue(3) },
      user: {
        findUnique: vi.fn().mockResolvedValue(buildUser({ credits: 10 })),
        updateMany: vi.fn(),
      },
      creditGrant: {
        findMany: vi.fn().mockResolvedValue([grant(10)]),
        update: vi.fn(),
      },
      creditHold: { findMany: vi.fn().mockResolvedValue([]) },
    };

    await expect(
      checkProjectCreationEligibility({
        client: client as never,
        userId: "user_1",
        modelId: FREE_MODEL,
      }),
    ).resolves.toMatchObject({
      success: false,
      error: "PROJECT_LIMIT_REACHED",
      projectCount: 3,
      projectLimit: 3,
      projectsRemaining: 0,
    });
  });

  it("allows active subscribers to access paid models only when credits are available", async () => {
    const client = {
      chat: { count: vi.fn().mockResolvedValue(10) },
      user: {
        findUnique: vi.fn().mockResolvedValue(
          buildUser({
            credits: 0,
            subscription: buildSubscription({ status: "active", tier: "pro" }),
          }),
        ),
        updateMany: vi.fn(),
      },
      creditGrant: { findMany: vi.fn().mockResolvedValue([]), update: vi.fn() },
      creditHold: { findMany: vi.fn().mockResolvedValue([]) },
    };

    await expect(
      checkProjectCreationEligibility({
        client: client as never,
        userId: "user_1",
        modelId: "openai/gpt-5.4",
      }),
    ).resolves.toMatchObject({
      success: false,
      error: "INSUFFICIENT_CREDITS",
      projectLimit: null,
      hasActiveSubscription: true,
    });
  });

  it("atomically consumes credits and creates audit records", async () => {
    const tx = createPrismaTransactionMock();
    prismaMock.$transaction.mockImplementationOnce(async (callback) =>
      callback(tx),
    );
    tx.user.findUnique
      .mockResolvedValueOnce(buildUser({ credits: 3 }))
      .mockResolvedValueOnce({ credits: 2 });
    tx.creditGrant.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([grant(3)])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([grant(3)])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([grant(2)]);
    tx.creditGrant.updateMany.mockResolvedValueOnce({ count: 1 });
    tx.user.updateMany.mockResolvedValueOnce({ count: 1 });

    await expect(
      checkAndConsumeCredits({
        userId: "user_1",
        modelId: FREE_MODEL,
        chatId: "chat_1",
        status: "completed",
      }),
    ).resolves.toEqual({
      success: true,
      creditsUsed: 1,
      remainingCredits: 2,
    });

    expect(tx.user.updateMany).toHaveBeenCalledWith({
      where: { id: "user_1", credits: { gte: 1 } },
      data: { credits: { decrement: 1 } },
    });
    expect(tx.creditHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user_1",
        amount: -1,
        type: "usage",
        chatId: "chat_1",
      }),
    });
    expect(tx.generationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user_1",
        modelId: FREE_MODEL,
        creditsUsed: 1,
        status: "completed",
      }),
    });
  });

  it("expires stale active holds and restores their grant allocations", async () => {
    const tx = createPrismaTransactionMock();
    const now = new Date("2026-07-09T12:00:00.000Z");
    prismaMock.$transaction.mockImplementationOnce(async (callback) =>
      callback(tx),
    );
    tx.creditHold.findMany.mockResolvedValueOnce([
      {
        id: "hold_1",
        userId: "user_1",
        amountHeld: 3,
        allocations: [{ grantId: "grant_1", amount: 3 }],
      },
    ]);
    tx.creditHold.updateMany.mockResolvedValueOnce({ count: 1 });

    await expect(
      releaseExpiredCreditHolds({ userId: "user_1", now }),
    ).resolves.toEqual({ expiredHolds: 1, creditsRestored: 3 });

    expect(tx.creditHold.findMany).toHaveBeenCalledWith({
      where: {
        status: "active",
        expiresAt: { lte: now },
        userId: "user_1",
      },
      select: {
        id: true,
        userId: true,
        amountHeld: true,
        allocations: true,
      },
      orderBy: { expiresAt: "asc" },
      take: 100,
    });
    expect(tx.creditHold.updateMany).toHaveBeenCalledWith({
      where: {
        id: "hold_1",
        status: "active",
        expiresAt: { lte: now },
      },
      data: { status: "expired" },
    });
    expect(tx.creditGrant.update).toHaveBeenCalledWith({
      where: { id: "grant_1" },
      data: { remainingAmount: { increment: 3 } },
    });
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { credits: { increment: 3 } },
    });
  });

  it("captures from exact provider cost and refunds the unused hold atomically", async () => {
    const tx = createPrismaTransactionMock();
    tx.creditHold.findUnique.mockResolvedValueOnce({
      id: "hold_1",
      userId: "user_1",
      modelId: "openai/gpt-4.1",
      amountHeld: 15,
      status: "active",
      allocations: [
        { grantId: "grant_1", amount: 15, unitRevenueUsd: 0.02 },
      ],
      providerCostUsd: 0.12,
      upstreamInferenceCostUsd: 0.1,
      inputTokens: 2_000,
      outputTokens: 1_000,
      reasoningTokens: 100,
      totalTokens: 3_000,
      provider: "OpenAI",
    });
    tx.creditHold.updateMany.mockResolvedValueOnce({ count: 1 });
    tx.creditGrant.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([grant(5)]);

    await expect(
      captureCreditHold({
        client: tx as never,
        holdId: "hold_1",
        userId: "user_1",
        modelId: "openai/gpt-4.1",
        chatId: "chat_1",
      }),
    ).resolves.toEqual({
      success: true,
      creditsUsed: 10,
      remainingCredits: 5,
    });

    expect(tx.creditHold.updateMany).toHaveBeenCalledWith({
      where: {
        id: "hold_1",
        userId: "user_1",
        modelId: "openai/gpt-4.1",
        status: "active",
      },
      data: { status: "capturing" },
    });
    expect(tx.creditGrant.update).toHaveBeenCalledWith({
      where: { id: "grant_1" },
      data: { remainingAmount: { increment: 5 } },
    });
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { credits: { increment: 5 } },
    });
    expect(tx.generationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        creditsUsed: 10,
        refundedCredits: 5,
        actualModelCostUsd: 0.12,
        upstreamInferenceCostUsd: 0.1,
        estimatedRevenueUsd: 0.2,
        estimatedGrossMarginUsd: 0.08000000000000002,
      }),
    });
  });

  it("does not refund or charge when another hold finalizer wins the claim", async () => {
    const tx = createPrismaTransactionMock();
    tx.creditHold.findUnique.mockResolvedValueOnce({
      id: "hold_1",
      userId: "user_1",
      modelId: FREE_MODEL,
      amountHeld: 1,
      status: "active",
      allocations: [{ grantId: "grant_1", amount: 1 }],
      providerCostUsd: 0,
      upstreamInferenceCostUsd: 0,
      inputTokens: 100,
      outputTokens: 100,
      reasoningTokens: 0,
      totalTokens: 200,
      provider: null,
    });
    tx.creditHold.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      captureCreditHold({
        client: tx as never,
        holdId: "hold_1",
        userId: "user_1",
        modelId: FREE_MODEL,
      }),
    ).resolves.toEqual({ success: false, error: "INSUFFICIENT_CREDITS" });

    expect(tx.creditGrant.update).not.toHaveBeenCalled();
    expect(tx.user.update).not.toHaveBeenCalled();
    expect(tx.creditHistory.create).not.toHaveBeenCalled();
    expect(tx.generationLog.create).not.toHaveBeenCalled();
  });

  it("does not permit negative balances when the atomic update loses the race", async () => {
    const tx = createPrismaTransactionMock();
    tx.user.findUnique.mockResolvedValueOnce(buildUser({ credits: 1 }));
    tx.creditGrant.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([grant(1)]);
    tx.creditGrant.updateMany.mockResolvedValueOnce({ count: 1 });
    tx.user.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      consumeCreditsForGeneration({
        client: tx as never,
        userId: "user_1",
        modelId: FREE_MODEL,
      }),
    ).resolves.toEqual({ success: false, error: "INSUFFICIENT_CREDITS" });

    expect(tx.creditHistory.create).not.toHaveBeenCalled();
    expect(tx.generationLog.create).not.toHaveBeenCalled();
  });

  it("adds credits and records history in the same transaction", async () => {
    const tx = createPrismaTransactionMock();
    prismaMock.$transaction.mockImplementationOnce(async (callback) =>
      callback(tx),
    );
    tx.user.update.mockResolvedValueOnce({ credits: 25 });

    await expect(
      addCredits({
        userId: "user_1",
        amount: 20,
        type: "purchase",
        description: "Credit pack",
      }),
    ).resolves.toEqual({ success: true, newBalance: 25 });

    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { credits: { increment: 20 } },
      select: { credits: true },
    });
    expect(tx.creditHistory.create).toHaveBeenCalledWith({
      data: {
        userId: "user_1",
        amount: 20,
        type: "purchase",
        description: "Credit pack",
      },
    });
    expect(tx.creditGrant.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user_1",
        amount: 20,
        remainingAmount: 20,
        type: "purchase",
      }),
    });
  });

  it("returns normalized user credit info", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(
      buildUser({
        credits: 12,
        subscription: buildSubscription({
          tier: "unlimited",
          currentPeriodEnd: new Date("2026-08-01T00:00:00.000Z"),
        }),
      }),
    );
    prismaMock.creditGrant.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([grant(12)]);

    await expect(getUserCreditInfo("user_1")).resolves.toEqual({
      credits: 12,
      creditBreakdown: {
        totalCredits: 12,
        subscriptionCredits: 12,
        purchasedCredits: 0,
        otherCredits: 0,
      },
      tier: "pro_plus",
      hasActiveSubscription: true,
      hasPurchasedCredits: false,
      subscriptionEndsAt: "2026-08-01T00:00:00.000Z",
    });
  });
});
