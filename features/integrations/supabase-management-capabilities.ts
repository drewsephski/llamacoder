import { z } from "zod";

export const supabaseManagementCapabilityStatusSchema = z.enum([
  "verified",
  "unverified",
  "missing",
  "reauthorization_required",
  "error",
]);

export type SupabaseManagementCapabilityStatus = z.infer<
  typeof supabaseManagementCapabilityStatusSchema
>;

export const supabaseManagementCapabilityIssueSchema = z.enum([
  "connection_expired",
  "insufficient_permissions",
  "rate_limited",
  "provider_unavailable",
  "project_unavailable",
]);

export const supabaseManagementCapabilitiesSchema = z
  .object({
    projectsRead: supabaseManagementCapabilityStatusSchema,
    projectsWrite: supabaseManagementCapabilityStatusSchema,
    secretsRead: supabaseManagementCapabilityStatusSchema,
    databaseRead: supabaseManagementCapabilityStatusSchema,
    databaseWrite: supabaseManagementCapabilityStatusSchema,
    authWrite: supabaseManagementCapabilityStatusSchema.default("unverified"),
    projectRef: z.string().min(1).nullable(),
    checkedAt: z.string().datetime(),
    issue: supabaseManagementCapabilityIssueSchema.nullable(),
  })
  .strict();

export type SupabaseManagementCapabilities = z.infer<
  typeof supabaseManagementCapabilitiesSchema
>;

export function readSupabaseManagementCapabilities(
  value: unknown,
): SupabaseManagementCapabilities | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const parsed = supabaseManagementCapabilitiesSchema.safeParse(
    (value as Record<string, unknown>).supabaseManagementCapabilities,
  );
  return parsed.success ? parsed.data : null;
}

export function hasSupabaseCapabilityStatus(
  capabilities: SupabaseManagementCapabilities,
  status: SupabaseManagementCapabilityStatus,
) {
  return (
    capabilities.projectsRead === status ||
    capabilities.projectsWrite === status ||
    capabilities.secretsRead === status ||
    capabilities.databaseRead === status ||
    capabilities.databaseWrite === status ||
    capabilities.authWrite === status
  );
}

export function preserveVerifiedSupabaseWriteCapabilities({
  existing,
  observed,
}: {
  existing: SupabaseManagementCapabilities | null;
  observed: SupabaseManagementCapabilities;
}): SupabaseManagementCapabilities {
  if (
    !existing ||
    existing.projectRef !== observed.projectRef ||
    observed.issue !== null
  ) {
    return observed;
  }

  return {
    ...observed,
    projectsWrite:
      observed.projectsWrite === "unverified" &&
      existing.projectsWrite === "verified"
        ? "verified"
        : observed.projectsWrite,
    databaseWrite:
      observed.databaseWrite === "unverified" &&
      existing.databaseWrite === "verified"
        ? "verified"
        : observed.databaseWrite,
    authWrite:
      observed.authWrite === "unverified" && existing.authWrite === "verified"
        ? "verified"
        : observed.authWrite,
  };
}
