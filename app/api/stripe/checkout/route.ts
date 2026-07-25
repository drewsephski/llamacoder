import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type Stripe from "stripe";
import {
  stripe,
  getOrCreateStripeCustomerId,
  isMissingStripeResourceError,
  STRIPE_PRICE_IDS,
  upgradeSubscriptionTier,
  cancelStripeSubscriptionIfPresent,
  createSubscriptionCheckoutSession,
} from "@/lib/stripe";
import { getPrisma } from "@/lib/prisma";
import { getEntitlementTier, isSubscriptionEntitled } from "@/lib/billing";
import { syncSubscriptionFromStripe } from "@/lib/billing/stripe-fulfillment";
import { consumeRateLimit } from "@/features/security/server/rate-limit";
import { recordOperationalEvent } from "@/lib/observability";
import { getAppOrigin } from "@/lib/app-origin";
import {
  checkoutErrorResponse,
  checkoutSuccessResponse,
  getCheckoutString,
} from "@/features/billing/server/checkout-responses";
import {
  persistStripeCustomerId,
  resolveExistingStripeCustomerId,
} from "@/features/billing/server/stripe-customer";

type SubscriptionTier = keyof typeof STRIPE_PRICE_IDS;

type CheckoutRequestBody = {
  plan?: string;
  priceId?: string;
  expectsJson: boolean;
};

function isSubscriptionTier(value: string): value is SubscriptionTier {
  return Object.hasOwn(STRIPE_PRICE_IDS, value);
}

function getTierForPriceId(priceId?: string): SubscriptionTier | undefined {
  if (!priceId) return undefined;

  return (
    Object.entries(STRIPE_PRICE_IDS) as [SubscriptionTier, string][]
  ).find(([, configuredPriceId]) => configuredPriceId === priceId)?.[0];
}

async function parseCheckoutRequest(
  request: NextRequest,
): Promise<CheckoutRequestBody> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, unknown>;

    return {
      plan: getCheckoutString(body.plan),
      priceId: getCheckoutString(body.priceId),
      expectsJson: true,
    };
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();

    return {
      plan: getCheckoutString(formData.get("plan")),
      priceId: getCheckoutString(formData.get("priceId")),
      expectsJson: false,
    };
  }

  return {
    expectsJson:
      request.headers.get("accept")?.includes("application/json") ?? false,
  };
}

export async function POST(request: NextRequest) {
  let expectsJson = true;

  try {
    const body = await parseCheckoutRequest(request);
    expectsJson = body.expectsJson;
    const priceTier = getTierForPriceId(body.priceId);
    const requestedPlan = body.plan ?? "pro";

    if (!priceTier && !isSubscriptionTier(requestedPlan)) {
      return checkoutErrorResponse(
        "Invalid subscription plan",
        400,
        request,
        expectsJson,
      );
    }

    const tier = priceTier ?? (requestedPlan as SubscriptionTier);
    const finalPriceId = body.priceId || STRIPE_PRICE_IDS[tier];

    if (!finalPriceId) {
      return checkoutErrorResponse(
        "Invalid price ID",
        400,
        request,
        expectsJson,
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return checkoutErrorResponse(
        "You must be signed in to subscribe",
        401,
        request,
        expectsJson,
      );
    }

    const rateLimit = await consumeRateLimit({
      userId: session.user.id,
      operation: "checkout",
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return checkoutErrorResponse(
        "Too many checkout requests. Please try again shortly.",
        429,
        request,
        expectsJson,
      );
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user) {
      return checkoutErrorResponse("User not found", 404, request, expectsJson);
    }

    const customerId = await getOrCreateStripeCustomerId({
      existingCustomerId: resolveExistingStripeCustomerId(user),
      email: user.email,
      name: user.name,
    });

    await persistStripeCustomerId({
      userId: user.id,
      customerId,
      subscriptionId: user.subscription?.id,
    });

    const currentTier = getEntitlementTier(user.subscription);
    const origin = getAppOrigin();
    const activeSubscription = user.subscription;

    if (
      activeSubscription &&
      isSubscriptionEntitled(activeSubscription.status)
    ) {
      if (currentTier === tier) {
        return checkoutErrorResponse(
          `You are already on the ${currentTier === "pro_plus" ? "Pro Plus" : "Pro"} plan`,
          400,
          request,
          expectsJson,
        );
      }

      if (currentTier === "pro_plus" || tier !== "pro_plus") {
        return checkoutErrorResponse(
          "Plan downgrades are not supported from checkout",
          400,
          request,
          expectsJson,
        );
      }

      if (!activeSubscription.stripeSubscriptionId) {
        return checkoutErrorResponse(
          "Your current subscription is missing a Stripe subscription ID",
          409,
          request,
          expectsJson,
        );
      }

      let updatedSubscription: Stripe.Subscription;

      try {
        updatedSubscription = await upgradeSubscriptionTier({
          subscriptionId: activeSubscription.stripeSubscriptionId,
          tier: "pro_plus",
          userId: user.id,
        });
      } catch (error) {
        if (!isMissingStripeResourceError(error, "subscription")) {
          throw error;
        }

        const checkoutSession = await createSubscriptionCheckoutSession({
          customerId,
          userId: user.id,
          tier,
          priceId: finalPriceId,
          origin,
        });

        await prisma.subscription.update({
          where: { id: activeSubscription.id },
          data: {
            stripeCustomerId: customerId,
            stripePriceId: finalPriceId,
            stripeSubscriptionId: null,
            status: "incomplete",
            tier,
          },
        });

        if (!checkoutSession.url) {
          return checkoutErrorResponse(
            "Stripe did not return a checkout URL",
            502,
            request,
            expectsJson,
          );
        }

        return checkoutSuccessResponse(checkoutSession.url, expectsJson);
      }

      await syncSubscriptionFromStripe({
        subscriptionId: updatedSubscription.id,
        fallbackCustomerId: customerId,
        fallbackUserId: user.id,
      });

      return checkoutSuccessResponse(
        `${origin}/dashboard?subscription_updated=true`,
        expectsJson,
      );
    }

    if (
      activeSubscription?.stripeSubscriptionId &&
      !isSubscriptionEntitled(activeSubscription.status)
    ) {
      await cancelStripeSubscriptionIfPresent(
        activeSubscription.stripeSubscriptionId,
      );
    }

    const checkoutSession = await createSubscriptionCheckoutSession({
      customerId,
      userId: user.id,
      tier,
      priceId: finalPriceId,
      origin,
    });

    if (user.subscription) {
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          stripeCustomerId: customerId,
          stripePriceId: finalPriceId,
          status: "incomplete",
          tier,
        },
      });
    } else {
      await prisma.subscription.create({
        data: {
          user: {
            connect: { id: user.id },
          },
          stripeCustomerId: customerId,
          stripePriceId: finalPriceId,
          status: "incomplete",
          tier,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    if (!checkoutSession.url) {
      return checkoutErrorResponse(
        "Stripe did not return a checkout URL",
        502,
        request,
        expectsJson,
      );
    }

    return checkoutSuccessResponse(checkoutSession.url, expectsJson);
  } catch (error: unknown) {
    await recordOperationalEvent({
      name: "checkout_session_failed",
      level: "error",
      operation: "subscription_checkout",
      status: "error",
      error,
    });
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create checkout session";

    return checkoutErrorResponse(message, 500, request, expectsJson);
  }
}
