ALTER TABLE "Message"
ADD COLUMN "versionLabel" TEXT,
ADD COLUMN "isBookmarked" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "GenerationRun" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "chatId" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "assistantMessageId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'running',
  "phase" TEXT NOT NULL DEFAULT 'preparing',
  "label" TEXT NOT NULL DEFAULT 'Preparing your project',
  "partialText" TEXT NOT NULL DEFAULT '',
  "creditHoldId" TEXT,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "GenerationRun_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "GenerationRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GenerationRun_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GenerationRun_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "GenerationRun_chatId_createdAt_idx" ON "GenerationRun"("chatId", "createdAt");
CREATE INDEX "GenerationRun_userId_status_idx" ON "GenerationRun"("userId", "status");
CREATE INDEX "GenerationRun_messageId_createdAt_idx" ON "GenerationRun"("messageId", "createdAt");

CREATE TABLE "RuntimeVerification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "chatId" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "report" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RuntimeVerification_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "RuntimeVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "RuntimeVerification_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "RuntimeVerification_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "RuntimeVerification_messageId_createdAt_idx" ON "RuntimeVerification"("messageId", "createdAt");
CREATE INDEX "RuntimeVerification_chatId_createdAt_idx" ON "RuntimeVerification"("chatId", "createdAt");
CREATE INDEX "RuntimeVerification_userId_createdAt_idx" ON "RuntimeVerification"("userId", "createdAt");
