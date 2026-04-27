import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe, createStripeCustomer, createCreditsCheckoutSession, CREDIT_PACKS } from "@/lib/stripe";
import { getPrisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "You must be signed in to purchase credits" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { pack } = body;

    // Validate the pack type
    if (!pack || !CREDIT_PACKS[pack as keyof typeof CREDIT_PACKS]) {
      return NextResponse.json(
        { error: "Invalid credit pack" },
        { status: 400 }
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

    // Create checkout session for credits
    const checkoutSession = await createCreditsCheckoutSession(
      customerId,
      `${origin}/dashboard?credits_success=true`,
      `${origin}/dashboard?credits_canceled=true`,
      pack as keyof typeof CREDIT_PACKS
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Error creating credits checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
