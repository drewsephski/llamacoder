import { describe, expect, it } from "vitest";
import {
  FREE_MODEL,
  LEGACY_FREE_MODEL,
  LEGACY_MIMO_STARTER_MODEL,
  LEGACY_SECONDARY_STARTER_MODEL,
  SAFE_GPT_MODEL,
  SECONDARY_STARTER_MODEL,
} from "@/lib/constants";
import { getModelWithFallbacks } from "@/lib/model-fallbacks";

describe("model fallbacks", () => {
  it("uses only the current free model and routes legacy free chats to it", () => {
    expect(getModelWithFallbacks(FREE_MODEL)).toEqual([FREE_MODEL]);
    expect(getModelWithFallbacks(LEGACY_FREE_MODEL)).toEqual([FREE_MODEL]);
  });

  it("routes the legacy secondary starter to the current secondary starter", () => {
    expect(getModelWithFallbacks(SECONDARY_STARTER_MODEL)).toEqual([
      SECONDARY_STARTER_MODEL,
    ]);
    expect(getModelWithFallbacks(LEGACY_SECONDARY_STARTER_MODEL)).toEqual([
      SECONDARY_STARTER_MODEL,
    ]);
    expect(getModelWithFallbacks(LEGACY_MIMO_STARTER_MODEL)).toEqual([
      SECONDARY_STARTER_MODEL,
    ]);
  });

  it("does not add fallback routes for paid models", () => {
    expect(getModelWithFallbacks("moonshotai/kimi-k2.7-code")).toEqual([
      "moonshotai/kimi-k2.7-code",
    ]);
  });

  it("routes mandatory-reasoning legacy models to optional/no-thinking models", () => {
    expect(getModelWithFallbacks("openai/gpt-5.5")).toEqual([SAFE_GPT_MODEL]);
    expect(getModelWithFallbacks("x-ai/grok-4.3")).toEqual([
      "minimax/minimax-m3",
    ]);
  });
});
