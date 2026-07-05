import { describe, expect, it } from "vitest";
import {
  TIERS,
  canTierUseModel,
  getModelCreditCost,
  normalizeTier,
} from "@/lib/billing/config";
import { FREE_MODEL } from "@/lib/constants";

describe("billing config", () => {
  it("uses deterministic model costs and defaults unknown models to one credit", () => {
    expect(getModelCreditCost(FREE_MODEL)).toBe(1);
    expect(getModelCreditCost("anthropic/claude-opus-4.6")).toBe(7);
    expect(getModelCreditCost("unknown/model")).toBe(1);
  });

  it("enforces tier model access from the config", () => {
    expect(canTierUseModel("free", FREE_MODEL)).toBe(true);
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
