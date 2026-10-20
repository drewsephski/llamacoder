import {
  CLAUDE_HAIKU_5_5_MODEL,
  CLAUDE_OPUS_5_5_MODEL,
  DEFAULT_MODEL,
  FREE_MODEL,
  GEMINI_3_5_FLASH_LITE_MODEL,
  GEMINI_3_8_FLASH_MODEL,
  LEGACY_GEMINI_3_5_FLASH_MODEL,
  LEGACY_GEMINI_3_6_FLASH_MODEL,
  LEGACY_GEMINI_3_7_FLASH_MODEL,
  LEGACY_DEEPSEEK_V4_PRO_MODEL,
  LEGACY_GROK_4_5_MODEL,
  GEMINI_MULTIMODAL_MODEL,
  GPT_6_LUNA_MODEL,
  LEGACY_CLAUDE_OPUS_4_8_MODEL,
  LEGACY_CLAUDE_SONNET_5_MODEL,
  LEGACY_DEFAULT_MODEL,
  LEGACY_GEMINI_PRO_MODEL,
  LEGACY_GLM_5_2_MODEL,
  LEGACY_KIMI_CODE_MODEL,
  LEGACY_MINIMAX_M3_MODEL,
  LEGACY_MIMO_STARTER_MODEL,
  LEGACY_QWEN_MAX_MODEL,
  LEGACY_SECONDARY_STARTER_MODEL,
  LEGACY_FREE_MODEL,
  SAFE_GPT_MODEL,
  SECONDARY_STARTER_MODEL,
} from "@/lib/constants";
import { getModelWithFallbacks } from "@/lib/model-fallbacks";

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
  [LEGACY_DEEPSEEK_V4_PRO_MODEL]: {
    tier: "efficient",
    bands: { small: 2, standard: 2, large: 2, xl: 3 },
  },
  [LEGACY_MINIMAX_M3_MODEL]: {
    tier: "efficient",
    bands: { small: 1, standard: 1, large: 2, xl: 2 },
  },
  [LEGACY_GLM_5_2_MODEL]: {
    tier: "efficient",
    bands: { small: 3, standard: 4, large: 5, xl: 6 },
  },
  [DEFAULT_MODEL]: {
    tier: "starter",
    bands: { small: 1, standard: 1, large: 2, xl: 2 },
  },
  [GEMINI_MULTIMODAL_MODEL]: {
    tier: "efficient",
    bands: { small: 2, standard: 3, large: 4, xl: 5 },
  },
  [GEMINI_3_5_FLASH_LITE_MODEL]: {
    tier: "efficient",
    bands: { small: 3, standard: 4, large: 5, xl: 6 },
  },
  [LEGACY_GEMINI_3_5_FLASH_MODEL]: {
    tier: "advanced",
    bands: { small: 6, standard: 8, large: 10, xl: 12 },
  },
  [LEGACY_GEMINI_3_6_FLASH_MODEL]: {
    tier: "efficient",
    bands: { small: 3, standard: 4, large: 5, xl: 6 },
  },
  [LEGACY_GEMINI_3_7_FLASH_MODEL]: {
    tier: "efficient",
    bands: { small: 3, standard: 4, large: 5, xl: 6 },
  },
  [GEMINI_3_8_FLASH_MODEL]: {
    tier: "efficient",
    bands: { small: 3, standard: 4, large: 5, xl: 7 },
  },
  [CLAUDE_HAIKU_5_5_MODEL]: {
    tier: "efficient",
    bands: { small: 2, standard: 3, large: 4, xl: 5 },
  },
  [GPT_6_LUNA_MODEL]: {
    tier: "advanced",
    bands: { small: 3, standard: 4, large: 5, xl: 6 },
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
  [LEGACY_GROK_4_5_MODEL]: {
    tier: "advanced",
    bands: { small: 7, standard: 9, large: 11, xl: 13 },
  },
  [SAFE_GPT_MODEL]: {
    tier: "advanced",
    bands: { small: 7, standard: 10, large: 13, xl: 15 },
  },
  "openai/gpt-5.5": {
    tier: "advanced",
    bands: { small: 7, standard: 10, large: 13, xl: 15 },
  },
  [LEGACY_CLAUDE_SONNET_5_MODEL]: {
    tier: "premium",
    bands: { small: 8, standard: 11, large: 15, xl: 18 },
  },
  [LEGACY_GEMINI_PRO_MODEL]: {
    tier: "premium",
    bands: { small: 4, standard: 9, large: 14, xl: 20 },
  },
  [LEGACY_CLAUDE_OPUS_4_8_MODEL]: {
    tier: "premium",
    bands: { small: 19, standard: 28, large: 36, xl: 44 },
  },
  [CLAUDE_OPUS_5_5_MODEL]: {
    tier: "premium",
    bands: { small: 16, standard: 24, large: 32, xl: 40 },
  },
};

export const FREE_PROJECT_LIMIT = 3;
export const CREDIT_MODEL_COST_USD = 0.015;
export const MODEL_COST_OVERHEAD_MULTIPLIER = 1.25;
export const DEFAULT_ESTIMATED_INPUT_TOKENS = 25_000;
export const STRIPE_CARD_PERCENT_FEE = 0.029;
export const STRIPE_CARD_FIXED_FEE_USD = 0.3;

export function estimateStripeNetRevenueUsd(grossRevenueUsd: number) {
  if (grossRevenueUsd <= 0) return 0;

  return Math.max(
    0,
    grossRevenueUsd * (1 - STRIPE_CARD_PERCENT_FEE) - STRIPE_CARD_FIXED_FEE_USD,
  );
}

export function getCostBasedCreditCharge(providerCostUsd: number) {
  if (!Number.isFinite(providerCostUsd) || providerCostUsd <= 0) return 0;

  return Math.max(
    1,
    Math.ceil(
      (providerCostUsd * MODEL_COST_OVERHEAD_MULTIPLIER) /
        CREDIT_MODEL_COST_USD,
    ),
  );
}

export type ModelTokenPricing = {
  inputPricePerMillion: number;
  outputPricePerMillion: number;
};

export const DEFAULT_OPENROUTER_MAX_PRICE_MARGIN_PERCENT = 15;

export const MODEL_TOKEN_PRICING: Record<string, ModelTokenPricing> = {
  [FREE_MODEL]: { inputPricePerMillion: 0.091, outputPricePerMillion: 0.182 },
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
  [LEGACY_DEEPSEEK_V4_PRO_MODEL]: {
    inputPricePerMillion: 0.435,
    outputPricePerMillion: 0.87,
  },
  [LEGACY_MINIMAX_M3_MODEL]: {
    inputPricePerMillion: 0.435,
    outputPricePerMillion: 0.87,
  },
  [LEGACY_GLM_5_2_MODEL]: {
    inputPricePerMillion: 0.62,
    outputPricePerMillion: 2.42,
  },
  [DEFAULT_MODEL]: {
    inputPricePerMillion: 0.048,
    outputPricePerMillion: 0.16,
  },
  [GEMINI_MULTIMODAL_MODEL]: {
    inputPricePerMillion: 0.25,
    outputPricePerMillion: 1.5,
  },
  [GEMINI_3_5_FLASH_LITE_MODEL]: {
    inputPricePerMillion: 0.3,
    outputPricePerMillion: 2.5,
  },
  [LEGACY_GEMINI_3_5_FLASH_MODEL]: {
    inputPricePerMillion: 1.5,
    outputPricePerMillion: 9,
  },
  [LEGACY_GEMINI_3_6_FLASH_MODEL]: {
    inputPricePerMillion: 0.75,
    outputPricePerMillion: 3.75,
  },
  [LEGACY_GEMINI_3_7_FLASH_MODEL]: {
    inputPricePerMillion: 0.75,
    outputPricePerMillion: 3.75,
  },
  [GEMINI_3_8_FLASH_MODEL]: {
    inputPricePerMillion: 0.825,
    outputPricePerMillion: 4.125,
  },
  [CLAUDE_HAIKU_5_5_MODEL]: {
    inputPricePerMillion: 0.1,
    outputPricePerMillion: 0.5,
  },
  [GPT_6_LUNA_MODEL]: {
    inputPricePerMillion: 0.1,
    outputPricePerMillion: 0.5,
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
  [LEGACY_GROK_4_5_MODEL]: {
    inputPricePerMillion: 2,
    outputPricePerMillion: 6,
  },
  [SAFE_GPT_MODEL]: { inputPricePerMillion: 2, outputPricePerMillion: 8 },
  "openai/gpt-5.5": { inputPricePerMillion: 2, outputPricePerMillion: 8 },
  [LEGACY_CLAUDE_SONNET_5_MODEL]: {
    inputPricePerMillion: 2,
    outputPricePerMillion: 10,
  },
  [LEGACY_GEMINI_PRO_MODEL]: {
    inputPricePerMillion: 2,
    outputPricePerMillion: 12,
  },
  [LEGACY_CLAUDE_OPUS_4_8_MODEL]: {
    inputPricePerMillion: 5,
    outputPricePerMillion: 25,
  },
  [CLAUDE_OPUS_5_5_MODEL]: {
    inputPricePerMillion: 4,
    outputPricePerMillion: 20,
  },
};

function getResolvedPricingModelId(modelId: string) {
  const [resolvedModelId] = getModelWithFallbacks(modelId);
  if (resolvedModelId && resolvedModelId !== modelId) return resolvedModelId;

  return modelId;
}

function getModelPricing(modelId: string): ModelPricing | undefined {
  return MODEL_PRICING[getResolvedPricingModelId(modelId)];
}

export function hasModelPricing(modelId: string) {
  const resolvedModelId = getResolvedPricingModelId(modelId);
  return Boolean(
    MODEL_PRICING[resolvedModelId] && MODEL_TOKEN_PRICING[resolvedModelId],
  );
}

export function getModelTokenPricing(modelId: string): ModelTokenPricing {
  const resolvedModelId = getResolvedPricingModelId(modelId);
  const pricing = MODEL_TOKEN_PRICING[resolvedModelId];

  if (!pricing) {
    throw new Error(`UNPRICED_MODEL:${modelId}`);
  }

  return pricing;
}

export function getOpenRouterMaxPrice(modelId: string): ModelTokenPricing {
  const pricing = getModelTokenPricing(modelId);
  const configuredMargin = Number.parseFloat(
    process.env.OPENROUTER_MAX_PRICE_MARGIN_PERCENT || "",
  );
  const marginPercent = Number.isFinite(configuredMargin)
    ? Math.min(100, Math.max(0, configuredMargin))
    : DEFAULT_OPENROUTER_MAX_PRICE_MARGIN_PERCENT;
  const multiplier = 1 + marginPercent / 100;
  const roundUp = (value: number) => Math.ceil(value * multiplier * 1e6) / 1e6;

  return {
    inputPricePerMillion: roundUp(pricing.inputPricePerMillion),
    outputPricePerMillion: roundUp(pricing.outputPricePerMillion),
  };
}

function requireModelPricing(modelId: string): ModelPricing {
  const pricing = getModelPricing(modelId);

  if (!pricing) {
    throw new Error(`UNPRICED_MODEL:${modelId}`);
  }

  return pricing;
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
  const pricing = getModelTokenPricing(modelId);
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
  const pricing = requireModelPricing(modelId);
  const outputTokens =
    options?.outputTokens ??
    (options?.generatedText
      ? estimateOutputTokensFromText(options.generatedText)
      : undefined);
  const band = outputTokens ? getGenerationSizeBand(outputTokens) : "small";

  return pricing.bands[band];
}

export function getModelCreditHoldCost(modelId: string): number {
  return requireModelPricing(modelId).bands.xl;
}

export function getModelCreditRange(modelId: string) {
  const costs = Object.values(requireModelPricing(modelId).bands);
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
      DEFAULT_MODEL,
      GEMINI_MULTIMODAL_MODEL,
      GEMINI_3_5_FLASH_LITE_MODEL,
      LEGACY_DEFAULT_MODEL,
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
  return requireModelPricing(modelId).tier;
}

export function canTierUseModel(
  tier: TierKey,
  modelId: string,
  options?: { hasPurchasedCredits?: boolean },
): boolean {
  const tierConfig = TIERS[tier];
  if (!tierConfig) return false;
  if (!hasModelPricing(modelId)) return false;

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

/**
 * Subscription statuses that unlock paid plan entitlements (models, project limit).
 * Stripe uses `trialing` during trial periods; treat it like active access.
 */
export function isSubscriptionEntitled(
  status: string | null | undefined,
): boolean {
  return status === "active" || status === "trialing";
}

export function getEntitlementTier(
  subscription:
    | {
        status: string;
        tier: string;
      }
    | null
    | undefined,
): TierKey {
  if (!subscription || !isSubscriptionEntitled(subscription.status)) {
    return "free";
  }

  return normalizeTier(subscription.tier);
}

export function hasPremiumModelAccess(
  tier: TierKey,
  options?: { hasPurchasedCredits?: boolean },
): boolean {
  if (tier === "pro_plus") return true;
  return Boolean(options?.hasPurchasedCredits);
}
