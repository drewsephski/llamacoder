import { purgeExpiredRateLimitBuckets } from "@/features/security/server/rate-limit";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const secret = process.env.CRON_SECRET;
  return Boolean(
    secret && request.headers.get("authorization") === `Bearer ${secret}`,
  );
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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
}
