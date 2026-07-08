import { describe, expect, it } from "vitest";
import {
  TIERS,
  canTierUseModel,
  getModelCreditCost,
  normalizeTier,
} from "@/lib/billing/config";
import {
  FREE_MODEL,
  LEGACY_MIMO_STARTER_MODEL,
  LEGACY_SECONDARY_STARTER_MODEL,
  SAFE_GPT_MODEL,
  SECONDARY_STARTER_MODEL,
} from "@/lib/constants";

describe("billing config", () => {
  it("uses deterministic model costs and defaults unknown models to one credit", () => {
    expect(getModelCreditCost(FREE_MODEL)).toBe(1);
    expect(getModelCreditCost(SECONDARY_STARTER_MODEL)).toBe(1);
    expect(getModelCreditCost(LEGACY_SECONDARY_STARTER_MODEL)).toBe(1);
    expect(getModelCreditCost(LEGACY_MIMO_STARTER_MODEL)).toBe(1);
    expect(getModelCreditCost("deepseek/deepseek-v4-pro")).toBe(2);
    expect(getModelCreditCost("x-ai/grok-4.3")).toBe(2);
    expect(getModelCreditCost("z-ai/glm-5.2")).toBe(2);
    expect(getModelCreditCost("minimax/minimax-m3")).toBe(2);
    expect(getModelCreditCost("moonshotai/kimi-k2.7-code")).toBe(3);
    expect(getModelCreditCost("qwen/qwen3.7-max")).toBe(3);
    expect(getModelCreditCost("anthropic/claude-sonnet-5")).toBe(4);
    expect(getModelCreditCost("google/gemini-3.1-pro-preview")).toBe(4);
    expect(getModelCreditCost(SAFE_GPT_MODEL)).toBe(4);
    expect(getModelCreditCost("anthropic/claude-opus-4.8")).toBe(6);
    expect(getModelCreditCost("openai/gpt-5.5")).toBe(4);
    expect(getModelCreditCost("unknown/model")).toBe(1);
  });

  it("enforces tier model access from the config", () => {
    expect(canTierUseModel("free", FREE_MODEL)).toBe(true);
    expect(canTierUseModel("free", SECONDARY_STARTER_MODEL)).toBe(true);
    expect(canTierUseModel("free", LEGACY_SECONDARY_STARTER_MODEL)).toBe(true);
    expect(canTierUseModel("free", LEGACY_MIMO_STARTER_MODEL)).toBe(true);
    expect(canTierUseModel("free", "openai/gpt-5.4")).toBe(false);
    expect(canTierUseModel("pro", "openai/gpt-5.4")).toBe(true);
    expect(TIERS.pro.monthlyCredits).toBe(100);
  });

  it("normalizes legacy and unknown tier values", () => {
    expect(normalizeTier(null)).toBe("free");
    expect(normalizeTier("unlimited")).toBe("pro_plus");
    expect(normalizeTier("pro")).toBe("pro");
    expect(normalizeTier("enterprise")).toBe("free");
  });
});
