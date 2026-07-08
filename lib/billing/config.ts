import { FREE_MODEL } from "@/lib/constants";

/**
 * Credit cost per model.
 * All models cost credits - even the "free" model costs 1 credit for consistency.
 * Free users get 5 credits to start, which covers 5 free generations.
 */
const COST_BAND = {
  // Free control lane: lowest-cost path with strict token constraints.
  free: 1,
  // Fast defaults for routine coding prompts.
  starter: 2,
  // Vision-assisted coding lanes with higher token/value tradeoff.
  vision: 3,
  // Strong code-specialized lane with competitive premium.
  proCode: 3,
  // Creative/visual exploration lane; lower cost to run broadly.
  creative: 2,
  // Higher-compute reasoning and architecture support.
  advanced: 5,
  // Premium rescue lane for hardest tasks.
  expert: 7,
} as const;

export const MODEL_PRICING: Record<string, { cost: number }> = {
  [FREE_MODEL]: { cost: 1 },
  "deepseek/deepseek-v4-flash": { cost: COST_BAND.starter },
  // Fast balanced multimodal builder for screenshot-first flows.
  "google/gemini-3-flash-preview": { cost: COST_BAND.vision },
  // Cheaper multimodal code lane with strong coding focus.
  "moonshotai/kimi-k2.7-code": { cost: COST_BAND.proCode },
  // Lowest-cost broad multimodal tier for iterations and variants.
  "google/gemini-3.1-flash-lite": { cost: COST_BAND.creative },
  // High-context reasoning for architecture and complex edits.
  "z-ai/glm-5.2": { cost: COST_BAND.advanced },
  // Reserved for the hardest one-off refactors and rescue runs.
  "anthropic/claude-opus-4.6": { cost: COST_BAND.expert },
};

export const FREE_PROJECT_LIMIT = 3;

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
