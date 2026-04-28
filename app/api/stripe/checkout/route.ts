import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe, createStripeCustomer, createCheckoutSession, STRIPE_PRICE_IDS, SUBSCRIPTION_TIERS } from "@/lib/stripe";
import { getPrisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const priceId = body.priceId as string;
    const tier = body.plan as string || "pro";

    // If priceId is provided directly, use it
    const finalPriceId = priceId || STRIPE_PRICE_IDS[tier as keyof typeof STRIPE_PRICE_IDS];

    if (!finalPriceId) {
      return NextResponse.json(
        { error: "Invalid price ID" },
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

    // Create checkout session with direct price ID
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?subscription_success=true`,
      cancel_url: `${origin}/dashboard?subscription_canceled=true`,
      subscription_data: {
        metadata: {
          tier: tier,
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
          stripePriceId: finalPriceId,
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
