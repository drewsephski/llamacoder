import { loadEnvConfig } from "@next/env";
import { Prisma } from "@prisma/client";

loadEnvConfig(process.cwd());

type CountRow = {
  source: string | null;
  count: number;
};

function requestedDays() {
  const argument = process.argv.find((value) => value.startsWith("--days="));
  const value = Number(argument?.split("=")[1] ?? 7);
  if (!Number.isInteger(value) || value < 1 || value > 365) {
    throw new Error("--days must be an integer between 1 and 365.");
  }
  return value;
}

function sourceLabel(source: string | null) {
  return source?.trim() || "direct / unattributed";
}

async function main() {
  const { getPrisma } = await import("@/lib/prisma");
  const prisma = getPrisma();
  const days = requestedDays();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1_000);

  try {
    const [applications, projects, completedProjects, activated, repeat] =
      await Promise.all([
        prisma.designPartnerApplication.groupBy({
          by: ["acquisitionSource"],
          where: { createdAt: { gte: since } },
          _count: { _all: true },
        }),
        prisma.chat.groupBy({
          by: ["acquisitionSource"],
          where: { createdAt: { gte: since }, userId: { not: null } },
          _count: { _all: true },
        }),
        prisma.chat.groupBy({
          by: ["acquisitionSource"],
          where: {
            createdAt: { gte: since },
            userId: { not: null },
            hasCode: true,
          },
          _count: { _all: true },
        }),
        prisma.$queryRaw<CountRow[]>(Prisma.sql`
          SELECT "acquisitionSource" AS source, COUNT(DISTINCT "userId")::int AS count
          FROM "Chat"
          WHERE "createdAt" >= ${since}
            AND "userId" IS NOT NULL
            AND "hasCode" = true
          GROUP BY "acquisitionSource"
        `),
        prisma.$queryRaw<CountRow[]>(Prisma.sql`
          SELECT source, COUNT(*)::int AS count
          FROM (
            SELECT "acquisitionSource" AS source, "userId"
            FROM "Chat"
            WHERE "createdAt" >= ${since}
              AND "userId" IS NOT NULL
              AND "hasCode" = true
            GROUP BY "acquisitionSource", "userId"
            HAVING COUNT(*) >= 2
          ) cohorts
          GROUP BY source
        `),
      ]);

    const sources = new Set<string>([
      ...applications.map((row) => sourceLabel(row.acquisitionSource)),
      ...projects.map((row) => sourceLabel(row.acquisitionSource)),
      ...completedProjects.map((row) => sourceLabel(row.acquisitionSource)),
      ...activated.map((row) => sourceLabel(row.source)),
      ...repeat.map((row) => sourceLabel(row.source)),
    ]);
    const count = (
      rows: Array<{ source: string | null; count: number }>,
      source: string,
    ) => rows.find((row) => sourceLabel(row.source) === source)?.count ?? 0;
    const grouped = (rows: typeof projects) =>
      rows.map((row) => ({
        source: row.acquisitionSource,
        count: row._count._all,
      }));

    const rows = [...sources]
      .sort((left, right) => left.localeCompare(right))
      .map((source) => {
        const projectCount = count(grouped(projects), source);
        const completedCount = count(grouped(completedProjects), source);
        return {
          source,
          applications: count(grouped(applications), source),
          projects: projectCount,
          completedProjects: completedCount,
          projectCompletionRate:
            projectCount > 0
              ? `${Math.round((completedCount / projectCount) * 100)}%`
              : "—",
          activatedUsers: count(activated, source),
          repeatBuilders: count(repeat, source),
        };
      });

    console.log(
      `Squid acquisition report · ${days} days · since ${since.toISOString()}`,
    );
    console.table(rows);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
