CREATE TABLE "IntegrationOperation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "projectIntegrationId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "externalId" TEXT,
    "url" TEXT,
    "commitSha" TEXT,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "IntegrationOperation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "IntegrationOperation_chatId_createdAt_idx" ON "IntegrationOperation"("chatId", "createdAt");
CREATE INDEX "IntegrationOperation_projectIntegrationId_createdAt_idx" ON "IntegrationOperation"("projectIntegrationId", "createdAt");
CREATE INDEX "IntegrationOperation_connectionId_createdAt_idx" ON "IntegrationOperation"("connectionId", "createdAt");
CREATE INDEX "IntegrationOperation_userId_createdAt_idx" ON "IntegrationOperation"("userId", "createdAt");
CREATE INDEX "IntegrationOperation_providerId_status_idx" ON "IntegrationOperation"("providerId", "status");

ALTER TABLE "IntegrationOperation" ADD CONSTRAINT "IntegrationOperation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IntegrationOperation" ADD CONSTRAINT "IntegrationOperation_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IntegrationOperation" ADD CONSTRAINT "IntegrationOperation_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "IntegrationConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IntegrationOperation" ADD CONSTRAINT "IntegrationOperation_projectIntegrationId_fkey" FOREIGN KEY ("projectIntegrationId") REFERENCES "ProjectIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "IntegrationWebhookDelivery" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationWebhookDelivery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "IntegrationWebhookDelivery_providerId_deliveryId_key" ON "IntegrationWebhookDelivery"("providerId", "deliveryId");
CREATE INDEX "IntegrationWebhookDelivery_providerId_createdAt_idx" ON "IntegrationWebhookDelivery"("providerId", "createdAt");
