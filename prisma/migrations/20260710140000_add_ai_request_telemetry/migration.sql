CREATE TABLE "AIRequestLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "chatId" TEXT,
    "messageId" TEXT,
    "modelId" TEXT NOT NULL,
    "quality" TEXT NOT NULL,
    "reasoningEnabled" BOOLEAN NOT NULL,
    "reasoningMandatory" BOOLEAN NOT NULL,
    "reasoningEffort" TEXT NOT NULL,
    "timeToFirstByteMs" INTEGER,
    "timeToFirstReasoningDeltaMs" INTEGER,
    "timeToFirstTextDeltaMs" INTEGER,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "reasoningTokens" INTEGER,
    "totalTokens" INTEGER,
    "finishReason" TEXT,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIRequestLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AIRequestLog_userId_createdAt_idx"
ON "AIRequestLog"("userId", "createdAt");

CREATE INDEX "AIRequestLog_chatId_createdAt_idx"
ON "AIRequestLog"("chatId", "createdAt");

CREATE INDEX "AIRequestLog_modelId_createdAt_idx"
ON "AIRequestLog"("modelId", "createdAt");
