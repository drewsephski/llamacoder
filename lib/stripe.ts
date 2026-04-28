import Stripe from "stripe";
import { TIERS, CREDIT_PACKS } from "./billing/config";

// Re-export for backward compatibility
export { TIERS as SUBSCRIPTION_TIERS, CREDIT_PACKS };

// Validate required environment variables at module load time
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required");
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET environment variable is required");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia",
});

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Subscription tier configurations
// These match the Stripe Price IDs created via MCP
export const STRIPE_PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID || process.env.STRIPE_PRICE_ID || "price_1TQySsRZE8Whwvf0U4nEsJrt",      // $9/month - 100 credits (fallback to old STRIPE_PRICE_ID)
  pro_plus: process.env.STRIPE_PRO_PLUS_PRICE_ID || process.env.STRIPE_UNLIMITED_PRICE_ID || "price_1TQyStRZE8Whwvf0mciJwsjS", // $29/month - 500 credits (was unlimited)
};

// Credit pack configurations with Stripe Price IDs
// These match the Stripe Product Price IDs created via MCP
export const CREDIT_PACK_CONFIGS = {
  small: {
    priceId: process.env.STRIPE_CREDITS_10_PRICE_ID || "price_1TQyStRZE8Whwvf0ofuH4dwB",
    credits: CREDIT_PACKS.small.credits,
    price: CREDIT_PACKS.small.price,
  },
  medium: {
    priceId: process.env.STRIPE_CREDITS_25_PRICE_ID || "price_1TQyStRZE8Whwvf0Vwt9tbnK",
    credits: CREDIT_PACKS.medium.credits,
    price: CREDIT_PACKS.medium.price,
  },
  large: {
    priceId: process.env.STRIPE_CREDITS_60_PRICE_ID || "price_1TQyStRZE8Whwvf0YJb0BFnI",
    credits: CREDIT_PACKS.large.credits,
    price: CREDIT_PACKS.large.price,
  },
};

export async function createStripeCustomer(email: string, name?: string) {
  return stripe.customers.create({
    email,
    name,
  });
}

export async function createCheckoutSession(
  customerId: string,
  successUrl: string,
  cancelUrl: string,
  tier: "pro" | "pro_plus" = "pro"
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
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        tier,
        credits: config.monthlyCredits.toString(),
      },
    },
  });
}

// Create a checkout session for one-time credit purchases
export async function createCreditsCheckoutSession(
  customerId: string,
  successUrl: string,
  cancelUrl: string,
  creditPack: keyof typeof CREDIT_PACK_CONFIGS,
  userId: string
) {
  const pack = CREDIT_PACK_CONFIGS[creditPack];

  if (!pack.priceId) {
    // If no price ID configured, create a dynamic price
    const price = await stripe.prices.create({
      unit_amount: pack.price * 100, // Convert to cents
      currency: "usd",
      product_data: {
        name: `${pack.credits} Credits Pack`,
      },
    });
    pack.priceId = price.id;
  }

  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price: pack.priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
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
  returnUrl: string
) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
