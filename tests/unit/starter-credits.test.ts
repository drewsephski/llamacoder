import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, tx } = vi.hoisted(() => {
  const transaction = {
    creditGrant: { findUnique: vi.fn(), create: vi.fn() },
    creditHistory: { create: vi.fn() },
    user: { update: vi.fn() },
  };
  return {
    tx: transaction,
    prismaMock: {
      $transaction: vi.fn(
        async (callback: (client: typeof transaction) => unknown) =>
          callback(transaction),
      ),
    },
  };
});

vi.mock("@/lib/prisma", () => ({ getPrisma: () => prismaMock }));

import {
  grantStarterCredits,
  STARTER_CREDITS,
} from "@/features/auth/server/starter-credits";

describe("verified account starter credits", () => {
  beforeEach(() => vi.clearAllMocks());

  it("adds an idempotent grant and ledger entry", async () => {
    tx.creditGrant.findUnique.mockResolvedValue(null);

    await expect(grantStarterCredits("user_1")).resolves.toBe(true);
    expect(tx.creditGrant.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user_1",
        amount: STARTER_CREDITS,
        remainingAmount: STARTER_CREDITS,
        dedupeKey: "welcome:user_1",
      }),
    });
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { credits: { increment: STARTER_CREDITS } },
    });
  });

  it("does not grant the same welcome credits twice", async () => {
    tx.creditGrant.findUnique.mockResolvedValue({ id: "grant_1" });

    await expect(grantStarterCredits("user_1")).resolves.toBe(false);
    expect(tx.creditGrant.create).not.toHaveBeenCalled();
    expect(tx.user.update).not.toHaveBeenCalled();
  });
});
