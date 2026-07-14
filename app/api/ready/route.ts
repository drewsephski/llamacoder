import { validateProductionEnvironment } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const REQUIRED_OPERATIONAL_MIGRATION =
  "20260714100000_add_operational_incidents";

export async function GET() {
  const checks: Record<string, { ok: boolean; detail?: string }> = {};
  const environment = validateProductionEnvironment();
  checks.environment = environment.valid
    ? { ok: true }
    : {
        ok: false,
        detail: `${environment.errors.length} configuration error(s)`,
      };

  const prisma = getPrisma();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { ok: true };
  } catch {
    checks.database = { ok: false, detail: "Database query failed" };
  }

  try {
    const appliedMigrations = await prisma.$queryRaw<
      Array<{ migration_name: string }>
    >`SELECT "migration_name"
      FROM "_prisma_migrations"
      WHERE "migration_name" = ${REQUIRED_OPERATIONAL_MIGRATION}
        AND "finished_at" IS NOT NULL
        AND "rolled_back_at" IS NULL`;
    if (appliedMigrations.length === 0) {
      checks.operationalSchema = {
        ok: false,
        detail: `Migration ${REQUIRED_OPERATIONAL_MIGRATION} is not applied`,
      };
    } else {
      await prisma.operationalIncident.findFirst({ select: { id: true } });
      checks.operationalSchema = { ok: true };
    }
  } catch {
    checks.operationalSchema = {
      ok: false,
      detail: "Operational incident schema is unavailable",
    };
  }

  try {
    const stuckHoldCount = await prisma.creditHold.count({
      where: { status: "active", expiresAt: { lt: new Date() } },
    });
    checks.creditHolds =
      stuckHoldCount === 0
        ? { ok: true }
        : { ok: false, detail: `${stuckHoldCount} expired active hold(s)` };
  } catch {
    checks.creditHolds = { ok: false, detail: "Credit hold query failed" };
  }

  const ready = Object.values(checks).every((check) => check.ok);
  return Response.json(
    { status: ready ? "ready" : "not_ready", checks },
    {
      status: ready ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
