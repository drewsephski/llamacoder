-- CreateTable
CREATE TABLE "ResearchFeedbackSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "accountEmail" TEXT NOT NULL,
    "buildGoal" TEXT NOT NULL,
    "previousTools" TEXT NOT NULL,
    "frustration" TEXT NOT NULL,
    "betterThanExpected" TEXT NOT NULL,
    "abandonmentPoint" TEXT NOT NULL,
    "launchBlocker" TEXT NOT NULL,
    "singleImprovement" TEXT NOT NULL,
    "paymentIntent" TEXT NOT NULL,
    "monthlyPriceUsd" INTEGER NOT NULL,
    "followUpConsent" BOOLEAN NOT NULL DEFAULT false,
    "mediaUrl" TEXT,
    "rewardTrack" TEXT NOT NULL DEFAULT 'standard',
    "activityEvidence" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "primaryCategory" TEXT,
    "rewardAmount" INTEGER,
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchFeedbackSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResearchFeedbackSubmission_userId_key" ON "ResearchFeedbackSubmission"("userId");

-- CreateIndex
CREATE INDEX "ResearchFeedbackSubmission_chatId_idx" ON "ResearchFeedbackSubmission"("chatId");

-- CreateIndex
CREATE INDEX "ResearchFeedbackSubmission_status_createdAt_idx" ON "ResearchFeedbackSubmission"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "ResearchFeedbackSubmission" ADD CONSTRAINT "ResearchFeedbackSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchFeedbackSubmission" ADD CONSTRAINT "ResearchFeedbackSubmission_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
