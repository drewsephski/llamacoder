import { z } from "zod";

export const SUPABASE_PREVIEW_RUNTIME_PATH = "/squid-runtime/supabase.ts";
export const SUPABASE_CLIENT_ADAPTER_PATH = "/lib/supabase.ts";
export const SUPABASE_CLIENT_ADAPTER_IMPORT = "@/lib/supabase";
export const SUPABASE_EXPORT_ENVIRONMENT_VARIABLES = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
] as const;

const supabaseProjectUrlSchema = z
  .string()
  .trim()
  .url()
  .superRefine((value, context) => {
    const url = new URL(value);
    const isHostedSupabaseProject =
      url.protocol === "https:" &&
      /^[a-z0-9-]+\.supabase\.co$/i.test(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.port &&
      (url.pathname === "/" || url.pathname === "") &&
      !url.search &&
      !url.hash;

    if (!isHostedSupabaseProject) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expected an HTTPS Supabase project URL.",
      });
    }
  })
  .transform((value) => value.replace(/\/$/, ""));

export const supabaseBrowserRuntimeConfigSchema = z
  .object({
    url: supabaseProjectUrlSchema,
    publishableKey: z.string().trim().min(1),
  })
  .strict()
  .superRefine((value, context) => {
    if (!isBrowserSafeSupabaseKey(value.publishableKey)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["publishableKey"],
        message:
          "Expected a browser-safe Supabase publishable or legacy anon key.",
      });
    }
  });

export type SupabaseBrowserRuntimeConfig = z.infer<
  typeof supabaseBrowserRuntimeConfigSchema
>;

export const supabaseBrowserRuntimeStateSchema = z.discriminatedUnion(
  "status",
  [
    z.object({ status: z.literal("not_connected") }).strict(),
    z.object({ status: z.literal("provisioning") }).strict(),
    z.object({ status: z.literal("missing_browser_key") }).strict(),
    z.object({ status: z.literal("invalid_browser_key") }).strict(),
    z.object({ status: z.literal("invalid_project_url") }).strict(),
    z
      .object({
        status: z.literal("ready"),
        config: supabaseBrowserRuntimeConfigSchema,
      })
      .strict(),
  ],
);

export type SupabaseBrowserRuntimeState = z.infer<
  typeof supabaseBrowserRuntimeStateSchema
>;

export function resolveSupabaseBrowserRuntimeForPreview({
  runtime,
  generatedAppUsesSupabase,
  workspaceResolved,
}: {
  runtime?: SupabaseBrowserRuntimeState;
  generatedAppUsesSupabase: boolean;
  workspaceResolved: boolean;
}): SupabaseBrowserRuntimeState | undefined {
  if (runtime) return runtime;
  if (!generatedAppUsesSupabase || !workspaceResolved) return undefined;
  return { status: "not_connected" };
}

export type SupabaseApiKeyCandidate = {
  name?: string | null;
  type?: string | null;
  api_key?: string | null;
  key?: string | null;
};

export type SupabaseBrowserKeySelection =
  | {
      status: "selected";
      key: string;
      kind: "publishable" | "legacy_anon";
    }
  | { status: "missing" | "ambiguous" | "rejected" };

function cleanString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function readCandidateKey(candidate: SupabaseApiKeyCandidate) {
  return cleanString(candidate.api_key) ?? cleanString(candidate.key);
}

function readLegacyJwtRole(key: string) {
  const parts = key.split(".");
  if (parts.length !== 3) return null;

  try {
    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
    const parsed = JSON.parse(globalThis.atob(payload)) as unknown;
    if (!parsed || typeof parsed !== "object" || !("role" in parsed)) {
      return null;
    }
    return typeof parsed.role === "string" ? parsed.role : null;
  } catch {
    return null;
  }
}

export function isLegacySupabaseAnonKey(key: string) {
  return readLegacyJwtRole(key.trim()) === "anon";
}

export function isBrowserSafeSupabaseKey(key: string) {
  const value = key.trim();
  return value.startsWith("sb_publishable_") || isLegacySupabaseAnonKey(value);
}

export function selectSupabaseBrowserKey(
  candidates: SupabaseApiKeyCandidate[],
): SupabaseBrowserKeySelection {
  const revealedCandidates = candidates.flatMap((candidate) => {
    const key = readCandidateKey(candidate);
    return key ? [{ candidate, key }] : [];
  });
  if (revealedCandidates.length === 0) return { status: "missing" };

  const publishableCandidates = revealedCandidates.filter(
    ({ candidate, key }) =>
      cleanString(candidate.type)?.toLowerCase() === "publishable" &&
      key.startsWith("sb_publishable_"),
  );
  if (publishableCandidates.length > 1) return { status: "ambiguous" };
  if (publishableCandidates.length === 1) {
    return {
      status: "selected",
      key: publishableCandidates[0].key,
      kind: "publishable",
    };
  }

  const legacyAnonCandidates = revealedCandidates.filter(
    ({ candidate, key }) => {
      const type = cleanString(candidate.type)?.toLowerCase();
      const name = cleanString(candidate.name)?.toLowerCase();
      return (
        (type === "legacy" || type === "anon") &&
        name === "anon" &&
        isLegacySupabaseAnonKey(key)
      );
    },
  );
  if (legacyAnonCandidates.length > 1) return { status: "ambiguous" };
  if (legacyAnonCandidates.length === 1) {
    return {
      status: "selected",
      key: legacyAnonCandidates[0].key,
      kind: "legacy_anon",
    };
  }

  return { status: "rejected" };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function selectStoredBrowserKey(config: Record<string, unknown>) {
  const canonicalKey = cleanString(config.supabasePublishableKey);
  const legacyFieldKey = cleanString(config.supabaseAnonKey);
  const distinctKeys = Array.from(
    new Set(
      [canonicalKey, legacyFieldKey].filter(
        (value): value is string => !!value,
      ),
    ),
  );
  if (distinctKeys.length === 0) return { status: "missing" as const };

  const modernKeys = distinctKeys.filter((key) =>
    key.startsWith("sb_publishable_"),
  );
  if (modernKeys.length > 1) return { status: "rejected" as const };
  if (modernKeys.length === 1)
    return { status: "selected" as const, key: modernKeys[0] };

  const legacyAnonKeys = distinctKeys.filter(isLegacySupabaseAnonKey);
  if (legacyAnonKeys.length !== 1 || distinctKeys.length !== 1) {
    return { status: "rejected" as const };
  }
  return { status: "selected" as const, key: legacyAnonKeys[0] };
}

export function buildSupabaseBrowserRuntimeState({
  integrationConfig,
  hasProjectBinding,
  isProvisioning,
}: {
  integrationConfig: unknown;
  hasProjectBinding: boolean;
  isProvisioning: boolean;
}): SupabaseBrowserRuntimeState {
  if (!hasProjectBinding) return { status: "not_connected" };
  if (isProvisioning) return { status: "provisioning" };
  if (!isRecord(integrationConfig)) return { status: "not_connected" };

  const projectUrl = cleanString(integrationConfig.supabaseProjectUrl);
  const hasProjectReference = Boolean(
    cleanString(integrationConfig.supabaseProjectRef) ||
      cleanString(integrationConfig.supabaseProjectId) ||
      projectUrl,
  );
  if (!hasProjectReference) return { status: "not_connected" };
  if (!projectUrl || !supabaseProjectUrlSchema.safeParse(projectUrl).success) {
    return { status: "invalid_project_url" };
  }

  const selectedKey = selectStoredBrowserKey(integrationConfig);
  if (selectedKey.status === "missing") {
    if (integrationConfig.supabaseBrowserKeyStatus === "rejected") {
      return { status: "invalid_browser_key" };
    }
    return { status: "missing_browser_key" };
  }
  if (selectedKey.status !== "selected") {
    return { status: "invalid_browser_key" };
  }

  const parsed = supabaseBrowserRuntimeConfigSchema.safeParse({
    url: projectUrl,
    publishableKey: selectedKey.key,
  });
  if (!parsed.success) return { status: "invalid_browser_key" };

  return { status: "ready", config: parsed.data };
}

export function getSupabaseRuntimeSetupMessage(
  state: Exclude<SupabaseBrowserRuntimeState, { status: "ready" }>,
) {
  switch (state.status) {
    case "not_connected":
      return "Supabase setup required: no Supabase project is connected.";
    case "provisioning":
      return "Supabase setup required: the connected project is still provisioning.";
    case "missing_browser_key":
      return "Supabase setup required: no browser-safe publishable key was found.";
    case "invalid_browser_key":
      return "Supabase setup required: an invalid or privileged API key was rejected.";
    case "invalid_project_url":
      return "Supabase setup required: the connected project URL is invalid.";
  }
}

export function buildSupabaseClientAdapterModule() {
  return `import { createClient } from "@supabase/supabase-js";
import { publishableKey, url } from "@/squid-runtime/supabase";

export const supabase = createClient(url, publishableKey);
`;
}

export function buildSupabaseExportRuntimeModule() {
  return `const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function isLegacyAnonKey(value: string) {
  const parts = value.split(".");
  if (parts.length !== 3) return false;

  try {
    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
    return JSON.parse(globalThis.atob(payload)).role === "anon";
  } catch {
    return false;
  }
}

function isValidProjectUrl(value: string) {
  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" &&
      /^[a-z0-9-]+\\.supabase\\.co$/i.test(parsed.hostname) &&
      !parsed.username &&
      !parsed.password &&
      !parsed.port &&
      (parsed.pathname === "/" || parsed.pathname === "") &&
      !parsed.search &&
      !parsed.hash
    );
  } catch {
    return false;
  }
}

if (!url || !isValidProjectUrl(url)) {
  throw new Error("Supabase setup required: set a valid VITE_SUPABASE_URL.");
}

if (
  !publishableKey ||
  (!publishableKey.startsWith("sb_publishable_") &&
    !isLegacyAnonKey(publishableKey))
) {
  throw new Error(
    "Supabase setup required: set a browser-safe VITE_SUPABASE_PUBLISHABLE_KEY.",
  );
}

export { publishableKey, url };
`;
}
