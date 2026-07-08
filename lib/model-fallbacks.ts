import {
  FREE_MODEL,
  LEGACY_FREE_MODEL,
  LEGACY_MIMO_STARTER_MODEL,
  LEGACY_SECONDARY_STARTER_MODEL,
  SAFE_GPT_MODEL,
  SECONDARY_STARTER_MODEL,
} from "@/lib/constants";

export const FALLBACK_MODELS = {
  free: FREE_MODEL,
  gpt: SAFE_GPT_MODEL,
  advancedCode: "minimax/minimax-m3",
};

export function getModelWithFallbacks(model: string): string[] {
  // Route stored legacy free chats through the current free model.
  if (model === LEGACY_FREE_MODEL) {
    return [FALLBACK_MODELS.free];
  }

  if (model === FALLBACK_MODELS.free) {
    return [FALLBACK_MODELS.free];
  }

  // Keep existing starter chats on the current cheaper starter lane.
  if (
    model === LEGACY_SECONDARY_STARTER_MODEL ||
    model === LEGACY_MIMO_STARTER_MODEL
  ) {
    return [SECONDARY_STARTER_MODEL];
  }

  // Route saved mandatory-reasoning chats through optional/no-thinking models.
  if (model.startsWith("openai/gpt-5")) {
    return [FALLBACK_MODELS.gpt];
  }

  if (model.startsWith("x-ai/grok-4")) {
    return [FALLBACK_MODELS.advancedCode];
  }

  // For paid models, just return the model itself (no fallbacks)
  return [model];
}
