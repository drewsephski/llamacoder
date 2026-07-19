CREATE TABLE "PagePurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "stripeCheckoutSessionId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'paid',
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastDownloadedAt" TIMESTAMP(3),
    CONSTRAINT "PagePurchase_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PagePurchase_stripeCheckoutSessionId_key" ON "PagePurchase"("stripeCheckoutSessionId");
CREATE INDEX "PagePurchase_userId_productKey_idx" ON "PagePurchase"("userId", "productKey");
CREATE INDEX "PagePurchase_userId_purchasedAt_idx" ON "PagePurchase"("userId", "purchasedAt");
ALTER TABLE "PagePurchase" ADD CONSTRAINT "PagePurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
