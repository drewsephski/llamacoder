import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Stripe config proxies", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("STRIPE_PRO_PRICE_ID", "price_pro");
    vi.stubEnv("STRIPE_PRO_PLUS_PRICE_ID", "price_pro_plus");
    vi.stubEnv("STRIPE_CREDITS_10_PRICE_ID", "price_credits_10");
    vi.stubEnv("STRIPE_CREDITS_25_PRICE_ID", "price_credits_25");
    vi.stubEnv("STRIPE_CREDITS_60_PRICE_ID", "price_credits_60");
  });

  it("exposes subscription price ids to Object.hasOwn and Object.entries", async () => {
    const { STRIPE_PRICE_IDS } = await import("@/lib/stripe");

    expect(Object.hasOwn(STRIPE_PRICE_IDS, "pro")).toBe(true);
    expect(Object.hasOwn(STRIPE_PRICE_IDS, "pro_plus")).toBe(true);
    expect(Object.hasOwn(STRIPE_PRICE_IDS, "free")).toBe(false);
    expect(Object.entries(STRIPE_PRICE_IDS)).toEqual([
      ["pro", "price_pro"],
      ["pro_plus", "price_pro_plus"],
    ]);
  });

  it("exposes credit pack configs to the in operator and Object.entries", async () => {
    const { CREDIT_PACK_CONFIGS } = await import("@/lib/stripe");

    expect("small" in CREDIT_PACK_CONFIGS).toBe(true);
    expect("medium" in CREDIT_PACK_CONFIGS).toBe(true);
    expect("large" in CREDIT_PACK_CONFIGS).toBe(true);
    expect(
      Object.entries(CREDIT_PACK_CONFIGS).map(([key, pack]) => [
        key,
        pack.priceId,
      ]),
    ).toEqual([
      ["small", "price_credits_10"],
      ["medium", "price_credits_25"],
      ["large", "price_credits_60"],
    ]);
  });
});
