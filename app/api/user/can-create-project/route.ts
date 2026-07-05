import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  FREE_PROJECT_LIMIT,
  checkProjectCreationEligibility,
  getModelCreditCost,
} from "@/lib/billing";
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
        projectCount: 0,
        projectLimit: FREE_PROJECT_LIMIT,
        projectsRemaining: FREE_PROJECT_LIMIT,
      });
    }

    const eligibility = await checkProjectCreationEligibility({
      userId: session.user.id,
      modelId: selectedModel,
    });

    return NextResponse.json({
      canCreate: eligibility.success,
      error: eligibility.success ? undefined : eligibility.error,
      hasExistingProjects: eligibility.projectCount > 0,
      projectCount: eligibility.projectCount,
      projectLimit: eligibility.projectLimit,
      projectsRemaining: eligibility.projectsRemaining,
      credits: eligibility.credits,
      hasActiveSubscription: eligibility.hasActiveSubscription,
      modelCost: eligibility.modelCost,
      shortfall: Math.max(0, eligibility.modelCost - eligibility.credits),
    });
  } catch (error: any) {
    console.error("Error checking project creation eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check eligibility" },
      { status: 500 },
    );
  }
}
