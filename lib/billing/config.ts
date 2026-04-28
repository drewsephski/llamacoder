import { FREE_MODEL } from "@/lib/constants";

/**
 * Credit cost per model.
 * All models cost credits - even the "free" model costs 1 credit for consistency.
 * Free users get 5 credits to start, which covers 5 free generations.
 */
export const MODEL_PRICING: Record<string, { cost: number }> = {
  [FREE_MODEL]: { cost: 1 },
  "deepseek/deepseek-v4-flash": { cost: 2 },
  "deepseek/deepseek-v4-pro": { cost: 3 },
  "openai/gpt-5.4": { cost: 7 },
  "anthropic/claude-sonnet-4.5": { cost: 6 },
  "anthropic/claude-opus-4.6": { cost: 7 },
};

/**
 * Get the credit cost for a model.
 * Defaults to 1 credit if model not found in config.
 */
export function getModelCreditCost(modelId: string): number {
  return MODEL_PRICING[modelId]?.cost ?? 1;
}

/**
 * Subscription tier configuration.
 * No "unlimited" tier - all tiers use credits.
 */
export const TIERS = {
  free: {
    monthlyCredits: 5,
    allowedModels: [FREE_MODEL] as string[] | "all",
    price: 0,
    name: "Free",
  },
  pro: {
    monthlyCredits: 100,
    allowedModels: "all" as string[] | "all",
    price: 9,
    name: "Pro",
  },
  pro_plus: {
    monthlyCredits: 500,
    allowedModels: "all" as string[] | "all",
    price: 29,
    name: "Pro Plus",
  },
};

export type TierKey = keyof typeof TIERS;

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
  },
};

export type CreditPackKey = keyof typeof CREDIT_PACKS;

/**
 * Check if a tier can use a specific model.
 */
export function canTierUseModel(tier: TierKey, modelId: string): boolean {
  const tierConfig = TIERS[tier];
  if (!tierConfig) return false;

  if (tierConfig.allowedModels === "all") return true;
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
