ALTER TABLE "CreditGrant"
ADD COLUMN "grossRevenueUsd" DOUBLE PRECISION,
ADD COLUMN "netRevenueUsd" DOUBLE PRECISION,
ADD COLUMN "unitRevenueUsd" DOUBLE PRECISION;

ALTER TABLE "CreditHold"
ADD COLUMN "providerCostUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "upstreamInferenceCostUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "inputTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "outputTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "reasoningTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "totalTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "provider" TEXT,
ADD COLUMN "providerRequestId" TEXT;

ALTER TABLE "GenerationLog"
ADD COLUMN "actualModelCostUsd" DOUBLE PRECISION,
ADD COLUMN "upstreamInferenceCostUsd" DOUBLE PRECISION,
ADD COLUMN "reasoningTokens" INTEGER,
ADD COLUMN "provider" TEXT,
ADD COLUMN "estimatedRevenueUsd" DOUBLE PRECISION,
ADD COLUMN "estimatedGrossMarginUsd" DOUBLE PRECISION;

ALTER TABLE "AIRequestLog"
ADD COLUMN "creditHoldId" TEXT,
ADD COLUMN "requestKind" TEXT NOT NULL DEFAULT 'generation',
ADD COLUMN "cachedInputTokens" INTEGER,
ADD COLUMN "provider" TEXT,
ADD COLUMN "providerRequestId" TEXT,
ADD COLUMN "providerCostUsd" DOUBLE PRECISION,
ADD COLUMN "upstreamInferenceCostUsd" DOUBLE PRECISION;

CREATE INDEX "AIRequestLog_creditHoldId_idx"
ON "AIRequestLog"("creditHoldId");

UPDATE "CreditGrant" AS credit_grant
SET "expiresAt" = subscription."currentPeriodEnd"
FROM "Subscription" AS subscription
WHERE credit_grant."userId" = subscription."userId"
  AND credit_grant.type = 'subscription'
  AND credit_grant."expiresAt" IS NULL;

UPDATE "CreditGrant"
SET
  "grossRevenueUsd" = CASE
    WHEN type = 'subscription' THEN amount * 0.058
    WHEN type = 'purchase' AND amount = 10 THEN 5
    WHEN type = 'purchase' AND amount = 25 THEN 10
    WHEN type = 'purchase' AND amount = 60 THEN 20
    ELSE 0
  END,
  "netRevenueUsd" = CASE
    WHEN type = 'subscription' THEN amount * 0.055718
    WHEN type = 'purchase' AND amount = 10 THEN 4.555
    WHEN type = 'purchase' AND amount = 25 THEN 9.41
    WHEN type = 'purchase' AND amount = 60 THEN 19.12
    ELSE 0
  END,
  "unitRevenueUsd" = CASE
    WHEN amount <= 0 THEN 0
    WHEN type = 'subscription' THEN 0.055718
    WHEN type = 'purchase' AND amount = 10 THEN 0.4555
    WHEN type = 'purchase' AND amount = 25 THEN 0.3764
    WHEN type = 'purchase' AND amount = 60 THEN 0.3186666667
    ELSE 0
  END
WHERE "unitRevenueUsd" IS NULL;
