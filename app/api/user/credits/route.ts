import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserCreditInfo } from "@/lib/billing";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserCreditInfo(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      credits: user.credits,
      creditBreakdown: user.creditBreakdown,
      tier: user.tier,
      hasActiveSubscription: user.hasActiveSubscription,
      hasPurchasedCredits: user.hasPurchasedCredits,
      subscriptionEndsAt: user.subscriptionEndsAt,
    });
  } catch (error: any) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 },
    );
  }
}
