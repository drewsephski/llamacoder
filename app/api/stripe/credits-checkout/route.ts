import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  createCreditsCheckoutSession,
  CREDIT_PACKS,
  getOrCreateStripeCustomerId,
} from "@/lib/stripe";
import { getPrisma } from "@/lib/prisma";

type CreditPack = keyof typeof CREDIT_PACKS;

type CreditsCheckoutRequestBody = {
  pack?: string;
  expectsJson: boolean;
};

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

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
      pack: getString(body.pack),
      expectsJson: true,
    };
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();

    return {
      pack: getString(formData.get("pack")),
      expectsJson: false,
    };
  }

  return {
    expectsJson:
      request.headers.get("accept")?.includes("application/json") ?? false,
  };
}

function errorResponse(
  message: string,
  status: number,
  request: NextRequest,
  expectsJson: boolean,
) {
  if (expectsJson) {
    return NextResponse.json({ error: message }, { status });
  }

  const redirectUrl = new URL("/dashboard", request.url);
  redirectUrl.searchParams.set("checkout_error", message);

  return NextResponse.redirect(redirectUrl, 303);
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
      console.error("[Credits Checkout] No session found");
      return errorResponse(
        "You must be signed in to purchase credits",
        401,
        request,
        expectsJson,
      );
    }

    console.log(
      "[Credits Checkout] Available packs:",
      Object.keys(CREDIT_PACKS),
    );
    console.log("[Credits Checkout] Pack requested:", pack);

    // Validate the pack type
    if (!pack || !isCreditPack(pack)) {
      console.error(
        "[Credits Checkout] Invalid pack:",
        pack,
        "Available:",
        Object.keys(CREDIT_PACKS),
      );
      return errorResponse("Invalid credit pack", 400, request, expectsJson);
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user) {
      return errorResponse("User not found", 404, request, expectsJson);
    }

    const customerId = await getOrCreateStripeCustomerId({
      existingCustomerId: user.subscription?.stripeCustomerId,
      email: user.email,
      name: user.name,
    });

    if (
      user.subscription &&
      user.subscription.stripeCustomerId !== customerId
    ) {
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      "http://localhost:3000";

    // Create checkout session for credits
    const checkoutSession = await createCreditsCheckoutSession(
      customerId,
      `${origin}/dashboard?credits_success=true`,
      `${origin}/dashboard?credits_canceled=true`,
      pack,
      user.id,
    );

    if (!checkoutSession.url) {
      return errorResponse(
        "Stripe did not return a checkout URL",
        502,
        request,
        expectsJson,
      );
    }

    if (!expectsJson) {
      return NextResponse.redirect(checkoutSession.url, 303);
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Error creating credits checkout session:", error);
    return errorResponse(
      error.message || "Failed to create checkout session",
      500,
      request,
      expectsJson,
    );
  }
}
