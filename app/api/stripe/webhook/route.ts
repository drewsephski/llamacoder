import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_WEBHOOK_SECRET, SUBSCRIPTION_TIERS, STRIPE_PRICE_IDS, CREDIT_PACKS } from "@/lib/stripe";
import { getPrisma } from "@/lib/prisma";

// Helper to determine tier from price ID
function getTierFromPriceId(priceId: string): "pro" | "unlimited" | null {
  if (priceId === STRIPE_PRICE_IDS.pro) return "pro";
  if (priceId === STRIPE_PRICE_IDS.unlimited) return "unlimited";
  // Fallback: if it's the old STRIPE_PRICE_ID, treat as pro
  if (process.env.STRIPE_PRICE_ID && priceId === process.env.STRIPE_PRICE_ID) return "pro";
  return null;
}

// Helper to determine credit pack from price ID
function getCreditPackFromPriceId(priceId: string): keyof typeof CREDIT_PACKS | null {
  for (const [key, pack] of Object.entries(CREDIT_PACKS)) {
    if (pack.priceId === priceId) return key as keyof typeof CREDIT_PACKS;
  }
  return null;
}

export async function POST(request: NextRequest) {
  console.log("[Stripe Webhook] Received request");
  console.log("[Stripe Webhook] Headers:", {
    "stripe-signature": request.headers.get("stripe-signature")?.slice(0, 20) + "...",
    "content-type": request.headers.get("content-type"),
  });

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("[Stripe Webhook] Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  if (!STRIPE_WEBHOOK_SECRET || STRIPE_WEBHOOK_SECRET === "whsec_...") {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not configured properly");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
    console.log("[Stripe Webhook] Event verified:", event.type, "ID:", event.id);
  } catch (error: any) {
    console.error("[Stripe Webhook] Signature verification failed:", error.message);
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
        const sessionMetadata = session.metadata as { type?: string; credits?: string; pack?: string } || {};

        // Check if this is a credit purchase (one-time payment)
        if (session.mode === "payment" && sessionMetadata.type === "credits") {
          const creditAmount = parseInt(sessionMetadata.credits || "0");
          const packName = sessionMetadata.pack || "unknown";
          
          if (creditAmount > 0) {
            // Find user by customer ID
            const existingSub = await prisma.subscription.findFirst({
              where: { stripeCustomerId: customerId },
            });

            if (existingSub) {
              // Add credits to user
              await prisma.user.update({
                where: { id: existingSub.userId },
                data: {
                  credits: { increment: creditAmount },
                },
              });

              // Record credit history
              await prisma.creditHistory.create({
                data: {
                  userId: existingSub.userId,
                  amount: creditAmount,
                  type: "purchase",
                  description: `Credit pack purchase - ${creditAmount} credits (${packName})`,
                },
              });
            }
          }
          break;
        }

        // Handle subscription checkout
        const subscriptionId = session.subscription as string;
        if (!subscriptionId) break;

        // Get subscription details from Stripe
        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
        const subscription = stripeSub as unknown as {
          status: string;
          current_period_start: number;
          current_period_end: number;
          items: { data: Array<{ price: { id: string } }> };
        };
        const priceId = subscription.items.data[0].price.id;

        // Determine tier from price ID
        const tier = getTierFromPriceId(priceId) || "pro";
        const tierConfig = SUBSCRIPTION_TIERS[tier];

        // Find user by customer ID
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
              tier: tier,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });

          // Add credits to user (only for Pro tier, Unlimited gets unlimited)
          if (tier === "pro" && tierConfig.credits > 0) {
            await prisma.user.update({
              where: { id: existingSub.userId },
              data: {
                credits: { increment: tierConfig.credits },
              },
            });

            // Record credit history
            await prisma.creditHistory.create({
              data: {
                userId: existingSub.userId,
                amount: tierConfig.credits,
                type: "subscription",
                description: `${tierConfig.name} subscription - ${tierConfig.credits} credits`,
              },
            });
          }
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

          // Determine tier and add monthly credits
          const tier = (userSub.tier as "pro" | "unlimited") || "pro";
          const tierConfig = SUBSCRIPTION_TIERS[tier];

          // Add monthly credits (only if this isn't the first invoice and it's Pro tier)
          if (tier === "pro" && tierConfig.credits > 0 && 
              (!stripeInvoice.billing_reason || stripeInvoice.billing_reason !== "subscription_create")) {
            await prisma.user.update({
              where: { id: userSub.userId },
              data: {
                credits: { increment: tierConfig.credits },
              },
            });

            await prisma.creditHistory.create({
              data: {
                userId: userSub.userId,
                amount: tierConfig.credits,
                type: "subscription",
                description: `${tierConfig.name} monthly renewal - ${tierConfig.credits} credits`,
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
