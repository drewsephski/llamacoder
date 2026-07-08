import {
  FREE_MODEL,
  LEGACY_MIMO_STARTER_MODEL,
  LEGACY_SECONDARY_STARTER_MODEL,
  LEGACY_FREE_MODEL,
  SAFE_GPT_MODEL,
  SECONDARY_STARTER_MODEL,
} from "@/lib/constants";

/**
 * Credit cost per model.
 * All models cost credits - even the "free" model costs 1 credit for consistency.
 * Free users get 5 credits to start, which covers 5 free generations.
 */
const COST_BAND = {
  // Free control lane: lowest-cost path with strict token constraints.
  free: 1,
  // Low-cost long-context coding models with strong price/performance.
  budgetCode: 2,
  // Fast multimodal builder for screenshot-first flows.
  vision: 3,
  // Strong code-specialized lane with competitive premium.
  proCode: 3,
  // Frontier-class models with lower output pricing than Opus.
  frontierEfficient: 4,
  // Frontier coding model priced for higher provider output costs.
  premiumCode: 6,
} as const;

export const MODEL_PRICING: Record<string, { cost: number }> = {
  [FREE_MODEL]: { cost: COST_BAND.free },
  [LEGACY_FREE_MODEL]: { cost: COST_BAND.free },
  [SECONDARY_STARTER_MODEL]: { cost: COST_BAND.free },
  [LEGACY_SECONDARY_STARTER_MODEL]: { cost: COST_BAND.free },
  [LEGACY_MIMO_STARTER_MODEL]: { cost: COST_BAND.free },
  // Fast balanced multimodal builder for screenshot-first flows.
  "google/gemini-3-flash-preview": { cost: COST_BAND.vision },
  // Cheaper multimodal code lane with strong coding focus.
  "moonshotai/kimi-k2.7-code": { cost: COST_BAND.proCode },
  // Strong budget coding options with lower provider output pricing.
  "deepseek/deepseek-v4-pro": { cost: COST_BAND.budgetCode },
  // Legacy Grok chats are routed to MiniMax M3 at generation time.
  "x-ai/grok-4.3": { cost: COST_BAND.budgetCode },
  "z-ai/glm-5.2": { cost: COST_BAND.budgetCode },
  "minimax/minimax-m3": { cost: COST_BAND.budgetCode },
  // Agentic coding model priced close to the existing advanced lane.
  "qwen/qwen3.7-max": { cost: COST_BAND.proCode },
  // Frontier-efficient premium models.
  "anthropic/claude-sonnet-5": { cost: COST_BAND.frontierEfficient },
  "google/gemini-3.1-pro-preview": { cost: COST_BAND.frontierEfficient },
  // Strong non-thinking GPT model with 1M context and lower output pricing.
  [SAFE_GPT_MODEL]: { cost: COST_BAND.frontierEfficient },
  // Legacy GPT-5 chats are routed to GPT-4.1 at generation time.
  "openai/gpt-5.5": { cost: COST_BAND.frontierEfficient },
  // Current Opus coding option for complex multi-file and agentic coding work.
  "anthropic/claude-opus-4.8": { cost: COST_BAND.premiumCode },
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
    allowedModels: [
      FREE_MODEL,
      LEGACY_FREE_MODEL,
      SECONDARY_STARTER_MODEL,
      LEGACY_SECONDARY_STARTER_MODEL,
      LEGACY_MIMO_STARTER_MODEL,
    ] as string[] | "all",
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
