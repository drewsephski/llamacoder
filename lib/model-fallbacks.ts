export const FALLBACK_MODELS = {
  free: "tencent/hy3-preview:free",
  freeFallbacks: [
    "qwen/qwen3-coder:free",
    "openai/gpt-oss-120b:free",
    "openrouter/free",
  ],
};

export function getModelWithFallbacks(model: string): string[] {
  // If it's the free model, return the fallback chain
  if (model === FALLBACK_MODELS.free) {
    return [FALLBACK_MODELS.free, ...FALLBACK_MODELS.freeFallbacks];
  }

  // For paid models, just return the model itself (no fallbacks)
  return [model];
}
