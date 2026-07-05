import { beforeEach, describe, expect, it, vi } from "vitest";
import { FREE_MODEL } from "@/lib/constants";
import { buildSubscription, buildUser } from "../fixtures/builders";
import { createPrismaTransactionMock } from "../helpers/mock-prisma";

const prismaMock = vi.hoisted(() => {
  const delegate = (methods: string[]) =>
    Object.fromEntries(methods.map((method) => [method, vi.fn()]));

  return {
    $transaction: vi.fn(),
    user: delegate(["findUnique", "update", "updateMany"]),
  };
});

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => prismaMock,
}));

import {
  addCredits,
  checkAndConsumeCredits,
  checkCreditAvailability,
  checkProjectCreationEligibility,
  consumeCreditsForGeneration,
  getUserCreditInfo,
} from "@/lib/billing/credits";

describe("billing credit engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports missing users, forbidden models, and insufficient credits", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    await expect(
      checkCreditAvailability({ userId: "missing", modelId: FREE_MODEL }),
    ).resolves.toEqual({ success: false, error: "USER_NOT_FOUND" });

    prismaMock.user.findUnique.mockResolvedValueOnce(buildUser({ credits: 10 }));
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
        credits: 7,
        subscription: buildSubscription({ tier: "pro_plus" }),
      }),
    );

    await expect(
      checkCreditAvailability({
        userId: "user_1",
        modelId: "anthropic/claude-opus-4.6",
      }),
    ).resolves.toMatchObject({
      success: true,
      creditsUsed: 7,
      remainingCredits: 7,
    });
  });

  it("enforces free project limits before checking credits for project creation", async () => {
    const client = {
      chat: { count: vi.fn().mockResolvedValue(3) },
      user: {
        findUnique: vi.fn().mockResolvedValue(buildUser({ credits: 10 })),
      },
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
      },
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

  it("does not permit negative balances when the atomic update loses the race", async () => {
    const tx = createPrismaTransactionMock();
    tx.user.findUnique.mockResolvedValueOnce(buildUser({ credits: 1 }));
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

    await expect(getUserCreditInfo("user_1")).resolves.toEqual({
      credits: 12,
      tier: "pro_plus",
      hasActiveSubscription: true,
      subscriptionEndsAt: "2026-08-01T00:00:00.000Z",
    });
  });
});
