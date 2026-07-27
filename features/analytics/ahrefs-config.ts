export const AHREFS_ANALYTICS_KEY = "O4gKckTzoHrR2FUZoZUz8w";
export const AHREFS_ANALYTICS_SCRIPT_ID = "ahrefs-web-analytics";
export const AHREFS_ANALYTICS_SCRIPT_URL =
  "https://analytics.ahrefs.com/analytics.js";

const AHREFS_ANALYTICS_HOSTS = new Set([
  "squidagent.app",
  "www.squidagent.app",
]);

const PUBLIC_ANALYTICS_EXACT_PATHS = new Set([
  "/",
  "/axon",
  "/axion-studio",
  "/contact",
  "/cookies",
  "/cozypaws",
  "/design-rocket-certificates",
  "/example",
  "/forma",
  "/gallery",
  "/gallery/cinder-studio",
  "/gallery/echo-chamber",
  "/gallery/orbital-salvage",
  "/gallery/relay-release-evidence",
  "/gallery/rune-circuit",
  "/gallery/small-hours-table",
  "/jack",
  "/launch",
  "/mentality",
  "/mindloop",
  "/prisma",
  "/privacy",
  "/questly",
  "/rivr",
  "/sentinel",
  "/skyelite",
  "/supabase",
  "/terraelix",
  "/terms",
  "/velorah",
  "/what-is-squid-agent",
]);

const PUBLIC_ANALYTICS_PATH_PREFIXES = [
  "/benchmarks",
  "/blog",
  "/compare",
  "/docs",
] as const;

export function normalizeAnalyticsPathname(pathname: string) {
  const pathOnly = pathname.split(/[?#]/u, 1)[0] || "/";
  if (pathOnly === "/") return pathOnly;
  return pathOnly.replace(/\/+$/u, "") || "/";
}

export function isAhrefsAnalyticsHost(hostname: string) {
  return AHREFS_ANALYTICS_HOSTS.has(hostname.toLowerCase());
}

export function isAhrefsAnalyticsPath(pathname: string) {
  const normalizedPathname = normalizeAnalyticsPathname(pathname);

  if (PUBLIC_ANALYTICS_EXACT_PATHS.has(normalizedPathname)) return true;

  return PUBLIC_ANALYTICS_PATH_PREFIXES.some(
    (prefix) =>
      normalizedPathname === prefix ||
      normalizedPathname.startsWith(`${prefix}/`),
  );
}
