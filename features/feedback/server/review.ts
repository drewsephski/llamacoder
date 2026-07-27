import "server-only";

import type { ResearchFeedbackReviewInput } from "@/features/feedback/contracts";
import { getResearchFeedbackRewardAmounts } from "@/features/feedback/contracts";
import { syncResearchFeedbackToGoogleSheet } from "@/features/feedback/server/delivery";
import { getPrisma } from "@/lib/prisma";

export type ReviewResearchFeedbackResult =
  | {
      success: true;
      status: "approved" | "rejected";
      rewardAmount: number;
      balance?: number;
    }
  | {
      success: false;
      code: "ALREADY_REVIEWED" | "INVALID_REWARD" | "NOT_FOUND";
      message: string;
    };

export async function reviewResearchFeedback({
  reviewerEmail,
  input,
}: {
  reviewerEmail: string;
  input: ResearchFeedbackReviewInput;
}): Promise<ReviewResearchFeedbackResult> {
  const prisma = getPrisma();
  const result = await prisma.$transaction(async (tx) => {
    const submission = await tx.researchFeedbackSubmission.findUnique({
      where: { id: input.submissionId },
      select: { id: true, userId: true, status: true, rewardTrack: true },
    });
    if (!submission) {
      return {
        success: false as const,
        code: "NOT_FOUND" as const,
        message: "Feedback submission not found.",
      };
    }
    if (submission.status !== "pending") {
      return {
        success: false as const,
        code: "ALREADY_REVIEWED" as const,
        message: `This submission is already ${submission.status}.`,
      };
    }

    const allowedRewards = getResearchFeedbackRewardAmounts(
      submission.rewardTrack,
    ) as readonly number[];
    if (
      input.decision === "approve" &&
      !allowedRewards.includes(input.rewardAmount ?? 0)
    ) {
      return {
        success: false as const,
        code: "INVALID_REWARD" as const,
        message:
          submission.rewardTrack === "extended"
            ? "Extended feedback can receive 25 or 40 credits."
            : "Standard feedback can receive 15 credits.",
      };
    }

    const claimed = await tx.researchFeedbackSubmission.updateMany({
      where: { id: submission.id, status: "pending" },
      data: { status: "reviewing" },
    });
    if (claimed.count !== 1) {
      return {
        success: false as const,
        code: "ALREADY_REVIEWED" as const,
        message: "This submission is already being reviewed.",
      };
    }

    if (input.decision === "reject") {
      await tx.researchFeedbackSubmission.update({
        where: { id: submission.id },
        data: {
          status: "rejected",
          primaryCategory: input.category,
          rewardAmount: null,
          reviewNotes: input.note,
          reviewedByEmail: reviewerEmail,
          reviewedAt: new Date(),
        },
      });
      return {
        success: true as const,
        status: "rejected" as const,
        rewardAmount: 0,
      };
    }

    const rewardAmount = input.rewardAmount!;
    const description = "Verified user-research feedback reward";
    await tx.creditGrant.create({
      data: {
        userId: submission.userId,
        amount: rewardAmount,
        remainingAmount: rewardAmount,
        type: "bonus",
        description,
        dedupeKey: `feedback:${submission.id}`,
        grossRevenueUsd: 0,
        netRevenueUsd: 0,
        unitRevenueUsd: 0,
      },
    });
    const user = await tx.user.update({
      where: { id: submission.userId },
      data: { credits: { increment: rewardAmount } },
      select: { credits: true },
    });
    await tx.creditHistory.create({
      data: {
        userId: submission.userId,
        amount: rewardAmount,
        type: "bonus",
        description,
        chatId: null,
      },
    });
    await tx.researchFeedbackSubmission.update({
      where: { id: submission.id },
      data: {
        status: "approved",
        primaryCategory: input.category,
        rewardAmount,
        reviewNotes: input.note,
        reviewedByEmail: reviewerEmail,
        reviewedAt: new Date(),
      },
    });
    return {
      success: true as const,
      status: "approved" as const,
      rewardAmount,
      balance: user.credits,
    };
  });

  if (result.success) {
    await syncResearchFeedbackToGoogleSheet(input.submissionId);
  }
  return result;
}
