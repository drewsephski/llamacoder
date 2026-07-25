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

let stripeClient: Stripe | undefined;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(getRequiredEnv("STRIPE_SECRET_KEY"), {
      apiVersion: "2026-04-22.dahlia",
    });
  }

  return stripeClient;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripeClient();
    const value = client[prop as keyof Stripe];

    if (typeof value === "function") {
      return value.bind(client);
    }

    return value;
  },
});

export function getStripeWebhookSecret() {
  return getRequiredEnv("STRIPE_WEBHOOK_SECRET");
}

let stripePriceIds: { pro: string; pro_plus: string } | undefined;

export function getStripePriceIds() {
  if (!stripePriceIds) {
    stripePriceIds = {
      pro: getRequiredEnv("STRIPE_PRO_PRICE_ID"),
      pro_plus: getRequiredEnv("STRIPE_PRO_PLUS_PRICE_ID"),
    };
  }

  return stripePriceIds;
}

export const STRIPE_PRICE_IDS = new Proxy(
  {} as { pro: string; pro_plus: string },
  {
    get(_target, prop) {
      return getStripePriceIds()[
        prop as keyof ReturnType<typeof getStripePriceIds>
      ];
    },
  },
);

let creditPackConfigs: typeof import("./billing/config").CREDIT_PACKS extends infer _T
  ? Record<
      "small" | "medium" | "large",
      { priceId: string; credits: number; price: number }
    >
  : never;

export function getCreditPackConfigs() {
  if (!creditPackConfigs) {
    creditPackConfigs = {
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
  }

  return creditPackConfigs;
}

export const CREDIT_PACK_CONFIGS = new Proxy(
  {} as ReturnType<typeof getCreditPackConfigs>,
  {
    get(_target, prop) {
      return getCreditPackConfigs()[
        prop as keyof ReturnType<typeof getCreditPackConfigs>
      ];
    },
  },
);

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

export async function cancelStripeSubscriptionIfPresent(
  subscriptionId?: string | null,
) {
  if (!subscriptionId) return;

  try {
    await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    if (!isMissingStripeResourceError(error, "subscription")) {
      throw error;
    }
  }
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
    allow_promotion_codes: true,
    integration_identifier: "llamacoder_subscription_k7m2xq9p",
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

export async function createCreditsCheckoutSession(
  customerId: string,
  successUrl: string,
  cancelUrl: string,
  creditPack: keyof ReturnType<typeof getCreditPackConfigs>,
  userId: string,
) {
  const pack = getCreditPackConfigs()[creditPack];

  return stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: userId,
    mode: "payment",
    allow_promotion_codes: true,
    integration_identifier: "llamacoder_credits_j4n8w2rt",
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

export async function createSubscriptionCheckoutSession({
  customerId,
  userId,
  tier,
  priceId,
  origin,
}: {
  customerId: string;
  userId: string;
  tier: "pro" | "pro_plus";
  priceId: string;
  origin: string;
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: userId,
    mode: "subscription",
    allow_promotion_codes: true,
    integration_identifier: "llamacoder_subscription_k7m2xq9p",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${origin}/dashboard?subscription_success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard?subscription_canceled=true`,
    metadata: {
      type: "subscription",
      tier,
      userId,
    },
    subscription_data: {
      metadata: {
        tier,
        userId,
      },
    },
  });
}
