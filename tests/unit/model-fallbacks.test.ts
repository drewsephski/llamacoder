import { describe, expect, it } from "vitest";
import {
  CLAUDE_HAIKU_5_5_MODEL,
  DEFAULT_MODEL,
  FREE_MODEL,
  GEMINI_3_5_FLASH_LITE_MODEL,
  GEMINI_3_8_FLASH_MODEL,
  GPT_6_LUNA_MODEL,
  LEGACY_DEFAULT_MODEL,
  LEGACY_GEMINI_PRO_MODEL,
  LEGACY_GLM_5_2_MODEL,
  LEGACY_GROK_4_5_MODEL,
  LEGACY_KIMI_CODE_MODEL,
  LEGACY_MINIMAX_M3_MODEL,
  LEGACY_FREE_MODEL,
  LEGACY_MIMO_STARTER_MODEL,
  LEGACY_QWEN_MAX_MODEL,
  LEGACY_SECONDARY_STARTER_MODEL,
  GEMINI_MULTIMODAL_MODEL,
  SAFE_GPT_MODEL,
  SECONDARY_STARTER_MODEL,
} from "@/lib/constants";
import { getModelWithFallbacks } from "@/lib/model-fallbacks";

describe("model fallbacks", () => {
  it("uses only the current free model and routes legacy free chats to it", () => {
    expect(getModelWithFallbacks(FREE_MODEL)).toEqual([FREE_MODEL]);
    expect(getModelWithFallbacks(LEGACY_FREE_MODEL)).toEqual([FREE_MODEL]);
  });

  it("routes the legacy secondary starter to the current Gemini Flash Lite lane", () => {
    expect(getModelWithFallbacks(GEMINI_3_5_FLASH_LITE_MODEL)).toEqual([
      GEMINI_3_5_FLASH_LITE_MODEL,
      FREE_MODEL,
    ]);
    expect(getModelWithFallbacks(LEGACY_SECONDARY_STARTER_MODEL)).toEqual([
      GEMINI_3_5_FLASH_LITE_MODEL,
      FREE_MODEL,
    ]);
    expect(getModelWithFallbacks(LEGACY_MIMO_STARTER_MODEL)).toEqual([
      GEMINI_3_5_FLASH_LITE_MODEL,
      FREE_MODEL,
    ]);
  });

  it("does not add fallback routes for active paid models", () => {
    expect(getModelWithFallbacks(GPT_6_LUNA_MODEL)).toEqual([GPT_6_LUNA_MODEL]);
  });

  it("routes mandatory-reasoning legacy models to supported alternatives", () => {
    expect(getModelWithFallbacks("openai/gpt-5.5")).toEqual([GPT_6_LUNA_MODEL]);
    expect(getModelWithFallbacks(SAFE_GPT_MODEL)).toEqual([GPT_6_LUNA_MODEL]);
    expect(getModelWithFallbacks("x-ai/grok-4.3")).toEqual([
      CLAUDE_HAIKU_5_5_MODEL,
    ]);
    expect(getModelWithFallbacks(LEGACY_GROK_4_5_MODEL)).toEqual([
      CLAUDE_HAIKU_5_5_MODEL,
    ]);
  });

  it("routes removed provider-failing models to supported alternatives", () => {
    expect(getModelWithFallbacks(LEGACY_GEMINI_PRO_MODEL)).toEqual([
      GEMINI_3_8_FLASH_MODEL,
    ]);
    expect(getModelWithFallbacks(LEGACY_QWEN_MAX_MODEL)).toEqual([
      CLAUDE_HAIKU_5_5_MODEL,
    ]);
    expect(getModelWithFallbacks(LEGACY_KIMI_CODE_MODEL)).toEqual([
      CLAUDE_HAIKU_5_5_MODEL,
    ]);
    expect(getModelWithFallbacks(LEGACY_MINIMAX_M3_MODEL)).toEqual([
      CLAUDE_HAIKU_5_5_MODEL,
    ]);
  });

  it("routes retired Gemini defaults to Gemini 3.8 Flash", () => {
    expect(getModelWithFallbacks(LEGACY_DEFAULT_MODEL)).toEqual([
      GEMINI_3_8_FLASH_MODEL,
    ]);
    expect(getModelWithFallbacks(GEMINI_MULTIMODAL_MODEL)).toEqual([
      GEMINI_3_8_FLASH_MODEL,
    ]);
    expect(getModelWithFallbacks(SECONDARY_STARTER_MODEL)).toEqual([
      GEMINI_3_8_FLASH_MODEL,
    ]);
  });

  it("routes legacy GLM 5.2 chats to GLM 5.3 Flash", () => {
    expect(getModelWithFallbacks(LEGACY_GLM_5_2_MODEL)).toEqual([
      DEFAULT_MODEL,
    ]);
  });
});
