import "server-only";

import { randomBytes } from "node:crypto";
import { z } from "zod";

import type { Prisma } from "@prisma/client";

import {
  selectSupabaseBrowserKey,
  supabaseBrowserRuntimeConfigSchema,
} from "@/features/integrations/supabase-browser-runtime";
import type { SupabaseAuthMode } from "@/features/integrations/supabase-backend";
import {
  hasSupabaseCapabilityStatus,
  readSupabaseManagementCapabilities,
  type SupabaseManagementCapabilities,
  type SupabaseManagementCapabilityStatus,
} from "@/features/integrations/supabase-management-capabilities";
import {
  getAuthorizedProjectIntegration,
  providerFetch,
} from "@/features/integrations/server/provider-client";
import { IntegrationServiceError } from "@/features/integrations/server/service";
import { getPrisma } from "@/lib/prisma";

const organizationSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  slug: z.string().optional(),
});

const organizationListPayloadSchema = z.union([
  z.array(organizationSchema),
  z.object({
    organizations: z.array(organizationSchema),
    data: z.never().optional(),
  }),
  z.object({
    data: z.array(organizationSchema),
    organizations: z.never().optional(),
  }),
]);

const projectSchema = z
  .object({
    id: z.string(),
    ref: z.string().optional(),
    name: z.string().default(""),
    status: z.string().optional(),
    region: z.string().optional(),
    endpoint: z.string().optional(),
    organization_id: z.string().optional(),
    dns_host: z.string().optional(),
  })
  .passthrough();

const projectListPayloadSchema = z.union([
  z.array(projectSchema),
  z.object({ projects: z.array(projectSchema) }),
  z.object({ data: z.array(projectSchema) }),
]);

const apiKeySchema = z
  .object({
    name: z.string().default(""),
    type: z.string().optional(),
    api_key: z.string().nullable().optional(),
    key: z.string().nullable().optional(),
  })
  .passthrough();

const apiKeysPayloadSchema = z.union([
  z.array(apiKeySchema),
  z.object({ api_keys: z.array(apiKeySchema) }),
  z.object({ keys: z.array(apiKeySchema) }),
]);

function sanitizeText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function fallbackDbPassword() {
  const base = randomBytes(24).toString("base64url");
  const sanitized = base.replace(/[^a-zA-Z0-9]/g, "");
  return (sanitized.slice(0, 24) || "SupabaseStrongPass2026").padEnd(20, "p");
}

function buildProjectUrl({
  ref,
  endpoint,
  dnsHost,
}: {
  ref?: string | null;
  endpoint?: string | null;
  dnsHost?: string | null;
}) {
  if (endpoint) {
    return endpoint;
  }
  if (dnsHost) {
    return `https://${dnsHost}`;
  }
  if (ref) {
    return `https://${ref}.supabase.co`;
  }
  return null;
}

function normalizeOrganizationPayload(payload: unknown) {
  const parsed = organizationListPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return [];
  }
  const raw = parsed.data;
  return (
    "organizations" in raw ? raw.organizations : "data" in raw ? raw.data : raw
  ) as z.infer<typeof organizationSchema>[];
}

function parseProject(payload: unknown) {
  return projectSchema.parse(payload);
}

function normalizeProjectPayload(payload: unknown) {
  const parsed = projectListPayloadSchema.safeParse(payload);
  if (!parsed.success) return [];
  const raw = parsed.data;
  if (Array.isArray(raw)) return raw;
  return "projects" in raw ? raw.projects : raw.data;
}

function parseApiKeys(payload: unknown) {
  const parsed = apiKeysPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return [];
  }
  const raw = parsed.data;
  if (Array.isArray(raw)) {
    return raw;
  }
  return "api_keys" in raw ? raw.api_keys : raw.keys;
}

function requireProviderIntegration(input: {
  projectId: string;
  bindingId: string;
  userId: string;
}) {
  return getAuthorizedProjectIntegration({
    ...input,
    expectedProvider: "supabase",
  });
}

function readIntegrationConfig(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function baseSupabaseManagementCapabilities(
  projectRef: string,
): SupabaseManagementCapabilities {
  return {
    projectsRead: "unverified",
    projectsWrite: "unverified",
    secretsRead: "unverified",
    databaseRead: "unverified",
    databaseWrite: "unverified",
    authWrite: "unverified",
    projectRef,
    checkedAt: new Date().toISOString(),
    issue: null,
  };
}

function classifySupabaseCapabilityError(error: unknown): {
  status: SupabaseManagementCapabilityStatus;
  issue: SupabaseManagementCapabilities["issue"];
} {
  if (error instanceof IntegrationServiceError) {
    if (error.status === 401) {
      return {
        status: "reauthorization_required",
        issue: "connection_expired",
      };
    }
    if (error.status === 403) {
      return {
        status: "reauthorization_required",
        issue: "insufficient_permissions",
      };
    }
    if (error.status === 404) {
      return { status: "missing", issue: "project_unavailable" };
    }
    if (error.status === 429) {
      return { status: "error", issue: "rate_limited" };
    }
  }
  return { status: "error", issue: "provider_unavailable" };
}

async function updateSupabaseDatabaseWriteCapability({
  binding,
  capabilities,
  status,
  issue,
}: {
  binding: Awaited<ReturnType<typeof requireProviderIntegration>>["binding"];
  capabilities: SupabaseManagementCapabilities;
  status: SupabaseManagementCapabilityStatus;
  issue: SupabaseManagementCapabilities["issue"];
}) {
  const config = readIntegrationConfig(binding.config);
  const nextCapabilities: SupabaseManagementCapabilities = {
    ...capabilities,
    databaseWrite: status,
    checkedAt: new Date().toISOString(),
    issue,
  };
  const reauthorizationRequired = status === "reauthorization_required";
  await getPrisma().$transaction([
    getPrisma().projectIntegration.update({
      where: { id: binding.id },
      data: {
        ...(reauthorizationRequired ? { status: "needs_attention" } : {}),
        config: {
          ...config,
          supabaseManagementCapabilities: nextCapabilities,
        } as Prisma.InputJsonValue,
      },
    }),
    ...(reauthorizationRequired
      ? [
          getPrisma().integrationConnection.update({
            where: { id: binding.connectionId },
            data: {
              status: "needs_attention",
              lastHealthStatus: "failed",
              lastHealthMessage:
                issue === "connection_expired"
                  ? "The Supabase Management connection expired. Reconnect Supabase."
                  : "Reconnect Supabase to grant Database Write access.",
              lastHealthCheckAt: new Date(),
            },
          }),
        ]
      : []),
  ]);
  return nextCapabilities;
}

export async function executeApprovedSupabaseDatabaseQuery(input: {
  projectId: string;
  bindingId: string;
  userId: string;
  projectRef: string;
  query: string;
  approval: {
    approved: boolean;
    approvedByUserId: string;
  };
}) {
  const authorized = await requireProviderIntegration(input);
  if (
    !input.approval.approved ||
    input.approval.approvedByUserId !== input.userId
  ) {
    throw new IntegrationServiceError(
      "SUPABASE_SQL_APPROVAL_REQUIRED",
      "Explicit approval is required before executing Supabase SQL.",
      409,
    );
  }

  const config = readIntegrationConfig(authorized.binding.config);
  const boundProjectRef = sanitizeText(config.supabaseProjectRef);
  if (!boundProjectRef || boundProjectRef !== input.projectRef) {
    throw new IntegrationServiceError(
      "SUPABASE_PROJECT_MISMATCH",
      "The approved SQL operation does not match the bound Supabase project.",
      409,
    );
  }
  const capabilities = readSupabaseManagementCapabilities(config);
  if (!capabilities || capabilities.projectRef !== boundProjectRef) {
    throw new IntegrationServiceError(
      "SUPABASE_CAPABILITY_CHECK_REQUIRED",
      "Verify Supabase Management capabilities before executing SQL.",
      409,
    );
  }
  if (hasSupabaseCapabilityStatus(capabilities, "reauthorization_required")) {
    throw new IntegrationServiceError(
      "SUPABASE_REAUTHORIZATION_REQUIRED",
      capabilities.issue === "connection_expired"
        ? "The Supabase Management connection expired. Reconnect Supabase."
        : "Reconnect Supabase to grant the required Management API access.",
      403,
    );
  }
  if (hasSupabaseCapabilityStatus(capabilities, "error")) {
    throw new IntegrationServiceError(
      "SUPABASE_CAPABILITY_TEMPORARILY_UNAVAILABLE",
      "Supabase Management capability verification is temporarily unavailable.",
      503,
    );
  }
  if (
    capabilities.databaseWrite !== "verified" &&
    capabilities.databaseWrite !== "unverified"
  ) {
    throw new IntegrationServiceError(
      capabilities.databaseWrite === "reauthorization_required"
        ? "SUPABASE_REAUTHORIZATION_REQUIRED"
        : "SUPABASE_DATABASE_WRITE_UNAVAILABLE",
      capabilities.databaseWrite === "reauthorization_required"
        ? "Reconnect Supabase to grant Database Write access."
        : "Supabase Database Write access is not currently available.",
      capabilities.databaseWrite === "reauthorization_required" ? 403 : 409,
    );
  }
  if (!input.query.trim()) {
    throw new IntegrationServiceError(
      "SUPABASE_SQL_INVALID",
      "The approved Supabase SQL query is empty.",
      400,
    );
  }

  try {
    const result = await providerFetch(
      "supabase",
      authorized.providerAuthorization ?? authorized.accessToken,
      `https://api.supabase.com/v1/projects/${encodeURIComponent(boundProjectRef)}/database/query`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input.query, read_only: false }),
      },
    );
    if (
      result &&
      typeof result === "object" &&
      "error" in result &&
      (result as { error?: unknown }).error != null
    ) {
      throw new IntegrationServiceError(
        "SUPABASE_QUERY_FAILED",
        "Supabase could not execute the approved database query.",
        502,
      );
    }
    if (capabilities.databaseWrite !== "verified") {
      await updateSupabaseDatabaseWriteCapability({
        binding: authorized.binding,
        capabilities,
        status: "verified",
        issue: null,
      });
    }
    return result;
  } catch (error) {
    if (error instanceof IntegrationServiceError) {
      const next =
        error.status === 401
          ? {
              status: "reauthorization_required" as const,
              issue: "connection_expired" as const,
            }
          : error.status === 403
            ? {
                status: "reauthorization_required" as const,
                issue: "insufficient_permissions" as const,
              }
            : error.status === 429
              ? { status: "error" as const, issue: "rate_limited" as const }
              : error.status >= 500
                ? {
                    status: "error" as const,
                    issue: "provider_unavailable" as const,
                  }
                : null;
      if (next) {
        await updateSupabaseDatabaseWriteCapability({
          binding: authorized.binding,
          capabilities,
          ...next,
        });
      }
    }
    throw error;
  }
}

export async function configureSupabaseAuthMode(input: {
  projectId: string;
  bindingId: string;
  userId: string;
  projectRef: string;
  mode: SupabaseAuthMode;
}) {
  const authorized = await requireProviderIntegration(input);
  const config = readIntegrationConfig(authorized.binding.config);
  const boundProjectRef = sanitizeText(config.supabaseProjectRef);
  if (boundProjectRef && boundProjectRef !== input.projectRef) {
    throw new IntegrationServiceError(
      "SUPABASE_PROJECT_MISMATCH",
      "The Supabase Auth configuration does not match the selected project.",
      409,
    );
  }

  try {
    await providerFetch(
      "supabase",
      authorized.providerAuthorization ?? authorized.accessToken,
      `https://api.supabase.com/v1/projects/${encodeURIComponent(input.projectRef)}/config/auth`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mailer_autoconfirm: input.mode === "prototype_instant_signup",
        }),
      },
    );
  } catch (error) {
    if (
      error instanceof IntegrationServiceError &&
      (error.status === 401 || error.status === 403)
    ) {
      const existing = readSupabaseManagementCapabilities(config);
      const capabilities =
        existing?.projectRef === input.projectRef
          ? existing
          : baseSupabaseManagementCapabilities(input.projectRef);
      const issue =
        error.status === 401
          ? ("connection_expired" as const)
          : ("insufficient_permissions" as const);
      const checkedAt = new Date();
      await getPrisma().$transaction([
        getPrisma().projectIntegration.update({
          where: { id: authorized.binding.id },
          data: {
            status: "needs_attention",
            config: {
              ...config,
              supabaseManagementCapabilities: {
                ...capabilities,
                authWrite: "reauthorization_required",
                checkedAt: checkedAt.toISOString(),
                issue,
              },
            } as Prisma.InputJsonValue,
          },
        }),
        getPrisma().integrationConnection.update({
          where: { id: authorized.binding.connectionId },
          data: {
            status: "needs_attention",
            lastHealthStatus: "failed",
            lastHealthMessage:
              error.status === 401
                ? "The Supabase Management connection expired. Reconnect Supabase."
                : "Reconnect Supabase to grant Auth Write access for authentication settings.",
            lastHealthCheckAt: checkedAt,
          },
        }),
        getPrisma().integrationAuditEvent.create({
          data: {
            userId: input.userId,
            providerId: "supabase",
            action: "supabase_auth_mode_update_failed",
            environment: authorized.binding.environment,
            connectionId: authorized.binding.connectionId,
            projectIntegrationId: authorized.binding.id,
            metadata: {
              mode: input.mode,
              outcome: "reauthorization_required",
            },
          },
        }),
      ]);
    }
    throw error;
  }

  const configuredAt = new Date();
  const latestConfig = readIntegrationConfig(
    (
      await getPrisma().projectIntegration.findUnique({
        where: { id: authorized.binding.id },
        select: { config: true },
      })
    )?.config,
  );
  const existing = readSupabaseManagementCapabilities(latestConfig);
  const capabilities =
    existing?.projectRef === input.projectRef
      ? existing
      : baseSupabaseManagementCapabilities(input.projectRef);
  const authState = {
    status: "ready" as const,
    mode: input.mode,
    configuredAt: configuredAt.toISOString(),
  };
  const nextConfig: Record<string, unknown> = {
    ...latestConfig,
    supabaseAuth: authState,
    supabaseManagementCapabilities: {
      ...capabilities,
      authWrite: "verified" as const,
      checkedAt: configuredAt.toISOString(),
      issue: null,
    },
  };
  delete nextConfig.supabasePrototypeAuth;
  await getPrisma().$transaction([
    getPrisma().projectIntegration.update({
      where: { id: authorized.binding.id },
      data: {
        config: nextConfig as Prisma.InputJsonValue,
      },
    }),
    getPrisma().integrationAuditEvent.create({
      data: {
        userId: input.userId,
        providerId: "supabase",
        action: "supabase_auth_mode_updated",
        environment: authorized.binding.environment,
        connectionId: authorized.binding.connectionId,
        projectIntegrationId: authorized.binding.id,
        metadata: {
          mode: input.mode,
          outcome: "configured",
        },
      },
    }),
  ]);
  return authState;
}

export async function listSupabaseOrganizations(input: {
  projectId: string;
  bindingId: string;
  userId: string;
}) {
  const authorized = await requireProviderIntegration(input);
  const payload = await providerFetch(
    "supabase",
    authorized.providerAuthorization ?? authorized.accessToken,
    "https://api.supabase.com/v1/organizations",
  );
  const organizations = normalizeOrganizationPayload(payload).map(
    (organization) => {
      const name =
        organization.name || sanitizeText(organization.slug) || organization.id;
      return {
        id: organization.id,
        name,
        owner: sanitizeText(organization.slug) ?? undefined,
        url: sanitizeText(
          `https://app.supabase.com/organizations/${organization.slug ?? organization.id}`,
        ),
      };
    },
  );
  if (organizations.length === 0) {
    throw new IntegrationServiceError(
      "SUPABASE_ORGANIZATIONS_EMPTY",
      "No Supabase organization is available for this account.",
      404,
    );
  }
  return organizations;
}

export async function listSupabaseProjects(input: {
  projectId: string;
  bindingId: string;
  userId: string;
  organizationId?: string | null;
}) {
  const authorized = await requireProviderIntegration(input);
  const payload = await providerFetch(
    "supabase",
    authorized.providerAuthorization ?? authorized.accessToken,
    "https://api.supabase.com/v1/projects",
  );
  const requestedOrganizationId = sanitizeText(input.organizationId);
  return normalizeProjectPayload(payload)
    .filter(
      (project) =>
        !requestedOrganizationId ||
        project.organization_id === requestedOrganizationId,
    )
    .map((project) => {
      const projectRef = project.ref ?? project.id;
      const name = sanitizeText(project.name) ?? projectRef;
      return {
        id: projectRef,
        name,
        owner: sanitizeText(project.organization_id) ?? undefined,
        url: sanitizeText(
          `https://supabase.com/dashboard/project/${encodeURIComponent(projectRef)}`,
        ),
      };
    });
}

export const SUPABASE_READY_PROJECT_STATUS = "ACTIVE_HEALTHY";

const SUPABASE_TERMINAL_PROJECT_STATUSES = new Set([
  "INIT_FAILED",
  "REMOVED",
  "PAUSED",
]);

export async function createSupabaseProject(input: {
  projectId: string;
  bindingId: string;
  userId: string;
  organizationId?: string | null;
  region?: string | null;
  projectName?: string | null;
}): Promise<{
  projectRef: string;
  url: string | null;
  metadata: Prisma.InputJsonValue;
  config: Record<string, unknown>;
}> {
  const authorized = await requireProviderIntegration(input);
  const orgs = await listSupabaseOrganizations(input);
  const selectedOrg = input.organizationId?.trim()
    ? orgs.find((org) => org.id === input.organizationId!.trim())
    : undefined;
  if (input.organizationId?.trim() && !selectedOrg) {
    throw new IntegrationServiceError(
      "SUPABASE_ORGANIZATION_NOT_FOUND",
      "The selected Supabase organization is no longer available.",
      404,
    );
  }
  const organization = selectedOrg ?? orgs[0];
  const organizationId = organization.id;
  const projectName =
    sanitizeText(input.projectName)?.slice(0, 80) ??
    `squid-project-${Date.now().toString(36)}`;

  const createPayload = {
    name: projectName,
    organization_id: organizationId,
    region: sanitizeText(input.region) ?? "us-east-1",
    db_pass: fallbackDbPassword(),
  };
  const createdProjectPayload = await providerFetch(
    "supabase",
    authorized.providerAuthorization ?? authorized.accessToken,
    "https://api.supabase.com/v1/projects",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createPayload),
    },
  );
  const createdProject = parseProject(createdProjectPayload);
  const projectRef = createdProject.ref ?? createdProject.id;
  const operationUrl = buildProjectUrl({
    ref: createdProject.ref ?? projectRef,
    endpoint: sanitizeText(createdProject.endpoint),
    dnsHost: sanitizeText(createdProject.dns_host),
  });
  const finalMetadata = {
    phase: "waiting_for_supabase",
    organizationId,
    organizationName: organization.name,
    projectId: createdProject.id,
    projectRef,
    projectName: createdProject.name || projectName,
    region: createdProject.region ?? createPayload.region,
    providerStatus: createdProject.status ?? null,
    url: operationUrl,
  };
  const existingCapabilities = readSupabaseManagementCapabilities(
    readIntegrationConfig(authorized.binding.config),
  );
  const managementCapabilities: SupabaseManagementCapabilities = {
    projectsRead: existingCapabilities?.projectsRead ?? "verified",
    projectsWrite: "verified",
    secretsRead: existingCapabilities?.secretsRead ?? "unverified",
    databaseRead: existingCapabilities?.databaseRead ?? "unverified",
    databaseWrite: existingCapabilities?.databaseWrite ?? "unverified",
    authWrite: existingCapabilities?.authWrite ?? "unverified",
    projectRef,
    checkedAt: new Date().toISOString(),
    issue: existingCapabilities?.issue ?? null,
  };
  const config = {
    supabaseOrganizationId: organizationId,
    supabaseOrganizationName: organization.name,
    supabaseProjectId: createdProject.id,
    supabaseProjectRef: projectRef,
    supabaseProjectName: createdProject.name || projectName,
    supabaseProjectRegion: createdProject.region ?? createPayload.region,
    supabaseProjectUrl: operationUrl,
    supabaseManagementCapabilities: managementCapabilities,
  };
  return {
    projectRef,
    url: operationUrl,
    metadata: finalMetadata,
    config,
  };
}

export async function getSupabaseProjectProvisioningStatus(input: {
  projectId: string;
  bindingId: string;
  userId: string;
  projectRef: string;
}) {
  const authorized = await requireProviderIntegration(input);
  const projectPayload = await providerFetch(
    "supabase",
    authorized.providerAuthorization ?? authorized.accessToken,
    `https://api.supabase.com/v1/projects/${encodeURIComponent(input.projectRef)}`,
  );
  const project = parseProject(projectPayload);
  const projectRef = project.ref ?? project.id;
  const providerStatus =
    sanitizeText(project.status)?.toUpperCase() ?? "UNKNOWN";
  const url = buildProjectUrl({
    ref: projectRef,
    endpoint: sanitizeText(project.endpoint),
    dnsHost: sanitizeText(project.dns_host),
  });

  return {
    projectRef,
    projectId: project.id,
    projectName: project.name,
    organizationId: sanitizeText(project.organization_id),
    region: sanitizeText(project.region),
    providerStatus,
    url,
    ready: providerStatus === SUPABASE_READY_PROJECT_STATUS,
    terminalError: SUPABASE_TERMINAL_PROJECT_STATUSES.has(providerStatus),
  };
}

export async function getSupabaseProjectBrowserConfiguration(input: {
  projectId: string;
  bindingId: string;
  userId: string;
  projectRef: string;
}) {
  const project = await getSupabaseProjectProvisioningStatus(input);
  if (!project.ready) {
    throw new IntegrationServiceError(
      "SUPABASE_PROJECT_NOT_READY",
      "Supabase is still preparing the project.",
      409,
    );
  }

  const authorized = await requireProviderIntegration(input);
  const keysPayload = await providerFetch(
    "supabase",
    authorized.providerAuthorization ?? authorized.accessToken,
    `https://api.supabase.com/v1/projects/${encodeURIComponent(project.projectRef)}/api-keys?reveal=true`,
  );
  const browserKey = selectSupabaseBrowserKey(parseApiKeys(keysPayload));
  if (browserKey.status !== "selected") {
    throw new IntegrationServiceError(
      browserKey.status === "missing"
        ? "SUPABASE_KEY_MISSING"
        : "SUPABASE_KEY_REJECTED",
      browserKey.status === "missing"
        ? "No browser-safe Supabase publishable key was returned."
        : "Supabase returned ambiguous or privileged keys that cannot be used in a browser.",
      502,
    );
  }
  if (!project.url) {
    throw new IntegrationServiceError(
      "SUPABASE_PROJECT_URL_INVALID",
      "Supabase did not return a valid project URL.",
      502,
    );
  }

  const runtimeConfig = supabaseBrowserRuntimeConfigSchema.parse({
    url: project.url,
    publishableKey: browserKey.key,
  });
  let databaseRead: SupabaseManagementCapabilityStatus = "verified";
  let capabilityIssue: SupabaseManagementCapabilities["issue"] = null;
  try {
    await providerFetch(
      "supabase",
      authorized.providerAuthorization ?? authorized.accessToken,
      `https://api.supabase.com/v1/projects/${encodeURIComponent(project.projectRef)}/types/typescript?included_schemas=public`,
    );
  } catch (error) {
    const classified = classifySupabaseCapabilityError(error);
    databaseRead = classified.status;
    capabilityIssue = classified.issue;
  }
  const existingCapabilities = readSupabaseManagementCapabilities(
    readIntegrationConfig(authorized.binding.config),
  );
  const sameProjectCapabilities =
    existingCapabilities?.projectRef === project.projectRef
      ? existingCapabilities
      : null;
  const managementCapabilities: SupabaseManagementCapabilities = {
    projectsRead: "verified",
    projectsWrite: sameProjectCapabilities?.projectsWrite ?? "unverified",
    secretsRead: "verified",
    databaseRead,
    databaseWrite: sameProjectCapabilities?.databaseWrite ?? "unverified",
    authWrite: sameProjectCapabilities?.authWrite ?? "unverified",
    projectRef: project.projectRef,
    checkedAt: new Date().toISOString(),
    issue: capabilityIssue,
  };
  return {
    runtimeConfig,
    providerStatus: project.providerStatus,
    config: {
      supabaseOrganizationId: project.organizationId,
      supabaseProjectId: project.projectId,
      supabaseProjectRef: project.projectRef,
      supabaseProjectName: project.projectName,
      supabaseProjectRegion: project.region,
      supabaseProjectUrl: runtimeConfig.url,
      supabasePublishableKey: runtimeConfig.publishableKey,
      supabaseBrowserKeyKind: browserKey.kind,
      supabaseBrowserKeyStatus: "ready",
      supabaseManagementCapabilities: managementCapabilities,
    },
  };
}
