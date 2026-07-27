ALTER TABLE "ResearchFeedbackSubmission"
ADD COLUMN "reviewedByEmail" TEXT,
ADD COLUMN "sheetSyncStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN "sheetSyncedAt" TIMESTAMP(3),
ADD COLUMN "sheetSyncError" TEXT,
ADD COLUMN "notificationStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN "notifiedAt" TIMESTAMP(3),
ADD COLUMN "notificationError" TEXT;

CREATE INDEX "ResearchFeedbackSubmission_sheetSyncStatus_updatedAt_idx"
ON "ResearchFeedbackSubmission"("sheetSyncStatus", "updatedAt");
