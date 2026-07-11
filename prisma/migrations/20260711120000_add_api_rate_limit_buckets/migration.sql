CREATE TABLE "ApiRateLimitBucket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiRateLimitBucket_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ApiRateLimitBucket_userId_operation_windowStart_idx"
ON "ApiRateLimitBucket"("userId", "operation", "windowStart");

CREATE INDEX "ApiRateLimitBucket_expiresAt_idx"
ON "ApiRateLimitBucket"("expiresAt");
