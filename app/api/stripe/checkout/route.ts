import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  stripe,
  getOrCreateStripeCustomerId,
  isMissingStripeResourceError,
  STRIPE_PRICE_IDS,
  upgradeSubscriptionTier,
} from "@/lib/stripe";
import { getPrisma } from "@/lib/prisma";
import { normalizeTier } from "@/lib/billing";
import { syncSubscriptionFromStripe } from "@/lib/billing/stripe-fulfillment";
import { consumeRateLimit } from "@/features/security/server/rate-limit";
import { recordOperationalEvent } from "@/lib/observability";

type SubscriptionTier = keyof typeof STRIPE_PRICE_IDS;

type CheckoutRequestBody = {
  plan?: string;
  priceId?: string;
  expectsJson: boolean;
};

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

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
      plan: getString(body.plan),
      priceId: getString(body.priceId),
      expectsJson: true,
    };
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();

    return {
      plan: getString(formData.get("plan")),
      priceId: getString(formData.get("priceId")),
      expectsJson: false,
    };
  }

  return {
    expectsJson:
      request.headers.get("accept")?.includes("application/json") ?? false,
  };
}

function errorResponse(
  message: string,
  status: number,
  request: NextRequest,
  expectsJson: boolean,
) {
  if (expectsJson) {
    return NextResponse.json({ error: message }, { status });
  }

  const redirectUrl = new URL("/dashboard", request.url);
  redirectUrl.searchParams.set("checkout_error", message);

  return NextResponse.redirect(redirectUrl, 303);
}

function successResponse(url: string, expectsJson: boolean) {
  if (expectsJson) {
    return NextResponse.json({ url });
  }

  return NextResponse.redirect(url, 303);
}

async function createSubscriptionCheckoutSession({
  customerId,
  userId,
  tier,
  priceId,
  origin,
}: {
  customerId: string;
  userId: string;
  tier: SubscriptionTier;
  priceId: string;
  origin: string;
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: userId,
    mode: "subscription",
    payment_method_types: ["card"],
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

export async function POST(request: NextRequest) {
  let expectsJson = true;

  try {
    const body = await parseCheckoutRequest(request);
    expectsJson = body.expectsJson;
    const priceTier = getTierForPriceId(body.priceId);
    const requestedPlan = body.plan ?? "pro";

    if (!priceTier && !isSubscriptionTier(requestedPlan)) {
      return errorResponse(
        "Invalid subscription plan",
        400,
        request,
        expectsJson,
      );
    }

    const tier = priceTier ?? (requestedPlan as SubscriptionTier);
    const finalPriceId = body.priceId || STRIPE_PRICE_IDS[tier];

    if (!finalPriceId) {
      return errorResponse("Invalid price ID", 400, request, expectsJson);
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return errorResponse(
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
      return errorResponse(
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
      return errorResponse("User not found", 404, request, expectsJson);
    }

    const customerId = await getOrCreateStripeCustomerId({
      existingCustomerId: user.subscription?.stripeCustomerId,
      email: user.email,
      name: user.name,
    });

    const currentTier =
      user.subscription?.status === "active"
        ? normalizeTier(user.subscription.tier)
        : "free";

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      "http://localhost:3000";

    if (user.subscription?.status === "active") {
      if (currentTier === tier) {
        return errorResponse(
          `You are already on the ${currentTier === "pro_plus" ? "Pro Plus" : "Pro"} plan`,
          400,
          request,
          expectsJson,
        );
      }

      if (currentTier === "pro_plus" || tier !== "pro_plus") {
        return errorResponse(
          "Plan downgrades are not supported from checkout",
          400,
          request,
          expectsJson,
        );
      }

      if (!user.subscription.stripeSubscriptionId) {
        return errorResponse(
          "Your current subscription is missing a Stripe subscription ID",
          409,
          request,
          expectsJson,
        );
      }

      let updatedSubscription;

      try {
        updatedSubscription = await upgradeSubscriptionTier({
          subscriptionId: user.subscription.stripeSubscriptionId,
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
          where: { id: user.subscription.id },
          data: {
            stripeCustomerId: customerId,
            stripePriceId: finalPriceId,
            stripeSubscriptionId: null,
            status: "incomplete",
            tier,
          },
        });

        if (!checkoutSession.url) {
          return errorResponse(
            "Stripe did not return a checkout URL",
            502,
            request,
            expectsJson,
          );
        }

        return successResponse(checkoutSession.url, expectsJson);
      }

      await syncSubscriptionFromStripe({
        subscriptionId: updatedSubscription.id,
        fallbackCustomerId: customerId,
        fallbackUserId: user.id,
      });

      return successResponse(
        `${origin}/dashboard?subscription_updated=true`,
        expectsJson,
      );
    }

    const checkoutSession = await createSubscriptionCheckoutSession({
      customerId,
      userId: user.id,
      tier,
      priceId: finalPriceId,
      origin,
    });

    // Create or update subscription record in database before checkout
    if (user.subscription) {
      // Update existing subscription
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
      // Create new subscription record
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
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      });
    }

    if (!checkoutSession.url) {
      return errorResponse(
        "Stripe did not return a checkout URL",
        502,
        request,
        expectsJson,
      );
    }

    return successResponse(checkoutSession.url, expectsJson);
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

    return errorResponse(message, 500, request, expectsJson);
  }
}
