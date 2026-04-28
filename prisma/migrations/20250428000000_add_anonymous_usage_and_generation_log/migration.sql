-- Create AnonymousUsage table
CREATE TABLE "AnonymousUsage" (
    "id" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "fingerprintHash" TEXT,
    "generationsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnonymousUsage_pkey" PRIMARY KEY ("id")
);

-- Create GenerationLog table
CREATE TABLE "GenerationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "modelId" TEXT NOT NULL,
    "creditsUsed" INTEGER NOT NULL,
    "tokensUsed" INTEGER,
    "status" TEXT NOT NULL,
    "chatId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenerationLog_pkey" PRIMARY KEY ("id")
);

-- Create indexes for AnonymousUsage
CREATE INDEX "AnonymousUsage_ipHash_fingerprintHash_idx" ON "AnonymousUsage"("ipHash", "fingerprintHash");
CREATE INDEX "AnonymousUsage_createdAt_idx" ON "AnonymousUsage"("createdAt");

-- Create indexes for GenerationLog
CREATE INDEX "GenerationLog_userId_createdAt_idx" ON "GenerationLog"("userId", "createdAt");
CREATE INDEX "GenerationLog_modelId_idx" ON "GenerationLog"("modelId");
CREATE INDEX "GenerationLog_createdAt_idx" ON "GenerationLog"("createdAt");
