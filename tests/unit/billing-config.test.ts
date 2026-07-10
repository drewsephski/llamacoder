import { describe, expect, it } from "vitest";
import {
  TIERS,
  canTierUseModel,
  getCostBasedCreditCharge,
  getModelCreditHoldCost,
  getModelCreditCost,
  normalizeTier,
} from "@/lib/billing/config";
import {
  FREE_MODEL,
  LEGACY_GEMINI_PRO_MODEL,
  LEGACY_KIMI_CODE_MODEL,
  LEGACY_MINIMAX_M3_MODEL,
  LEGACY_MIMO_STARTER_MODEL,
  LEGACY_QWEN_MAX_MODEL,
  LEGACY_SECONDARY_STARTER_MODEL,
  SAFE_GPT_MODEL,
  SECONDARY_STARTER_MODEL,
} from "@/lib/constants";

describe("billing config", () => {
  it("uses conservative model costs and fails closed for unknown models", () => {
    expect(getModelCreditCost(FREE_MODEL)).toBe(1);
    expect(getModelCreditCost(SECONDARY_STARTER_MODEL)).toBe(1);
    expect(getModelCreditCost(LEGACY_SECONDARY_STARTER_MODEL)).toBe(1);
    expect(getModelCreditCost(LEGACY_MIMO_STARTER_MODEL)).toBe(1);
    expect(getModelCreditCost("deepseek/deepseek-v4-pro")).toBe(2);
    expect(getModelCreditCost("x-ai/grok-4.3")).toBe(2);
    expect(getModelCreditCost("z-ai/glm-5.2")).toBe(3);
    expect(getModelCreditCost(LEGACY_MINIMAX_M3_MODEL)).toBe(2);
    expect(getModelCreditCost(LEGACY_KIMI_CODE_MODEL)).toBe(2);
    expect(getModelCreditCost(LEGACY_QWEN_MAX_MODEL)).toBe(2);
    expect(getModelCreditCost("anthropic/claude-sonnet-5")).toBe(8);
    expect(getModelCreditCost("x-ai/grok-4.5")).toBe(7);
    expect(getModelCreditCost(LEGACY_GEMINI_PRO_MODEL)).toBe(3);
    expect(getModelCreditCost(SAFE_GPT_MODEL)).toBe(7);
    expect(getModelCreditCost("anthropic/claude-opus-4.8")).toBe(19);
    expect(
      getModelCreditCost("anthropic/claude-opus-4.8", { outputTokens: 15_000 }),
    ).toBe(44);
    expect(getModelCreditHoldCost("anthropic/claude-opus-4.8")).toBe(44);
    expect(getModelCreditCost("openai/gpt-5.5")).toBe(7);
    expect(() => getModelCreditCost("unknown/model")).toThrow(
      "UNPRICED_MODEL:unknown/model",
    );
    expect(() => getModelCreditCost("openai/gpt-5.99-preview")).toThrow(
      "UNPRICED_MODEL:openai/gpt-5.99-preview",
    );
    expect(canTierUseModel("pro_plus", "unknown/model")).toBe(false);
  });

  it("rounds actual provider cost up to preserve the configured margin", () => {
    expect(getCostBasedCreditCharge(0)).toBe(0);
    expect(getCostBasedCreditCharge(0.015)).toBe(2);
    expect(getCostBasedCreditCharge(0.12)).toBe(10);
  });

  it.each([
    [3_999, 2],
    [4_000, 2],
    [4_001, 2],
    [8_000, 2],
    [8_001, 2],
    [12_000, 2],
    [12_001, 3],
    [15_000, 3],
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
    expect(canTierUseModel("free", SECONDARY_STARTER_MODEL)).toBe(true);
    expect(canTierUseModel("free", LEGACY_SECONDARY_STARTER_MODEL)).toBe(true);
    expect(canTierUseModel("free", LEGACY_MIMO_STARTER_MODEL)).toBe(true);
    expect(canTierUseModel("free", "deepseek/deepseek-v4-pro")).toBe(false);
    expect(
      canTierUseModel("free", "deepseek/deepseek-v4-pro", {
        hasPurchasedCredits: true,
      }),
    ).toBe(true);
    expect(canTierUseModel("pro", SAFE_GPT_MODEL)).toBe(true);
    expect(canTierUseModel("pro", "anthropic/claude-opus-4.8")).toBe(false);
    expect(canTierUseModel("pro_plus", "anthropic/claude-opus-4.8")).toBe(true);
    expect(TIERS.pro.monthlyCredits).toBe(100);
    expect(TIERS.pro.rolloverCap).toBe(200);
  });

  it("normalizes legacy and unknown tier values", () => {
    expect(normalizeTier(null)).toBe("free");
    expect(normalizeTier("unlimited")).toBe("pro_plus");
    expect(normalizeTier("pro")).toBe("pro");
    expect(normalizeTier("enterprise")).toBe("free");
  });
});
