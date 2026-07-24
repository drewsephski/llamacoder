-- Billing tables were previously applied outside migration history (db push).
-- This baseline migration restores a clean shadow-database replay path.

ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS "credits" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "CreditHistory" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "description" TEXT,
  "chatId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CreditHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CreditHistory_userId_idx" ON "CreditHistory"("userId");
CREATE INDEX IF NOT EXISTS "CreditHistory_createdAt_idx" ON "CreditHistory"("createdAt");

CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "stripeCustomerId" TEXT NOT NULL,
  "stripePriceId" TEXT NOT NULL,
  "stripeSubscriptionId" TEXT,
  "status" TEXT NOT NULL,
  "currentPeriodStart" TIMESTAMP(3) NOT NULL,
  "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "tier" TEXT NOT NULL DEFAULT 'pro',
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_userId_key" ON "Subscription"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "Subscription_userId_idx" ON "Subscription"("userId");
CREATE INDEX IF NOT EXISTS "Subscription_stripeCustomerId_idx" ON "Subscription"("stripeCustomerId");
CREATE INDEX IF NOT EXISTS "Subscription_stripeSubscriptionId_idx" ON "Subscription"("stripeSubscriptionId");

CREATE TABLE IF NOT EXISTS "CreditGrant" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "description" TEXT,
  "dedupeKey" TEXT NOT NULL,
  "stripeEventId" TEXT,
  "stripeCheckoutSessionId" TEXT,
  "stripeInvoiceId" TEXT,
  "stripeSubscriptionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CreditGrant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CreditGrant_dedupeKey_key" ON "CreditGrant"("dedupeKey");
CREATE INDEX IF NOT EXISTS "CreditGrant_userId_idx" ON "CreditGrant"("userId");
CREATE INDEX IF NOT EXISTS "CreditGrant_stripeEventId_idx" ON "CreditGrant"("stripeEventId");
CREATE INDEX IF NOT EXISTS "CreditGrant_stripeCheckoutSessionId_idx" ON "CreditGrant"("stripeCheckoutSessionId");
CREATE INDEX IF NOT EXISTS "CreditGrant_stripeInvoiceId_idx" ON "CreditGrant"("stripeInvoiceId");
CREATE INDEX IF NOT EXISTS "CreditGrant_stripeSubscriptionId_idx" ON "CreditGrant"("stripeSubscriptionId");

CREATE TABLE IF NOT EXISTS "StripeWebhookEvent" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  ALTER TABLE "CreditHistory"
  ADD CONSTRAINT "CreditHistory_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "Subscription"
  ADD CONSTRAINT "Subscription_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "CreditGrant"
  ADD CONSTRAINT "CreditGrant_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
