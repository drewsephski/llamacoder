import Stripe from "stripe";
import { TIERS, CREDIT_PACKS } from "./billing/config";

// Re-export for backward compatibility
export { TIERS as SUBSCRIPTION_TIERS, CREDIT_PACKS };

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value || value.includes("...")) {
    throw new Error(`${name} environment variable is required`);
  }

  return value;
}

// Validate required environment variables at module load time
const STRIPE_SECRET_KEY = getRequiredEnv("STRIPE_SECRET_KEY");

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia",
});

export const STRIPE_WEBHOOK_SECRET = getRequiredEnv("STRIPE_WEBHOOK_SECRET");

// Subscription tier configurations
// These must be configured per Stripe account; do not fall back to stale prices.
export const STRIPE_PRICE_IDS = {
  pro: getRequiredEnv("STRIPE_PRO_PRICE_ID"),
  pro_plus: getRequiredEnv("STRIPE_PRO_PLUS_PRICE_ID"),
};

// Credit pack configurations with Stripe Price IDs
export const CREDIT_PACK_CONFIGS = {
  small: {
    priceId: getRequiredEnv("STRIPE_CREDITS_10_PRICE_ID"),
    credits: CREDIT_PACKS.small.credits,
    price: CREDIT_PACKS.small.price,
  },
  medium: {
    priceId: getRequiredEnv("STRIPE_CREDITS_25_PRICE_ID"),
    credits: CREDIT_PACKS.medium.credits,
    price: CREDIT_PACKS.medium.price,
  },
  large: {
    priceId: getRequiredEnv("STRIPE_CREDITS_60_PRICE_ID"),
    credits: CREDIT_PACKS.large.credits,
    price: CREDIT_PACKS.large.price,
  },
};

function addCheckoutSessionId(url: string) {
  const separator = url.includes("?") ? "&" : "?";
  return url.includes("{CHECKOUT_SESSION_ID}")
    ? url
    : `${url}${separator}session_id={CHECKOUT_SESSION_ID}`;
}

export async function createStripeCustomer(email: string, name?: string) {
  return stripe.customers.create({
    email,
    name,
  });
}

export function isMissingStripeResourceError(
  error: unknown,
  resourceName: string,
) {
  return (
    error instanceof Stripe.errors.StripeInvalidRequestError &&
    error.code === "resource_missing" &&
    error.message.includes(`No such ${resourceName}`)
  );
}

export async function getOrCreateStripeCustomerId({
  existingCustomerId,
  email,
  name,
}: {
  existingCustomerId?: string | null;
  email: string;
  name?: string | null;
}) {
  if (existingCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(existingCustomerId);

      if (!customer.deleted) {
        return existingCustomerId;
      }
    } catch (error) {
      if (!isMissingStripeResourceError(error, "customer")) {
        throw error;
      }
    }
  }

  const customer = await createStripeCustomer(email, name || undefined);

  return customer.id;
}

export async function createCheckoutSession(
  customerId: string,
  successUrl: string,
  cancelUrl: string,
  tier: "pro" | "pro_plus" = "pro",
) {
  const priceId = STRIPE_PRICE_IDS[tier];
  const config = TIERS[tier];

  if (!priceId) {
    throw new Error(`Price ID not configured for tier: ${tier}`);
  }

  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: addCheckoutSessionId(successUrl),
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        tier,
        credits: config.monthlyCredits.toString(),
      },
    },
  });
}

export async function upgradeSubscriptionTier({
  subscriptionId,
  tier,
  userId,
}: {
  subscriptionId: string;
  tier: "pro_plus";
  userId: string;
}) {
  const priceId = STRIPE_PRICE_IDS[tier];

  if (!priceId) {
    throw new Error(`Price ID not configured for tier: ${tier}`);
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const item = subscription.items.data[0];

  if (!item) {
    throw new Error(`Stripe subscription ${subscriptionId} has no items`);
  }

  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: item.id,
        price: priceId,
      },
    ],
    metadata: {
      ...subscription.metadata,
      tier,
      userId,
    },
    proration_behavior: "always_invoice",
  });
}

// Create a checkout session for one-time credit purchases
export async function createCreditsCheckoutSession(
  customerId: string,
  successUrl: string,
  cancelUrl: string,
  creditPack: keyof typeof CREDIT_PACK_CONFIGS,
  userId: string,
) {
  const pack = CREDIT_PACK_CONFIGS[creditPack];

  return stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: userId,
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price: pack.priceId,
        quantity: 1,
      },
    ],
    success_url: addCheckoutSessionId(successUrl),
    cancel_url: cancelUrl,
    metadata: {
      type: "credits",
      credits: pack.credits.toString(),
      pack: creditPack,
      userId: userId,
    },
  });
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string,
) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
