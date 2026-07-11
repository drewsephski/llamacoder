import { z } from "zod";
import { TIER_KEYS } from "@/lib/billing/config";

export const userCreditsSchema = z.object({
  credits: z.number(),
  creditBreakdown: z.object({
    totalCredits: z.number(),
    subscriptionCredits: z.number(),
    purchasedCredits: z.number(),
    otherCredits: z.number(),
  }),
  tier: z.enum(TIER_KEYS),
  hasActiveSubscription: z.boolean(),
  hasPurchasedCredits: z.boolean(),
  subscriptionEndsAt: z.string().nullable(),
});

export type UserCredits = z.infer<typeof userCreditsSchema>;

export const projectEligibilitySchema = z.object({
  canCreate: z.boolean(),
  error: z.string().optional(),
  hasExistingProjects: z.boolean(),
  projectCount: z.number(),
  projectLimit: z.number().nullable(),
  projectsRemaining: z.number().nullable(),
  credits: z.number(),
  hasActiveSubscription: z.boolean().optional(),
  modelCost: z.number(),
  shortfall: z.number().optional(),
});

export type ProjectEligibility = z.infer<typeof projectEligibilitySchema>;
