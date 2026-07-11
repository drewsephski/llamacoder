const DEFAULT_LOOKBACK_MONTHS = 6;
const DEFAULT_MAX_SOURCES = 5;
const DEFAULT_MAX_EXCERPT_CHARACTERS = 4_000;

export type ResearchWindow = {
  start: Date;
  end: Date;
  startIso: string;
  endIso: string;
  startDate: string;
  endDate: string;
};

export type RecentWebSource = {
  title: string;
  url: string;
  publishedDate: string;
  excerpt: string;
};

function subtractUtcMonths(value: Date, months: number) {
  const result = new Date(value);
  const originalDay = result.getUTCDate();

  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() - months);

  const lastDayOfTargetMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(originalDay, lastDayOfTargetMonth));

  return result;
}

export function createResearchWindow(
  now = new Date(),
  lookbackMonths = DEFAULT_LOOKBACK_MONTHS,
): ResearchWindow {
  if (!Number.isInteger(lookbackMonths) || lookbackMonths < 1) {
    throw new Error("Research lookback must be a positive whole month count");
  }

  const end = new Date(now);
  if (Number.isNaN(end.getTime())) {
    throw new Error("Research window requires a valid current date");
  }

  const start = subtractUtcMonths(end, lookbackMonths);

  return {
    start,
    end,
    startIso: start.toISOString(),
    endIso: end.toISOString(),
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function getExcerpt(result: Record<string, unknown>) {
  const highlights = Array.isArray(result.highlights)
    ? result.highlights.flatMap((highlight) => {
        const value = getString(highlight);
        return value ? [value] : [];
      })
    : [];

  return (
    highlights.join("\n\n") ||
    getString(result.summary) ||
    getString(result.text) ||
    ""
  );
}

export function extractRecentWebSources(
  outputs: unknown[],
  window: ResearchWindow,
  options: {
    maxSources?: number;
    maxExcerptCharacters?: number;
  } = {},
): RecentWebSource[] {
  const maxSources = options.maxSources ?? DEFAULT_MAX_SOURCES;
  const maxExcerptCharacters =
    options.maxExcerptCharacters ?? DEFAULT_MAX_EXCERPT_CHARACTERS;
  const sources = new Map<string, RecentWebSource>();

  for (const output of outputs) {
    if (!output || typeof output !== "object") continue;

    const results = (output as { results?: unknown }).results;
    if (!Array.isArray(results)) continue;

    for (const result of results) {
      if (!result || typeof result !== "object") continue;

      const candidate = result as Record<string, unknown>;
      const url = getString(candidate.url);
      const publishedDate = getString(candidate.publishedDate);
      if (!url || !publishedDate || sources.has(url)) continue;

      const publishedAt = new Date(publishedDate);
      if (
        Number.isNaN(publishedAt.getTime()) ||
        publishedAt < window.start ||
        publishedAt > window.end
      ) {
        continue;
      }

      sources.set(url, {
        title: getString(candidate.title) ?? "Source",
        url,
        publishedDate: publishedAt.toISOString(),
        excerpt: getExcerpt(candidate).slice(0, maxExcerptCharacters),
      });

      if (sources.size >= maxSources) {
        return Array.from(sources.values());
      }
    }
  }

  return Array.from(sources.values());
}
