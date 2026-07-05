import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getPrisma } from "@/lib/prisma";
import { normalizeTier } from "@/lib/billing";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        credits: true,
        subscription: {
          select: {
            status: true,
            tier: true,
            currentPeriodEnd: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasActiveSubscription = user.subscription?.status === "active";
    const tier = hasActiveSubscription
      ? normalizeTier(user.subscription?.tier)
      : "free";

    return NextResponse.json({
      credits: user.credits ?? 0,
      tier,
      hasActiveSubscription,
      subscriptionEndsAt:
        user.subscription?.currentPeriodEnd?.toISOString() || null,
    });
  } catch (error: any) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 },
    );
  }
}
