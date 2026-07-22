import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const state = {
    connection: null as null | Record<string, any>,
    audits: [] as Array<Record<string, unknown>>,
    bindingStatus: "ready",
  };
  return {
    state,
    executeRaw: vi.fn(async () => 1),
    connectionFindFirst: vi.fn(async () => state.connection),
    connectionUpdate: vi.fn(async ({ data }: { data: Record<string, any> }) => {
      Object.assign(state.connection!, data);
      return state.connection;
    }),
    credentialUpsert: vi.fn(async ({ create, update }: any) => {
      const next = { ...(create ?? {}), ...(update ?? {}) };
      const credentials = state.connection!.credentials as Array<
        Record<string, any>
      >;
      const existing = credentials.find(
        (credential) => credential.kind === next.kind,
      );
      if (existing) Object.assign(existing, next);
      else credentials.push(next);
      return next;
    }),
    integrationFindMany: vi.fn(async () => [
      {
        id: "binding_1",
        config: {
          supabaseProjectRef: "project-ref",
          supabaseManagementCapabilities: {
            projectsRead: "verified",
            projectsWrite: "verified",
            secretsRead: "verified",
            databaseRead: "verified",
            databaseWrite: "verified",
            projectRef: "project-ref",
            checkedAt: new Date(NOW).toISOString(),
            issue: null,
          },
        },
      },
    ]),
    integrationUpdate: vi.fn(async ({ data }: any) => {
      state.bindingStatus = data.status;
      return data;
    }),
    auditCreate: vi.fn(async ({ data }: any) => {
      state.audits.push(data);
      return data;
    }),
  };
});

const prismaMock = {
  integrationConnection: {
    findFirst: mocks.connectionFindFirst,
    update: mocks.connectionUpdate,
  },
  integrationCredential: { upsert: mocks.credentialUpsert },
  projectIntegration: {
    findMany: mocks.integrationFindMany,
    update: mocks.integrationUpdate,
  },
  integrationAuditEvent: { create: mocks.auditCreate },
  $executeRaw: mocks.executeRaw,
  $transaction: vi.fn(async (callback: (tx: any) => Promise<unknown>) =>
    callback(prismaMock),
  ),
};

vi.mock("@/lib/prisma", () => ({ getPrisma: () => prismaMock }));
vi.mock("@/features/integrations/server/credential-vault", () => ({
  encryptIntegrationCredential: vi.fn(
    ({ value }: { value: string; kind: string }) => ({
      ciphertext: `encrypted:${Buffer.from(value).toString("base64")}`,
      iv: "iv",
      authTag: "tag",
      keyVersion: 1,
    }),
  ),
  decryptIntegrationCredential: vi.fn(
    ({ credential }: { credential: { ciphertext: string } }) =>
      Buffer.from(
        credential.ciphertext.replace(/^encrypted:/, ""),
        "base64",
      ).toString("utf8"),
  ),
}));
vi.mock("@/features/integrations/server/oauth-provider", () => ({
  getOAuthProviderConfig: () => ({
    providerId: "supabase",
    mode: "oauth_app",
    clientId: "client-id",
    clientSecret: "rotated-client-secret",
    callbackUrl: "http://localhost/callback",
  }),
}));

import { providerFetch } from "@/features/integrations/server/provider-client";
import {
  getSupabaseProviderAuthorization,
  type SupabaseProviderAuthorization,
} from "@/features/integrations/server/supabase-oauth-tokens";

const NOW = Date.parse("2026-07-22T12:00:00.000Z");

function encryptedCredential(kind: string, value: string) {
  return {
    id: `${kind}_id`,
    connectionId: "connection_1",
    kind,
    ciphertext: `encrypted:${Buffer.from(value).toString("base64")}`,
    iv: "iv",
    authTag: "tag",
    keyVersion: 1,
    createdAt: new Date(NOW),
    updatedAt: new Date(NOW),
  };
}

function connection({
  expiresAt = new Date(NOW + 60_000).toISOString(),
  refreshToken = "old-refresh-token",
  legacyRefreshToken,
}: {
  expiresAt?: string | null;
  refreshToken?: string | null;
  legacyRefreshToken?: string;
} = {}) {
  return {
    id: "connection_1",
    userId: "user_1",
    providerId: "supabase",
    displayName: "Supabase",
    authType: "oauth",
    status: "ready",
    scopes: ["projects:read"],
    metadata: {
      ...(expiresAt ? { supabaseAccessTokenExpiresAt: expiresAt } : {}),
      supabaseTokenType: "bearer",
      ...(legacyRefreshToken
        ? { supabaseRefreshToken: legacyRefreshToken }
        : {}),
    },
    lastHealthStatus: "healthy",
    lastHealthMessage: null,
    lastHealthCheckAt: new Date(NOW),
    createdAt: new Date(NOW),
    updatedAt: new Date(NOW),
    credentials: [
      encryptedCredential("access_token", "old-access-token"),
      ...(refreshToken
        ? [encryptedCredential("refresh_token", refreshToken)]
        : []),
    ],
  };
}

function refreshResponse(overrides: Record<string, unknown> = {}) {
  return Response.json({
    access_token: "new-access-token",
    refresh_token: "rotated-refresh-token",
    expires_in: 3600,
    token_type: "bearer",
    scope: "projects:read database:write",
    ...overrides,
  });
}

describe("Supabase OAuth token lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.state.connection = connection();
    mocks.state.audits = [];
    mocks.state.bindingStatus = "ready";
  });

  it("refreshes proactively near expiry and atomically persists token rotation", async () => {
    const fetchImpl = vi.fn(async () => refreshResponse());

    const authorization = await getSupabaseProviderAuthorization({
      connection: mocks.state.connection as any,
      now: () => NOW,
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(authorization.accessToken).toBe("new-access-token");
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(mocks.credentialUpsert).toHaveBeenCalledTimes(2);
    expect(mocks.state.connection!.metadata).toMatchObject({
      supabaseAccessTokenExpiresAt: "2026-07-22T13:00:00.000Z",
      supabaseTokenType: "bearer",
    });
    expect(mocks.state.connection!.scopes).toEqual([
      "projects:read",
      "database:write",
    ]);
    expect(JSON.stringify(mocks.state.connection)).not.toContain(
      "rotated-refresh-token",
    );
    expect(mocks.state.audits).toEqual([
      expect.objectContaining({
        action: "supabase_oauth_token_refreshed",
        metadata: {
          rotatedRefreshToken: true,
          expiresAtRecorded: true,
          scopesReturned: true,
        },
      }),
    ]);
  });

  it("does not refresh a token outside the proactive expiry window", async () => {
    mocks.state.connection = connection({
      expiresAt: new Date(NOW + 10 * 60_000).toISOString(),
    });
    const fetchImpl = vi.fn();

    const authorization = await getSupabaseProviderAuthorization({
      connection: mocks.state.connection as any,
      now: () => NOW,
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(authorization.accessToken).toBe("old-access-token");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("scrubs legacy plaintext refresh metadata when an encrypted token exists", async () => {
    mocks.state.connection = connection({
      expiresAt: new Date(NOW + 10 * 60_000).toISOString(),
      legacyRefreshToken: "legacy-plaintext-refresh-token",
    });

    const authorization = await getSupabaseProviderAuthorization({
      connection: mocks.state.connection as any,
      now: () => NOW,
      fetchImpl: vi.fn() as typeof fetch,
    });

    expect(authorization.accessToken).toBe("old-access-token");
    expect(mocks.state.connection!.metadata).not.toHaveProperty(
      "supabaseRefreshToken",
    );
    expect(mocks.connectionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          metadata: expect.not.objectContaining({
            supabaseRefreshToken: expect.anything(),
          }),
        }),
      }),
    );
  });

  it("refreshes once after a Management API 401 and retries once", async () => {
    mocks.state.connection = connection({
      expiresAt: new Date(NOW + 10 * 60_000).toISOString(),
    });
    const authorization: SupabaseProviderAuthorization = {
      accessToken: "old-access-token",
      connectionId: "connection_1",
      userId: "user_1",
    };
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith("/v1/oauth/token")) return refreshResponse();
      const callCount = fetchImpl.mock.calls.filter(
        ([candidate]) => String(candidate) === url,
      ).length;
      return callCount === 1
        ? Response.json({ hidden: "provider-token-body" }, { status: 401 })
        : Response.json({ projects: [] });
    });

    await expect(
      providerFetch(
        "supabase",
        authorization,
        "https://api.supabase.com/v1/projects",
        {},
        fetchImpl as typeof fetch,
      ),
    ).resolves.toEqual({ projects: [] });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("deduplicates concurrent proactive refresh attempts", async () => {
    let release!: () => void;
    const waiting = new Promise<void>((resolve) => {
      release = resolve;
    });
    const fetchImpl = vi.fn(async () => {
      await waiting;
      return refreshResponse();
    });

    const first = getSupabaseProviderAuthorization({
      connection: mocks.state.connection as any,
      now: () => NOW,
      fetchImpl: fetchImpl as typeof fetch,
    });
    const second = getSupabaseProviderAuthorization({
      connection: mocks.state.connection as any,
      now: () => NOW,
      fetchImpl: fetchImpl as typeof fetch,
    });
    release();
    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(firstResult.accessToken).toBe("new-access-token");
    expect(secondResult.accessToken).toBe("new-access-token");
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("marks revoked refresh authorization as reconnect required", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json(
        { error: "invalid_grant", refresh_token: "must-not-leak" },
        { status: 400 },
      ),
    );

    await expect(
      getSupabaseProviderAuthorization({
        connection: mocks.state.connection as any,
        now: () => NOW,
        fetchImpl: fetchImpl as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: "AUTHORIZATION_REQUIRED" });
    expect(mocks.state.connection!.status).toBe("authorization_required");
    expect(mocks.state.bindingStatus).toBe("authorization_required");
    expect(mocks.integrationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          config: expect.objectContaining({
            supabaseManagementCapabilities: expect.objectContaining({
              databaseRead: "reauthorization_required",
              databaseWrite: "reauthorization_required",
              issue: "connection_expired",
            }),
          }),
        }),
      }),
    );
    expect(JSON.stringify(mocks.state.audits)).not.toContain("must-not-leak");
  });

  it.each([
    [429, "SUPABASE_OAUTH_REFRESH_UNAVAILABLE"],
    [500, "SUPABASE_OAUTH_REFRESH_UNAVAILABLE"],
    [503, "SUPABASE_OAUTH_REFRESH_UNAVAILABLE"],
  ])(
    "keeps the connection ready after a temporary refresh HTTP %s",
    async (status, code) => {
      const fetchImpl = vi.fn(async () =>
        Response.json({ error: "temporary-provider-detail" }, { status }),
      );

      await expect(
        getSupabaseProviderAuthorization({
          connection: mocks.state.connection as any,
          now: () => NOW,
          fetchImpl: fetchImpl as typeof fetch,
        }),
      ).rejects.toMatchObject({ code });
      expect(mocks.state.connection!.status).toBe("ready");
      expect(mocks.state.bindingStatus).toBe("ready");
      expect(mocks.state.audits).toEqual([]);
      expect(JSON.stringify(mocks.state)).not.toContain(
        "temporary-provider-detail",
      );
    },
  );

  it("keeps the connection ready after a refresh network failure", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network detail must not leak");
    });

    await expect(
      getSupabaseProviderAuthorization({
        connection: mocks.state.connection as any,
        now: () => NOW,
        fetchImpl: fetchImpl as typeof fetch,
      }),
    ).rejects.toMatchObject({
      code: "SUPABASE_OAUTH_REFRESH_UNAVAILABLE",
      status: 503,
    });
    expect(mocks.state.connection!.status).toBe("ready");
    expect(mocks.state.bindingStatus).toBe("ready");
  });

  it("keeps the connection ready after a malformed successful refresh", async () => {
    const fetchImpl = vi.fn(async () => Response.json({ expires_in: 3600 }));

    await expect(
      getSupabaseProviderAuthorization({
        connection: mocks.state.connection as any,
        now: () => NOW,
        fetchImpl: fetchImpl as typeof fetch,
      }),
    ).rejects.toMatchObject({
      code: "SUPABASE_OAUTH_REFRESH_UNAVAILABLE",
      status: 502,
    });
    expect(mocks.state.connection!.status).toBe("ready");
    expect(mocks.state.bindingStatus).toBe("ready");
  });

  it("rejects legacy plaintext-only refresh state and removes it", async () => {
    mocks.state.connection = connection({
      refreshToken: null,
      legacyRefreshToken: "legacy-plaintext-refresh-token",
    });
    const fetchImpl = vi.fn();

    await expect(
      getSupabaseProviderAuthorization({
        connection: mocks.state.connection as any,
        now: () => NOW,
        fetchImpl: fetchImpl as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: "AUTHORIZATION_REQUIRED" });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(mocks.state.connection!.metadata).not.toHaveProperty(
      "supabaseRefreshToken",
    );
  });

  it("never retries a Management API 403", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({ secret: "raw-provider-secret" }, { status: 403 }),
    );
    const authorization: SupabaseProviderAuthorization = {
      accessToken: "old-access-token",
      connectionId: "connection_1",
      userId: "user_1",
    };

    await expect(
      providerFetch(
        "supabase",
        authorization,
        "https://api.supabase.com/v1/projects",
        {},
        fetchImpl as typeof fetch,
      ),
    ).rejects.toMatchObject({ status: 403 });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("marks reauthorization required when the retried request is still 401", async () => {
    const authorization: SupabaseProviderAuthorization = {
      accessToken: "old-access-token",
      connectionId: "connection_1",
      userId: "user_1",
    };
    const fetchImpl = vi.fn(async (input: string | URL | Request) =>
      String(input).endsWith("/v1/oauth/token")
        ? refreshResponse()
        : Response.json({ hidden: "provider-token-body" }, { status: 401 }),
    );

    await expect(
      providerFetch(
        "supabase",
        authorization,
        "https://api.supabase.com/v1/projects",
        {},
        fetchImpl as typeof fetch,
      ),
    ).rejects.toMatchObject({ status: 401 });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(mocks.state.connection!.status).toBe("authorization_required");
    expect(mocks.state.bindingStatus).toBe("authorization_required");
  });
});
