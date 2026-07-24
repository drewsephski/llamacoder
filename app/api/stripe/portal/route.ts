import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  createCustomerPortalSession,
  getOrCreateStripeCustomerId,
} from "@/lib/stripe";
import { getPrisma } from "@/lib/prisma";
import { isSubscriptionEntitled } from "@/lib/billing";
import { consumeRateLimit } from "@/features/security/server/rate-limit";
import { recordOperationalEvent } from "@/lib/observability";
import { getAppOrigin } from "@/lib/app-origin";
import { getErrorMessage } from "@/features/shared/errors";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "You must be signed in to manage your subscription" },
        { status: 401 },
      );
    }

    const rateLimit = await consumeRateLimit({
      userId: session.user.id,
      operation: "portal",
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429 },
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

    const subscription = user.subscription;
    if (
      !subscription ||
      !isSubscriptionEntitled(subscription.status) ||
      !subscription.stripeSubscriptionId
    ) {
      return NextResponse.json(
        { error: "No active subscription to manage" },
        { status: 400 },
      );
    }

    const customerId = await getOrCreateStripeCustomerId({
      existingCustomerId: subscription.stripeCustomerId,
      email: user.email,
      name: user.name,
    });

    if (subscription.stripeCustomerId !== customerId) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const origin = getAppOrigin();
    const returnUrl =
      request.headers.get("referer")?.startsWith(origin) === true
        ? request.headers.get("referer")!
        : `${origin}/dashboard`;

    const portalSession = await createCustomerPortalSession(
      customerId,
      returnUrl,
    );

    if (!portalSession.url) {
      return NextResponse.json(
        { error: "Stripe did not return a portal URL" },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: portalSession.url });
  } catch (error: unknown) {
    await recordOperationalEvent({
      name: "portal_session_failed",
      level: "error",
      operation: "customer_portal",
      status: "error",
      error,
    });

    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to open subscription portal") },
      { status: 500 },
    );
  }
}
