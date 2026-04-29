import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getPrisma } from "@/lib/prisma";
import { getModelCreditCost } from "@/lib/billing";
import { FREE_MODEL } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Extract model from query params to check model-specific credit cost
    const { searchParams } = new URL(request.url);
    const selectedModel = searchParams.get("model") || FREE_MODEL;
    const modelCost = getModelCreditCost(selectedModel);

    // If not signed in, allow creation (anonymous users can create one project)
    if (!session) {
      return NextResponse.json({
        canCreate: true,
        hasExistingProjects: false,
        credits: 0,
        modelCost,
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
    // - First project is always free (only for free model)
    // - Subsequent projects require enough credits for the selected model
    // - Active subscription grants model access but still needs credits
    const canCreate =
      (!hasExistingProjects && selectedModel === FREE_MODEL) ||
      credits >= modelCost ||
      hasActiveSubscription;

    return NextResponse.json({
      canCreate,
      hasExistingProjects,
      credits,
      hasActiveSubscription,
      modelCost,
      shortfall: Math.max(0, modelCost - credits),
    });
  } catch (error: any) {
    console.error("Error checking project creation eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check eligibility" },
      { status: 500 },
    );
  }
}
