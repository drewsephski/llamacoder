import {
  FREE_MODEL,
  LEGACY_GEMINI_PRO_MODEL,
  LEGACY_KIMI_CODE_MODEL,
  LEGACY_MINIMAX_M3_MODEL,
  LEGACY_MIMO_STARTER_MODEL,
  LEGACY_QWEN_MAX_MODEL,
  LEGACY_SECONDARY_STARTER_MODEL,
  LEGACY_FREE_MODEL,
  SAFE_GPT_MODEL,
  SECONDARY_STARTER_MODEL,
} from "@/lib/constants";

/**
 * Dynamic credit pricing by output size.
 * Credits are charged only after a new app version is successfully saved.
 */
export type GenerationSizeBand = "small" | "standard" | "large" | "xl";

type ModelTier = "starter" | "efficient" | "advanced" | "premium";

type ModelPricing = {
  tier: ModelTier;
  bands: Record<GenerationSizeBand, number>;
};

export const MODEL_PRICING: Record<string, ModelPricing> = {
  [FREE_MODEL]: {
    tier: "starter",
    bands: { small: 1, standard: 1, large: 1, xl: 1 },
  },
  [LEGACY_FREE_MODEL]: {
    tier: "starter",
    bands: { small: 1, standard: 1, large: 1, xl: 1 },
  },
  [SECONDARY_STARTER_MODEL]: {
    tier: "starter",
    bands: { small: 1, standard: 1, large: 1, xl: 1 },
  },
  [LEGACY_SECONDARY_STARTER_MODEL]: {
    tier: "starter",
    bands: { small: 1, standard: 1, large: 1, xl: 1 },
  },
  [LEGACY_MIMO_STARTER_MODEL]: {
    tier: "starter",
    bands: { small: 1, standard: 1, large: 1, xl: 1 },
  },
  "deepseek/deepseek-v4-pro": {
    tier: "efficient",
    bands: { small: 1, standard: 1, large: 2, xl: 2 },
  },
  [LEGACY_MINIMAX_M3_MODEL]: {
    tier: "efficient",
    bands: { small: 1, standard: 1, large: 2, xl: 2 },
  },
  "z-ai/glm-5.2": {
    tier: "efficient",
    bands: { small: 1, standard: 3, large: 4, xl: 6 },
  },
  "google/gemini-3-flash-preview": {
    tier: "efficient",
    bands: { small: 1, standard: 3, large: 4, xl: 5 },
  },
  [LEGACY_KIMI_CODE_MODEL]: {
    tier: "efficient",
    bands: { small: 1, standard: 3, large: 4, xl: 5 },
  },
  "x-ai/grok-4.3": {
    tier: "efficient",
    bands: { small: 1, standard: 1, large: 2, xl: 3 },
  },
  [LEGACY_QWEN_MAX_MODEL]: {
    tier: "advanced",
    bands: { small: 2, standard: 4, large: 5, xl: 8 },
  },
  "x-ai/grok-4.5": {
    tier: "advanced",
    bands: { small: 3, standard: 5, large: 8, xl: 12 },
  },
  [SAFE_GPT_MODEL]: {
    tier: "advanced",
    bands: { small: 3, standard: 7, large: 10, xl: 15 },
  },
  "openai/gpt-5.5": {
    tier: "advanced",
    bands: { small: 3, standard: 7, large: 10, xl: 15 },
  },
  "anthropic/claude-sonnet-5": {
    tier: "premium",
    bands: { small: 4, standard: 8, large: 12, xl: 17 },
  },
  [LEGACY_GEMINI_PRO_MODEL]: {
    tier: "premium",
    bands: { small: 4, standard: 9, large: 14, xl: 20 },
  },
  "anthropic/claude-opus-4.8": {
    tier: "premium",
    bands: { small: 8, standard: 18, large: 30, xl: 42 },
  },
};

export const FREE_PROJECT_LIMIT = 3;
export const CREDIT_MODEL_COST_USD = 0.015;
export const MODEL_COST_OVERHEAD_MULTIPLIER = 1.25;
export const DEFAULT_ESTIMATED_INPUT_TOKENS = 25_000;

const MODEL_TOKEN_PRICING: Record<
  string,
  { inputPricePerMillion: number; outputPricePerMillion: number }
> = {
  [FREE_MODEL]: { inputPricePerMillion: 0.09, outputPricePerMillion: 0.18 },
  [LEGACY_FREE_MODEL]: {
    inputPricePerMillion: 0.09,
    outputPricePerMillion: 0.18,
  },
  [SECONDARY_STARTER_MODEL]: {
    inputPricePerMillion: 0.1,
    outputPricePerMillion: 0.4,
  },
  [LEGACY_SECONDARY_STARTER_MODEL]: {
    inputPricePerMillion: 0.1,
    outputPricePerMillion: 0.4,
  },
  [LEGACY_MIMO_STARTER_MODEL]: {
    inputPricePerMillion: 0.1,
    outputPricePerMillion: 0.4,
  },
  "deepseek/deepseek-v4-pro": {
    inputPricePerMillion: 0.435,
    outputPricePerMillion: 0.87,
  },
  [LEGACY_MINIMAX_M3_MODEL]: {
    inputPricePerMillion: 0.435,
    outputPricePerMillion: 0.87,
  },
  "z-ai/glm-5.2": { inputPricePerMillion: 0.84, outputPricePerMillion: 2.64 },
  "google/gemini-3-flash-preview": {
    inputPricePerMillion: 0.5,
    outputPricePerMillion: 3,
  },
  [LEGACY_KIMI_CODE_MODEL]: {
    inputPricePerMillion: 0.5,
    outputPricePerMillion: 3,
  },
  "x-ai/grok-4.3": { inputPricePerMillion: 0.3, outputPricePerMillion: 1.2 },
  [LEGACY_QWEN_MAX_MODEL]: {
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 3.75,
  },
  "x-ai/grok-4.5": { inputPricePerMillion: 2, outputPricePerMillion: 6 },
  [SAFE_GPT_MODEL]: { inputPricePerMillion: 2, outputPricePerMillion: 8 },
  "openai/gpt-5.5": { inputPricePerMillion: 2, outputPricePerMillion: 8 },
  "anthropic/claude-sonnet-5": {
    inputPricePerMillion: 2,
    outputPricePerMillion: 10,
  },
  [LEGACY_GEMINI_PRO_MODEL]: {
    inputPricePerMillion: 2,
    outputPricePerMillion: 12,
  },
  "anthropic/claude-opus-4.8": {
    inputPricePerMillion: 5,
    outputPricePerMillion: 25,
  },
};

const FALLBACK_PRICING: ModelPricing = {
  tier: "starter",
  bands: { small: 1, standard: 1, large: 1, xl: 1 },
};

function getModelPricing(modelId: string): ModelPricing {
  return MODEL_PRICING[modelId] ?? FALLBACK_PRICING;
}

export function getGenerationSizeBand(outputTokens = 0): GenerationSizeBand {
  if (outputTokens <= 4_000) return "small";
  if (outputTokens <= 8_000) return "standard";
  if (outputTokens <= 12_000) return "large";
  return "xl";
}

export function estimateOutputTokensFromText(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function estimateModelCostUsd({
  modelId,
  inputTokens = DEFAULT_ESTIMATED_INPUT_TOKENS,
  outputTokens,
}: {
  modelId: string;
  inputTokens?: number;
  outputTokens: number;
}) {
  const pricing =
    MODEL_TOKEN_PRICING[modelId] ?? MODEL_TOKEN_PRICING[FREE_MODEL];
  const estimatedModelCostUsd =
    (inputTokens / 1_000_000) * pricing.inputPricePerMillion +
    (outputTokens / 1_000_000) * pricing.outputPricePerMillion;
  const riskAdjustedModelCostUsd =
    estimatedModelCostUsd * MODEL_COST_OVERHEAD_MULTIPLIER;

  return {
    inputTokens,
    outputTokens,
    estimatedModelCostUsd,
    riskAdjustedModelCostUsd,
  };
}

/**
 * Get the credit charge for a saved generation.
 * Without output size, this returns the model's minimum charge for UI copy.
 */
export function getModelCreditCost(
  modelId: string,
  options?: { outputTokens?: number | null; generatedText?: string | null },
): number {
  const pricing = getModelPricing(modelId);
  const outputTokens =
    options?.outputTokens ??
    (options?.generatedText
      ? estimateOutputTokensFromText(options.generatedText)
      : undefined);
  const band = outputTokens ? getGenerationSizeBand(outputTokens) : "small";

  return pricing.bands[band];
}

export function getModelCreditHoldCost(modelId: string): number {
  return getModelPricing(modelId).bands.xl;
}

export function getModelCreditRange(modelId: string) {
  const costs = Object.values(getModelPricing(modelId).bands);
  return {
    min: Math.min(...costs),
    max: Math.max(...costs),
  };
}

export function formatModelCreditRange(modelId: string): string {
  const range = getModelCreditRange(modelId);
  return range.min === range.max
    ? `${range.min} credit${range.min === 1 ? "" : "s"}`
    : `from ${range.min}-${range.max} credits`;
}

/**
 * Subscription tier configuration.
 * No "unlimited" tier - all tiers use credits.
 */
export const TIERS = {
  free: {
    monthlyCredits: 5,
    allowedModels: [
      FREE_MODEL,
      LEGACY_FREE_MODEL,
      SECONDARY_STARTER_MODEL,
      LEGACY_SECONDARY_STARTER_MODEL,
      LEGACY_MIMO_STARTER_MODEL,
    ] as string[] | "all",
    price: 0,
    name: "Free",
    rolloverCap: 0,
  },
  pro: {
    monthlyCredits: 100,
    allowedTiers: ["starter", "efficient", "advanced"] as ModelTier[],
    price: 9,
    name: "Pro",
    rolloverCap: 200,
  },
  pro_plus: {
    monthlyCredits: 500,
    allowedModels: "all" as string[] | "all",
    price: 29,
    name: "Pro Plus",
    rolloverCap: 1_000,
  },
};

export type TierKey = keyof typeof TIERS;
export const TIER_KEYS = Object.keys(TIERS) as [TierKey, ...TierKey[]];

/**
 * Credit pack configurations for one-time purchases.
 */
export const CREDIT_PACKS = {
  small: {
    credits: 10,
    price: 5,
    label: "10 Credits",
  },
  medium: {
    credits: 25,
    price: 10,
    label: "25 Credits",
    popular: true,
  },
  large: {
    credits: 60,
    price: 20,
    label: "60 Credits",
    bestValue: true,
  },
};

export type CreditPackKey = keyof typeof CREDIT_PACKS;

/**
 * Check if a tier can use a specific model.
 */
export function getModelTier(modelId: string): ModelTier {
  return getModelPricing(modelId).tier;
}

export function canTierUseModel(
  tier: TierKey,
  modelId: string,
  options?: { hasPurchasedCredits?: boolean },
): boolean {
  const tierConfig = TIERS[tier];
  if (!tierConfig) return false;

  if ("allowedTiers" in tierConfig) {
    return tierConfig.allowedTiers.includes(getModelTier(modelId));
  }

  if (tierConfig.allowedModels === "all") return true;

  if (tier === "free" && options?.hasPurchasedCredits) {
    return ["starter", "efficient"].includes(getModelTier(modelId));
  }

  return tierConfig.allowedModels.includes(modelId);
}

/**
 * Get tier from subscription tier string.
 * Handles legacy "unlimited" tier by mapping to pro_plus.
 */
export function normalizeTier(tier: string | null | undefined): TierKey {
  if (!tier) return "free";
  if (tier === "unlimited") return "pro_plus";
  if (tier in TIERS) return tier as TierKey;
  return "free";
}
