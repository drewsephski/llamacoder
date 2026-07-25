import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  createCreditsCheckoutSession,
  CREDIT_PACKS,
  getOrCreateStripeCustomerId,
} from "@/lib/stripe";
import { getPrisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/features/security/server/rate-limit";
import { getErrorMessage } from "@/features/shared/errors";
import { recordOperationalEvent } from "@/lib/observability";
import { getAppOrigin } from "@/lib/app-origin";
import {
  checkoutErrorResponse,
  checkoutSuccessResponse,
  getCheckoutString,
} from "@/features/billing/server/checkout-responses";
import {
  persistStripeCustomerId,
  resolveExistingStripeCustomerId,
} from "@/features/billing/server/stripe-customer";

type CreditPack = keyof typeof CREDIT_PACKS;

type CreditsCheckoutRequestBody = {
  pack?: string;
  expectsJson: boolean;
};

function isCreditPack(value: string): value is CreditPack {
  return Object.hasOwn(CREDIT_PACKS, value);
}

async function parseCreditsCheckoutRequest(
  request: NextRequest,
): Promise<CreditsCheckoutRequestBody> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, unknown>;

    return {
      pack: getCheckoutString(body.pack),
      expectsJson: true,
    };
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();

    return {
      pack: getCheckoutString(formData.get("pack")),
      expectsJson: false,
    };
  }

  return {
    expectsJson:
      request.headers.get("accept")?.includes("application/json") ?? false,
  };
}

export async function POST(request: NextRequest) {
  let expectsJson = true;

  try {
    const body = await parseCreditsCheckoutRequest(request);
    expectsJson = body.expectsJson;
    const { pack } = body;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return checkoutErrorResponse(
        "You must be signed in to purchase credits",
        401,
        request,
        expectsJson,
      );
    }

    const rateLimit = await consumeRateLimit({
      userId: session.user.id,
      operation: "checkout",
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return checkoutErrorResponse(
        "Too many checkout requests. Please try again shortly.",
        429,
        request,
        expectsJson,
      );
    }

    if (!pack || !isCreditPack(pack)) {
      return checkoutErrorResponse(
        "Invalid credit pack",
        400,
        request,
        expectsJson,
      );
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user) {
      return checkoutErrorResponse("User not found", 404, request, expectsJson);
    }

    const customerId = await getOrCreateStripeCustomerId({
      existingCustomerId: resolveExistingStripeCustomerId(user),
      email: user.email,
      name: user.name,
    });

    await persistStripeCustomerId({
      userId: user.id,
      customerId,
      subscriptionId: user.subscription?.id,
    });

    const origin = getAppOrigin();
    const checkoutSession = await createCreditsCheckoutSession(
      customerId,
      `${origin}/dashboard?credits_success=true`,
      `${origin}/dashboard?credits_canceled=true`,
      pack,
      user.id,
    );

    if (!checkoutSession.url) {
      return checkoutErrorResponse(
        "Stripe did not return a checkout URL",
        502,
        request,
        expectsJson,
      );
    }

    if (!expectsJson) {
      return checkoutSuccessResponse(checkoutSession.url, expectsJson);
    }

    return checkoutSuccessResponse(checkoutSession.url, expectsJson);
  } catch (error: unknown) {
    await recordOperationalEvent({
      name: "checkout_session_failed",
      level: "error",
      operation: "credits_checkout",
      status: "error",
      error,
    });
    return checkoutErrorResponse(
      getErrorMessage(error, "Failed to create checkout session"),
      500,
      request,
      expectsJson,
    );
  }
}
