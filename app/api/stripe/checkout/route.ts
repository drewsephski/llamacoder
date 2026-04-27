import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe, createStripeCustomer, createCheckoutSession, STRIPE_PRICE_IDS, SUBSCRIPTION_TIERS } from "@/lib/stripe";
import { getPrisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tier = body.plan || "pro";

    // Validate tier
    if (!STRIPE_PRICE_IDS[tier as keyof typeof STRIPE_PRICE_IDS]) {
      return NextResponse.json(
        { error: "Invalid subscription tier" },
        { status: 400 }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "You must be signed in to subscribe" },
        { status: 401 }
      );
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has an active subscription
    if (user.subscription && user.subscription.status === "active") {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      );
    }

    // Create or get existing Stripe customer
    let customerId: string;
    if (user.subscription?.stripeCustomerId) {
      customerId = user.subscription.stripeCustomerId;
    } else {
      const customer = await createStripeCustomer(
        user.email,
        user.name || undefined
      );
      customerId = customer.id;
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";

    // Create checkout session with tier
    const checkoutSession = await createCheckoutSession(
      customerId,
      `${origin}/dashboard?subscription_success=true&tier=${tier}`,
      `${origin}/dashboard?subscription_canceled=true`,
      tier as "pro" | "unlimited"
    );

    const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];

    // Create or update subscription record in database before checkout
    if (user.subscription) {
      // Update existing subscription
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          stripeCustomerId: customerId,
          stripePriceId: STRIPE_PRICE_IDS[tier as keyof typeof STRIPE_PRICE_IDS],
          status: "incomplete",
          tier: tier,
        },
      });
    } else {
      // Create new subscription record
      await prisma.subscription.create({
        data: {
          user: {
            connect: { id: user.id }
          },
          stripeCustomerId: customerId,
          stripePriceId: STRIPE_PRICE_IDS[tier as keyof typeof STRIPE_PRICE_IDS],
          stripeSubscriptionId: checkoutSession.subscription as string,
          status: "incomplete",
          tier: tier,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      });
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
