import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { StylePackId } from "@/features/generation/style-packs";

export type HallmarkLogEntry = {
  date: string;
  macrostructure?: string;
  theme: string;
  enrichment?: string;
  brief?: string;
  nav?: string;
  footer?: string;
  stylePack?: StylePackId;
};

/** Maps Hallmark catalog theme names and Style Pack ids to canonical pack ids. */
const THEME_TO_PACK: Record<string, StylePackId> = {
  cobalt: "cobaltMinimal",
  cobaltminimal: "cobaltMinimal",
  lumen: "lumenAtmospheric",
  lumenatmospheric: "lumenAtmospheric",
  specimen: "editorialSpecimen",
  editorial: "editorialSpecimen",
  editorialspecimen: "editorialSpecimen",
  brutal: "swissBrutal",
  swissbrutal: "swissBrutal",
  carnival: "kineticAwwwards",
  kinetic: "kineticAwwwards",
  kineticawwwards: "kineticAwwwards",
  hum: "softStructural",
  softstructural: "softStructural",
  terminal: "terminalPhosphor",
  terminalphosphor: "terminalPhosphor",
  garden: "gardenBotanical",
  gardenbotanical: "gardenBotanical",
  midnight: "midnightCool",
  midnightcool: "midnightCool",
  aurora: "midnightCool",
  manifesto: "manifestoGeometric",
  manifestogeometric: "manifestoGeometric",
  atelier: "editorialSpecimen",
  newsprint: "newsprintEditorial",
  newsprinteditorial: "newsprintEditorial",
  riso: "risoPoster",
  risoposter: "risoPoster",
};

function normalizeThemeKey(theme: string): string {
  return theme
    .trim()
    .toLowerCase()
    .replace(/[\s/_-]+/g, "");
}

export function themeNameToStylePackId(theme: string): StylePackId | null {
  const key = normalizeThemeKey(theme);
  return THEME_TO_PACK[key] ?? null;
}

export function readHallmarkLog(
  projectRoot = process.cwd(),
): HallmarkLogEntry[] {
  const logPath = join(projectRoot, ".hallmark", "log.json");
  if (!existsSync(logPath)) return [];

  try {
    const raw = readFileSync(logPath, "utf8");
    const parsed = JSON.parse(raw) as HallmarkLogEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Returns Style Pack ids used in the last N log entries (newest first).
 * Used to diversify consecutive generations away from repeated palettes/fonts.
 */
export function getRecentStylePackIds(
  log: readonly HallmarkLogEntry[],
  count = 3,
): StylePackId[] {
  const recent: StylePackId[] = [];

  for (const entry of log.slice(0, count)) {
    const fromField = entry.stylePack;
    if (fromField) {
      recent.push(fromField);
      continue;
    }
    const fromTheme = themeNameToStylePackId(entry.theme);
    if (fromTheme) recent.push(fromTheme);
  }

  return recent;
}

export function pickDiversifiedPack(
  candidates: readonly StylePackId[],
  recentPacks: readonly StylePackId[],
  seed: number,
): StylePackId {
  if (candidates.length === 0) return "cobaltMinimal";

  const blocked = new Set(recentPacks.slice(0, 2));
  let pool = candidates.filter((id) => !blocked.has(id));

  if (pool.length === 0) {
    const last = recentPacks[0];
    pool = candidates.filter((id) => id !== last);
  }
  if (pool.length === 0) pool = [...candidates];

  return pool[seed % pool.length] ?? candidates[0]!;
}

const MAX_LOG_ENTRIES = 20;

function hallmarkLogPath(projectRoot: string): string {
  return join(projectRoot, ".hallmark", "log.json");
}

/**
 * Append a generation record for Style Pack / macrostructure diversification.
 * Creates `.hallmark/log.json` when missing (newest entry first).
 */
export function appendHallmarkLogEntry(
  entry: HallmarkLogEntry,
  projectRoot = process.cwd(),
): void {
  const logPath = hallmarkLogPath(projectRoot);
  const dir = join(projectRoot, ".hallmark");

  const existing = readHallmarkLog(projectRoot);
  const next: HallmarkLogEntry[] = [
    {
      ...entry,
      date: entry.date || new Date().toISOString().slice(0, 10),
    },
    ...existing,
  ].slice(0, MAX_LOG_ENTRIES);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(logPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}

export type RecordGenerationDesignMemoryInput = {
  brief: string;
  stylePackId?: StylePackId | null;
  macrostructure?: string;
  nav?: string;
  footer?: string;
  enrichment?: string;
  theme?: string;
  projectRoot?: string;
};

/** Record a completed codegen build for diversification on the next run. */
export function recordGenerationDesignMemory(
  input: RecordGenerationDesignMemoryInput,
): void {
  const briefSummary = input.brief.trim().slice(0, 120) || "Squid generation";

  appendHallmarkLogEntry(
    {
      date: new Date().toISOString().slice(0, 10),
      macrostructure: input.macrostructure,
      theme: input.theme ?? input.stylePackId ?? "catalog",
      enrichment: input.enrichment ?? "none",
      brief: briefSummary,
      nav: input.nav,
      footer: input.footer,
      stylePack: input.stylePackId ?? undefined,
    },
    input.projectRoot ?? process.cwd(),
  );
}
