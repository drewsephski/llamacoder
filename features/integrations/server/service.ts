import "server-only";

import { randomUUID } from "node:crypto";

import type { Prisma, PrismaClient } from "@prisma/client";

import type {
  IntegrationEnvironment,
  ProjectIntegrationView,
} from "@/features/integrations/contracts";
import {
  buildIntegrationProviderSummaries,
  getIntegrationCredentialKind,
} from "@/features/integrations/catalog";
import {
  buildIntegrationProviderGuidance,
  getIntegrationProvider,
  type IntegrationProvider,
} from "@/features/integrations/registry";
import {
  decryptIntegrationCredential,
  encryptIntegrationCredential,
  fingerprintCredential,
} from "@/features/integrations/server/credential-vault";
import {
  oauthProviderAvailability,
  type OAuthProviderId,
} from "@/features/integrations/server/oauth-provider";
import { IntegrationServiceError } from "@/features/integrations/server/integration-error";
import { providerFetch } from "@/features/integrations/server/provider-client";
import {
  requestProviderHealth,
  requestSupabaseManagementCapabilities,
} from "@/features/integrations/server/provider-health";
import {
  getSupabaseProviderAuthorization,
  supabaseTokenMetadata,
} from "@/features/integrations/server/supabase-oauth-tokens";
import { buildSupabaseBrowserRuntimeState } from "@/features/integrations/supabase-browser-runtime";
import {
  buildAuthenticatedTasksGenerationContext,
  getAuthenticatedTasksBackendPlan,
  readSupabaseAuthState,
  readSupabaseBackendState,
} from "@/features/integrations/supabase-backend";
import {
  hasSupabaseCapabilityStatus,
  preserveVerifiedSupabaseWriteCapabilities,
  readSupabaseManagementCapabilities,
} from "@/features/integrations/supabase-management-capabilities";
import { getPrisma } from "@/lib/prisma";

type CredentialInput = {
  kind: "api_key" | "access_token";
  value: string;
};

type ProjectBindingWithConnection = Prisma.ProjectIntegrationGetPayload<{
  include: {
    connection: { include: { credentials: { select: { id: true } } } };
  };
}>;

export { IntegrationServiceError } from "@/features/integrations/server/integration-error";

function getInitialStatus(
  provider: IntegrationProvider,
  credential: CredentialInput | undefined,
) {
  if (provider.policyStatus === "blocked") return "blocked" as const;
  if (provider.auth === "none") return "configured" as const;
  return credential
    ? ("configured" as const)
    : ("authorization_required" as const);
}

async function requireOwnedProject(
  prisma: PrismaClient | Prisma.TransactionClient,
  projectId: string,
  userId: string,
) {
  const project = await prisma.chat.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });
  if (!project) {
    throw new IntegrationServiceError(
      "PROJECT_NOT_FOUND",
      "Project not found or access was denied.",
      404,
    );
  }
}

function serializeBinding(
  binding: ProjectBindingWithConnection,
): ProjectIntegrationView {
  const storedConfig =
    binding.config &&
    typeof binding.config === "object" &&
    !Array.isArray(binding.config)
      ? (binding.config as Record<string, unknown>)
      : null;
  const publicConfig = storedConfig ? { ...storedConfig } : null;
  if (publicConfig) {
    delete publicConfig.supabaseManagementCapabilities;
    delete publicConfig.supabaseBackend;
  }
  const capabilities = readSupabaseManagementCapabilities(storedConfig);
  const storedBackend = readSupabaseBackendState(storedConfig);
  const currentPlan = getAuthenticatedTasksBackendPlan();
  const hasCurrentPlan =
    storedBackend &&
    "plan" in storedBackend &&
    storedBackend.plan.migrationChecksum === currentPlan.migrationChecksum;
  const hasBrowserConfiguration = Boolean(
    storedConfig?.supabaseProjectRef &&
      storedConfig?.supabaseProjectUrl &&
      (storedConfig?.supabasePublishableKey || storedConfig?.supabaseAnonKey),
  );
  const supabaseBackend =
    binding.providerId !== "supabase"
      ? null
      : !binding.connection.credentials.length
        ? ({ status: "not_connected" } as const)
        : capabilities &&
            hasSupabaseCapabilityStatus(
              capabilities,
              "reauthorization_required",
            )
          ? ({
              status: "reauthorization_required",
              plan: currentPlan,
            } as const)
          : hasCurrentPlan
            ? storedBackend
            : hasBrowserConfiguration
              ? ({ status: "approval_required", plan: currentPlan } as const)
              : ({ status: "provisioning" } as const);
  return {
    id: binding.id,
    projectId: binding.chatId,
    providerId: binding.providerId,
    environment: binding.environment as IntegrationEnvironment,
    status: binding.status as ProjectIntegrationView["status"],
    createdAt: binding.createdAt.toISOString(),
    updatedAt: binding.updatedAt.toISOString(),
    config: publicConfig,
    supabaseManagementCapabilities:
      binding.providerId === "supabase" ? capabilities : null,
    supabaseBackend,
    connection: {
      id: binding.connection.id,
      displayName: binding.connection.displayName,
      authType: binding.connection.authType,
      status: binding.connection
        .status as ProjectIntegrationView["connection"]["status"],
      hasCredential: binding.connection.credentials.length > 0,
      lastHealthStatus: binding.connection.lastHealthStatus,
      lastHealthMessage: binding.connection.lastHealthMessage,
      lastHealthCheckAt:
        binding.connection.lastHealthCheckAt?.toISOString() ?? null,
    },
  };
}

function providerSummaries() {
  return buildIntegrationProviderSummaries({
    oauthAvailability: oauthProviderAvailability(),
  });
}

function getOperationPhase(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  const phase = (metadata as Record<string, unknown>).phase;
  return typeof phase === "string" ? phase : null;
}

function supabaseCapabilityHealthMessage(
  issue: NonNullable<
    ReturnType<typeof readSupabaseManagementCapabilities>
  >["issue"],
) {
  switch (issue) {
    case "connection_expired":
      return "The Supabase Management connection expired. Reconnect Supabase.";
    case "insufficient_permissions":
      return "Reconnect Supabase to grant the required Management API access.";
    case "rate_limited":
      return "Supabase temporarily rate-limited the capability check.";
    case "provider_unavailable":
      return "Supabase is temporarily unavailable for capability checks.";
    case "project_unavailable":
      return "The bound Supabase project is no longer available.";
    default:
      return "Supabase Management API access is ready.";
  }
}

export async function assertIntegrationProjectAccess({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}) {
  await requireOwnedProject(getPrisma(), projectId, userId);
}

export async function getConnectedIntegrationPromptContext({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}) {
  const bindings = await getPrisma().projectIntegration.findMany({
    where: { chatId: projectId, connection: { userId } },
    select: {
      providerId: true,
      environment: true,
      status: true,
      config: true,
      connection: {
        select: {
          displayName: true,
          authType: true,
          lastHealthStatus: true,
        },
      },
    },
    orderBy: [{ environment: "asc" }, { providerId: "asc" }],
  });
  if (bindings.length === 0) {
    return { prompt: "", providerIds: [], requiresServerRuntime: false };
  }

  const providerIds = Array.from(
    new Set(bindings.map((binding) => binding.providerId)),
  );
  const providers = providerIds
    .map(getIntegrationProvider)
    .filter((provider): provider is IntegrationProvider => provider !== null);
  const prompt = [
    "=== CONNECTED PROJECT INTEGRATIONS ===",
    "The user explicitly selected these project-scoped APIs. Every selected provider is mandatory in the plan and generated app. Do not omit or substitute one, even when the latest user message does not mention it again.",
    "Use a selected API as the primary source for every capability and live value it provides. Fetch that data through the reviewed client or server adapter at runtime; never replace it with web-search results, remembered facts, or a hard-coded snapshot.",
    "Web research may supplement a selected API only when the user explicitly requests search, the app needs external context the API does not return, or the reviewed provider contract is missing or ambiguous. Search is not a substitute for calling the selected API.",
    "Structured interview labels such as '(Recommended)' describe product choices; they are never themselves web-search requests or search queries.",
    "Before planning or generating, confirm that the user's prompt gives every selected API a specific user-visible job. If it does not, propose a few concrete ways to combine the app idea with the selected APIs, recommend the strongest direction first, and ask the user to choose.",
    "Connections are stored in Squid's encrypted server vault; never request, reveal, or emit their credentials.",
    ...bindings.map((binding) => {
      const provider = getIntegrationProvider(binding.providerId);
      return `- ${provider?.name ?? binding.providerId} [${binding.providerId}]: environment=${binding.environment}; status=${binding.status}; auth=${binding.connection.authType}; health=${binding.connection.lastHealthStatus ?? "not_checked"}; connection=${binding.connection.displayName}.`;
    }),
    "Treat a ready connection as satisfying credential setup during planning. A configured or needs_attention connection still requires a successful health check and an honest setup-required UI, but it must not be dropped from the implementation.",
    "Generated browser code must still never contain credentials. Reference the providerId in integrations.ts and keep secret-bearing operations behind a server adapter.",
    "=== END CONNECTED PROJECT INTEGRATIONS ===",
    buildIntegrationProviderGuidance(providerIds),
    ...bindings.flatMap((binding) => {
      if (binding.providerId !== "supabase") return [];
      const backend = readSupabaseBackendState(binding.config);
      return binding.status === "ready" &&
        backend?.status === "ready" &&
        backend.plan.migrationChecksum ===
          getAuthenticatedTasksBackendPlan().migrationChecksum
        ? [
            buildAuthenticatedTasksGenerationContext({
              authMode: readSupabaseAuthState(binding.config)?.mode ?? null,
            }),
          ]
        : [
            "Supabase browser runtime may be connected, but the authenticated_tasks backend is not verified ready. Do not claim working task persistence or invent SQL. The user must approve and complete Squid's server-owned backend template first.",
            `For the exact signed-in personal tasks use case, the model may request only this typed plan and must never provide executable SQL: ${JSON.stringify(getAuthenticatedTasksBackendPlan())}`,
          ];
    }),
  ].join("\n");

  return {
    prompt,
    providerIds,
    requiresServerRuntime: providers.some(
      (provider) =>
        provider.id !== "supabase" &&
        (provider.runtime === "server" ||
          provider.auth === "secret" ||
          provider.auth === "oauth"),
    ),
  };
}

export async function completeOAuthProjectIntegration({
  projectId,
  userId,
  providerId,
  environment,
  accessToken,
  refreshToken,
  accessTokenExpiresAt,
  tokenType,
  scopes,
  metadata,
}: {
  projectId: string;
  userId: string;
  providerId: OAuthProviderId;
  environment: IntegrationEnvironment;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: string;
  tokenType?: string;
  scopes: string[];
  metadata: Record<string, string | null>;
}) {
  const provider = getIntegrationProvider(providerId);
  if (!provider || provider.auth !== "oauth") {
    throw new IntegrationServiceError(
      "INVALID_OAUTH_PROVIDER",
      "This provider does not support the integration OAuth flow.",
      400,
    );
  }

  const prisma = getPrisma();
  return prisma.$transaction(async (tx) => {
    await requireOwnedProject(tx, projectId, userId);
    const existing = await tx.projectIntegration.findUnique({
      where: {
        chatId_providerId_environment: {
          chatId: projectId,
          providerId,
          environment,
        },
      },
      include: { connection: true },
    });
    const connectionId = existing?.connectionId ?? randomUUID();
    const encrypted = accessToken
      ? encryptIntegrationCredential({
          value: accessToken,
          userId,
          connectionId,
          kind: "access_token",
        })
      : null;
    const encryptedRefreshToken = refreshToken
      ? encryptIntegrationCredential({
          value: refreshToken,
          userId,
          connectionId,
          kind: "refresh_token",
        })
      : null;
    const sanitizedMetadata: Record<string, string | null> = { ...metadata };
    delete sanitizedMetadata[supabaseTokenMetadata.legacyRefreshToken];
    if (providerId === "supabase") {
      sanitizedMetadata[supabaseTokenMetadata.accessTokenExpiresAt] =
        accessTokenExpiresAt ?? null;
      sanitizedMetadata[supabaseTokenMetadata.tokenType] = tokenType ?? null;
    }
    const connectionStatus = accessToken ? "configured" : "ready";
    const existingBindingConfig =
      existing?.config &&
      typeof existing.config === "object" &&
      !Array.isArray(existing.config)
        ? { ...(existing.config as Record<string, unknown>) }
        : null;
    if (existingBindingConfig) {
      delete existingBindingConfig.supabaseManagementCapabilities;
    }

    const connection = existing
      ? await tx.integrationConnection.update({
          where: { id: connectionId },
          data: {
            status: connectionStatus,
            scopes,
            metadata: sanitizedMetadata as Prisma.InputJsonValue,
            lastHealthStatus: null,
            lastHealthMessage: null,
            lastHealthCheckAt: null,
          },
        })
      : await tx.integrationConnection.create({
          data: {
            id: connectionId,
            userId,
            providerId,
            displayName: provider.name,
            authType: "oauth",
            status: connectionStatus,
            scopes,
            metadata: sanitizedMetadata as Prisma.InputJsonValue,
          },
        });
    if (encrypted) {
      await tx.integrationCredential.upsert({
        where: {
          connectionId_kind: { connectionId, kind: "access_token" },
        },
        create: {
          connectionId,
          kind: "access_token",
          ...encrypted,
        },
        update: encrypted,
      });
    }
    if (providerId === "supabase" && encryptedRefreshToken) {
      await tx.integrationCredential.upsert({
        where: {
          connectionId_kind: { connectionId, kind: "refresh_token" },
        },
        create: {
          connectionId,
          kind: "refresh_token",
          ...encryptedRefreshToken,
        },
        update: encryptedRefreshToken,
      });
    } else if (providerId === "supabase") {
      await tx.integrationCredential.deleteMany({
        where: { connectionId, kind: "refresh_token" },
      });
    }
    const binding = existing
      ? await tx.projectIntegration.update({
          where: { id: existing.id },
          data: {
            status: connectionStatus,
            ...(providerId === "supabase"
              ? {
                  config: existingBindingConfig
                    ? (existingBindingConfig as Prisma.InputJsonValue)
                    : ({} as Prisma.InputJsonValue),
                }
              : {}),
          },
        })
      : await tx.projectIntegration.create({
          data: {
            chatId: projectId,
            connectionId: connection.id,
            providerId,
            environment,
            status: connectionStatus,
          },
        });
    await tx.integrationAuditEvent.create({
      data: {
        userId,
        providerId,
        action: existing ? "oauth_reauthorized" : "oauth_connected",
        environment,
        connectionId,
        projectIntegrationId: binding.id,
        metadata: { scopes } as Prisma.InputJsonValue,
      },
    });

    const completed = await tx.projectIntegration.findUniqueOrThrow({
      where: { id: binding.id },
      include: {
        connection: { include: { credentials: { select: { id: true } } } },
      },
    });
    return serializeBinding(completed);
  });
}

export async function getIntegrationWorkspace({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}) {
  const prisma = getPrisma();
  await requireOwnedProject(prisma, projectId, userId);
  const bindings = await prisma.projectIntegration.findMany({
    where: { chatId: projectId, connection: { userId } },
    include: {
      connection: { include: { credentials: { select: { id: true } } } },
    },
    orderBy: [{ environment: "asc" }, { createdAt: "asc" }],
  });
  const recentOperations = await prisma.integrationOperation.findMany({
    where: { chatId: projectId, userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const supabaseBinding =
    bindings.find(
      (binding) =>
        binding.providerId === "supabase" &&
        binding.environment === "development",
    ) ?? bindings.find((binding) => binding.providerId === "supabase");
  const isSupabaseProvisioning = Boolean(
    supabaseBinding &&
      recentOperations.some(
        (operation) =>
          operation.projectIntegrationId === supabaseBinding.id &&
          operation.kind === "supabase_provision" &&
          operation.status === "running",
      ),
  );

  return {
    providers: providerSummaries(),
    integrations: bindings.map(serializeBinding),
    recentOperations: recentOperations.map((operation) => ({
      id: operation.id,
      projectIntegrationId: operation.projectIntegrationId,
      providerId: operation.providerId,
      kind: operation.kind,
      status: operation.status,
      phase: getOperationPhase(operation.metadata),
      externalId: operation.externalId,
      url: operation.url,
      commitSha: operation.commitSha,
      errorMessage: operation.errorMessage,
      createdAt: operation.createdAt.toISOString(),
      completedAt: operation.completedAt?.toISOString() ?? null,
    })),
    browserRuntime: {
      supabase: buildSupabaseBrowserRuntimeState({
        integrationConfig: supabaseBinding?.config,
        hasProjectBinding: Boolean(supabaseBinding),
        isProvisioning: isSupabaseProvisioning,
      }),
    },
  };
}

export async function createProjectIntegration({
  projectId,
  userId,
  providerId,
  environment,
  displayName,
  credential,
  config,
}: {
  projectId: string;
  userId: string;
  providerId: string;
  environment: IntegrationEnvironment;
  displayName?: string;
  credential?: CredentialInput;
  config?: Record<string, unknown>;
}) {
  const provider = getIntegrationProvider(providerId);
  if (!provider) {
    throw new IntegrationServiceError(
      "UNKNOWN_PROVIDER",
      "This integration provider is not supported.",
      400,
    );
  }
  if (provider.policyStatus === "blocked") {
    throw new IntegrationServiceError(
      "PROVIDER_BLOCKED",
      `${provider.name} is blocked by Squid's integration policy.`,
      409,
    );
  }

  const expectedCredentialKind = getIntegrationCredentialKind(provider);
  if (credential && credential.kind !== expectedCredentialKind) {
    throw new IntegrationServiceError(
      "INVALID_CREDENTIAL_KIND",
      `${provider.name} requires ${expectedCredentialKind === "api_key" ? "an API key" : "an access token"}.`,
      400,
    );
  }

  const prisma = getPrisma();
  return prisma.$transaction(async (tx) => {
    await requireOwnedProject(tx, projectId, userId);
    const existing = await tx.projectIntegration.findUnique({
      where: {
        chatId_providerId_environment: {
          chatId: projectId,
          providerId,
          environment,
        },
      },
      select: { id: true },
    });
    if (existing) {
      throw new IntegrationServiceError(
        "INTEGRATION_EXISTS",
        `${provider.name} is already configured for ${environment}.`,
        409,
      );
    }

    const connectionId = randomUUID();
    const status = getInitialStatus(provider, credential);
    const encrypted = credential
      ? encryptIntegrationCredential({
          value: credential.value,
          userId,
          connectionId,
          kind: credential.kind,
        })
      : null;
    const connection = await tx.integrationConnection.create({
      data: {
        id: connectionId,
        userId,
        providerId,
        displayName: displayName || provider.name,
        authType: provider.auth,
        status,
        credentials: encrypted
          ? {
              create: {
                kind: credential!.kind,
                ...encrypted,
              },
            }
          : undefined,
      },
    });
    const binding = await tx.projectIntegration.create({
      data: {
        chatId: projectId,
        connectionId: connection.id,
        providerId,
        environment,
        status,
        config: config ? (config as Prisma.InputJsonValue) : undefined,
      },
    });
    await tx.integrationAuditEvent.create({
      data: {
        userId,
        providerId,
        action: "connected",
        environment,
        connectionId: connection.id,
        projectIntegrationId: binding.id,
        metadata: credential
          ? { credentialFingerprint: fingerprintCredential(credential.value) }
          : undefined,
      },
    });

    const created = await tx.projectIntegration.findUniqueOrThrow({
      where: { id: binding.id },
      include: {
        connection: { include: { credentials: { select: { id: true } } } },
      },
    });
    return serializeBinding(created);
  });
}

export async function updateProjectIntegration({
  projectId,
  bindingId,
  userId,
  displayName,
  credential,
  config,
}: {
  projectId: string;
  bindingId: string;
  userId: string;
  displayName?: string;
  credential?: CredentialInput;
  config?: Record<string, unknown>;
}) {
  const prisma = getPrisma();
  return prisma.$transaction(async (tx) => {
    await requireOwnedProject(tx, projectId, userId);
    const binding = await tx.projectIntegration.findFirst({
      where: { id: bindingId, chatId: projectId, connection: { userId } },
      include: { connection: true },
    });
    if (!binding) {
      throw new IntegrationServiceError(
        "INTEGRATION_NOT_FOUND",
        "Integration not found.",
        404,
      );
    }

    const provider = getIntegrationProvider(binding.providerId);
    if (!provider) {
      throw new IntegrationServiceError(
        "UNKNOWN_PROVIDER",
        "This integration provider is no longer supported.",
        409,
      );
    }
    const expectedCredentialKind = getIntegrationCredentialKind(provider);
    if (credential && credential.kind !== expectedCredentialKind) {
      throw new IntegrationServiceError(
        "INVALID_CREDENTIAL_KIND",
        `${provider.name} requires ${expectedCredentialKind === "api_key" ? "an API key" : "an access token"}.`,
        400,
      );
    }

    if (credential) {
      const encrypted = encryptIntegrationCredential({
        value: credential.value,
        userId,
        connectionId: binding.connectionId,
        kind: credential.kind,
      });
      await tx.integrationCredential.upsert({
        where: {
          connectionId_kind: {
            connectionId: binding.connectionId,
            kind: credential.kind,
          },
        },
        create: {
          connectionId: binding.connectionId,
          kind: credential.kind,
          ...encrypted,
        },
        update: encrypted,
      });
    }

    const status = credential ? "configured" : binding.status;
    await tx.integrationConnection.update({
      where: { id: binding.connectionId },
      data: {
        displayName,
        status,
        lastHealthStatus: credential ? null : undefined,
        lastHealthMessage: credential ? null : undefined,
        lastHealthCheckAt: credential ? null : undefined,
      },
    });
    await tx.projectIntegration.update({
      where: { id: binding.id },
      data: {
        status,
        config: config ? (config as Prisma.InputJsonValue) : undefined,
      },
    });
    await tx.integrationAuditEvent.create({
      data: {
        userId,
        providerId: binding.providerId,
        action: credential ? "credential_rotated" : "configuration_updated",
        environment: binding.environment,
        connectionId: binding.connectionId,
        projectIntegrationId: binding.id,
        metadata: credential
          ? { credentialFingerprint: fingerprintCredential(credential.value) }
          : undefined,
      },
    });

    const updated = await tx.projectIntegration.findUniqueOrThrow({
      where: { id: binding.id },
      include: {
        connection: { include: { credentials: { select: { id: true } } } },
      },
    });
    return serializeBinding(updated);
  });
}

export async function testProjectIntegration({
  projectId,
  bindingId,
  userId,
  fetchImpl = fetch,
}: {
  projectId: string;
  bindingId: string;
  userId: string;
  fetchImpl?: typeof fetch;
}) {
  const prisma = getPrisma();
  await requireOwnedProject(prisma, projectId, userId);
  const binding = await prisma.projectIntegration.findFirst({
    where: { id: bindingId, chatId: projectId, connection: { userId } },
    include: { connection: { include: { credentials: true } } },
  });
  if (!binding) {
    throw new IntegrationServiceError(
      "INTEGRATION_NOT_FOUND",
      "Integration not found.",
      404,
    );
  }
  const provider = getIntegrationProvider(binding.providerId);
  if (!provider || provider.policyStatus === "blocked") {
    throw new IntegrationServiceError(
      "PROVIDER_BLOCKED",
      "This provider cannot be tested because it is blocked or unavailable.",
      409,
    );
  }

  if (provider.id === "supabase") {
    const authorization = await getSupabaseProviderAuthorization({
      connection: binding.connection,
      fetchImpl,
    });
    const existingConfig =
      binding.config &&
      typeof binding.config === "object" &&
      !Array.isArray(binding.config)
        ? (binding.config as Record<string, unknown>)
        : {};
    const projectRefValue = existingConfig.supabaseProjectRef;
    const projectRef =
      typeof projectRefValue === "string" && projectRefValue.trim()
        ? projectRefValue.trim()
        : null;
    const observedCapabilities = await requestSupabaseManagementCapabilities({
      credential: authorization.accessToken,
      projectRef,
      fetchImpl,
      request: (url) =>
        providerFetch("supabase", authorization, url, {}, fetchImpl),
    });
    const capabilities = preserveVerifiedSupabaseWriteCapabilities({
      existing: readSupabaseManagementCapabilities(existingConfig),
      observed: observedCapabilities,
    });
    const hasBlockingCapability =
      hasSupabaseCapabilityStatus(capabilities, "reauthorization_required") ||
      hasSupabaseCapabilityStatus(capabilities, "error") ||
      hasSupabaseCapabilityStatus(capabilities, "missing");
    const ready =
      capabilities.projectsRead === "verified" && !hasBlockingCapability;
    const now = new Date();
    const status = ready ? "ready" : "needs_attention";
    const message = supabaseCapabilityHealthMessage(capabilities.issue);

    await prisma.$transaction([
      prisma.integrationConnection.update({
        where: { id: binding.connectionId },
        data: {
          status,
          lastHealthStatus: ready ? "healthy" : "failed",
          lastHealthMessage: message,
          lastHealthCheckAt: now,
        },
      }),
      prisma.projectIntegration.update({
        where: { id: binding.id },
        data: {
          status,
          config: {
            ...existingConfig,
            supabaseManagementCapabilities: capabilities,
          } as Prisma.InputJsonValue,
        },
      }),
      prisma.integrationAuditEvent.create({
        data: {
          userId,
          providerId: binding.providerId,
          action: ready
            ? "supabase_capabilities_checked"
            : "supabase_capabilities_attention_required",
          environment: binding.environment,
          connectionId: binding.connectionId,
          projectIntegrationId: binding.id,
          metadata: {
            projectsRead: capabilities.projectsRead,
            projectsWrite: capabilities.projectsWrite,
            secretsRead: capabilities.secretsRead,
            databaseRead: capabilities.databaseRead,
            databaseWrite: capabilities.databaseWrite,
            authWrite: capabilities.authWrite,
            issue: capabilities.issue,
          },
        },
      }),
    ]);

    const updated = await prisma.projectIntegration.findUniqueOrThrow({
      where: { id: binding.id },
      include: {
        connection: { include: { credentials: { select: { id: true } } } },
      },
    });
    return serializeBinding(updated);
  }
  const stored = binding.connection.credentials[0] ?? null;
  const credential = stored
    ? decryptIntegrationCredential({
        credential: stored,
        userId,
        connectionId: binding.connectionId,
        kind: stored.kind,
      })
    : null;
  const result = await requestProviderHealth({
    provider,
    credential,
    metadata: binding.connection.metadata,
    fetchImpl,
  });
  const now = new Date();
  const status = result.ok ? "ready" : "needs_attention";

  await prisma.$transaction([
    prisma.integrationConnection.update({
      where: { id: binding.connectionId },
      data: {
        status,
        lastHealthStatus: result.ok ? "healthy" : "failed",
        lastHealthMessage: result.message,
        lastHealthCheckAt: now,
      },
    }),
    prisma.projectIntegration.update({
      where: { id: binding.id },
      data: { status },
    }),
    prisma.integrationAuditEvent.create({
      data: {
        userId,
        providerId: binding.providerId,
        action: result.ok ? "health_check_passed" : "health_check_failed",
        environment: binding.environment,
        connectionId: binding.connectionId,
        projectIntegrationId: binding.id,
      },
    }),
  ]);

  const updated = await prisma.projectIntegration.findUniqueOrThrow({
    where: { id: binding.id },
    include: {
      connection: { include: { credentials: { select: { id: true } } } },
    },
  });
  return serializeBinding(updated);
}

export async function disconnectProjectIntegration({
  projectId,
  bindingId,
  userId,
}: {
  projectId: string;
  bindingId: string;
  userId: string;
}) {
  const prisma = getPrisma();
  await prisma.$transaction(async (tx) => {
    await requireOwnedProject(tx, projectId, userId);
    const binding = await tx.projectIntegration.findFirst({
      where: { id: bindingId, chatId: projectId, connection: { userId } },
    });
    if (!binding) {
      throw new IntegrationServiceError(
        "INTEGRATION_NOT_FOUND",
        "Integration not found.",
        404,
      );
    }

    await tx.integrationAuditEvent.create({
      data: {
        userId,
        providerId: binding.providerId,
        action: "disconnected",
        environment: binding.environment,
        connectionId: binding.connectionId,
        projectIntegrationId: binding.id,
      },
    });
    await tx.projectIntegration.delete({ where: { id: binding.id } });
    const remainingBindings = await tx.projectIntegration.count({
      where: { connectionId: binding.connectionId },
    });
    if (remainingBindings === 0) {
      await tx.integrationConnection.delete({
        where: { id: binding.connectionId },
      });
    }
  });
}
