import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe, createStripeCustomer, STRIPE_PRICE_IDS } from "@/lib/stripe";
import { getPrisma } from "@/lib/prisma";

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

export async function POST(request: NextRequest) {
  try {
    const body = await parseCheckoutRequest(request);
    const priceTier = getTierForPriceId(body.priceId);
    const requestedPlan = body.plan ?? "pro";

    if (!priceTier && !isSubscriptionTier(requestedPlan)) {
      return errorResponse(
        "Invalid subscription plan",
        400,
        request,
        body.expectsJson,
      );
    }

    const tier = priceTier ?? (requestedPlan as SubscriptionTier);
    const finalPriceId = body.priceId || STRIPE_PRICE_IDS[tier];

    if (!finalPriceId) {
      return errorResponse("Invalid price ID", 400, request, body.expectsJson);
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return errorResponse(
        "You must be signed in to subscribe",
        401,
        request,
        body.expectsJson,
      );
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user) {
      return errorResponse("User not found", 404, request, body.expectsJson);
    }

    // Check if user already has an active subscription
    if (user.subscription && user.subscription.status === "active") {
      return errorResponse(
        "You already have an active subscription",
        400,
        request,
        body.expectsJson,
      );
    }

    // Create or get existing Stripe customer
    let customerId: string;
    if (user.subscription?.stripeCustomerId) {
      customerId = user.subscription.stripeCustomerId;
    } else {
      const customer = await createStripeCustomer(
        user.email,
        user.name || undefined,
      );
      customerId = customer.id;
    }

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      "http://localhost:3000";

    // Create checkout session with direct price ID
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: user.id,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?subscription_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?subscription_canceled=true`,
      metadata: {
        type: "subscription",
        tier,
        userId: user.id,
      },
      subscription_data: {
        metadata: {
          tier,
          userId: user.id,
        },
      },
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
        body.expectsJson,
      );
    }

    if (!body.expectsJson) {
      return NextResponse.redirect(checkoutSession.url, 303);
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create checkout session";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
