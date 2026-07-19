import type Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { CREDIT_PACK_CONFIGS, STRIPE_PRICE_IDS, stripe } from "@/lib/stripe";
import { getPrisma } from "@/lib/prisma";
import {
  TIERS,
  estimateStripeNetRevenueUsd,
  normalizeTier,
  type TierKey,
} from "./config";
import { fulfillPagePurchase } from "@/features/for-sale/server/purchases";

type CreditGrantType = "purchase" | "subscription" | "referral";
type SubscriptionTier = Extract<TierKey, "pro" | "pro_plus">;
const REFERRAL_UPGRADE_CREDITS = 25;

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function toDateFromSeconds(value: unknown, fallback: Date): Date {
  return typeof value === "number" ? new Date(value * 1000) : fallback;
}

function getStripeId(value: string | { id?: string } | null | undefined) {
  if (typeof value === "string") return value;
  return value?.id;
}

export function getTierFromPriceId(priceId?: string): SubscriptionTier | null {
  if (!priceId) return null;
  if (priceId === STRIPE_PRICE_IDS.pro) return "pro";
  if (priceId === STRIPE_PRICE_IDS.pro_plus) return "pro_plus";
  return null;
}

function getCreditPackFromPriceId(
  priceId?: string,
): keyof typeof CREDIT_PACK_CONFIGS | null {
  if (!priceId) return null;

  for (const [key, pack] of Object.entries(CREDIT_PACK_CONFIGS)) {
    if (pack.priceId === priceId) {
      return key as keyof typeof CREDIT_PACK_CONFIGS;
    }
  }

  return null;
}

function getSubscriptionPeriod(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0] as Stripe.SubscriptionItem & {
    current_period_start?: number;
    current_period_end?: number;
  };
  const fallbackStart = toDateFromSeconds(subscription.start_date, new Date());
  const fallbackEnd = new Date(
    fallbackStart.getTime() + 30 * 24 * 60 * 60 * 1000,
  );

  return {
    currentPeriodStart: toDateFromSeconds(
      item?.current_period_start,
      fallbackStart,
    ),
    currentPeriodEnd: toDateFromSeconds(item?.current_period_end, fallbackEnd),
  };
}

function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const parent = invoice.parent as
    | {
        subscription_details?: {
          subscription?: string | Stripe.Subscription | null;
          metadata?: Stripe.Metadata | null;
        } | null;
      }
    | null
    | undefined;
  const parentSubscriptionId = getStripeId(
    parent?.subscription_details?.subscription,
  );

  if (parentSubscriptionId) return parentSubscriptionId;

  for (const line of invoice.lines?.data ?? []) {
    const lineParent = line.parent as
      | {
          subscription_item_details?: {
            subscription?: string | Stripe.Subscription | null;
          } | null;
        }
      | null
      | undefined;
    const lineSubscriptionId = getStripeId(
      lineParent?.subscription_item_details?.subscription,
    );

    if (lineSubscriptionId) return lineSubscriptionId;
  }

  return null;
}

function getInvoiceMetadata(invoice: Stripe.Invoice) {
  const parent = invoice.parent as
    | {
        subscription_details?: {
          metadata?: Stripe.Metadata | null;
        } | null;
      }
    | null
    | undefined;

  return {
    ...parent?.subscription_details?.metadata,
    ...invoice.metadata,
  };
}

async function findUserIdForCustomer(customerId: string) {
  const prisma = getPrisma();
  const subscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
    select: { userId: true },
  });

  return subscription?.userId ?? null;
}

async function grantCreditsOnce({
  userId,
  amount,
  type,
  description,
  dedupeKey,
  expiresAt,
  rolloverCap,
  stripeEventId,
  stripeCheckoutSessionId,
  stripeInvoiceId,
  stripeSubscriptionId,
  grossRevenueUsd,
  netRevenueUsd,
}: {
  userId: string;
  amount: number;
  type: CreditGrantType;
  description: string;
  dedupeKey: string;
  expiresAt?: Date;
  rolloverCap?: number;
  stripeEventId?: string;
  stripeCheckoutSessionId?: string;
  stripeInvoiceId?: string;
  stripeSubscriptionId?: string;
  grossRevenueUsd?: number;
  netRevenueUsd?: number;
}) {
  const prisma = getPrisma();

  try {
    return await prisma.$transaction(async (tx) => {
      if (type === "subscription" && rolloverCap) {
        const carryoverLimit = Math.max(0, rolloverCap - amount);
        const existingGrants =
          (await tx.creditGrant.findMany({
            where: {
              userId,
              type: "subscription",
              remainingAmount: { gt: 0 },
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
            orderBy: [{ expiresAt: "asc" }, { createdAt: "asc" }],
            select: {
              id: true,
              remainingAmount: true,
            },
          })) ?? [];
        const existingTotal = existingGrants.reduce(
          (total, grant) => total + grant.remainingAmount,
          0,
        );
        let trimAmount = Math.max(0, existingTotal - carryoverLimit);

        for (const grant of existingGrants) {
          if (trimAmount <= 0) break;

          const decrement = Math.min(trimAmount, grant.remainingAmount);
          await tx.creditGrant.update({
            where: { id: grant.id },
            data: { remainingAmount: { decrement } },
          });
          trimAmount -= decrement;
        }

        if (existingTotal > carryoverLimit) {
          await tx.user.update({
            where: { id: userId },
            data: {
              credits: { decrement: existingTotal - carryoverLimit },
            },
          });
        }

        if (expiresAt) {
          await tx.creditGrant.updateMany({
            where: {
              userId,
              type: "subscription",
              remainingAmount: { gt: 0 },
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
            data: { expiresAt },
          });
        }
      }

      await tx.creditGrant.create({
        data: {
          userId,
          amount,
          remainingAmount: amount,
          type,
          description,
          dedupeKey,
          expiresAt,
          stripeEventId,
          stripeCheckoutSessionId,
          stripeInvoiceId,
          stripeSubscriptionId,
          grossRevenueUsd,
          netRevenueUsd,
          unitRevenueUsd:
            amount > 0 && netRevenueUsd !== undefined
              ? netRevenueUsd / amount
              : 0,
        },
      });

      const user = await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: amount } },
        select: { credits: true },
      });

      await tx.creditHistory.create({
        data: {
          userId,
          amount,
          type,
          description,
        },
      });

      return { granted: true, balance: user.credits };
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { granted: false, balance: null };
    }

    throw error;
  }
}

function getRevenueBackedSubscriptionCredits({
  invoice,
  monthlyCredits,
  monthlyPriceUsd,
}: {
  invoice: Stripe.Invoice;
  monthlyCredits: number;
  monthlyPriceUsd: number;
}) {
  const invoiceWithRevenue = invoice as Stripe.Invoice & {
    total_excluding_tax?: number | null;
    subtotal_excluding_tax?: number | null;
    amount_paid?: number;
  };
  const fullPriceCents = Math.round(monthlyPriceUsd * 100);
  const revenueCents =
    invoiceWithRevenue.total_excluding_tax ??
    invoiceWithRevenue.subtotal_excluding_tax ??
    invoiceWithRevenue.amount_paid ??
    fullPriceCents;

  if (fullPriceCents <= 0 || revenueCents <= 0) {
    return { credits: 0, grossRevenueUsd: 0, netRevenueUsd: 0 };
  }

  const grossRevenueUsd = revenueCents / 100;
  return {
    credits: Math.min(
      monthlyCredits,
      Math.floor((monthlyCredits * revenueCents) / fullPriceCents),
    ),
    grossRevenueUsd,
    netRevenueUsd: estimateStripeNetRevenueUsd(grossRevenueUsd),
  };
}

async function grantReferralCreditsForUpgrade({
  upgradedUserId,
  eventId,
}: {
  upgradedUserId: string;
  eventId?: string;
}) {
  const prisma = getPrisma();
  const referral = await prisma.chat.findFirst({
    where: {
      userId: upgradedUserId,
      referrerUserId: {
        not: null,
      },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      sourceMessageId: true,
      sourceChatId: true,
      referrerUserId: true,
    },
  });

  if (!referral?.referrerUserId || referral.referrerUserId === upgradedUserId) {
    return { granted: false, reason: "no_referrer" };
  }

  const grant = await grantCreditsOnce({
    userId: referral.referrerUserId,
    amount: REFERRAL_UPGRADE_CREDITS,
    type: "referral",
    description: `Referral upgrade bonus - ${REFERRAL_UPGRADE_CREDITS} credits`,
    dedupeKey: `referral:upgrade:${upgradedUserId}`,
    stripeEventId: eventId,
  });

  if (grant.granted && referral.sourceMessageId && referral.sourceChatId) {
    await prisma.shareEvent.create({
      data: {
        messageId: referral.sourceMessageId,
        chatId: referral.sourceChatId,
        eventType: "referral_credit_granted",
        userId: upgradedUserId,
        referrerUserId: referral.referrerUserId,
        metadata: {
          credits: REFERRAL_UPGRADE_CREDITS,
          remixChatId: referral.id,
        },
      },
    });
  }

  return {
    granted: grant.granted,
    referrerUserId: referral.referrerUserId,
    credits: REFERRAL_UPGRADE_CREDITS,
  };
}

async function getExpandedInvoice(invoiceId: string) {
  return stripe.invoices.retrieve(invoiceId, {
    expand: ["lines.data"],
  });
}

export async function hasProcessedStripeEvent(eventId: string) {
  const prisma = getPrisma();
  const event = await prisma.stripeWebhookEvent.findUnique({
    where: { id: eventId },
    select: { id: true },
  });

  return Boolean(event);
}

export async function recordProcessedStripeEvent(event: Stripe.Event) {
  const prisma = getPrisma();

  await prisma.stripeWebhookEvent.upsert({
    where: { id: event.id },
    create: {
      id: event.id,
      type: event.type,
    },
    update: {},
  });
}

export async function syncSubscriptionFromStripe({
  subscriptionId,
  fallbackCustomerId,
  fallbackUserId,
}: {
  subscriptionId: string;
  fallbackCustomerId?: string;
  fallbackUserId?: string;
}) {
  const prisma = getPrisma();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["latest_invoice"],
  });
  const item = subscription.items.data[0];
  const priceId = item?.price?.id;
  const tier =
    getTierFromPriceId(priceId) ?? normalizeTier(subscription.metadata.tier);
  const tierKey = tier === "free" ? "pro" : tier;
  const customerId =
    getStripeId(subscription.customer) ?? fallbackCustomerId ?? null;
  const userId =
    asString(subscription.metadata.userId) ||
    fallbackUserId ||
    (customerId ? await findUserIdForCustomer(customerId) : null);

  if (!customerId) {
    throw new Error(`Stripe subscription ${subscriptionId} has no customer`);
  }

  if (!userId) {
    throw new Error(
      `Could not resolve user for Stripe subscription ${subscriptionId}`,
    );
  }

  const period = getSubscriptionPeriod(subscription);

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId ?? "",
      status: subscription.status,
      tier: tierKey,
      ...period,
    },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId ?? "",
      status: subscription.status,
      tier: tierKey,
      ...period,
    },
  });

  return {
    userId,
    customerId,
    subscriptionId: subscription.id,
    status: subscription.status,
    tier: tierKey,
    priceId,
    latestInvoiceId: getStripeId(subscription.latest_invoice),
    currentPeriodEnd: period.currentPeriodEnd,
  };
}

export async function fulfillPaidInvoice(
  invoice: Stripe.Invoice,
  eventId?: string,
) {
  if (invoice.status !== "paid") {
    return { fulfilled: false, reason: "invoice_not_paid" };
  }

  const invoiceId = invoice.id;
  if (!invoiceId) {
    return { fulfilled: false, reason: "missing_invoice_id" };
  }

  const expandedInvoice =
    invoice.lines?.data?.length && invoice.parent
      ? invoice
      : await getExpandedInvoice(invoiceId);
  const subscriptionId = getSubscriptionIdFromInvoice(expandedInvoice);

  if (!subscriptionId) {
    return { fulfilled: false, reason: "invoice_without_subscription" };
  }

  const metadata = getInvoiceMetadata(expandedInvoice);
  const syncedSubscription = await syncSubscriptionFromStripe({
    subscriptionId,
    fallbackCustomerId: getStripeId(expandedInvoice.customer),
    fallbackUserId: asString(metadata.userId),
  });
  const tierConfig = TIERS[syncedSubscription.tier];

  if (!tierConfig) {
    throw new Error(`Unknown subscription tier: ${syncedSubscription.tier}`);
  }

  const revenueBackedGrant = getRevenueBackedSubscriptionCredits({
    invoice: expandedInvoice,
    monthlyCredits: tierConfig.monthlyCredits,
    monthlyPriceUsd: tierConfig.price,
  });
  if (revenueBackedGrant.credits <= 0) {
    return {
      fulfilled: false,
      reason: "invoice_without_credit_revenue",
      userId: syncedSubscription.userId,
      invoiceId,
    };
  }

  const grant = await grantCreditsOnce({
    userId: syncedSubscription.userId,
    amount: revenueBackedGrant.credits,
    type: "subscription",
    description: `${tierConfig.name} subscription invoice - ${revenueBackedGrant.credits} credits`,
    dedupeKey: `stripe:invoice:${invoiceId}`,
    expiresAt: syncedSubscription.currentPeriodEnd,
    rolloverCap: tierConfig.rolloverCap,
    stripeEventId: eventId,
    stripeInvoiceId: invoiceId,
    stripeSubscriptionId: syncedSubscription.subscriptionId,
    grossRevenueUsd: revenueBackedGrant.grossRevenueUsd,
    netRevenueUsd: revenueBackedGrant.netRevenueUsd,
  });
  const referralGrant = grant.granted
    ? await grantReferralCreditsForUpgrade({
        upgradedUserId: syncedSubscription.userId,
        eventId,
      })
    : { granted: false, reason: "subscription_credit_not_granted" };

  return {
    fulfilled: grant.granted,
    userId: syncedSubscription.userId,
    subscriptionId: syncedSubscription.subscriptionId,
    invoiceId,
    tier: syncedSubscription.tier,
    credits: revenueBackedGrant.credits,
    referralGrant,
  };
}

async function fulfillCreditPackCheckout(
  session: Stripe.Checkout.Session,
  eventId?: string,
) {
  if (session.payment_status !== "paid") {
    return { fulfilled: false, reason: "checkout_not_paid" };
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 1,
  });
  const priceId = lineItems.data[0]?.price?.id;
  const packKey =
    asString(session.metadata?.pack) ?? getCreditPackFromPriceId(priceId);

  if (!packKey || !(packKey in CREDIT_PACK_CONFIGS)) {
    throw new Error(`Unknown credit pack for Checkout Session ${session.id}`);
  }

  const pack = CREDIT_PACK_CONFIGS[packKey as keyof typeof CREDIT_PACK_CONFIGS];
  const customerId = getStripeId(session.customer);
  const userId =
    asString(session.metadata?.userId) ||
    asString(session.client_reference_id) ||
    (customerId ? await findUserIdForCustomer(customerId) : null);

  if (!userId) {
    throw new Error(
      `Could not resolve user for Checkout Session ${session.id}`,
    );
  }

  const grant = await grantCreditsOnce({
    userId,
    amount: pack.credits,
    type: "purchase",
    description: `Credit pack purchase - ${pack.credits} credits (${packKey})`,
    dedupeKey: `stripe:checkout-session:${session.id}`,
    stripeEventId: eventId,
    stripeCheckoutSessionId: session.id,
    grossRevenueUsd: pack.price,
    netRevenueUsd: estimateStripeNetRevenueUsd(pack.price),
  });
  const referralGrant = grant.granted
    ? await grantReferralCreditsForUpgrade({
        upgradedUserId: userId,
        eventId,
      })
    : { granted: false, reason: "credit_pack_not_granted" };

  return {
    fulfilled: grant.granted,
    userId,
    checkoutSessionId: session.id,
    credits: pack.credits,
    referralGrant,
  };
}

export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session,
  eventId?: string,
) {
  if (session.mode === "payment") {
    if (session.metadata?.kind === "page_license") {
      return fulfillPagePurchase(session);
    }
    return fulfillCreditPackCheckout(session, eventId);
  }

  if (session.mode !== "subscription") {
    return { fulfilled: false, reason: "unsupported_checkout_mode" };
  }

  const subscriptionId = getStripeId(session.subscription);
  if (!subscriptionId) {
    return { fulfilled: false, reason: "missing_subscription" };
  }

  const syncedSubscription = await syncSubscriptionFromStripe({
    subscriptionId,
    fallbackCustomerId: getStripeId(session.customer),
    fallbackUserId:
      asString(session.metadata?.userId) ||
      asString(session.client_reference_id),
  });

  if (!syncedSubscription.latestInvoiceId) {
    return {
      fulfilled: false,
      reason: "subscription_without_latest_invoice",
      subscriptionId,
    };
  }

  const invoice = await getExpandedInvoice(syncedSubscription.latestInvoiceId);
  return fulfillPaidInvoice(invoice, eventId);
}

export async function reconcileCheckoutSessionForUser({
  checkoutSessionId,
  userId,
}: {
  checkoutSessionId: string;
  userId: string;
}) {
  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
    expand: ["subscription"],
  });
  const sessionCustomerId = getStripeId(session.customer);
  const referencedUserId =
    asString(session.metadata?.userId) || asString(session.client_reference_id);

  if (referencedUserId && referencedUserId !== userId) {
    throw new Error("Checkout Session does not belong to the signed-in user");
  }

  if (!referencedUserId && sessionCustomerId) {
    const customerUserId = await findUserIdForCustomer(sessionCustomerId);
    if (customerUserId && customerUserId !== userId) {
      throw new Error(
        "Checkout Session customer does not belong to the signed-in user",
      );
    }
  }

  return fulfillCheckoutSession(session);
}

export async function markSubscriptionStatus(
  subscriptionId: string,
  status: string,
) {
  const prisma = getPrisma();

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status },
  });
}
