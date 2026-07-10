import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";
import { createPrismaTransactionMock } from "../helpers/mock-prisma";

const { prismaMock, stripeMock } = vi.hoisted(() => {
  const delegate = (methods: string[]) =>
    Object.fromEntries(methods.map((method) => [method, vi.fn()]));

  return {
    prismaMock: {
      $transaction: vi.fn(),
      chat: delegate(["findFirst"]),
      shareEvent: delegate(["create"]),
      subscription: delegate(["findFirst", "updateMany", "upsert"]),
      stripeWebhookEvent: delegate(["findUnique", "upsert"]),
    },
    stripeMock: {
      subscriptions: { retrieve: vi.fn() },
      invoices: { retrieve: vi.fn() },
      checkout: {
        sessions: {
          listLineItems: vi.fn(),
          retrieve: vi.fn(),
        },
      },
    },
  };
});

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => prismaMock,
}));

vi.mock("@/lib/stripe", () => ({
  stripe: stripeMock,
  STRIPE_PRICE_IDS: {
    pro: "price_pro",
    pro_plus: "price_pro_plus",
  },
  CREDIT_PACK_CONFIGS: {
    small: { priceId: "price_credits_10", credits: 10, price: 5 },
    medium: { priceId: "price_credits_25", credits: 25, price: 10 },
    large: { priceId: "price_credits_60", credits: 60, price: 20 },
  },
}));

import {
  fulfillCheckoutSession,
  fulfillPaidInvoice,
  hasProcessedStripeEvent,
  markSubscriptionStatus,
  recordProcessedStripeEvent,
  syncSubscriptionFromStripe,
} from "@/lib/billing/stripe-fulfillment";

function subscription(overrides: Record<string, unknown> = {}) {
  return {
    id: "sub_1",
    customer: "cus_1",
    status: "active",
    start_date: 1_782_864_000,
    metadata: { userId: "user_1", tier: "pro" },
    latest_invoice: "in_1",
    items: {
      data: [
        {
          id: "si_1",
          price: { id: "price_pro" },
          current_period_start: 1_782_864_000,
          current_period_end: 1_785_456_000,
        },
      ],
    },
    ...overrides,
  };
}

function paidInvoice(overrides: Record<string, unknown> = {}) {
  return {
    id: "in_1",
    status: "paid",
    customer: "cus_1",
    metadata: {},
    parent: {
      subscription_details: {
        subscription: "sub_1",
        metadata: { userId: "user_1" },
      },
    },
    lines: { data: [{}] },
    ...overrides,
  };
}

describe("Stripe fulfillment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.chat.findFirst.mockResolvedValue(null);
  });

  it("syncs subscriptions from Stripe into the local tier model", async () => {
    stripeMock.subscriptions.retrieve.mockResolvedValueOnce(subscription());

    await expect(
      syncSubscriptionFromStripe({ subscriptionId: "sub_1" }),
    ).resolves.toMatchObject({
      userId: "user_1",
      customerId: "cus_1",
      subscriptionId: "sub_1",
      status: "active",
      tier: "pro",
      latestInvoiceId: "in_1",
    });

    expect(prismaMock.subscription.upsert).toHaveBeenCalledWith({
      where: { userId: "user_1" },
      create: expect.objectContaining({
        userId: "user_1",
        stripeCustomerId: "cus_1",
        stripeSubscriptionId: "sub_1",
        tier: "pro",
      }),
      update: expect.objectContaining({
        stripeCustomerId: "cus_1",
        stripeSubscriptionId: "sub_1",
        tier: "pro",
      }),
    });
  });

  it("grants subscription invoice credits exactly once", async () => {
    const tx = createPrismaTransactionMock();
    stripeMock.subscriptions.retrieve.mockResolvedValueOnce(subscription());
    prismaMock.$transaction.mockImplementationOnce(async (callback) =>
      callback(tx),
    );
    tx.user.update.mockResolvedValueOnce({ credits: 105 });

    await expect(fulfillPaidInvoice(paidInvoice() as never, "evt_1")).resolves.toEqual({
      fulfilled: true,
      userId: "user_1",
      subscriptionId: "sub_1",
      invoiceId: "in_1",
      tier: "pro",
      credits: 100,
      referralGrant: { granted: false, reason: "no_referrer" },
    });

    expect(tx.creditGrant.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        dedupeKey: "stripe:invoice:in_1",
        amount: 100,
        type: "subscription",
        stripeEventId: "evt_1",
      }),
    });
    expect(tx.creditHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user_1",
        amount: 100,
        type: "subscription",
      }),
    });
  });

  it("does not double-grant duplicate subscription invoice credits", async () => {
    const tx = createPrismaTransactionMock();
    const duplicate = new Prisma.PrismaClientKnownRequestError("duplicate", {
      code: "P2002",
      clientVersion: "test",
      meta: {},
    });
    stripeMock.subscriptions.retrieve.mockResolvedValueOnce(subscription());
    prismaMock.$transaction.mockImplementationOnce(async (callback) =>
      callback(tx),
    );
    tx.creditGrant.create.mockRejectedValueOnce(duplicate);

    await expect(fulfillPaidInvoice(paidInvoice() as never, "evt_1")).resolves.toMatchObject({
      fulfilled: false,
      userId: "user_1",
      invoiceId: "in_1",
      credits: 100,
    });
    expect(tx.user.update).not.toHaveBeenCalled();
    expect(tx.creditHistory.create).not.toHaveBeenCalled();
  });

  it("grants prorated subscription credits only in proportion to collected revenue", async () => {
    const tx = createPrismaTransactionMock();
    stripeMock.subscriptions.retrieve.mockResolvedValueOnce(subscription());
    prismaMock.$transaction.mockImplementationOnce(async (callback) =>
      callback(tx),
    );
    tx.user.update.mockResolvedValueOnce({ credits: 50 });

    await expect(
      fulfillPaidInvoice(
        paidInvoice({ total_excluding_tax: 450, amount_paid: 450 }) as never,
        "evt_proration",
      ),
    ).resolves.toMatchObject({
      fulfilled: true,
      credits: 50,
    });

    expect(tx.creditGrant.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        amount: 50,
        grossRevenueUsd: 4.5,
        netRevenueUsd: 4.0695,
      }),
    });
    expect(
      tx.creditGrant.create.mock.calls[0][0].data.unitRevenueUsd,
    ).toBeCloseTo(0.08139);
  });

  it("trims rollover to the cap and extends retained grants to the new period", async () => {
    const tx = createPrismaTransactionMock();
    const nextPeriodEnd = new Date(1_785_456_000 * 1000);
    stripeMock.subscriptions.retrieve.mockResolvedValueOnce(subscription());
    prismaMock.$transaction.mockImplementationOnce(async (callback) =>
      callback(tx),
    );
    tx.creditGrant.findMany.mockResolvedValueOnce([
      { id: "grant_old_1", remainingAmount: 80 },
      { id: "grant_old_2", remainingAmount: 70 },
    ]);
    tx.user.update
      .mockResolvedValueOnce({ credits: 100 })
      .mockResolvedValueOnce({ credits: 200 });

    await fulfillPaidInvoice(paidInvoice() as never, "evt_rollover");

    expect(tx.creditGrant.update).toHaveBeenCalledWith({
      where: { id: "grant_old_1" },
      data: { remainingAmount: { decrement: 50 } },
    });
    expect(tx.user.update).toHaveBeenNthCalledWith(1, {
      where: { id: "user_1" },
      data: { credits: { decrement: 50 } },
    });
    expect(tx.creditGrant.updateMany).toHaveBeenCalledWith({
      where: {
        userId: "user_1",
        type: "subscription",
        remainingAmount: { gt: 0 },
        OR: [{ expiresAt: null }, { expiresAt: { gt: expect.any(Date) } }],
      },
      data: { expiresAt: nextPeriodEnd },
    });
  });

  it("fulfills credit-pack checkouts with session dedupe keys", async () => {
    const tx = createPrismaTransactionMock();
    prismaMock.$transaction.mockImplementationOnce(async (callback) =>
      callback(tx),
    );
    tx.user.update.mockResolvedValueOnce({ credits: 30 });
    stripeMock.checkout.sessions.listLineItems.mockResolvedValueOnce({
      data: [{ price: { id: "price_credits_25" } }],
    });

    await expect(
      fulfillCheckoutSession(
        {
          id: "cs_1",
          mode: "payment",
          payment_status: "paid",
          customer: "cus_1",
          client_reference_id: "user_1",
          metadata: { type: "credits" },
        } as never,
        "evt_2",
      ),
    ).resolves.toEqual({
      fulfilled: true,
      userId: "user_1",
      checkoutSessionId: "cs_1",
      credits: 25,
      referralGrant: { granted: false, reason: "no_referrer" },
    });

    expect(tx.creditGrant.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        dedupeKey: "stripe:checkout-session:cs_1",
        amount: 25,
        type: "purchase",
        stripeEventId: "evt_2",
      }),
    });
  });

  it("records webhook event processing and marks deleted subscriptions", async () => {
    prismaMock.stripeWebhookEvent.findUnique.mockResolvedValueOnce(null);
    await expect(hasProcessedStripeEvent("evt_1")).resolves.toBe(false);

    await recordProcessedStripeEvent({
      id: "evt_1",
      type: "checkout.session.completed",
    } as never);
    expect(prismaMock.stripeWebhookEvent.upsert).toHaveBeenCalledWith({
      where: { id: "evt_1" },
      create: { id: "evt_1", type: "checkout.session.completed" },
      update: {},
    });

    await markSubscriptionStatus("sub_1", "canceled");
    expect(prismaMock.subscription.updateMany).toHaveBeenCalledWith({
      where: { stripeSubscriptionId: "sub_1" },
      data: { status: "canceled" },
    });
  });
});
