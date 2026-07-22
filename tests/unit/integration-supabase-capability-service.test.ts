import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requestCapabilities: vi.fn(),
  connectionCreate: vi.fn(),
  connectionUpdate: vi.fn(async () => ({})),
  credentialUpsert: vi.fn(async () => ({})),
  credentialDeleteMany: vi.fn(async () => ({ count: 0 })),
  integrationCreate: vi.fn(),
  integrationFindFirst: vi.fn(),
  integrationFindMany: vi.fn(),
  integrationFindUnique: vi.fn(),
  integrationFindUniqueOrThrow: vi.fn(),
  integrationUpdate: vi.fn(async () => ({})),
  auditCreate: vi.fn(async () => ({})),
}));

const now = new Date("2026-07-21T00:00:00.000Z");

const prismaMock = {
  chat: { findFirst: vi.fn(async () => ({ id: "project_1" })) },
  integrationConnection: {
    create: mocks.connectionCreate,
    update: mocks.connectionUpdate,
  },
  integrationCredential: {
    upsert: mocks.credentialUpsert,
    deleteMany: mocks.credentialDeleteMany,
  },
  projectIntegration: {
    create: mocks.integrationCreate,
    findFirst: mocks.integrationFindFirst,
    findMany: mocks.integrationFindMany,
    findUnique: mocks.integrationFindUnique,
    findUniqueOrThrow: mocks.integrationFindUniqueOrThrow,
    update: mocks.integrationUpdate,
  },
  integrationAuditEvent: { create: mocks.auditCreate },
  $transaction: vi.fn(
    async (
      input:
        | Array<Promise<unknown>>
        | ((tx: typeof prismaMock) => Promise<unknown>),
    ) => (typeof input === "function" ? input(prismaMock) : Promise.all(input)),
  ),
};

vi.mock("@/lib/prisma", () => ({ getPrisma: () => prismaMock }));
vi.mock("@/features/integrations/server/credential-vault", () => ({
  encryptIntegrationCredential: vi.fn(() => ({
    ciphertext: "encrypted",
    iv: "iv",
    authTag: "tag",
    keyVersion: 1,
  })),
  decryptIntegrationCredential: vi.fn(() => "management-token"),
  fingerprintCredential: vi.fn(() => "fingerprint"),
}));
vi.mock("@/features/integrations/server/provider-health", () => ({
  requestProviderHealth: vi.fn(),
  requestSupabaseManagementCapabilities: mocks.requestCapabilities,
}));
vi.mock("@/features/integrations/server/oauth-provider", () => ({
  oauthProviderAvailability: () => ({
    github: true,
    vercel: true,
    supabase: true,
  }),
}));
vi.mock("@/features/integrations/server/provider-client", () => ({
  providerFetch: vi.fn(async () => ({})),
}));
vi.mock("@/features/integrations/server/supabase-oauth-tokens", () => ({
  getSupabaseProviderAuthorization: vi.fn(async () => ({
    accessToken: "management-token",
    connectionId: "connection_1",
    userId: "user_1",
  })),
  supabaseTokenMetadata: {
    accessTokenExpiresAt: "supabaseAccessTokenExpiresAt",
    tokenType: "supabaseTokenType",
    legacyRefreshToken: "supabaseRefreshToken",
  },
}));

import {
  completeOAuthProjectIntegration,
  getConnectedIntegrationPromptContext,
  testProjectIntegration,
} from "@/features/integrations/server/service";
import { getAuthenticatedTasksBackendPlan } from "@/features/integrations/supabase-backend";

function storedBinding(config: Record<string, unknown> | null = null) {
  return {
    id: "binding_1",
    chatId: "project_1",
    connectionId: "connection_1",
    providerId: "supabase",
    environment: "development",
    status: "configured",
    config,
    createdAt: now,
    updatedAt: now,
    connection: {
      id: "connection_1",
      userId: "user_1",
      providerId: "supabase",
      displayName: "Supabase",
      authType: "oauth",
      status: "configured",
      scopes: [],
      metadata: {},
      lastHealthStatus: null,
      lastHealthMessage: null,
      lastHealthCheckAt: null,
      createdAt: now,
      updatedAt: now,
      credentials: [
        {
          id: "credential_1",
          kind: "access_token",
          connectionId: "connection_1",
          ciphertext: "encrypted",
          iv: "iv",
          authTag: "tag",
          keyVersion: 1,
          createdAt: now,
          updatedAt: now,
        },
      ],
    },
  };
}

describe("Supabase OAuth capability persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.integrationFindUnique.mockResolvedValue(null);
    mocks.connectionCreate.mockResolvedValue({ id: "connection_1" });
    mocks.integrationCreate.mockResolvedValue({ id: "binding_1" });
    mocks.integrationFindUniqueOrThrow.mockResolvedValue(storedBinding());
  });

  it("adds the constrained auth and CRUD contract only for a verified backend", async () => {
    mocks.integrationFindMany.mockResolvedValue([
      {
        providerId: "supabase",
        environment: "development",
        status: "ready",
        config: {
          supabaseBackend: {
            status: "ready",
            plan: getAuthenticatedTasksBackendPlan(),
            verifiedAt: "2026-07-21T00:00:00.000Z",
            verification: {
              table: true,
              columns: true,
              rowLevelSecurity: true,
              authenticatedGrants: true,
              ownershipPolicies: true,
              anonAccessRevoked: true,
            },
          },
        },
        connection: {
          displayName: "Supabase",
          authType: "oauth",
          lastHealthStatus: "healthy",
        },
      },
    ]);

    const result = await getConnectedIntegrationPromptContext({
      projectId: "project_1",
      userId: "user_1",
    });

    expect(result.requiresServerRuntime).toBe(false);
    expect(result.prompt).toContain(
      'import { supabase } from "@/lib/supabase";',
    );
    expect(result.prompt).toContain("email/password sign-up, login, logout");
    expect(result.prompt).toContain("set user_id to that user id");
    expect(result.prompt).not.toContain("create table");
    expect(result.prompt).not.toMatch(
      /management-token|sb_secret_actual_value|oauth-client-secret-value/,
    );
  });

  it("persists returned scopes as informational connection metadata", async () => {
    await completeOAuthProjectIntegration({
      projectId: "project_1",
      userId: "user_1",
      providerId: "supabase",
      environment: "development",
      accessToken: "management-token",
      refreshToken: "refresh-token",
      accessTokenExpiresAt: "2026-07-21T01:00:00.000Z",
      tokenType: "bearer",
      scopes: ["projects:read", "database:write"],
      metadata: { supabaseRefreshToken: "legacy-plaintext-token" },
    });

    expect(mocks.connectionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          scopes: ["projects:read", "database:write"],
        }),
      }),
    );
    expect(mocks.credentialUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ kind: "refresh_token" }),
      }),
    );
    expect(mocks.connectionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          metadata: expect.not.objectContaining({
            supabaseRefreshToken: expect.anything(),
          }),
        }),
      }),
    );
  });

  it("persists observed capabilities independently from an empty scope list", async () => {
    const binding = storedBinding({
      supabaseProjectRef: "project-ref",
      supabaseProjectUrl: "https://project-ref.supabase.co",
      supabasePublishableKey: "sb_publishable_project",
    });
    const capabilities = {
      projectsRead: "verified",
      projectsWrite: "unverified",
      secretsRead: "verified",
      databaseRead: "verified",
      databaseWrite: "unverified",
      projectRef: "project-ref",
      checkedAt: "2026-07-21T00:00:00.000Z",
      issue: null,
    };
    mocks.integrationFindFirst.mockResolvedValue(binding);
    mocks.requestCapabilities.mockResolvedValue(capabilities);
    mocks.integrationFindUniqueOrThrow.mockResolvedValue({
      ...binding,
      status: "ready",
      config: {
        supabaseProjectRef: "project-ref",
        supabaseProjectUrl: "https://project-ref.supabase.co",
        supabasePublishableKey: "sb_publishable_project",
        supabaseManagementCapabilities: capabilities,
      },
      connection: { ...binding.connection, status: "ready" },
    });

    const result = await testProjectIntegration({
      projectId: "project_1",
      bindingId: "binding_1",
      userId: "user_1",
    });

    expect(mocks.requestCapabilities).toHaveBeenCalledWith(
      expect.objectContaining({
        credential: "management-token",
        projectRef: "project-ref",
      }),
    );
    expect(mocks.integrationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "ready",
          config: expect.objectContaining({
            supabaseManagementCapabilities: expect.objectContaining({
              databaseRead: "verified",
              databaseWrite: "unverified",
            }),
          }),
        }),
      }),
    );
    expect(result.supabaseBackend).toMatchObject({
      status: "approval_required",
      plan: { template: "authenticated_tasks", destructive: false },
    });
    expect(result.config).not.toHaveProperty("supabaseManagementCapabilities");
    expect(result.config).not.toHaveProperty("supabaseBackend");
    expect(JSON.stringify(result)).not.toMatch(
      /management-token|raw provider response|service_role|sb_secret_/,
    );
  });

  it("preserves write capabilities already verified by live operations", async () => {
    const verifiedCapabilities = {
      projectsRead: "verified",
      projectsWrite: "verified",
      secretsRead: "verified",
      databaseRead: "verified",
      databaseWrite: "verified",
      projectRef: "project-ref",
      checkedAt: "2026-07-20T00:00:00.000Z",
      issue: null,
    } as const;
    const binding = storedBinding({
      supabaseProjectRef: "project-ref",
      supabaseManagementCapabilities: verifiedCapabilities,
    });
    mocks.integrationFindFirst.mockResolvedValue(binding);
    mocks.requestCapabilities.mockResolvedValue({
      ...verifiedCapabilities,
      projectsWrite: "unverified",
      databaseWrite: "unverified",
      checkedAt: "2026-07-21T00:00:00.000Z",
    });
    mocks.integrationFindUniqueOrThrow.mockResolvedValue({
      ...binding,
      status: "ready",
      connection: { ...binding.connection, status: "ready" },
    });

    await testProjectIntegration({
      projectId: "project_1",
      bindingId: "binding_1",
      userId: "user_1",
    });

    expect(mocks.integrationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          config: expect.objectContaining({
            supabaseManagementCapabilities: expect.objectContaining({
              projectsWrite: "verified",
              databaseWrite: "verified",
              checkedAt: "2026-07-21T00:00:00.000Z",
            }),
          }),
        }),
      }),
    );
  });

  it("marks an expired Management token as reconnect required", async () => {
    const binding = storedBinding({ supabaseProjectRef: "project-ref" });
    const capabilities = {
      projectsRead: "reauthorization_required",
      projectsWrite: "unverified",
      secretsRead: "reauthorization_required",
      databaseRead: "reauthorization_required",
      databaseWrite: "unverified",
      projectRef: "project-ref",
      checkedAt: "2026-07-21T00:00:00.000Z",
      issue: "connection_expired",
    };
    mocks.integrationFindFirst.mockResolvedValue(binding);
    mocks.requestCapabilities.mockResolvedValue(capabilities);
    mocks.integrationFindUniqueOrThrow.mockResolvedValue({
      ...binding,
      status: "needs_attention",
      config: {
        supabaseProjectRef: "project-ref",
        supabaseManagementCapabilities: capabilities,
      },
      connection: { ...binding.connection, status: "needs_attention" },
    });

    await testProjectIntegration({
      projectId: "project_1",
      bindingId: "binding_1",
      userId: "user_1",
    });

    expect(mocks.connectionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "needs_attention",
          lastHealthMessage: expect.stringContaining("expired"),
        }),
      }),
    );
    expect(mocks.integrationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "needs_attention" }),
      }),
    );
  });
});
