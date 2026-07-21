import "server-only";

import { randomBytes } from "node:crypto";
import { z } from "zod";

import type { Prisma } from "@prisma/client";

import {
  getAuthorizedProjectIntegration,
  providerFetch,
} from "@/features/integrations/server/provider-client";
import { IntegrationServiceError } from "@/features/integrations/server/service";

const organizationSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  slug: z.string().optional(),
});

const organizationListPayloadSchema = z.union([
  z.array(organizationSchema),
  z.object({ organizations: z.array(organizationSchema), data: z.never().optional() }),
  z.object({ data: z.array(organizationSchema), organizations: z.never().optional() }),
]);

const projectSchema = z.object({
  id: z.string(),
  ref: z.string().optional(),
  name: z.string().default(""),
  status: z.string().optional(),
  region: z.string().optional(),
  endpoint: z.string().optional(),
  organization_id: z.string().optional(),
  dns_host: z.string().optional(),
}).passthrough();

const apiKeySchema = z.object({
  name: z.string().default(""),
  type: z.string().optional(),
  api_key: z.string().nullable().optional(),
  key: z.string().nullable().optional(),
}).passthrough();

const apiKeysPayloadSchema = z.union([
  z.array(apiKeySchema),
  z.object({ api_keys: z.array(apiKeySchema) }),
  z.object({ keys: z.array(apiKeySchema) }),
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function sanitizeText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function fallbackDbPassword() {
  const base = randomBytes(24).toString("base64url");
  const sanitized = base.replace(/[^a-zA-Z0-9]/g, "");
  return (sanitized.slice(0, 24) || "SupabaseStrongPass2026").padEnd(
    20,
    "p",
  );
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
  return ("organizations" in raw
    ? raw.organizations
    : "data" in raw
      ? raw.data
      : raw) as z.infer<typeof organizationSchema>[];
}

function parseProject(payload: unknown) {
  return projectSchema.parse(payload);
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

function getPublishableKey(candidates: z.infer<typeof apiKeySchema>[]) {
  for (const item of candidates) {
    const name = item.name.toLowerCase();
    const type = item.type?.toLowerCase() ?? "";
    const keyValue = sanitizeText(item.api_key) ?? sanitizeText(item.key);
    if (!keyValue) continue;
    if (type === "anon" || type === "public" || name.includes("anon")) {
      return keyValue;
    }
  }
  for (const item of candidates) {
    const keyValue = sanitizeText(item.api_key) ?? sanitizeText(item.key);
    if (keyValue && item.type?.toLowerCase() !== "service_role") {
      return keyValue;
    }
  }
  return null;
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

export async function listSupabaseOrganizations(input: {
  projectId: string;
  bindingId: string;
  userId: string;
}) {
  const authorized = await requireProviderIntegration(input);
  const payload = await providerFetch(
    "supabase",
    authorized.accessToken,
    "https://api.supabase.com/v1/organizations",
  );
  const organizations = normalizeOrganizationPayload(payload).map((organization) => {
    const name = organization.name || sanitizeText(organization.slug) || organization.id;
    return {
      id: organization.id,
      name,
      owner: sanitizeText(organization.slug) ?? undefined,
      url: sanitizeText(`https://app.supabase.com/organizations/${organization.slug ?? organization.id}`),
    };
  });
  if (organizations.length === 0) {
    throw new IntegrationServiceError(
      "SUPABASE_ORGANIZATIONS_EMPTY",
      "No Supabase organization is available for this account.",
      404,
    );
  }
  return organizations;
}

export async function provisionSupabaseProject(input: {
  projectId: string;
  bindingId: string;
  userId: string;
  organizationId?: string | null;
  region?: string | null;
  projectName?: string | null;
}): Promise<{
  operationStatus: "succeeded" | "running" | "failed";
  externalId: string | null;
  url: string | null;
  metadata: Prisma.InputJsonValue;
  config: Record<string, unknown>;
}> {
  const authorized = await requireProviderIntegration(input);
  const orgs = await listSupabaseOrganizations(input);
  const selectedOrg =
    input.organizationId?.trim()
      ? orgs.find((org) => org.id === input.organizationId!.trim())
      : undefined;
  const organizationId = selectedOrg?.id ?? orgs[0].id;
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
    authorized.accessToken,
    "https://api.supabase.com/v1/projects",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createPayload),
    },
  );
  const createdProject = parseProject(createdProjectPayload);
  const projectRef = createdProject.ref ?? createdProject.id;
  const projectPayload = await providerFetch(
    "supabase",
    authorized.accessToken,
    `https://api.supabase.com/v1/projects/${encodeURIComponent(projectRef)}`,
  );
  const project = parseProject(projectPayload);
  const keysPayload = await providerFetch(
    "supabase",
    authorized.accessToken,
    `https://api.supabase.com/v1/projects/${encodeURIComponent(projectRef)}/api-keys?reveal=true`,
  );
  const keys = parseApiKeys(keysPayload);
  const anonKey = getPublishableKey(keys);
  if (!isRecord(keysPayload)) {
    // no-op: keep payload schema validation to keep behavior explicit
  }
  if (!anonKey) {
    throw new IntegrationServiceError(
      "SUPABASE_KEY_MISSING",
      "Supabase project was created, but the publishable key could not be read.",
      502,
    );
  }
  const operationUrl = buildProjectUrl({
    ref: project.ref,
    endpoint: sanitizeText(project.endpoint),
    dnsHost: sanitizeText(project.dns_host),
  });
  const operationStatus =
    project.status === "ACTIVE_HEALTHY" ? "succeeded" : "running";
  const finalMetadata = {
    organizationId,
    organizationName: selectedOrg?.name,
    projectId: project.id,
    projectRef: project.ref ?? project.id,
    projectName: project.name,
    region: project.region ?? createPayload.region,
    status: project.status ?? null,
    url: operationUrl,
    hasSecretKey: false,
  };
  const config = {
    supabaseOrganizationId: organizationId,
    supabaseOrganizationName: selectedOrg?.name ?? null,
    supabaseProjectId: project.id,
    supabaseProjectRef: project.ref ?? project.id,
    supabaseProjectName: project.name,
    supabaseProjectRegion: project.region ?? createPayload.region,
    supabaseProjectUrl: operationUrl,
    supabaseAnonKey: anonKey,
  };
  return {
    operationStatus,
    externalId: project.ref ?? project.id,
    url: operationUrl,
    metadata: finalMetadata,
    config,
  };
}
