CREATE TABLE "IntegrationConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "authType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "lastHealthStatus" TEXT,
    "lastHealthMessage" TEXT,
    "lastHealthCheckAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationConnection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IntegrationCredential" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "authTag" TEXT NOT NULL,
    "keyVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationCredential_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectIntegration" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectIntegration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IntegrationAuditEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "environment" TEXT,
    "connectionId" TEXT,
    "projectIntegrationId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "IntegrationConnection_userId_providerId_idx" ON "IntegrationConnection"("userId", "providerId");
CREATE INDEX "IntegrationConnection_userId_status_idx" ON "IntegrationConnection"("userId", "status");
CREATE UNIQUE INDEX "IntegrationCredential_connectionId_kind_key" ON "IntegrationCredential"("connectionId", "kind");
CREATE INDEX "IntegrationCredential_connectionId_idx" ON "IntegrationCredential"("connectionId");
CREATE UNIQUE INDEX "ProjectIntegration_chatId_providerId_environment_key" ON "ProjectIntegration"("chatId", "providerId", "environment");
CREATE INDEX "ProjectIntegration_chatId_environment_idx" ON "ProjectIntegration"("chatId", "environment");
CREATE INDEX "ProjectIntegration_connectionId_idx" ON "ProjectIntegration"("connectionId");
CREATE INDEX "IntegrationAuditEvent_userId_createdAt_idx" ON "IntegrationAuditEvent"("userId", "createdAt");
CREATE INDEX "IntegrationAuditEvent_connectionId_createdAt_idx" ON "IntegrationAuditEvent"("connectionId", "createdAt");
CREATE INDEX "IntegrationAuditEvent_projectIntegrationId_createdAt_idx" ON "IntegrationAuditEvent"("projectIntegrationId", "createdAt");

ALTER TABLE "IntegrationConnection" ADD CONSTRAINT "IntegrationConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IntegrationCredential" ADD CONSTRAINT "IntegrationCredential_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "IntegrationConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectIntegration" ADD CONSTRAINT "ProjectIntegration_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectIntegration" ADD CONSTRAINT "ProjectIntegration_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "IntegrationConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IntegrationAuditEvent" ADD CONSTRAINT "IntegrationAuditEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IntegrationAuditEvent" ADD CONSTRAINT "IntegrationAuditEvent_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "IntegrationConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "IntegrationAuditEvent" ADD CONSTRAINT "IntegrationAuditEvent_projectIntegrationId_fkey" FOREIGN KEY ("projectIntegrationId") REFERENCES "ProjectIntegration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
