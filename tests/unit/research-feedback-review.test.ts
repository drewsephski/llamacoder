import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const tx = {
    researchFeedbackSubmission: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    creditGrant: { create: vi.fn() },
    creditHistory: { create: vi.fn() },
    user: { update: vi.fn() },
  };
  return {
    tx,
    prisma: {
      $transaction: vi.fn(async (callback: (value: typeof tx) => unknown) =>
        callback(tx),
      ),
    },
    syncResearchFeedbackToGoogleSheet: vi.fn(),
  };
});

vi.mock("@/lib/prisma", () => ({ getPrisma: () => mocks.prisma }));
vi.mock("@/features/feedback/server/delivery", () => ({
  syncResearchFeedbackToGoogleSheet: mocks.syncResearchFeedbackToGoogleSheet,
}));

import { reviewResearchFeedback } from "@/features/feedback/server/review";

describe("research feedback review", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.tx.researchFeedbackSubmission.updateMany.mockResolvedValue({
      count: 1,
    });
    mocks.tx.user.update.mockResolvedValue({ credits: 47 });
    mocks.syncResearchFeedbackToGoogleSheet.mockResolvedValue({
      status: "synced",
    });
  });

  it("does not let a standard response receive an extended reward", async () => {
    mocks.tx.researchFeedbackSubmission.findUnique.mockResolvedValue({
      id: "feedback_1",
      userId: "user_1",
      status: "pending",
      rewardTrack: "standard",
    });

    const result = await reviewResearchFeedback({
      reviewerEmail: "admin@squidagent.app",
      input: {
        submissionId: "feedback_1",
        decision: "approve",
        category: "editing_difficulty",
        rewardAmount: 40,
        note: "The response contains detailed project evidence.",
      },
    });

    expect(result).toMatchObject({ success: false, code: "INVALID_REWARD" });
    expect(
      mocks.tx.researchFeedbackSubmission.updateMany,
    ).not.toHaveBeenCalled();
    expect(mocks.tx.creditGrant.create).not.toHaveBeenCalled();
  });

  it("awards an extended reward once and mirrors the decision", async () => {
    mocks.tx.researchFeedbackSubmission.findUnique.mockResolvedValue({
      id: "feedback_1",
      userId: "user_1",
      status: "pending",
      rewardTrack: "extended",
    });

    const result = await reviewResearchFeedback({
      reviewerEmail: "admin@squidagent.app",
      input: {
        submissionId: "feedback_1",
        decision: "approve",
        category: "editing_difficulty",
        rewardAmount: 40,
        note: "The response contains detailed project evidence.",
      },
    });

    expect(result).toEqual({
      success: true,
      status: "approved",
      rewardAmount: 40,
      balance: 47,
    });
    expect(mocks.tx.creditGrant.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        amount: 40,
        dedupeKey: "feedback:feedback_1",
      }),
    });
    expect(mocks.tx.researchFeedbackSubmission.update).toHaveBeenCalledWith({
      where: { id: "feedback_1" },
      data: expect.objectContaining({
        status: "approved",
        reviewedByEmail: "admin@squidagent.app",
      }),
    });
    expect(mocks.syncResearchFeedbackToGoogleSheet).toHaveBeenCalledWith(
      "feedback_1",
    );
  });
});
