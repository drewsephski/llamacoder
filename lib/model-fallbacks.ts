import {
  CLAUDE_HAIKU_5_5_MODEL,
  CLAUDE_OPUS_5_5_MODEL,
  DEFAULT_MODEL,
  FREE_MODEL,
  GEMINI_3_5_FLASH_LITE_MODEL,
  GEMINI_3_8_FLASH_MODEL,
  GEMINI_MULTIMODAL_MODEL,
  GPT_6_LUNA_MODEL,
  LEGACY_CLAUDE_OPUS_4_8_MODEL,
  LEGACY_CLAUDE_OPUS_MODEL,
  LEGACY_CLAUDE_SONNET_5_MODEL,
  LEGACY_DEFAULT_MODEL,
  LEGACY_DEEPSEEK_V4_PRO_MODEL,
  LEGACY_GEMINI_3_5_FLASH_MODEL,
  LEGACY_GEMINI_3_6_FLASH_MODEL,
  LEGACY_GEMINI_3_7_FLASH_MODEL,
  LEGACY_GEMINI_PRO_MODEL,
  LEGACY_GLM_5_2_MODEL,
  LEGACY_GLM_5_3_FLASH_MODEL,
  LEGACY_GROK_4_5_MODEL,
  LEGACY_GPT_5_4_MODEL,
  LEGACY_KIMI_CODE_MODEL,
  LEGACY_LAGUNA_MODEL,
  LEGACY_MINIMAX_M3_MODEL,
  LEGACY_FREE_MODEL,
  LEGACY_GEMINI_DEFAULT_MODEL,
  LEGACY_MIMO_STARTER_MODEL,
  LEGACY_QWEN_MAX_MODEL,
  LEGACY_SECONDARY_STARTER_MODEL,
  SAFE_GPT_MODEL,
  SECONDARY_STARTER_MODEL,
} from "@/lib/constants";

export const FALLBACK_MODELS = {
  free: FREE_MODEL,
  gpt: GPT_6_LUNA_MODEL,
  gemini: GEMINI_3_8_FLASH_MODEL,
  advancedCode: CLAUDE_HAIKU_5_5_MODEL,
  premium: CLAUDE_OPUS_5_5_MODEL,
};

const LEGACY_GEMINI_FLASH_MODELS = new Set<string>([
  GEMINI_MULTIMODAL_MODEL,
  LEGACY_GEMINI_DEFAULT_MODEL,
  LEGACY_GEMINI_3_5_FLASH_MODEL,
  LEGACY_GEMINI_3_6_FLASH_MODEL,
  LEGACY_GEMINI_3_7_FLASH_MODEL,
  SECONDARY_STARTER_MODEL,
]);

export function getModelWithFallbacks(model: string): string[] {
  // Route stored legacy free chats through the current free model.
  if (model === LEGACY_FREE_MODEL) {
    return [FALLBACK_MODELS.free];
  }

  if (model === FALLBACK_MODELS.free) {
    return [FALLBACK_MODELS.free];
  }

  // Keep projects created with retired Gemini IDs on the current Gemini lane.
  if (model === LEGACY_DEFAULT_MODEL || LEGACY_GEMINI_FLASH_MODELS.has(model)) {
    return [FALLBACK_MODELS.gemini];
  }

  // Keep existing starter chats on the current cheaper starter lane.
  if (
    model === LEGACY_SECONDARY_STARTER_MODEL ||
    model === LEGACY_MIMO_STARTER_MODEL
  ) {
    return [GEMINI_3_5_FLASH_LITE_MODEL, FALLBACK_MODELS.free];
  }

  // Keep starter generation available when Gemini returns a transient stream
  // error. The fallback stays inside the starter lane's provider price cap.
  if (model === GEMINI_3_5_FLASH_LITE_MODEL) {
    return [GEMINI_3_5_FLASH_LITE_MODEL, FALLBACK_MODELS.free];
  }

  // Route saved mandatory-reasoning chats through optional/no-thinking models.
  if (
    model === LEGACY_GPT_5_4_MODEL ||
    model === "openai/gpt-5.5" ||
    model === SAFE_GPT_MODEL
  ) {
    return [FALLBACK_MODELS.gpt];
  }

  if (
    model === LEGACY_CLAUDE_OPUS_MODEL ||
    model === LEGACY_CLAUDE_OPUS_4_8_MODEL ||
    model === LEGACY_CLAUDE_SONNET_5_MODEL
  ) {
    return [FALLBACK_MODELS.premium];
  }

  if (model === LEGACY_LAGUNA_MODEL) {
    return [FALLBACK_MODELS.free];
  }

  if (model === "x-ai/grok-4.3" || model === LEGACY_GROK_4_5_MODEL) {
    return [FALLBACK_MODELS.advancedCode];
  }

  if (model === LEGACY_GEMINI_PRO_MODEL) {
    return [FALLBACK_MODELS.gemini];
  }

  if (
    model === LEGACY_QWEN_MAX_MODEL ||
    model === LEGACY_KIMI_CODE_MODEL ||
    model === LEGACY_MINIMAX_M3_MODEL ||
    model === LEGACY_DEEPSEEK_V4_PRO_MODEL
  ) {
    return [FALLBACK_MODELS.advancedCode];
  }

  if (model === LEGACY_GLM_5_2_MODEL || model === LEGACY_GLM_5_3_FLASH_MODEL) {
    return [DEFAULT_MODEL];
  }

  // For paid models, just return the model itself (no fallbacks)
  return [model];
}
