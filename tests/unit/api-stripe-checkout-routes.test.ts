import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authGetSessionMock,
  consumeRateLimitMock,
  createCreditsCheckoutSessionMock,
  createSubscriptionCheckoutSessionMock,
  getOrCreateStripeCustomerIdMock,
  persistStripeCustomerIdMock,
  prismaMock,
} = vi.hoisted(() => ({
  authGetSessionMock: vi.fn(),
  consumeRateLimitMock: vi.fn(),
  createCreditsCheckoutSessionMock: vi.fn(),
  createSubscriptionCheckoutSessionMock: vi.fn(),
  getOrCreateStripeCustomerIdMock: vi.fn(),
  persistStripeCustomerIdMock: vi.fn(),
  prismaMock: {
    subscription: {
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: authGetSessionMock } },
}));

vi.mock("@/features/security/server/rate-limit", () => ({
  consumeRateLimit: consumeRateLimitMock,
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => prismaMock,
}));

vi.mock("@/lib/billing", () => ({
  getEntitlementTier: (
    subscription: { status: string; tier: string } | null,
  ) =>
    subscription?.status === "active" || subscription?.status === "trialing"
      ? subscription.tier
      : "free",
  isSubscriptionEntitled: (status: string | null | undefined) =>
    status === "active" || status === "trialing",
  normalizeTier: (tier: string) => tier,
}));

vi.mock("@/lib/billing/stripe-fulfillment", () => ({
  syncSubscriptionFromStripe: vi.fn(),
}));

vi.mock("@/lib/observability", () => ({
  recordOperationalEvent: vi.fn(),
}));

vi.mock("@/features/billing/server/stripe-customer", () => ({
  persistStripeCustomerId: persistStripeCustomerIdMock,
  resolveExistingStripeCustomerId: (user: {
    stripeCustomerId?: string | null;
    subscription?: { stripeCustomerId?: string | null } | null;
  }) => user.stripeCustomerId ?? user.subscription?.stripeCustomerId ?? null,
}));

vi.mock("@/lib/stripe", () => ({
  CREDIT_PACKS: {
    small: { credits: 10, price: 5 },
    medium: { credits: 25, price: 10 },
    large: { credits: 60, price: 20 },
  },
  STRIPE_PRICE_IDS: {
    pro: "price_pro",
    pro_plus: "price_pro_plus",
  },
  cancelStripeSubscriptionIfPresent: vi.fn(),
  createCreditsCheckoutSession: createCreditsCheckoutSessionMock,
  createSubscriptionCheckoutSession: createSubscriptionCheckoutSessionMock,
  getOrCreateStripeCustomerId: getOrCreateStripeCustomerIdMock,
  isMissingStripeResourceError: vi.fn().mockReturnValue(false),
  upgradeSubscriptionTier: vi.fn(),
}));

import { POST as createSubscriptionCheckout } from "@/app/api/stripe/checkout/route";
import { POST as createCreditsCheckout } from "@/app/api/stripe/credits-checkout/route";

function checkoutRequest(path: string, body: Record<string, string>) {
  return new NextRequest(`https://www.squidagent.app${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://attacker.example",
    },
    body: JSON.stringify(body),
  });
}

describe("Stripe checkout return URLs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://www.squidagent.app");
    authGetSessionMock.mockResolvedValue({ user: { id: "user_1" } });
    consumeRateLimitMock.mockResolvedValue({ allowed: true, remaining: 9 });
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "user@example.com",
      name: "User",
      subscription: null,
    });
    getOrCreateStripeCustomerIdMock.mockResolvedValue("cus_1");
    createSubscriptionCheckoutSessionMock.mockResolvedValue({
      url: "https://checkout.stripe.com/subscription",
    });
    createCreditsCheckoutSessionMock.mockResolvedValue({
      url: "https://checkout.stripe.com/credits",
    });
  });

  it("uses the configured app origin for subscription checkout", async () => {
    const response = await createSubscriptionCheckout(
      checkoutRequest("/api/stripe/checkout", { plan: "pro" }),
    );

    expect(response.status).toBe(200);
    expect(createSubscriptionCheckoutSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: "https://www.squidagent.app",
        tier: "pro",
      }),
    );
    expect(persistStripeCustomerIdMock).toHaveBeenCalledWith({
      userId: "user_1",
      customerId: "cus_1",
      subscriptionId: undefined,
    });
  });

  it("uses the configured app origin for credit checkout", async () => {
    const response = await createCreditsCheckout(
      checkoutRequest("/api/stripe/credits-checkout", { pack: "small" }),
    );

    expect(response.status).toBe(200);
    expect(createCreditsCheckoutSessionMock).toHaveBeenCalledWith(
      "cus_1",
      "https://www.squidagent.app/dashboard?credits_success=true",
      "https://www.squidagent.app/dashboard?credits_canceled=true",
      "small",
      "user_1",
    );
  });
});
