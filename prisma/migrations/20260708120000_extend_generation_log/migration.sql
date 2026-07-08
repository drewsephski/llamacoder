ALTER TABLE "GenerationLog"
ADD COLUMN "estimatedCredits" INTEGER,
ADD COLUMN "actualCredits" INTEGER,
ADD COLUMN "refundedCredits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "reason" TEXT,
ADD COLUMN "phase" TEXT;

UPDATE "GenerationLog"
SET "estimatedCredits" = "creditsUsed",
    "actualCredits" = "creditsUsed"
WHERE "estimatedCredits" IS NULL
   OR "actualCredits" IS NULL;

CREATE INDEX "GenerationLog_chatId_createdAt_idx" ON "GenerationLog"("chatId", "createdAt");
