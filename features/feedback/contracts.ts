import { z } from "zod";

export const RESEARCH_FEEDBACK_CATEGORIES = [
  "generation_quality",
  "slow_or_failed_generation",
  "confusing_onboarding",
  "editing_difficulty",
  "preview_runtime_errors",
  "export_deployment_problems",
  "missing_integrations",
  "pricing_credit_confusion",
  "unclear_product_value",
] as const;

export const researchFeedbackCategorySchema = z.enum(
  RESEARCH_FEEDBACK_CATEGORIES,
);

export const RESEARCH_FEEDBACK_REWARD_AMOUNTS = [15, 25, 40] as const;

export const researchFeedbackReviewSchema = z
  .object({
    submissionId: z.string().trim().min(1).max(64),
    decision: z.enum(["approve", "reject"]),
    category: researchFeedbackCategorySchema,
    rewardAmount: z.coerce.number().int().optional(),
    note: z.string().trim().min(8).max(1_000),
  })
  .superRefine((value, context) => {
    if (value.decision === "approve") {
      if (
        !RESEARCH_FEEDBACK_REWARD_AMOUNTS.includes(
          value.rewardAmount as (typeof RESEARCH_FEEDBACK_REWARD_AMOUNTS)[number],
        )
      ) {
        context.addIssue({
          code: "custom",
          path: ["rewardAmount"],
          message: "Choose 15, 25, or 40 credits.",
        });
      }
    } else if (value.rewardAmount !== undefined) {
      context.addIssue({
        code: "custom",
        path: ["rewardAmount"],
        message: "Rejected feedback cannot receive credits.",
      });
    }
  });

export const paymentIntentSchema = z.enum(["yes", "maybe", "no"]);

const thoughtfulAnswer = (minimum: number, maximum: number) =>
  z.string().trim().min(minimum).max(maximum);

export const researchFeedbackSubmissionSchema = z.object({
  projectId: z.string().trim().min(1).max(64),
  buildGoal: thoughtfulAnswer(20, 1_500),
  previousTools: thoughtfulAnswer(2, 1_000),
  frustration: thoughtfulAnswer(20, 2_000),
  betterThanExpected: thoughtfulAnswer(10, 1_500),
  abandonmentPoint: thoughtfulAnswer(20, 2_000),
  launchBlocker: thoughtfulAnswer(20, 2_000),
  singleImprovement: thoughtfulAnswer(15, 1_200),
  paymentIntent: paymentIntentSchema,
  monthlyPriceUsd: z.number().int().min(0).max(10_000),
  followUpConsent: z.boolean(),
  mediaUrl: z
    .string()
    .trim()
    .max(2_048)
    .refine(
      (value) => {
        if (!value) return true;
        try {
          const url = new URL(value);
          return url.protocol === "https:" || url.protocol === "http:";
        } catch {
          return false;
        }
      },
      { message: "Use a valid http or https link." },
    )
    .optional()
    .transform((value) => value || undefined),
  honestyConfirmed: z.literal(true),
});

export type ResearchFeedbackSubmissionInput = z.infer<
  typeof researchFeedbackSubmissionSchema
>;

export type ResearchFeedbackReviewInput = z.infer<
  typeof researchFeedbackReviewSchema
>;

export function getResearchFeedbackRewardAmounts(rewardTrack: string) {
  return rewardTrack === "extended" ? ([25, 40] as const) : ([15] as const);
}

export type ResearchFeedbackActivityEvidence = {
  generatedVersions: number;
  previewed: boolean;
  edited: boolean;
  exported: boolean;
  qualifies: boolean;
};

export type EligibleResearchProject = ResearchFeedbackActivityEvidence & {
  id: string;
  title: string;
  createdAt: string;
};

export type ResearchProgramSubmission = {
  id: string;
  projectId: string;
  projectTitle: string;
  status: "pending" | "approved" | "rejected";
  rewardAmount: number | null;
  createdAt: string;
};

export type ResearchProgramState = {
  accountEmail: string;
  emailVerified: boolean;
  eligibleProjects: EligibleResearchProject[];
  submission: ResearchProgramSubmission | null;
};
