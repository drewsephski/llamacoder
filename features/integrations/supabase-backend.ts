import { z } from "zod";

export const supabaseBackendPlanSchema = z
  .object({
    version: z.literal(1),
    template: z.literal("authenticated_tasks"),
    summary: z.literal(
      "Create a tasks table protected by row-level security so signed-in users can access only their own tasks.",
    ),
    migrationChecksum: z.string().regex(/^[a-f0-9]{64}$/),
    destructive: z.literal(false),
  })
  .strict();

export type SupabaseBackendPlan = z.infer<typeof supabaseBackendPlanSchema>;

export const AUTHENTICATED_TASKS_MIGRATION_CHECKSUM =
  "a8a8eb095fe82a3583589d8c5d43c54a35ad6d887be06e77c91ad2cfff5eba99";

export function getAuthenticatedTasksBackendPlan(): SupabaseBackendPlan {
  return {
    version: 1,
    template: "authenticated_tasks",
    summary:
      "Create a tasks table protected by row-level security so signed-in users can access only their own tasks.",
    migrationChecksum: AUTHENTICATED_TASKS_MIGRATION_CHECKSUM,
    destructive: false,
  };
}

export const supabaseBackendVerificationSchema = z
  .object({
    table: z.literal(true),
    columns: z.literal(true),
    rowLevelSecurity: z.literal(true),
    authenticatedGrants: z.literal(true),
    ownershipPolicies: z.literal(true),
    anonAccessRevoked: z.literal(true),
  })
  .strict();

export type SupabaseBackendVerification = z.infer<
  typeof supabaseBackendVerificationSchema
>;

const planState = { plan: supabaseBackendPlanSchema };

export const supabaseBackendStateSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("not_connected") }).strict(),
  z.object({ status: z.literal("provisioning") }).strict(),
  z
    .object({
      status: z.literal("approval_required"),
      ...planState,
    })
    .strict(),
  z
    .object({
      status: z.literal("applying"),
      ...planState,
    })
    .strict(),
  z
    .object({
      status: z.literal("verification_failed"),
      ...planState,
      message: z.string().trim().min(1).max(240),
    })
    .strict(),
  z
    .object({
      status: z.literal("reauthorization_required"),
      ...planState,
    })
    .strict(),
  z
    .object({
      status: z.literal("ready"),
      ...planState,
      verifiedAt: z.string().datetime(),
      verification: supabaseBackendVerificationSchema,
    })
    .strict(),
]);

export type SupabaseBackendState = z.infer<typeof supabaseBackendStateSchema>;

export const supabaseAuthModeSchema = z.enum([
  "prototype_instant_signup",
  "verified_email",
]);

export type SupabaseAuthMode = z.infer<typeof supabaseAuthModeSchema>;

export const DEFAULT_SUPABASE_AUTH_MODE =
  "prototype_instant_signup" as const satisfies SupabaseAuthMode;

export const supabaseAuthStateSchema = z
  .object({
    status: z.literal("ready"),
    mode: supabaseAuthModeSchema,
    configuredAt: z.string().datetime(),
  })
  .strict();

export type SupabaseAuthState = z.infer<typeof supabaseAuthStateSchema>;

export function readSupabaseAuthState(value: unknown): SupabaseAuthState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const config = value as Record<string, unknown>;
  const parsed = supabaseAuthStateSchema.safeParse(config.supabaseAuth);
  if (parsed.success) return parsed.data;

  // Preserve existing uncommitted prototype connections until their next
  // explicitly approved mode update migrates the persisted field.
  const legacy = config.supabasePrototypeAuth;
  const legacyParsed = z
    .object({
      status: z.literal("ready"),
      mode: z.literal("email_password_no_confirmation"),
      configuredAt: z.string().datetime(),
    })
    .passthrough()
    .safeParse(legacy);
  if (legacyParsed.success) {
    return {
      status: "ready",
      mode: "prototype_instant_signup",
      configuredAt: legacyParsed.data.configuredAt,
    };
  }
  return null;
}

export function readSupabaseBackendState(
  value: unknown,
): SupabaseBackendState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const parsed = supabaseBackendStateSchema.safeParse(
    (value as Record<string, unknown>).supabaseBackend,
  );
  return parsed.success ? parsed.data : null;
}

export function buildAuthenticatedTasksGenerationContext({
  authMode = null,
}: { authMode?: SupabaseAuthMode | null } = {}) {
  return [
    "=== VERIFIED SUPABASE BACKEND TEMPLATE ===",
    "The server verified authenticated_tasks version 1 for this project. Generate the real browser app against public.tasks; do not output SQL, migrations, policies, service-role keys, or Management API credentials.",
    'Import the protected browser client exactly as: import { supabase } from "@/lib/supabase";',
    "Implement email/password sign-up, login, logout, initial session restoration, and an auth-state listener whose subscription is unsubscribed during cleanup.",
    authMode === "prototype_instant_signup"
      ? "This project uses explicitly approved prototype/demo authentication with email confirmation disabled and reduced account-security guarantees. A successful signUp returns an authenticated session immediately: enter the signed-in app and do not show a check-your-email state. Never describe the app as production-ready solely because signup works. Reliable recovery email requires custom SMTP, and CAPTCHA is recommended before any public launch."
      : authMode === "verified_email"
        ? "This project uses the production-recommended verified-email mode. After signUp, keep the user in a confirmation-pending state and do not enter the signed-in app until Supabase returns an authenticated session after email confirmation. Clearly explain that reliable confirmation and recovery delivery requires custom SMTP."
        : "Supabase Auth mode has not been explicitly configured. Handle both an immediate session and a confirmation-required signup response honestly, and do not claim production readiness.",
    "Implement task list, create, edit title, toggle completed, and delete with explicit loading, empty, and actionable error states.",
    "Before insert, obtain the authenticated session user and set user_id to that user id. Rely on verified RLS for row authorization and never use a privileged key.",
    "Set updated_at to a new ISO timestamp when editing a title or toggling completion.",
    "Use only public.tasks columns: id, user_id, title, completed, created_at, updated_at.",
    "Do not add social OAuth, password recovery, Storage, Edge Functions, or another database schema.",
    "=== END VERIFIED SUPABASE BACKEND TEMPLATE ===",
  ].join("\n");
}
