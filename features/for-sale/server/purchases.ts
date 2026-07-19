import "server-only";

import type Stripe from "stripe";

import { getForSaleProductByKey } from "@/features/for-sale/products";
import { getPrisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

function stripeId(value: string | { id?: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id;
}

export async function fulfillPagePurchase(session: Stripe.Checkout.Session) {
  if (
    session.mode !== "payment" ||
    session.payment_status !== "paid" ||
    session.metadata?.kind !== "page_license"
  ) {
    return { fulfilled: false, reason: "not_a_paid_page_license" } as const;
  }

  const productKey = session.metadata.productKey;
  const userId = session.metadata.userId || session.client_reference_id;
  const product = productKey ? getForSaleProductByKey(productKey) : null;

  if (!product || !userId) {
    throw new Error(`Invalid page purchase metadata for ${session.id}`);
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 1,
  });
  if (lineItems.data[0]?.price?.id !== product.priceId) {
    throw new Error(`Page purchase price mismatch for ${session.id}`);
  }

  const purchase = await getPrisma().pagePurchase.upsert({
    where: { stripeCheckoutSessionId: session.id },
    create: {
      userId,
      productKey,
      route: product.route,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: stripeId(session.payment_intent),
      status: "paid",
    },
    update: {
      stripePaymentIntentId: stripeId(session.payment_intent),
      status: "paid",
    },
  });

  return { fulfilled: true, purchase } as const;
}

export async function reconcilePagePurchase(sessionId: string, userId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const referencedUserId =
    session.metadata?.userId || session.client_reference_id;

  if (referencedUserId !== userId) {
    throw new Error("Checkout Session does not belong to the signed-in user");
  }

  return fulfillPagePurchase(session);
}
