import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authGetSessionMock,
  consumeRateLimitMock,
  createCustomerPortalSessionMock,
  getOrCreateStripeCustomerIdMock,
  prismaMock,
} = vi.hoisted(() => ({
  authGetSessionMock: vi.fn(),
  consumeRateLimitMock: vi.fn(),
  createCustomerPortalSessionMock: vi.fn(),
  getOrCreateStripeCustomerIdMock: vi.fn(),
  prismaMock: {
    subscription: {
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
  isSubscriptionEntitled: (status: string | null | undefined) =>
    status === "active" || status === "trialing",
}));

vi.mock("@/lib/observability", () => ({
  recordOperationalEvent: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  createCustomerPortalSession: createCustomerPortalSessionMock,
  getOrCreateStripeCustomerId: getOrCreateStripeCustomerIdMock,
}));

import { POST as createPortalSession } from "@/app/api/stripe/portal/route";

function portalRequest(referer?: string) {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  if (referer) {
    headers.referer = referer;
  }

  return new NextRequest("https://www.squidagent.app/api/stripe/portal", {
    method: "POST",
    headers,
  });
}

describe("Stripe customer portal route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://www.squidagent.app");
    authGetSessionMock.mockResolvedValue({ user: { id: "user_1" } });
    consumeRateLimitMock.mockResolvedValue({ allowed: true, remaining: 9 });
    getOrCreateStripeCustomerIdMock.mockResolvedValue("cus_1");
    createCustomerPortalSessionMock.mockResolvedValue({
      url: "https://billing.stripe.com/portal",
    });
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "user@example.com",
      name: "User",
      subscription: {
        id: "sub_row_1",
        status: "active",
        stripeCustomerId: "cus_1",
        stripeSubscriptionId: "sub_1",
      },
    });
  });

  it("returns a portal URL for subscribed users", async () => {
    const response = await createPortalSession(portalRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ url: "https://billing.stripe.com/portal" });
    expect(createCustomerPortalSessionMock).toHaveBeenCalledWith(
      "cus_1",
      "https://www.squidagent.app/dashboard",
    );
  });

  it("uses the referer when it matches the app origin", async () => {
    await createPortalSession(
      portalRequest("https://www.squidagent.app/dashboard?tab=billing"),
    );

    expect(createCustomerPortalSessionMock).toHaveBeenCalledWith(
      "cus_1",
      "https://www.squidagent.app/dashboard?tab=billing",
    );
  });

  it("rejects users without an active subscription", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "user@example.com",
      name: "User",
      subscription: null,
    });

    const response = await createPortalSession(portalRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/active subscription/i);
    expect(createCustomerPortalSessionMock).not.toHaveBeenCalled();
  });

  it("requires authentication", async () => {
    authGetSessionMock.mockResolvedValue(null);

    const response = await createPortalSession(portalRequest());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toMatch(/signed in/i);
  });
});
