import {
  notifyResearchFeedbackSubmission,
  syncResearchFeedbackToGoogleSheet,
} from "@/features/feedback/server/delivery";
import { isGoogleSheetsFeedbackSyncConfigured } from "@/features/feedback/server/google-sheets";
import { isFeedbackNotificationConfigured } from "@/features/feedback/server/notification";
import { isCronAuthorized } from "@/features/security/server/cron-auth";
import { getPrisma } from "@/lib/prisma";

const RETRYABLE_SHEET_STATES = ["pending", "failed", "disabled", "syncing"];
const RETRYABLE_NOTIFICATION_STATES = [
  "pending",
  "failed",
  "disabled",
  "sending",
];

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const sheetConfigured = isGoogleSheetsFeedbackSyncConfigured();
  const notificationConfigured = isFeedbackNotificationConfigured();
  if (!sheetConfigured && !notificationConfigured) {
    return Response.json({
      processed: 0,
      sheetConfigured,
      notificationConfigured,
    });
  }

  const submissions = await getPrisma().researchFeedbackSubmission.findMany({
    where: {
      OR: [
        ...(sheetConfigured
          ? [{ sheetSyncStatus: { in: RETRYABLE_SHEET_STATES } }]
          : []),
        ...(notificationConfigured
          ? [{ notificationStatus: { in: RETRYABLE_NOTIFICATION_STATES } }]
          : []),
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 25,
    select: {
      id: true,
      sheetSyncStatus: true,
      notificationStatus: true,
    },
  });

  const results = await Promise.all(
    submissions.map(async (submission) => {
      const [sheet, notification] = await Promise.all([
        sheetConfigured &&
        RETRYABLE_SHEET_STATES.includes(submission.sheetSyncStatus)
          ? syncResearchFeedbackToGoogleSheet(submission.id)
          : Promise.resolve({ status: "skipped" as const }),
        notificationConfigured &&
        RETRYABLE_NOTIFICATION_STATES.includes(submission.notificationStatus)
          ? notifyResearchFeedbackSubmission(submission.id)
          : Promise.resolve({ status: "skipped" as const }),
      ]);
      return { id: submission.id, sheet, notification };
    }),
  );

  return Response.json({
    processed: submissions.length,
    sheetConfigured,
    notificationConfigured,
    results,
  });
}
