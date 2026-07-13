const MODEL_BADGE_CLASS_BY_PROVIDER: Record<string, string> = {
  anthropic: "model-claude",
  deepseek: "model-deepseek",
  google: "model-gemini",
  "meta-llama": "model-llama",
  openai: "model-gpt",
  "x-ai": "model-grok",
  "z-ai": "model-glm",
};

export function getModelBadgeClass(model: string): string {
  const provider = model.toLowerCase().split("/", 1)[0];
  return MODEL_BADGE_CLASS_BY_PROVIDER[provider] ?? "model-default";
}
