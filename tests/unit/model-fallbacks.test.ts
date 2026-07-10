import { describe, expect, it } from "vitest";
import {
  FREE_MODEL,
  LEGACY_GEMINI_PRO_MODEL,
  LEGACY_KIMI_CODE_MODEL,
  LEGACY_MINIMAX_M3_MODEL,
  LEGACY_FREE_MODEL,
  LEGACY_MIMO_STARTER_MODEL,
  LEGACY_QWEN_MAX_MODEL,
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
    expect(getModelWithFallbacks("x-ai/grok-4.5")).toEqual(["x-ai/grok-4.5"]);
  });

  it("routes mandatory-reasoning legacy models to optional/no-thinking models", () => {
    expect(getModelWithFallbacks("openai/gpt-5.5")).toEqual([SAFE_GPT_MODEL]);
    expect(getModelWithFallbacks("x-ai/grok-4.3")).toEqual([
      "deepseek/deepseek-v4-pro",
    ]);
  });

  it("routes removed provider-failing models to supported alternatives", () => {
    expect(getModelWithFallbacks(LEGACY_GEMINI_PRO_MODEL)).toEqual([
      "google/gemini-3-flash-preview",
    ]);
    expect(getModelWithFallbacks(LEGACY_QWEN_MAX_MODEL)).toEqual([
      "deepseek/deepseek-v4-pro",
    ]);
    expect(getModelWithFallbacks(LEGACY_KIMI_CODE_MODEL)).toEqual([
      "deepseek/deepseek-v4-pro",
    ]);
    expect(getModelWithFallbacks(LEGACY_MINIMAX_M3_MODEL)).toEqual([
      "deepseek/deepseek-v4-pro",
    ]);
  });
});
