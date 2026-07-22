import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentSession } from "@/features/auth/server/session";
import { listIntegrationResources } from "@/features/integrations/server/actions";
import { integrationErrorResponse } from "@/features/integrations/server/http";

type RouteContext = {
  params: Promise<{ projectId: string; bindingId: string }>;
};

const supabaseResourceQuerySchema = z.object({
  type: z.enum(["organizations", "projects"]).optional(),
  organizationId: z.string().trim().min(1).max(128).optional(),
});

export async function GET(request: Request, context: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Sign in to use integrations." },
      { status: 401 },
    );
  }
  try {
    const query = supabaseResourceQuerySchema.safeParse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    if (!query.success) {
      return NextResponse.json(
        { error: "INVALID_REQUEST", message: "Invalid resource query." },
        { status: 400 },
      );
    }
    const { projectId, bindingId } = await context.params;
    const resources = await listIntegrationResources({
      projectId,
      bindingId,
      userId: session.user.id,
      resourceType: query.data.type,
      organizationId: query.data.organizationId,
    });
    return NextResponse.json({ resources });
  } catch (error) {
    return integrationErrorResponse(error);
  }
}
