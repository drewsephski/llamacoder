import { NextResponse } from "next/server";

import { getCurrentSession } from "@/features/auth/server/session";
import { listIntegrationResources } from "@/features/integrations/server/actions";
import { integrationErrorResponse } from "@/features/integrations/server/http";

type RouteContext = {
  params: Promise<{ projectId: string; bindingId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Sign in to use integrations." },
      { status: 401 },
    );
  }
  try {
    const { projectId, bindingId } = await context.params;
    const resources = await listIntegrationResources({
      projectId,
      bindingId,
      userId: session.user.id,
    });
    return NextResponse.json({ resources });
  } catch (error) {
    return integrationErrorResponse(error);
  }
}
