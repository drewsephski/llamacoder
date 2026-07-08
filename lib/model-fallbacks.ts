import { FREE_MODEL, LEGACY_FREE_MODEL } from "@/lib/constants";

export const FALLBACK_MODELS = {
  free: FREE_MODEL,
};

export function getModelWithFallbacks(model: string): string[] {
  // Route stored legacy free chats through the current free model.
  if (model === LEGACY_FREE_MODEL) {
    return [FALLBACK_MODELS.free];
  }

  if (model === FALLBACK_MODELS.free) {
    return [FALLBACK_MODELS.free];
  }

  // For paid models, just return the model itself (no fallbacks)
  return [model];
}
