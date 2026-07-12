import "server-only";

import { randomUUID } from "node:crypto";

import type { Prisma, PrismaClient } from "@prisma/client";

import type {
  IntegrationEnvironment,
  ProjectIntegrationView,
} from "@/features/integrations/contracts";
import {
  getIntegrationProvider,
  integrationRegistry,
  type IntegrationProvider,
} from "@/features/integrations/registry";
import {
  decryptIntegrationCredential,
  encryptIntegrationCredential,
  fingerprintCredential,
} from "@/features/integrations/server/credential-vault";
import { oauthProviderAvailability } from "@/features/integrations/server/oauth-provider";
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

export class IntegrationServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "IntegrationServiceError";
  }
}

function getCredentialKind(provider: IntegrationProvider) {
  if (provider.auth === "secret" || provider.auth === "publishable_key") {
    return "api_key" as const;
  }
  if (provider.auth === "oauth") return "access_token" as const;
  return null;
}

function getInitialStatus(
  provider: IntegrationProvider,
  credential: CredentialInput | undefined,
) {
  if (provider.policyStatus === "blocked") return "blocked" as const;
  if (provider.auth === "none") return "ready" as const;
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
  return {
    id: binding.id,
    projectId: binding.chatId,
    providerId: binding.providerId,
    environment: binding.environment as IntegrationEnvironment,
    status: binding.status as ProjectIntegrationView["status"],
    createdAt: binding.createdAt.toISOString(),
    updatedAt: binding.updatedAt.toISOString(),
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
  const oauthAvailability = oauthProviderAvailability();
  return integrationRegistry.map((provider) => ({
    id: provider.id,
    name: provider.name,
    capabilities: [...provider.capabilities],
    auth: provider.auth,
    runtime: provider.runtime,
    policyStatus: provider.policyStatus,
    commercialUse: provider.commercialUse,
    docsUrl: provider.docsUrl,
    credentialKind: getCredentialKind(provider),
    oauthAvailable:
      provider.id === "github" || provider.id === "vercel"
        ? oauthAvailability[provider.id]
        : false,
  }));
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
  if (bindings.length === 0) return "";

  return [
    "=== CONNECTED PROJECT INTEGRATIONS ===",
    "These project-scoped connections are stored in Squid's encrypted server vault. Never request, reveal, or emit their credentials.",
    ...bindings.map((binding) => {
      const provider = getIntegrationProvider(binding.providerId);
      return `- ${provider?.name ?? binding.providerId} [${binding.providerId}]: environment=${binding.environment}; status=${binding.status}; auth=${binding.connection.authType}; health=${binding.connection.lastHealthStatus ?? "not_checked"}; connection=${binding.connection.displayName}.`;
    }),
    "Treat a ready connection as satisfying credential setup during planning. A configured or needs_attention connection still requires a successful health check.",
    "Generated browser code must still never contain credentials. Reference the providerId in integrations.ts and keep secret-bearing operations behind a server adapter.",
    "=== END CONNECTED PROJECT INTEGRATIONS ===",
  ].join("\n");
}

export async function completeOAuthProjectIntegration({
  projectId,
  userId,
  providerId,
  environment,
  accessToken,
  scopes,
  metadata,
}: {
  projectId: string;
  userId: string;
  providerId: "github" | "vercel";
  environment: IntegrationEnvironment;
  accessToken: string;
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
    const encrypted = encryptIntegrationCredential({
      value: accessToken,
      userId,
      connectionId,
      kind: "access_token",
    });

    const connection = existing
      ? await tx.integrationConnection.update({
          where: { id: connectionId },
          data: {
            status: "configured",
            scopes,
            metadata: metadata as Prisma.InputJsonValue,
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
            status: "configured",
            scopes,
            metadata: metadata as Prisma.InputJsonValue,
          },
        });
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
    const binding = existing
      ? await tx.projectIntegration.update({
          where: { id: existing.id },
          data: { status: "configured" },
        })
      : await tx.projectIntegration.create({
          data: {
            chatId: projectId,
            connectionId: connection.id,
            providerId,
            environment,
            status: "configured",
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

  return {
    providers: providerSummaries(),
    integrations: bindings.map(serializeBinding),
  };
}

export async function createProjectIntegration({
  projectId,
  userId,
  providerId,
  environment,
  displayName,
  credential,
}: {
  projectId: string;
  userId: string;
  providerId: string;
  environment: IntegrationEnvironment;
  displayName?: string;
  credential?: CredentialInput;
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

  const expectedCredentialKind = getCredentialKind(provider);
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
}: {
  projectId: string;
  bindingId: string;
  userId: string;
  displayName?: string;
  credential?: CredentialInput;
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
    const expectedCredentialKind = getCredentialKind(provider);
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
      data: { status },
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

async function requestProviderHealth({
  provider,
  credential,
  fetchImpl,
}: {
  provider: IntegrationProvider;
  credential: string | null;
  fetchImpl: typeof fetch;
}) {
  if (provider.auth === "none") {
    return { ok: true, message: "No credential is required." };
  }
  if (!credential) {
    return { ok: false, message: "A credential is required before testing." };
  }

  const checks: Record<
    string,
    { url: string; headers: Record<string, string> }
  > = {
    stripe: {
      url: "https://api.stripe.com/v1/account",
      headers: { Authorization: `Bearer ${credential}` },
    },
    resend: {
      url: "https://api.resend.com/domains?limit=1",
      headers: { Authorization: `Bearer ${credential}` },
    },
    coingecko: {
      url: "https://api.coingecko.com/api/v3/ping",
      headers: { "x-cg-demo-api-key": credential },
    },
    github: {
      url: "https://api.github.com/user",
      headers: {
        Authorization: `Bearer ${credential}`,
        Accept: "application/vnd.github+json",
      },
    },
    vercel: {
      url: "https://api.vercel.com/v2/user",
      headers: { Authorization: `Bearer ${credential}` },
    },
    supabase: {
      url: "https://api.supabase.com/v1/projects",
      headers: { Authorization: `Bearer ${credential}` },
    },
  };
  const check = checks[provider.id];
  if (!check) {
    return {
      ok: true,
      message:
        "Credential decrypted successfully; no live health adapter is available yet.",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetchImpl(check.url, {
      method: "GET",
      headers: check.headers,
      signal: controller.signal,
      cache: "no-store",
    });
    return response.ok
      ? { ok: true, message: "Provider accepted the configured credential." }
      : {
          ok: false,
          message: `Provider rejected the health check with HTTP ${response.status}.`,
        };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error && error.name === "AbortError"
          ? "Provider health check timed out."
          : "Provider health check could not be completed.",
    };
  } finally {
    clearTimeout(timeout);
  }
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
