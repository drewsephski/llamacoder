import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getForSaleProductByKey } from "@/features/for-sale/products";
import { auth } from "@/lib/auth";
import { getAppOrigin } from "@/lib/app-origin";
import { stripe } from "@/lib/stripe";

const requestSchema = z.object({ productKey: z.string().min(1).max(100) });

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json(
      { error: "Sign in before purchasing this page." },
      { status: 401 },
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
}
