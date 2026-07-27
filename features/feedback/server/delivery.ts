import "server-only";

import type { Prisma } from "@prisma/client";
import { after } from "next/server";

import type { ResearchFeedbackActivityEvidence } from "@/features/feedback/contracts";
import {
  type ResearchFeedbackMirrorRecord,
  upsertResearchFeedbackSheetRow,
} from "@/features/feedback/server/google-sheets";
import { sendResearchFeedbackNotification } from "@/features/feedback/server/notification";
import { getPrisma } from "@/lib/prisma";

function activityEvidenceFromJson(
  value: Prisma.JsonValue,
): ResearchFeedbackActivityEvidence {
  const evidence =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    generatedVersions:
      typeof evidence.generatedVersions === "number"
        ? evidence.generatedVersions
        : 0,
    previewed: evidence.previewed === true,
    edited: evidence.edited === true,
    exported: evidence.exported === true,
    qualifies: evidence.qualifies === true,
  };
}

async function getDeliveryRecord(submissionId: string) {
  const submission = await getPrisma().researchFeedbackSubmission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      userId: true,
      chatId: true,
      accountEmail: true,
      buildGoal: true,
      previousTools: true,
      frustration: true,
      betterThanExpected: true,
      abandonmentPoint: true,
      launchBlocker: true,
      singleImprovement: true,
      paymentIntent: true,
      monthlyPriceUsd: true,
      followUpConsent: true,
      mediaUrl: true,
      rewardTrack: true,
      activityEvidence: true,
      status: true,
      primaryCategory: true,
      rewardAmount: true,
      reviewedByEmail: true,
      reviewNotes: true,
      reviewedAt: true,
      createdAt: true,
      chat: { select: { title: true } },
    },
  });
  if (!submission) throw new Error("Feedback submission not found.");

  return {
    id: submission.id,
    userId: submission.userId,
    accountEmail: submission.accountEmail,
    projectId: submission.chatId,
    projectTitle: submission.chat.title,
    buildGoal: submission.buildGoal,
    previousTools: submission.previousTools,
    frustration: submission.frustration,
    betterThanExpected: submission.betterThanExpected,
    abandonmentPoint: submission.abandonmentPoint,
    launchBlocker: submission.launchBlocker,
    singleImprovement: submission.singleImprovement,
    paymentIntent: submission.paymentIntent,
    monthlyPriceUsd: submission.monthlyPriceUsd,
    followUpConsent: submission.followUpConsent,
    mediaUrl: submission.mediaUrl,
    rewardTrack: submission.rewardTrack,
    activityEvidence: activityEvidenceFromJson(submission.activityEvidence),
    status: submission.status,
    primaryCategory: submission.primaryCategory,
    rewardAmount: submission.rewardAmount,
    reviewedByEmail: submission.reviewedByEmail,
    reviewNotes: submission.reviewNotes,
    reviewedAt: submission.reviewedAt,
    createdAt: submission.createdAt,
  } satisfies ResearchFeedbackMirrorRecord;
}

function deliveryError(error: unknown) {
  return (error instanceof Error ? error.message : "Delivery failed.").slice(
    0,
    1_000,
  );
}

export async function syncResearchFeedbackToGoogleSheet(submissionId: string) {
  const prisma = getPrisma();
  await prisma.researchFeedbackSubmission.update({
    where: { id: submissionId },
    data: { sheetSyncStatus: "syncing", sheetSyncError: null },
  });
  try {
    const submission = await getDeliveryRecord(submissionId);
    const result = await upsertResearchFeedbackSheetRow(submission);
    await prisma.researchFeedbackSubmission.update({
      where: { id: submissionId },
      data:
        result.status === "synced"
          ? {
              sheetSyncStatus: "synced",
              sheetSyncedAt: new Date(),
              sheetSyncError: null,
            }
          : {
              sheetSyncStatus: "disabled",
              sheetSyncError: null,
            },
    });
    return result;
  } catch (error) {
    await prisma.researchFeedbackSubmission.update({
      where: { id: submissionId },
      data: {
        sheetSyncStatus: "failed",
        sheetSyncError: deliveryError(error),
      },
    });
    return { status: "failed" as const, error: deliveryError(error) };
  }
}

export async function notifyResearchFeedbackSubmission(submissionId: string) {
  const prisma = getPrisma();
  const state = await prisma.researchFeedbackSubmission.findUnique({
    where: { id: submissionId },
    select: { notificationStatus: true },
  });
  if (!state) throw new Error("Feedback submission not found.");
  if (state.notificationStatus === "sent") {
    return { status: "sent" as const };
  }

  await prisma.researchFeedbackSubmission.update({
    where: { id: submissionId },
    data: { notificationStatus: "sending", notificationError: null },
  });
  try {
    const submission = await getDeliveryRecord(submissionId);
    const result = await sendResearchFeedbackNotification(submission);
    await prisma.researchFeedbackSubmission.update({
      where: { id: submissionId },
      data:
        result.status === "sent"
          ? {
              notificationStatus: "sent",
              notifiedAt: new Date(),
              notificationError: null,
            }
          : {
              notificationStatus: "disabled",
              notificationError: null,
            },
    });
    return result;
  } catch (error) {
    await prisma.researchFeedbackSubmission.update({
      where: { id: submissionId },
      data: {
        notificationStatus: "failed",
        notificationError: deliveryError(error),
      },
    });
    return { status: "failed" as const, error: deliveryError(error) };
  }
}

export async function deliverResearchFeedbackSubmission(submissionId: string) {
  const [sheet, notification] = await Promise.all([
    syncResearchFeedbackToGoogleSheet(submissionId),
    notifyResearchFeedbackSubmission(submissionId),
  ]);
  return { sheet, notification };
}

export function scheduleResearchFeedbackDelivery(submissionId: string) {
  after(async () => {
    try {
      await deliverResearchFeedbackSubmission(submissionId);
    } catch (error) {
      console.error("[research-feedback] Background delivery failed", error);
    }
  });
}
