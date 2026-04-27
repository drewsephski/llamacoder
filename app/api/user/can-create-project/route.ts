import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // If not signed in, allow creation (anonymous users can create one project)
    if (!session) {
      return NextResponse.json({
        canCreate: true,
        hasExistingProjects: false,
        credits: 0,
      });
    }

    const prisma = getPrisma();
    
    // Check if user has any saved projects
    const existingProjectsCount = await prisma.chat.count({
      where: { 
        userId: session.user.id,
      },
    });

    const hasExistingProjects = existingProjectsCount > 0;

    // Get user credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        credits: true,
        subscription: {
          select: {
            status: true,
          },
        },
      },
    });

    const credits = user?.credits || 0;
    const hasActiveSubscription = user?.subscription?.status === "active";

    // Logic:
    // - First project is always free
    // - Subsequent projects require credits OR active subscription
    const canCreate = !hasExistingProjects || credits > 0 || hasActiveSubscription;

    return NextResponse.json({
      canCreate,
      hasExistingProjects,
      credits,
      hasActiveSubscription,
    });
  } catch (error: any) {
    console.error("Error checking project creation eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check eligibility" },
      { status: 500 }
    );
  }
}
