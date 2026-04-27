import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_WEBHOOK_SECRET, SUBSCRIPTION_CONFIG } from "@/lib/stripe";
import { getPrisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${error.message}` },
      { status: 400 }
    );
  }

  const prisma = getPrisma();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // Get subscription details from Stripe
        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
        const subscription = stripeSub as unknown as {
          status: string;
          current_period_start: number;
          current_period_end: number;
          items: { data: Array<{ price: { id: string } }> };
        };
        const priceId = subscription.items.data[0].price.id;

        // Find user by customer ID (should have been created during checkout initiation)
        const existingSub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (existingSub) {
          // Update subscription
          await prisma.subscription.update({
            where: { id: existingSub.id },
            data: {
              stripeSubscriptionId: subscriptionId,
              stripePriceId: priceId,
              status: subscription.status,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });

          // Add credits to user
          await prisma.user.update({
            where: { id: existingSub.userId },
            data: {
              credits: { increment: SUBSCRIPTION_CONFIG.generations },
            },
          });

          // Record credit history
          await prisma.creditHistory.create({
            data: {
              userId: existingSub.userId,
              amount: SUBSCRIPTION_CONFIG.generations,
              type: "subscription",
              description: `Monthly subscription - ${SUBSCRIPTION_CONFIG.generations} generations`,
            },
          });
        }
        break;
      }

      case "invoice.paid": {
        const stripeInvoice = event.data.object as unknown as {
          subscription: string;
          customer: string;
          billing_reason?: string;
        };
        const subscriptionId = stripeInvoice.subscription;
        const customerId = stripeInvoice.customer;

        const userSub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        });

        if (userSub) {
          // Update subscription period
          const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
          const subscription = stripeSub as unknown as {
            status: string;
            current_period_start: number;
            current_period_end: number;
          };
          await prisma.subscription.update({
            where: { id: userSub.id },
            data: {
              status: subscription.status,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });

          // Add monthly credits (only if this isn't the first invoice)
          if (!stripeInvoice.billing_reason || stripeInvoice.billing_reason !== "subscription_create") {
            await prisma.user.update({
              where: { id: userSub.userId },
              data: {
                credits: { increment: SUBSCRIPTION_CONFIG.generations },
              },
            });

            await prisma.creditHistory.create({
              data: {
                userId: userSub.userId,
                amount: SUBSCRIPTION_CONFIG.generations,
                type: "subscription",
                description: `Monthly renewal - ${SUBSCRIPTION_CONFIG.generations} generations`,
              },
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const failedInvoice = event.data.object as unknown as { subscription: string };
        const subscriptionId = failedInvoice.subscription;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: { status: "past_due" },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: { status: "canceled" },
        });
        break;
      }

      case "customer.subscription.updated": {
        const stripeSubscription = event.data.object as unknown as {
          id: string;
          status: string;
          current_period_start: number;
          current_period_end: number;
        };
        const subscriptionId = stripeSubscription.id;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            status: stripeSubscription.status,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          },
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
