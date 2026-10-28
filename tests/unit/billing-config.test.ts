import { describe, expect, it } from "vitest";
import {
  TIERS,
  canTierUseModel,
  getCostBasedCreditCharge,
  getEntitlementTier,
  getModelCreditHoldCost,
  getModelCreditCost,
  getModelTokenPricing,
  getOpenRouterMaxPrice,
  isSubscriptionEntitled,
  normalizeTier,
} from "@/lib/billing/config";
import {
  DEFAULT_MODEL,
  FREE_MODEL,
  GEMINI_3_5_FLASH_LITE_MODEL,
  LEGACY_DEFAULT_MODEL,
  LEGACY_GEMINI_PRO_MODEL,
  LEGACY_KIMI_CODE_MODEL,
  LEGACY_MINIMAX_M3_MODEL,
  LEGACY_MIMO_STARTER_MODEL,
  LEGACY_QWEN_MAX_MODEL,
  GEMINI_MULTIMODAL_MODEL,
  LEGACY_GLM_5_2_MODEL,
  LEGACY_SECONDARY_STARTER_MODEL,
  SAFE_GPT_MODEL,
  SECONDARY_STARTER_MODEL,
} from "@/lib/constants";

describe("billing config", () => {
  it("uses conservative model costs and fails closed for unknown models", () => {
    expect(getModelCreditCost(FREE_MODEL)).toBe(1);
    expect(getModelCreditCost(DEFAULT_MODEL)).toBe(1);
    expect(getModelCreditCost(GEMINI_3_5_FLASH_LITE_MODEL)).toBe(3);
    expect(getModelCreditCost(LEGACY_DEFAULT_MODEL)).toBe(3);
    expect(getModelCreditCost(SECONDARY_STARTER_MODEL)).toBe(3);
    expect(getModelCreditCost(LEGACY_SECONDARY_STARTER_MODEL)).toBe(3);
    expect(getModelCreditCost(LEGACY_MIMO_STARTER_MODEL)).toBe(3);
    expect(getModelCreditCost("deepseek/deepseek-v4-pro")).toBe(2);
    expect(getModelCreditCost("x-ai/grok-4.3")).toBe(2);
    expect(getModelCreditCost("openai/gpt-6-luna")).toBe(1);
    expect(getModelCreditCost(LEGACY_GLM_5_2_MODEL)).toBe(1);
    expect(getModelCreditCost(LEGACY_MINIMAX_M3_MODEL)).toBe(2);
    expect(getModelCreditCost(LEGACY_KIMI_CODE_MODEL)).toBe(2);
    expect(getModelCreditCost(LEGACY_QWEN_MAX_MODEL)).toBe(2);
    expect(getModelCreditCost("anthropic/claude-sonnet-5")).toBe(16);
    expect(getModelCreditCost("x-ai/grok-4.5")).toBe(2);
    expect(getModelCreditCost(LEGACY_GEMINI_PRO_MODEL)).toBe(3);
    expect(getModelCreditCost(SAFE_GPT_MODEL)).toBe(1);
    expect(getModelCreditCost("anthropic/claude-opus-5.5")).toBe(16);
    expect(getModelCreditCost("anthropic/claude-opus-4.8")).toBe(16);
    expect(
      getModelCreditCost("anthropic/claude-opus-4.8", { outputTokens: 15_000 }),
    ).toBe(40);
    expect(getModelCreditHoldCost("anthropic/claude-opus-4.8")).toBe(40);
    expect(getModelCreditCost("openai/gpt-5.5")).toBe(1);
    expect(() => getModelCreditCost("unknown/model")).toThrow(
      "UNPRICED_MODEL:unknown/model",
    );
    expect(() => getModelCreditCost("openai/gpt-5.99-preview")).toThrow(
      "UNPRICED_MODEL:openai/gpt-5.99-preview",
    );
    expect(canTierUseModel("pro_plus", "unknown/model")).toBe(false);
  });

  it("uses the current OpenRouter token prices for the default model", () => {
    expect(getModelTokenPricing(DEFAULT_MODEL)).toEqual({
      inputPricePerMillion: 0.1,
      outputPricePerMillion: 0.5,
    });
    expect(getModelTokenPricing(GEMINI_MULTIMODAL_MODEL)).toEqual({
      inputPricePerMillion: 0.825,
      outputPricePerMillion: 4.125,
    });
    expect(getModelTokenPricing(GEMINI_3_5_FLASH_LITE_MODEL)).toEqual({
      inputPricePerMillion: 0.3,
      outputPricePerMillion: 2.5,
    });
    expect(getModelTokenPricing(LEGACY_DEFAULT_MODEL)).toEqual(
      getModelTokenPricing("google/gemini-3.8-flash"),
    );
    expect(getModelTokenPricing(FREE_MODEL)).toEqual({
      inputPricePerMillion: 0.091,
      outputPricePerMillion: 0.182,
    });
    expect(getModelTokenPricing(LEGACY_GLM_5_2_MODEL)).toEqual(
      getModelTokenPricing(DEFAULT_MODEL),
    );
  });

  it("adds a bounded safety margin to OpenRouter provider ceilings", () => {
    expect(getOpenRouterMaxPrice(FREE_MODEL)).toEqual({
      inputPricePerMillion: 0.10465,
      outputPricePerMillion: 0.2093,
    });
    expect(getOpenRouterMaxPrice(LEGACY_GLM_5_2_MODEL)).toEqual({
      inputPricePerMillion: 0.115,
      outputPricePerMillion: 0.575,
    });
  });

  it("rounds actual provider cost up to preserve the configured margin", () => {
    expect(getCostBasedCreditCharge(0)).toBe(0);
    expect(getCostBasedCreditCharge(0.015)).toBe(2);
    expect(getCostBasedCreditCharge(0.12)).toBe(10);
  });

  it.each([
    [3_999, 2],
    [4_000, 2],
    [4_001, 3],
    [8_000, 3],
    [8_001, 4],
    [12_000, 4],
    [12_001, 5],
    [15_000, 5],
  ])(
    "prices legacy Qwen output boundary %i tokens",
    (outputTokens, expected) => {
      const modelId = LEGACY_QWEN_MAX_MODEL;
      expect(getModelCreditCost(modelId, { outputTokens })).toBe(expected);
      expect(getModelCreditHoldCost(modelId)).toBeGreaterThanOrEqual(expected);
    },
  );

  it("enforces tier model access from the config", () => {
    expect(canTierUseModel("free", FREE_MODEL)).toBe(true);
    expect(canTierUseModel("free", DEFAULT_MODEL)).toBe(true);
    expect(canTierUseModel("free", GEMINI_MULTIMODAL_MODEL)).toBe(true);
    expect(canTierUseModel("free", GEMINI_3_5_FLASH_LITE_MODEL)).toBe(true);
    expect(canTierUseModel("free", LEGACY_DEFAULT_MODEL)).toBe(true);
    expect(canTierUseModel("free", LEGACY_SECONDARY_STARTER_MODEL)).toBe(true);
    expect(canTierUseModel("free", LEGACY_MIMO_STARTER_MODEL)).toBe(true);
    expect(canTierUseModel("free", "z-ai/glm-5.3-flash")).toBe(true);
    expect(canTierUseModel("free", "deepseek/deepseek-v4-pro")).toBe(false);
    expect(
      canTierUseModel("free", "deepseek/deepseek-v4-pro", {
        hasPurchasedCredits: true,
      }),
    ).toBe(true);
    expect(canTierUseModel("pro", "openai/gpt-6-luna")).toBe(true);
    expect(canTierUseModel("pro", "anthropic/claude-opus-5.5")).toBe(false);
    expect(canTierUseModel("pro_plus", "anthropic/claude-opus-5.5")).toBe(true);
    expect(TIERS.pro.monthlyCredits).toBe(100);
    expect(TIERS.pro.rolloverCap).toBe(200);
  });

  it("normalizes legacy and unknown tier values", () => {
    expect(normalizeTier(null)).toBe("free");
    expect(normalizeTier("unlimited")).toBe("pro_plus");
    expect(normalizeTier("pro")).toBe("pro");
    expect(normalizeTier("enterprise")).toBe("free");
  });

  it("treats trialing subscriptions as entitled to paid tiers", () => {
    expect(isSubscriptionEntitled("active")).toBe(true);
    expect(isSubscriptionEntitled("trialing")).toBe(true);
    expect(isSubscriptionEntitled("past_due")).toBe(false);
    expect(isSubscriptionEntitled("canceled")).toBe(false);

    expect(getEntitlementTier({ status: "trialing", tier: "pro" })).toBe("pro");
    expect(getEntitlementTier({ status: "canceled", tier: "pro_plus" })).toBe(
      "free",
    );
  });
});
