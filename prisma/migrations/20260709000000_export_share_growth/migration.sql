ALTER TABLE "Chat"
ADD COLUMN "sourceMessageId" TEXT,
ADD COLUMN "sourceChatId" TEXT,
ADD COLUMN "referrerUserId" TEXT;

CREATE INDEX "Chat_sourceMessageId_idx" ON "Chat"("sourceMessageId");
CREATE INDEX "Chat_sourceChatId_idx" ON "Chat"("sourceChatId");
CREATE INDEX "Chat_referrerUserId_idx" ON "Chat"("referrerUserId");

CREATE TABLE "ExportArtifact" (
  "id" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "chatId" TEXT NOT NULL,
  "userId" TEXT,
  "appTitle" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "fileCount" INTEGER NOT NULL,
  "manifest" JSONB NOT NULL,
  "report" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ExportArtifact_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ExportArtifact_messageId_idx" ON "ExportArtifact"("messageId");
CREATE INDEX "ExportArtifact_chatId_idx" ON "ExportArtifact"("chatId");
CREATE INDEX "ExportArtifact_userId_idx" ON "ExportArtifact"("userId");
CREATE INDEX "ExportArtifact_createdAt_idx" ON "ExportArtifact"("createdAt");

CREATE TABLE "ShareEvent" (
  "id" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "chatId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "visitorId" TEXT,
  "userId" TEXT,
  "referrerUserId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ShareEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ShareEvent_messageId_idx" ON "ShareEvent"("messageId");
CREATE INDEX "ShareEvent_chatId_idx" ON "ShareEvent"("chatId");
CREATE INDEX "ShareEvent_eventType_idx" ON "ShareEvent"("eventType");
CREATE INDEX "ShareEvent_visitorId_idx" ON "ShareEvent"("visitorId");
CREATE INDEX "ShareEvent_userId_idx" ON "ShareEvent"("userId");
CREATE INDEX "ShareEvent_referrerUserId_idx" ON "ShareEvent"("referrerUserId");
CREATE INDEX "ShareEvent_createdAt_idx" ON "ShareEvent"("createdAt");
