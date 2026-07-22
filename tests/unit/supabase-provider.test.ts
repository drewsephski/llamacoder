import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthorized: vi.fn(),
  providerFetch: vi.fn(),
  projectIntegrationFindUnique: vi.fn(
    async (): Promise<{ config: unknown }> => ({ config: null }),
  ),
  projectIntegrationUpdate: vi.fn(async () => ({})),
  integrationConnectionUpdate: vi.fn(async () => ({})),
  auditCreate: vi.fn(async () => ({})),
  transaction: vi.fn(async (operations: Array<Promise<unknown>>) =>
    Promise.all(operations),
  ),
}));

vi.mock("@/features/integrations/server/provider-client", () => ({
  getAuthorizedProjectIntegration: mocks.getAuthorized,
  providerFetch: mocks.providerFetch,
}));
vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({
    $transaction: mocks.transaction,
    projectIntegration: {
      findUnique: mocks.projectIntegrationFindUnique,
      update: mocks.projectIntegrationUpdate,
    },
    integrationConnection: { update: mocks.integrationConnectionUpdate },
    integrationAuditEvent: { create: mocks.auditCreate },
  }),
}));

import {
  configureSupabaseAuthMode,
  createSupabaseProject,
  executeApprovedSupabaseDatabaseQuery,
  getSupabaseProjectBrowserConfiguration,
  getSupabaseProjectProvisioningStatus,
  listSupabaseProjects,
} from "@/features/integrations/server/supabase";
import { IntegrationServiceError } from "@/features/integrations/server/service";

function legacyJwt(role: "anon" | "service_role") {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256" })}.${encode({ role })}.signature`;
}

function mockProvisioningResponses(keys: unknown[]) {
  mocks.providerFetch.mockImplementation(
    async (
      _provider: string,
      _token: string,
      url: string,
      init?: RequestInit,
    ) => {
      if (url.endsWith("/v1/organizations")) {
        return [{ id: "org_1", name: "Acme", slug: "acme" }];
      }
      if (url.endsWith("/v1/projects") && init?.method === "POST") {
        return { id: "project-ref", ref: "project-ref", name: "Tasks" };
      }
      if (url.endsWith("/v1/projects/project-ref")) {
        return {
          id: "project-ref",
          ref: "project-ref",
          name: "Tasks",
          status: "ACTIVE_HEALTHY",
          region: "us-east-1",
        };
      }
      if (url.includes("/v1/projects/project-ref/api-keys?reveal=true")) {
        return keys;
      }
      if (url.includes("/v1/projects/project-ref/types/typescript")) {
        return { types: "export type Database = unknown" };
      }
      throw new Error(`Unexpected Supabase request: ${url}`);
    },
  );
}

describe("Supabase project provisioning key safety", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.projectIntegrationFindUnique.mockResolvedValue({ config: null });
    mocks.getAuthorized.mockResolvedValue({
      accessToken: "management-token",
      binding: {
        id: "binding_1",
        connectionId: "connection_1",
        environment: "development",
        config: null,
      },
    });
  });

  it("configures immediate prototype signup using only the Auth config flag", async () => {
    const capabilities = {
      projectsRead: "verified",
      projectsWrite: "unverified",
      secretsRead: "verified",
      databaseRead: "verified",
      databaseWrite: "unverified",
      authWrite: "unverified",
      projectRef: "project-ref",
      checkedAt: "2026-07-22T00:00:00.000Z",
      issue: null,
    };
    const config = {
      supabaseProjectRef: "project-ref",
      supabaseManagementCapabilities: capabilities,
    };
    mocks.getAuthorized.mockResolvedValue({
      accessToken: "management-token",
      binding: {
        id: "binding_1",
        connectionId: "connection_1",
        environment: "development",
        config,
      },
    });
    mocks.projectIntegrationFindUnique.mockResolvedValue({ config });
    mocks.providerFetch.mockResolvedValue({ mailer_autoconfirm: true });

    const result = await configureSupabaseAuthMode({
      projectId: "squid-project",
      bindingId: "binding_1",
      userId: "user_1",
      projectRef: "project-ref",
      mode: "prototype_instant_signup",
    });

    expect(result).toMatchObject({
      status: "ready",
      mode: "prototype_instant_signup",
    });
    expect(mocks.providerFetch).toHaveBeenCalledWith(
      "supabase",
      "management-token",
      "https://api.supabase.com/v1/projects/project-ref/config/auth",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mailer_autoconfirm: true }),
      },
    );
    expect(mocks.projectIntegrationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          config: expect.objectContaining({
            supabaseAuth: expect.objectContaining({
              status: "ready",
              mode: "prototype_instant_signup",
            }),
            supabaseManagementCapabilities: expect.objectContaining({
              authWrite: "verified",
            }),
          }),
        }),
      }),
    );
    expect(
      JSON.stringify(mocks.projectIntegrationUpdate.mock.calls),
    ).not.toMatch(
      /smtp_pass|management-token|refresh-token|service_role|sb_secret_/i,
    );
    expect(mocks.auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "supabase_auth_mode_updated",
        metadata: {
          mode: "prototype_instant_signup",
          outcome: "configured",
        },
      }),
    });
  });

  it("switches back to verified email by updating only mailer_autoconfirm", async () => {
    const config = { supabaseProjectRef: "project-ref" };
    mocks.getAuthorized.mockResolvedValue({
      accessToken: "management-token",
      binding: {
        id: "binding_1",
        connectionId: "connection_1",
        environment: "development",
        config,
      },
    });
    mocks.projectIntegrationFindUnique.mockResolvedValue({ config });
    mocks.providerFetch.mockResolvedValue({ mailer_autoconfirm: false });

    const result = await configureSupabaseAuthMode({
      projectId: "squid-project",
      bindingId: "binding_1",
      userId: "user_1",
      projectRef: "project-ref",
      mode: "verified_email",
    });

    expect(result.mode).toBe("verified_email");
    expect(mocks.providerFetch).toHaveBeenCalledWith(
      "supabase",
      "management-token",
      "https://api.supabase.com/v1/projects/project-ref/config/auth",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mailer_autoconfirm: false }),
      },
    );
    const requestInit = mocks.providerFetch.mock.calls[0]?.[3] as RequestInit;
    expect(JSON.parse(String(requestInit.body))).toEqual({
      mailer_autoconfirm: false,
    });
  });

  it("requires reauthorization when Auth Write is missing", async () => {
    const config = { supabaseProjectRef: "project-ref" };
    mocks.getAuthorized.mockResolvedValue({
      accessToken: "management-token",
      binding: {
        id: "binding_1",
        connectionId: "connection_1",
        environment: "development",
        config,
      },
    });
    mocks.providerFetch.mockRejectedValue(
      new IntegrationServiceError(
        "SUPABASE_REQUEST_FAILED",
        "Supabase authorization lacks permission",
        403,
      ),
    );

    await expect(
      configureSupabaseAuthMode({
        projectId: "squid-project",
        bindingId: "binding_1",
        userId: "user_1",
        projectRef: "project-ref",
        mode: "verified_email",
      }),
    ).rejects.toMatchObject({ status: 403 });
    expect(mocks.projectIntegrationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "needs_attention",
          config: expect.objectContaining({
            supabaseManagementCapabilities: expect.objectContaining({
              authWrite: "reauthorization_required",
              issue: "insufficient_permissions",
            }),
          }),
        }),
      }),
    );
    expect(mocks.integrationConnectionUpdate).toHaveBeenCalledOnce();
  });

  it("lists existing projects and filters them by organization", async () => {
    mocks.providerFetch.mockResolvedValue([
      {
        id: "project-one",
        ref: "project-one",
        name: "Tasks One",
        organization_id: "org_1",
      },
      {
        id: "project-two",
        ref: "project-two",
        name: "Tasks Two",
        organization_id: "org_2",
      },
    ]);

    await expect(
      listSupabaseProjects({
        projectId: "squid-project",
        bindingId: "binding_1",
        userId: "user_1",
        organizationId: "org_1",
      }),
    ).resolves.toEqual([
      {
        id: "project-one",
        name: "Tasks One",
        owner: "org_1",
        url: "https://supabase.com/dashboard/project/project-one",
      },
    ]);
    expect(mocks.providerFetch).toHaveBeenCalledWith(
      "supabase",
      "management-token",
      "https://api.supabase.com/v1/projects",
    );
  });

  it("stores a resumable reference before retrieving the preferred browser key", async () => {
    mockProvisioningResponses([
      {
        type: "legacy",
        name: "anon",
        api_key: legacyJwt("anon"),
      },
      {
        type: "publishable",
        name: "web",
        api_key: "sb_publishable_project",
      },
      {
        type: "secret",
        name: "backend",
        api_key: "sb_secret_backend",
      },
    ]);

    const created = await createSupabaseProject({
      projectId: "squid-project",
      bindingId: "binding_1",
      userId: "user_1",
      projectName: "Tasks",
    });

    expect(created).toMatchObject({
      projectRef: "project-ref",
      url: "https://project-ref.supabase.co",
      config: {
        supabaseProjectRef: "project-ref",
        supabaseProjectUrl: "https://project-ref.supabase.co",
      },
    });
    expect(created.config).not.toHaveProperty("supabasePublishableKey");
    expect(created.config).toMatchObject({
      supabaseManagementCapabilities: {
        projectsWrite: "verified",
        projectRef: "project-ref",
      },
    });
    expect(
      mocks.providerFetch.mock.calls.some((call) =>
        String(call[2]).includes("api-keys"),
      ),
    ).toBe(false);
    const createCall = mocks.providerFetch.mock.calls.find(
      (call) =>
        String(call[2]).endsWith("/v1/projects") &&
        (call[3] as RequestInit | undefined)?.method === "POST",
    );
    const createBody = JSON.parse(
      String((createCall?.[3] as RequestInit | undefined)?.body),
    ) as Record<string, unknown>;
    expect(createBody).toMatchObject({
      organization_slug: "acme",
      region_selection: { type: "smartGroup", code: "americas" },
    });
    expect(createBody).not.toHaveProperty("organization_id");
    expect(createBody).not.toHaveProperty("region");

    mocks.getAuthorized.mockResolvedValue({
      accessToken: "management-token",
      binding: {
        id: "binding_1",
        connectionId: "connection_1",
        config: created.config,
      },
    });

    const result = await getSupabaseProjectBrowserConfiguration({
      projectId: "squid-project",
      bindingId: "binding_1",
      userId: "user_1",
      projectRef: created.projectRef,
    });

    expect(result.config).toMatchObject({
      supabaseProjectUrl: "https://project-ref.supabase.co",
      supabasePublishableKey: "sb_publishable_project",
      supabaseBrowserKeyKind: "publishable",
      supabaseManagementCapabilities: {
        projectsRead: "verified",
        projectsWrite: "verified",
        secretsRead: "verified",
        databaseRead: "verified",
        databaseWrite: "unverified",
      },
    });
    expect(result.config).not.toHaveProperty("supabaseAnonKey");
    expect(JSON.stringify(result.config)).not.toContain("sb_secret_backend");
  });

  it("keeps a non-ready project running without retrieving API keys", async () => {
    mockProvisioningResponses([]);
    mocks.providerFetch.mockImplementation(
      async (_provider: string, _token: string, url: string) => {
        if (url.endsWith("/v1/projects/project-ref")) {
          return {
            id: "project-ref",
            ref: "project-ref",
            name: "Tasks",
            status: "COMING_UP",
          };
        }
        throw new Error(`Unexpected Supabase request: ${url}`);
      },
    );

    const status = await getSupabaseProjectProvisioningStatus({
      projectId: "squid-project",
      bindingId: "binding_1",
      userId: "user_1",
      projectRef: "project-ref",
    });

    expect(status).toMatchObject({
      ready: false,
      terminalError: false,
      providerStatus: "COMING_UP",
    });
    expect(
      mocks.providerFetch.mock.calls.some((call) =>
        String(call[2]).includes("api-keys"),
      ),
    ).toBe(false);
  });

  it("falls back to the documented plain API-key read when reveal is rejected", async () => {
    mocks.providerFetch.mockImplementation(
      async (_provider: string, _token: string, url: string) => {
        if (url.endsWith("/v1/projects/project-ref")) {
          return {
            id: "project-ref",
            ref: "project-ref",
            name: "Tasks",
            status: "ACTIVE_HEALTHY",
            region: "us-east-1",
          };
        }
        if (url.endsWith("/api-keys?reveal=true")) {
          throw new IntegrationServiceError(
            "SUPABASE_REQUEST_FAILED",
            "Supabase request failed with HTTP 400",
            400,
          );
        }
        if (url.endsWith("/api-keys")) {
          return [
            {
              id: "publishable_1",
              type: "publishable",
              name: "default",
              api_key: "sb_publishable_project",
            },
          ];
        }
        if (url.includes("/types/typescript")) {
          return { types: "export type Database = unknown" };
        }
        throw new Error(`Unexpected Supabase request: ${url}`);
      },
    );

    const result = await getSupabaseProjectBrowserConfiguration({
      projectId: "squid-project",
      bindingId: "binding_1",
      userId: "user_1",
      projectRef: "project-ref",
    });

    expect(result.config.supabasePublishableKey).toBe("sb_publishable_project");
    expect(mocks.providerFetch).toHaveBeenCalledWith(
      "supabase",
      "management-token",
      "https://api.supabase.com/v1/projects/project-ref/api-keys",
    );
  });

  it("does not verify Projects Write from an incomplete create response", async () => {
    mocks.providerFetch.mockImplementation(
      async (_provider: string, _token: string, url: string) => {
        if (url.endsWith("/v1/organizations")) {
          return [{ id: "org_1", name: "Acme", slug: "acme" }];
        }
        if (url.endsWith("/v1/projects")) {
          return { name: "Tasks", status: "COMING_UP" };
        }
        throw new Error(`Unexpected Supabase request: ${url}`);
      },
    );

    await expect(
      createSupabaseProject({
        projectId: "squid-project",
        bindingId: "binding_1",
        userId: "user_1",
        projectName: "Tasks",
      }),
    ).rejects.toThrow();
  });

  it("accepts a verified legacy anon key after the project is healthy", async () => {
    const anonKey = legacyJwt("anon");
    mockProvisioningResponses([
      { type: "legacy", name: "anon", api_key: anonKey },
    ]);

    const result = await getSupabaseProjectBrowserConfiguration({
      projectId: "squid-project",
      bindingId: "binding_1",
      userId: "user_1",
      projectRef: "project-ref",
    });

    expect(result.runtimeConfig).toEqual({
      url: "https://project-ref.supabase.co",
      publishableKey: anonKey,
    });
    expect(result.config).toMatchObject({
      supabaseBrowserKeyKind: "legacy_anon",
    });
  });

  it("rejects the old not-service-role fallback behavior", async () => {
    mockProvisioningResponses([
      {
        type: "secret",
        name: "backend",
        api_key: "sb_secret_backend",
      },
      {
        type: "future_type",
        name: "unknown",
        api_key: "unknown-key-that-is-not-service-role",
      },
      {
        type: "legacy",
        name: "service_role",
        api_key: legacyJwt("service_role"),
      },
    ]);

    await expect(
      getSupabaseProjectBrowserConfiguration({
        projectId: "squid-project",
        bindingId: "binding_1",
        userId: "user_1",
        projectRef: "project-ref",
      }),
    ).rejects.toMatchObject({ code: "SUPABASE_KEY_REJECTED", status: 502 });
  });
});

function managementCapabilities(databaseWrite: "verified" | "unverified") {
  return {
    projectsRead: "verified",
    projectsWrite: "unverified",
    secretsRead: "verified",
    databaseRead: "verified",
    databaseWrite,
    projectRef: "project-ref",
    checkedAt: "2026-07-21T00:00:00.000Z",
    issue: null,
  } as const;
}

function approvedQueryInput(approved = true) {
  return {
    projectId: "squid-project",
    bindingId: "binding_1",
    userId: "user_1",
    projectRef: "project-ref",
    query: "select 1",
    approval: { approved, approvedByUserId: "user_1" },
  };
}

describe("approved Supabase database queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthorized.mockResolvedValue({
      accessToken: "management-token",
      binding: {
        id: "binding_1",
        connectionId: "connection_1",
        config: {
          supabaseProjectRef: "project-ref",
          supabaseManagementCapabilities: managementCapabilities("unverified"),
        },
      },
    });
  });

  it("blocks SQL execution without explicit approval", async () => {
    await expect(
      executeApprovedSupabaseDatabaseQuery(approvedQueryInput(false)),
    ).rejects.toMatchObject({ code: "SUPABASE_SQL_APPROVAL_REQUIRED" });
    expect(mocks.providerFetch).not.toHaveBeenCalled();
  });

  it("lets the first approved query verify Database Write", async () => {
    mocks.providerFetch.mockResolvedValue({ result: [{ value: 1 }] });

    await expect(
      executeApprovedSupabaseDatabaseQuery(approvedQueryInput()),
    ).resolves.toEqual({ result: [{ value: 1 }] });

    expect(mocks.providerFetch).toHaveBeenCalledWith(
      "supabase",
      "management-token",
      "https://api.supabase.com/v1/projects/project-ref/database/query",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ query: "select 1", read_only: false }),
      }),
    );
    expect(mocks.projectIntegrationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          config: expect.objectContaining({
            supabaseManagementCapabilities: expect.objectContaining({
              databaseWrite: "verified",
            }),
          }),
        }),
      }),
    );
  });

  it("marks Database Write as requiring reauthorization after a 403", async () => {
    mocks.providerFetch.mockRejectedValue(
      new IntegrationServiceError(
        "SUPABASE_REQUEST_FAILED",
        "Supabase: authorization expired or lacks the required scope",
        403,
      ),
    );

    await expect(
      executeApprovedSupabaseDatabaseQuery(approvedQueryInput()),
    ).rejects.toMatchObject({ status: 403 });
    expect(mocks.providerFetch).toHaveBeenCalledOnce();
    expect(mocks.projectIntegrationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "needs_attention",
          config: expect.objectContaining({
            supabaseManagementCapabilities: expect.objectContaining({
              databaseWrite: "reauthorization_required",
              issue: "insufficient_permissions",
            }),
          }),
        }),
      }),
    );
    expect(mocks.integrationConnectionUpdate).toHaveBeenCalled();
  });

  it("sanitizes a provider query error returned in a successful response", async () => {
    mocks.providerFetch.mockResolvedValue({
      result: null,
      error: "database-password sb_secret_raw_provider_error",
    });

    await expect(
      executeApprovedSupabaseDatabaseQuery(approvedQueryInput()),
    ).rejects.toMatchObject({
      code: "SUPABASE_QUERY_FAILED",
      message: "Supabase could not execute the approved database query.",
    });
    expect(
      JSON.stringify(mocks.projectIntegrationUpdate.mock.calls),
    ).not.toMatch(/database-password|sb_secret_raw_provider_error/);
  });
});
