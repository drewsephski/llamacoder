import { purgeExpiredRateLimitBuckets } from "@/features/security/server/rate-limit";
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
    const purged = await purgeExpiredRateLimitBuckets();
    const remainingExpiredBuckets = await getPrisma().apiRateLimitBucket.count({
      where: { expiresAt: { lte: new Date() } },
    });

    return Response.json(
      {
        status: remainingExpiredBuckets === 0 ? "completed" : "incomplete",
        purged,
        remainingExpiredBuckets,
      },
      {
        status: remainingExpiredBuckets === 0 ? 200 : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error: unknown) {
    await recordOperationalEvent({
      name: "maintenance_rate_limit_buckets_failed",
      level: "error",
      operation: "rate_limit_bucket_cleanup",
      status: "error",
      error,
    });

    return Response.json(
      { error: getErrorMessage(error, "Rate limit bucket cleanup failed") },
      { status: 500 },
    );
  }
}
