export const FALLBACK_MODELS = {
  primary: "tencent/hy3-preview:free",
  fallbacks: [
    "minimax/minimax-m2.5:free",
    "openai/gpt-oss-120b:free",
    "openrouter/free",
    "z-ai/glm-4.5-air:free",
  ],
};

export function getModelWithFallbacks(model: string): string[] {
  // If it's the free model, return the fallback chain
  if (model === "tencent/hy3-preview:free") {
    return [FALLBACK_MODELS.primary, ...FALLBACK_MODELS.fallbacks];
  }

  // For paid models, just return the model itself (no fallbacks)
  return [model];
}
