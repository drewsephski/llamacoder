import { beforeEach, describe, expect, it, vi } from "vitest";

const { tx, prisma } = vi.hoisted(() => {
  const tx = {
    user: { findUnique: vi.fn(), update: vi.fn() },
    creditGrant: { createMany: vi.fn() },
    creditHistory: { create: vi.fn() },
  };
  return {
    tx,
    prisma: {
      $transaction: vi.fn(async (fn: (client: typeof tx) => unknown) => fn(tx)),
    },
  };
});
vi.mock("@/lib/prisma", () => ({ getPrisma: () => prisma }));
import { claimCreditGift } from "@/features/billing/server/credit-gifts";

describe("reserved personal credit gifts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tx.user.findUnique.mockResolvedValue({
      email: "samstehno@outlook.com",
      emailVerified: true,
    });
    tx.creditGrant.createMany.mockResolvedValue({ count: 1 });
  });

  it("requires a verified recipient and does not grant to other accounts", async () => {
    for (const user of [
      null,
      { email: "samstehno@outlook.com", emailVerified: false },
      { email: "someone@example.com", emailVerified: true },
    ]) {
      tx.user.findUnique.mockResolvedValue(user);
      expect(await claimCreditGift("user_1")).toBeNull();
    }
    expect(tx.creditGrant.createMany).not.toHaveBeenCalled();
  });

  it("grants 25 spendable credits with a personal message and matching ledger", async () => {
    const gift = await claimCreditGift("user_1");
    expect(gift).toMatchObject({
      amount: 25,
      message: "Drew personally gave you 25 free credits.",
    });
    expect(tx.creditGrant.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          expect.objectContaining({
            userId: "user_1",
            amount: 25,
            remainingAmount: 25,
            type: "bonus",
            dedupeKey: "gift:drew-sam-2026-10-28",
          }),
        ],
        skipDuplicates: true,
      }),
    );
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { credits: { increment: 25 } },
    });
    expect(tx.creditHistory.create).toHaveBeenCalledOnce();
  });

  it("returns the message on later logins without granting again", async () => {
    tx.creditGrant.createMany.mockResolvedValue({ count: 0 });
    expect(await claimCreditGift("user_1")).toMatchObject({ amount: 25 });
    expect(tx.user.update).not.toHaveBeenCalled();
    expect(tx.creditHistory.create).not.toHaveBeenCalled();
  });
});
