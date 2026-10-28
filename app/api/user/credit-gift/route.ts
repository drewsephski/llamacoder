import { NextResponse } from "next/server";
import { getCurrentSession } from "@/features/auth/server/session";
import { claimCreditGift } from "@/features/billing/server/credit-gifts";

export async function POST() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const gift = await claimCreditGift(session.user.id);
    return NextResponse.json(
      { gift },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to claim credit gift:", error);
    return NextResponse.json(
      { error: "Unable to claim gift" },
      { status: 500 },
    );
  }
}
