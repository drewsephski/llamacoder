ALTER TABLE "CreditGrant"
ADD COLUMN "remainingAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "expiresAt" TIMESTAMP(3);

UPDATE "CreditGrant"
SET "remainingAmount" = GREATEST("amount", 0)
WHERE "amount" > 0;

DO $$
DECLARE
  user_record RECORD;
  grant_record RECORD;
  grant_total INTEGER;
  trim_amount INTEGER;
  decrement_amount INTEGER;
  missing_amount INTEGER;
BEGIN
  FOR user_record IN SELECT id, credits FROM "user" WHERE credits > 0 LOOP
    SELECT COALESCE(SUM("remainingAmount"), 0)
    INTO grant_total
    FROM "CreditGrant"
    WHERE "userId" = user_record.id;

    IF grant_total > user_record.credits THEN
      trim_amount := grant_total - user_record.credits;

      FOR grant_record IN
        SELECT id, "remainingAmount"
        FROM "CreditGrant"
        WHERE "userId" = user_record.id AND "remainingAmount" > 0
        ORDER BY
          CASE
            WHEN type = 'subscription' THEN 0
            WHEN type IN ('bonus', 'referral') THEN 1
            WHEN type = 'purchase' THEN 2
            ELSE 3
          END,
          "expiresAt" ASC NULLS LAST,
          "createdAt" ASC
      LOOP
        EXIT WHEN trim_amount <= 0;
        decrement_amount := LEAST(trim_amount, grant_record."remainingAmount");

        UPDATE "CreditGrant"
        SET "remainingAmount" = "remainingAmount" - decrement_amount
        WHERE id = grant_record.id;

        trim_amount := trim_amount - decrement_amount;
      END LOOP;
    ELSIF grant_total < user_record.credits THEN
      missing_amount := user_record.credits - grant_total;

      INSERT INTO "CreditGrant" (
        id,
        "userId",
        amount,
        "remainingAmount",
        type,
        description,
        "dedupeKey",
        "createdAt"
      )
      VALUES (
        substring(md5(random()::text || clock_timestamp()::text) from 1 for 16),
        user_record.id,
        missing_amount,
        missing_amount,
        'legacy',
        'Legacy reconciled credit balance',
        'legacy-balance:' || user_record.id,
        now()
      )
      ON CONFLICT ("dedupeKey") DO NOTHING;
    END IF;
  END LOOP;
END $$;

CREATE INDEX "CreditGrant_userId_type_remainingAmount_idx" ON "CreditGrant"("userId", "type", "remainingAmount");
CREATE INDEX "CreditGrant_expiresAt_idx" ON "CreditGrant"("expiresAt");

ALTER TABLE "Chat"
ADD COLUMN "generationStatus" TEXT NOT NULL DEFAULT 'idle',
ADD COLUMN "generationStartedAt" TIMESTAMP(3);

CREATE INDEX "Chat_generationStatus_idx" ON "Chat"("generationStatus");

CREATE TABLE "CreditHold" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "chatId" TEXT,
  "modelId" TEXT NOT NULL,
  "amountHeld" INTEGER NOT NULL,
  "amountCaptured" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL,
  "reason" TEXT,
  "phase" TEXT,
  "allocations" JSONB NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CreditHold_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CreditHold_userId_status_idx" ON "CreditHold"("userId", "status");
CREATE INDEX "CreditHold_chatId_status_idx" ON "CreditHold"("chatId", "status");
CREATE INDEX "CreditHold_expiresAt_idx" ON "CreditHold"("expiresAt");

ALTER TABLE "GenerationLog"
ADD COLUMN "inputTokens" INTEGER,
ADD COLUMN "outputTokens" INTEGER,
ADD COLUMN "generationSize" TEXT,
ADD COLUMN "estimatedModelCostUsd" DOUBLE PRECISION,
ADD COLUMN "riskAdjustedModelCostUsd" DOUBLE PRECISION;
