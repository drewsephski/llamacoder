import { releaseExpiredCreditHolds } from "@/lib/billing";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(
    secret && request.headers.get("authorization") === `Bearer ${secret}`,
  );
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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
}
