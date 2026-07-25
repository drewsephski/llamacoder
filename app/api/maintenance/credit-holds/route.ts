import { releaseExpiredCreditHolds } from "@/lib/billing";
import { getPrisma } from "@/lib/prisma";
import { isCronAuthorized } from "@/features/security/server/cron-auth";
import { recordOperationalEvent } from "@/lib/observability";
import { getErrorMessage } from "@/features/shared/errors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await releaseExpiredCreditHolds({ limit: 500 });
    const remainingExpiredHolds = await getPrisma().creditHold.count({
      where: { status: "active", expiresAt: { lte: new Date() } },
    });

    return Response.json(
      {
        status: remainingExpiredHolds === 0 ? "completed" : "incomplete",
        ...result,
        remainingExpiredHolds,
      },
      {
        status: remainingExpiredHolds === 0 ? 200 : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error: unknown) {
    await recordOperationalEvent({
      name: "maintenance_credit_holds_failed",
      level: "error",
      operation: "credit_holds_cleanup",
      status: "error",
      error,
    });

    return Response.json(
      { error: getErrorMessage(error, "Credit hold cleanup failed") },
      { status: 500 },
    );
  }
}
