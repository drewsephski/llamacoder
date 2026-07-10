import type { CreditPackKey, TierKey } from "@/lib/billing";

export type PricingTab = "plans" | "credits";
export type SubscriptionTier = Exclude<TierKey, "free">;

export type CheckoutInput =
  | { plan: SubscriptionTier; pack?: never }
  | { pack: CreditPackKey; plan?: never };
