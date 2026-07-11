ALTER TABLE "GenerationLog"
ADD COLUMN "messageId" TEXT;

CREATE INDEX "GenerationLog_messageId_idx" ON "GenerationLog"("messageId");
