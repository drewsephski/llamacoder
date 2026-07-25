import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getForSaleProductByKey } from "@/features/for-sale/products";
import { auth } from "@/lib/auth";
import { getAppOrigin } from "@/lib/app-origin";
import { stripe } from "@/lib/stripe";
import { consumeRateLimit } from "@/features/security/server/rate-limit";
import { recordOperationalEvent } from "@/lib/observability";
import { getErrorMessage } from "@/features/shared/errors";

const requestSchema = z.object({ productKey: z.string().min(1).max(100) });

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json(
        { error: "Sign in before purchasing this page." },
        { status: 401 },
      );
    }

    const rateLimit = await consumeRateLimit({
      userId: session.user.id,
      operation: "checkout",
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many checkout requests. Please try again shortly." },
        { status: 429 },
      );
    }

    const parsed = requestSchema.safeParse(await request.json());
    const product = parsed.success
      ? getForSaleProductByKey(parsed.data.productKey)
      : null;
    if (!product) {
      return NextResponse.json(
        { error: "Unknown page product." },
        { status: 400 },
      );
    }

    const origin = getAppOrigin();
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: session.user.email,
      client_reference_id: session.user.id,
      line_items: [{ price: product.priceId, quantity: 1 }],
      metadata: {
        kind: "page_license",
        productKey: product.key,
        route: product.route,
        userId: session.user.id,
      },
      payment_intent_data: {
        metadata: {
          kind: "page_license",
          productKey: product.key,
          userId: session.user.id,
        },
      },
      success_url: `${origin}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${product.route}`,
      allow_promotion_codes: true,
    });

    if (!checkout.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: checkout.url });
  } catch (error: unknown) {
    await recordOperationalEvent({
      name: "page_checkout_failed",
      level: "error",
      operation: "page_checkout",
      status: "error",
      error,
    });

    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to create checkout session.") },
      { status: 500 },
    );
  }
}
