import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import {
  fulfillCheckoutSession,
  fulfillPaidInvoice,
  hasProcessedStripeEvent,
  markSubscriptionStatus,
  recordProcessedStripeEvent,
  syncSubscriptionFromStripe,
} from "@/lib/billing/stripe-fulfillment";

function getStripeId(value: string | { id?: string } | null | undefined) {
  if (typeof value === "string") return value;
  return value?.id;
}

async function retrieveInvoiceFromInvoicePayment(eventObject: unknown) {
  if (typeof eventObject !== "object" || eventObject === null) return null;

  const invoice = (eventObject as { invoice?: string | { id?: string } })
    .invoice;
  const invoiceId = getStripeId(invoice);

  if (!invoiceId) return null;

  return stripe.invoices.retrieve(invoiceId, {
    expand: ["lines.data"],
  });
}

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("[Stripe Webhook] Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  if (!STRIPE_WEBHOOK_SECRET || STRIPE_WEBHOOK_SECRET === "whsec_...") {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown signature error";
    console.error("[Stripe Webhook] Signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 },
    );
  }

  if (await hasProcessedStripeEvent(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const result = await fulfillCheckoutSession(
          event.data.object as Stripe.Checkout.Session,
          event.id,
        );
        console.log("[Stripe Webhook] Fulfilled checkout session:", result);
        break;
      }

      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const result = await fulfillPaidInvoice(
          event.data.object as Stripe.Invoice,
          event.id,
        );
        console.log("[Stripe Webhook] Fulfilled paid invoice:", result);
        break;
      }

      case "invoice_payment.paid": {
        const invoice = await retrieveInvoiceFromInvoicePayment(
          event.data.object,
        );
        if (invoice) {
          const result = await fulfillPaidInvoice(invoice, event.id);
          console.log("[Stripe Webhook] Fulfilled invoice payment:", result);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const result = await syncSubscriptionFromStripe({
          subscriptionId: subscription.id,
          fallbackCustomerId: getStripeId(subscription.customer),
        });
        console.log("[Stripe Webhook] Synced subscription:", result);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoicePayment = await retrieveInvoiceFromInvoicePayment(
          event.data.object,
        );
        const subscriptionId =
          getStripeId(
            (invoice as unknown as { subscription?: string }).subscription,
          ) ||
          getStripeId(
            (
              invoice.parent as {
                subscription_details?: {
                  subscription?: string | Stripe.Subscription | null;
                } | null;
              } | null
            )?.subscription_details?.subscription,
          ) ||
          (invoicePayment
            ? getStripeId(
                (
                  invoicePayment.parent as {
                    subscription_details?: {
                      subscription?: string | Stripe.Subscription | null;
                    } | null;
                  } | null
                )?.subscription_details?.subscription,
              )
            : null);

        if (subscriptionId) {
          await markSubscriptionStatus(subscriptionId, "past_due");
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await markSubscriptionStatus(subscription.id, "canceled");
        break;
      }

      default:
        console.log("[Stripe Webhook] Unhandled event type:", event.type);
    }

    await recordProcessedStripeEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error processing event:", event.id, error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
