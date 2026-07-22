import { beforeEach, describe, expect, it, vi } from "vitest";

import { integrationActionInputSchema } from "@/features/integrations/contracts";

type OperationRecord = {
  id: string;
  userId: string;
  chatId: string;
  connectionId: string;
  projectIntegrationId: string;
  providerId: string;
  kind: string;
  status: string;
  externalId: string | null;
  url: string | null;
  commitSha: string | null;
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
};

const mocks = vi.hoisted(() => ({
  configureSupabaseAuthMode: vi.fn(),
  createSupabaseProject: vi.fn(),
  getSupabaseProjectStatus: vi.fn(),
  getSupabaseBrowserConfiguration: vi.fn(),
  getAuthorized: vi.fn(),
  providerFetch: vi.fn(),
  getProjectExportBundle: vi.fn(),
  executeApprovedSupabaseQuery: vi.fn(),
  verifyAuthenticatedTasksBackend: vi.fn(),
}));

const state = {
  operations: [] as OperationRecord[],
  binding: {
    id: "binding_1",
    chatId: "project_1",
    connectionId: "connection_1",
    providerId: "supabase",
    environment: "development",
    status: "ready",
    config: null as Record<string, unknown> | null,
  },
  auditEvents: [] as Array<Record<string, unknown>>,
  operationCounter: 0,
  transactionTail: Promise.resolve() as Promise<unknown>,
};

function matchesOperationWhere(
  operation: OperationRecord,
  where: Record<string, unknown>,
) {
  return Object.entries(where).every(([key, value]) => {
    if (key === "status" && typeof value === "object" && value) {
      return true;
    }
    if (key === "metadata" && typeof value === "object" && value) {
      const filter = value as { path?: string[]; equals?: unknown };
      const field = filter.path?.[0];
      return field ? operation.metadata?.[field] === filter.equals : true;
    }
    return operation[key as keyof OperationRecord] === value;
  });
}

function createOperation(data: Record<string, unknown>): OperationRecord {
  const now = new Date();
  const operation: OperationRecord = {
    id: `operation_${++state.operationCounter}`,
    userId: String(data.userId),
    chatId: String(data.chatId),
    connectionId: String(data.connectionId),
    projectIntegrationId: String(data.projectIntegrationId),
    providerId: String(data.providerId),
    kind: String(data.kind),
    status: String(data.status),
    externalId: typeof data.externalId === "string" ? data.externalId : null,
    url: typeof data.url === "string" ? data.url : null,
    commitSha: null,
    errorMessage: null,
    metadata:
      data.metadata && typeof data.metadata === "object"
        ? (data.metadata as Record<string, unknown>)
        : null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };
  state.operations.push(operation);
  return operation;
}

function updateOperation(id: string, data: Record<string, unknown>) {
  const operation = state.operations.find((candidate) => candidate.id === id);
  if (!operation) throw new Error(`Missing operation ${id}`);
  Object.assign(operation, data, { updatedAt: new Date() });
  return operation;
}

const transactionClient = {
  $executeRaw: vi.fn(async () => 1),
  integrationOperation: {
    findFirst: vi.fn(async ({ where }: { where: Record<string, unknown> }) =>
      state.operations
        .slice()
        .reverse()
        .find((operation) => matchesOperationWhere(operation, where)),
    ),
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) =>
      createOperation(data),
    ),
    update: vi.fn(
      async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Record<string, unknown>;
      }) => updateOperation(where.id, data),
    ),
  },
  projectIntegration: {
    findUnique: vi.fn(async () => ({ config: state.binding.config })),
    update: vi.fn(
      async ({
        data,
      }: {
        data: { config?: Record<string, unknown>; status?: string };
      }) => {
        if (data.config) state.binding.config = data.config;
        if (data.status) state.binding.status = data.status;
        return state.binding;
      },
    ),
  },
  integrationAuditEvent: {
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      state.auditEvents.push(data);
      return data;
    }),
  },
  integrationConnection: {
    update: vi.fn(async () => ({})),
  },
};

const prismaMock = {
  $transaction: vi.fn(
    <T>(callback: (tx: typeof transactionClient) => Promise<T>): Promise<T> => {
      const result = state.transactionTail.then(() =>
        callback(transactionClient),
      );
      state.transactionTail = result.then(
        () => undefined,
        () => undefined,
      );
      return result;
    },
  ),
  projectIntegration: {
    findFirst: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
      const connection = where.connection as { userId?: string } | undefined;
      return where.id === state.binding.id &&
        where.chatId === state.binding.chatId &&
        connection?.userId === "user_1"
        ? state.binding
        : null;
    }),
    findUnique: transactionClient.projectIntegration.findUnique,
  },
  integrationOperation: {
    findFirst: vi.fn(
      async ({ where }: { where: Record<string, unknown> }) =>
        state.operations.find((operation) =>
          matchesOperationWhere(operation, where),
        ) ?? null,
    ),
    create: transactionClient.integrationOperation.create,
    update: transactionClient.integrationOperation.update,
  },
};

vi.mock("@/lib/prisma", () => ({ getPrisma: () => prismaMock }));
vi.mock("@/features/integrations/server/supabase", () => ({
  configureSupabaseAuthMode: mocks.configureSupabaseAuthMode,
  createSupabaseProject: mocks.createSupabaseProject,
  getSupabaseProjectProvisioningStatus: mocks.getSupabaseProjectStatus,
  getSupabaseProjectBrowserConfiguration: mocks.getSupabaseBrowserConfiguration,
  listSupabaseOrganizations: vi.fn(),
  listSupabaseProjects: vi.fn(),
  executeApprovedSupabaseDatabaseQuery: mocks.executeApprovedSupabaseQuery,
}));
vi.mock(
  "@/features/integrations/server/supabase-authenticated-tasks",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("@/features/integrations/server/supabase-authenticated-tasks")
      >();
    return {
      ...actual,
      verifyAuthenticatedTasksBackend: mocks.verifyAuthenticatedTasksBackend,
    };
  },
);
vi.mock("@/features/integrations/server/provider-client", () => ({
  getAuthorizedProjectIntegration: mocks.getAuthorized,
  providerFetch: mocks.providerFetch,
}));
vi.mock("@/features/integrations/server/project-artifact", () => ({
  getProjectExportBundle: mocks.getProjectExportBundle,
}));
vi.mock("@/features/integrations/server/github", () => ({
  listGitHubRepositories: vi.fn(),
  publishGitHubBundle: vi.fn(),
}));
vi.mock("@/features/integrations/server/vercel", () => ({
  deployVercelBundle: vi.fn(),
  listVercelProjects: vi.fn(),
}));

import {
  executeIntegrationAction,
  refreshIntegrationOperation,
  SUPABASE_PROVISIONING_TIMEOUT_MS,
} from "@/features/integrations/server/actions";
import { IntegrationServiceError } from "@/features/integrations/server/service";
import { getAuthenticatedTasksBackendPlan } from "@/features/integrations/supabase-backend";

function createRunningSupabaseOperation(
  phase = "waiting_for_supabase",
  createdAt = new Date(),
  authMode:
    | "prototype_instant_signup"
    | "verified_email"
    | null = "prototype_instant_signup",
) {
  const operation = createOperation({
    userId: "user_1",
    chatId: "project_1",
    connectionId: "connection_1",
    projectIntegrationId: "binding_1",
    providerId: "supabase",
    kind: "supabase_provision",
    status: "running",
    externalId: "project-ref",
    url: "https://project-ref.supabase.co",
    metadata: {
      phase,
      projectRef: "project-ref",
      ...(authMode ? { authMode } : {}),
    },
  });
  operation.createdAt = createdAt;
  return operation;
}

async function executeProvisioning() {
  return executeIntegrationAction({
    projectId: "project_1",
    bindingId: "binding_1",
    userId: "user_1",
    action: {
      action: "supabase_provision",
      organizationId: "org_1",
      projectName: "Tasks",
      authMode: "prototype_instant_signup",
      authModeApproval: { approved: true },
    },
  });
}

describe("Supabase provisioning operation lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    state.operations = [];
    state.binding.providerId = "supabase";
    state.binding.config = null;
    state.auditEvents = [];
    state.operationCounter = 0;
    state.transactionTail = Promise.resolve();
    mocks.createSupabaseProject.mockResolvedValue({
      projectRef: "project-ref",
      url: "https://project-ref.supabase.co",
      metadata: {
        phase: "waiting_for_supabase",
        projectRef: "project-ref",
      },
      config: {
        supabaseProjectRef: "project-ref",
        supabaseProjectUrl: "https://project-ref.supabase.co",
      },
    });
    mocks.configureSupabaseAuthMode.mockImplementation(
      async ({
        mode,
      }: {
        mode: "prototype_instant_signup" | "verified_email";
      }) => ({
        status: "ready" as const,
        mode,
        configuredAt: "2026-07-22T00:00:00.000Z",
      }),
    );
    mocks.getSupabaseProjectStatus.mockResolvedValue({
      projectRef: "project-ref",
      projectId: "project-ref",
      projectName: "Tasks",
      region: "us-east-1",
      providerStatus: "COMING_UP",
      url: "https://project-ref.supabase.co",
      ready: false,
      terminalError: false,
    });
    mocks.getSupabaseBrowserConfiguration.mockResolvedValue({
      runtimeConfig: {
        url: "https://project-ref.supabase.co",
        publishableKey: "sb_publishable_project",
      },
      providerStatus: "ACTIVE_HEALTHY",
      config: {
        supabaseProjectRef: "project-ref",
        supabaseProjectUrl: "https://project-ref.supabase.co",
        supabasePublishableKey: "sb_publishable_project",
        supabaseBrowserKeyKind: "publishable",
        supabaseBrowserKeyStatus: "ready",
      },
    });
    mocks.getAuthorized.mockResolvedValue({
      accessToken: "management-token",
      metadata: {},
    });
  });

  it("allows provisioning before a separately approved Auth mode", () => {
    expect(
      integrationActionInputSchema.safeParse({
        action: "supabase_provision",
        organizationId: "org_1",
      }).success,
    ).toBe(true);
    expect(
      integrationActionInputSchema.safeParse({
        action: "supabase_provision",
        organizationId: "org_1",
        authMode: "prototype_instant_signup",
        authModeApproval: { approved: false },
      }).success,
    ).toBe(false);
    expect(
      integrationActionInputSchema.safeParse({
        action: "supabase_provision",
        organizationId: "org_1",
        authMode: "verified_email",
        authModeApproval: { approved: true },
      }).success,
    ).toBe(true);
  });

  it("stores a resumable project reference immediately after creation", async () => {
    const result = await executeProvisioning();

    expect(result).toMatchObject({
      status: "running",
      phase: "waiting_for_supabase",
      externalId: "project-ref",
    });
    expect(state.binding.config).toMatchObject({
      supabaseProjectRef: "project-ref",
    });
    expect(state.auditEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: "supabase_project_created" }),
      ]),
    );
  });

  it("binds an existing healthy project without creating a provider project", async () => {
    const result = await executeIntegrationAction({
      projectId: "project_1",
      bindingId: "binding_1",
      userId: "user_1",
      action: {
        action: "supabase_bind_project",
        authMode: "verified_email",
        authModeApproval: { approved: true },
        projectRef: "project-ref",
      },
    });

    expect(result).toMatchObject({
      kind: "supabase_bind_project",
      status: "succeeded",
      phase: "ready",
      externalId: "project-ref",
    });
    expect(mocks.getSupabaseBrowserConfiguration).toHaveBeenCalledWith({
      projectId: "project_1",
      bindingId: "binding_1",
      userId: "user_1",
      projectRef: "project-ref",
    });
    expect(mocks.configureSupabaseAuthMode).toHaveBeenCalledWith({
      projectId: "project_1",
      bindingId: "binding_1",
      userId: "user_1",
      projectRef: "project-ref",
      mode: "verified_email",
    });
    expect(mocks.createSupabaseProject).not.toHaveBeenCalled();
    expect(state.binding.config).toMatchObject({
      supabaseProjectRef: "project-ref",
      supabasePublishableKey: "sb_publishable_project",
    });
    expect(state.auditEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: "supabase_project_bound" }),
      ]),
    );
  });

  it("deduplicates concurrent binding of the same existing project", async () => {
    const input = {
      projectId: "project_1",
      bindingId: "binding_1",
      userId: "user_1",
      action: {
        action: "supabase_bind_project" as const,
        authMode: "verified_email" as const,
        authModeApproval: { approved: true as const },
        projectRef: "project-ref",
      },
    };
    const [first, second] = await Promise.all([
      executeIntegrationAction(input),
      executeIntegrationAction(input),
    ]);

    expect(first.id).toBe(second.id);
    expect(
      state.operations.filter(
        (operation) => operation.kind === "supabase_bind_project",
      ),
    ).toHaveLength(1);
  });

  it("requires approval before changing auth on an already-bound project", async () => {
    state.binding.config = { supabaseProjectRef: "project-ref" };

    await expect(
      executeIntegrationAction({
        projectId: "project_1",
        bindingId: "binding_1",
        userId: "user_1",
        action: {
          action: "supabase_configure_auth_mode",
          mode: "prototype_instant_signup",
          approval: { approved: false as true },
        },
      }),
    ).rejects.toMatchObject({ code: "SUPABASE_AUTH_MODE_APPROVAL_REQUIRED" });
    expect(mocks.configureSupabaseAuthMode).not.toHaveBeenCalled();
  });

  it("enables immediate signup on an approved bound project", async () => {
    state.binding.config = { supabaseProjectRef: "project-ref" };

    const result = await executeIntegrationAction({
      projectId: "project_1",
      bindingId: "binding_1",
      userId: "user_1",
      action: {
        action: "supabase_configure_auth_mode",
        mode: "prototype_instant_signup",
        approval: { approved: true },
      },
    });

    expect(result).toMatchObject({
      kind: "supabase_configure_auth_mode",
      status: "succeeded",
      externalId: "project-ref",
    });
    expect(state.operations[0]?.metadata).toMatchObject({
      mode: "prototype_instant_signup",
      outcome: "configured",
    });
    expect(mocks.configureSupabaseAuthMode).toHaveBeenCalledWith({
      projectId: "project_1",
      bindingId: "binding_1",
      userId: "user_1",
      projectRef: "project-ref",
      mode: "prototype_instant_signup",
    });
  });

  it("deduplicates concurrent Auth-mode approvals", async () => {
    state.binding.config = { supabaseProjectRef: "project-ref" };
    const input = {
      projectId: "project_1",
      bindingId: "binding_1",
      userId: "user_1",
      action: {
        action: "supabase_configure_auth_mode" as const,
        mode: "verified_email" as const,
        approval: { approved: true as const },
      },
    };

    const [first, second] = await Promise.all([
      executeIntegrationAction(input),
      executeIntegrationAction(input),
    ]);

    expect(first.id).toBe(second.id);
    expect(mocks.configureSupabaseAuthMode).toHaveBeenCalledTimes(1);
    expect(
      state.operations.filter(
        (operation) => operation.kind === "supabase_configure_auth_mode",
      ),
    ).toHaveLength(1);
  });

  it("does not verify Projects Write when project creation fails", async () => {
    mocks.createSupabaseProject.mockRejectedValue(
      new IntegrationServiceError(
        "SUPABASE_REQUEST_FAILED",
        "Supabase: request failed with HTTP 500",
        502,
      ),
    );

    const result = await executeProvisioning();

    expect(result.status).toBe("failed");
    expect(state.binding.config).not.toMatchObject({
      supabaseManagementCapabilities: { projectsWrite: "verified" },
    });
  });

  it("reuses the same operation for repeated and concurrent submissions", async () => {
    const [first, second] = await Promise.all([
      executeProvisioning(),
      executeProvisioning(),
    ]);
    const third = await executeProvisioning();

    expect(first.id).toBe(second.id);
    expect(second.id).toBe(third.id);
    expect(mocks.createSupabaseProject).toHaveBeenCalledTimes(1);
    expect(state.operations).toHaveLength(1);
    expect(transactionClient.$executeRaw).toHaveBeenCalled();
  });

  it("keeps non-ready projects running and does not retrieve keys", async () => {
    const operation = createRunningSupabaseOperation();

    const result = await refreshIntegrationOperation({
      projectId: "project_1",
      bindingId: "binding_1",
      operationId: operation.id,
      userId: "user_1",
    });

    expect(result).toMatchObject({
      status: "running",
      phase: "waiting_for_supabase",
    });
    expect(mocks.getSupabaseBrowserConfiguration).not.toHaveBeenCalled();
  });

  it("moves through browser configuration and completes the Sandpack binding", async () => {
    const operation = createRunningSupabaseOperation();
    mocks.getSupabaseProjectStatus.mockResolvedValue({
      projectRef: "project-ref",
      projectId: "project-ref",
      projectName: "Tasks",
      region: "us-east-1",
      providerStatus: "ACTIVE_HEALTHY",
      url: "https://project-ref.supabase.co",
      ready: true,
      terminalError: false,
    });

    const configuring = await refreshIntegrationOperation({
      projectId: "project_1",
      bindingId: "binding_1",
      operationId: operation.id,
      userId: "user_1",
    });
    expect(configuring).toMatchObject({
      status: "running",
      phase: "configuring_browser_access",
    });
    expect(mocks.getSupabaseBrowserConfiguration).not.toHaveBeenCalled();

    const completed = await refreshIntegrationOperation({
      projectId: "project_1",
      bindingId: "binding_1",
      operationId: operation.id,
      userId: "user_1",
    });
    expect(completed).toMatchObject({
      status: "succeeded",
      phase: "ready",
      url: "https://project-ref.supabase.co",
    });
    expect(state.binding.config).toMatchObject({
      supabaseProjectUrl: "https://project-ref.supabase.co",
      supabasePublishableKey: "sb_publishable_project",
    });
    expect(mocks.configureSupabaseAuthMode).toHaveBeenCalledWith({
      projectId: "project_1",
      bindingId: "binding_1",
      userId: "user_1",
      projectRef: "project-ref",
      mode: "prototype_instant_signup",
    });
    expect(state.auditEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: "supabase_project_ready" }),
      ]),
    );
  });

  it("records terminal provider states as sanitized failures", async () => {
    const operation = createRunningSupabaseOperation();
    mocks.getSupabaseProjectStatus.mockResolvedValue({
      projectRef: "project-ref",
      providerStatus: "INIT_FAILED",
      ready: false,
      terminalError: true,
    });

    const result = await refreshIntegrationOperation({
      projectId: "project_1",
      bindingId: "binding_1",
      operationId: operation.id,
      userId: "user_1",
    });

    expect(result).toMatchObject({
      status: "failed",
      phase: "failed",
      errorMessage: "Supabase reported terminal project status INIT_FAILED.",
    });
    expect(JSON.stringify(result)).not.toMatch(
      /management-token|database-password|refresh-token/,
    );
  });

  it("times out without making another provider request", async () => {
    const operation = createRunningSupabaseOperation(
      "waiting_for_supabase",
      new Date(Date.now() - SUPABASE_PROVISIONING_TIMEOUT_MS - 1),
    );

    const result = await refreshIntegrationOperation({
      projectId: "project_1",
      bindingId: "binding_1",
      operationId: operation.id,
      userId: "user_1",
    });

    expect(result).toMatchObject({
      status: "timed_out",
      phase: "timed_out",
    });
    expect(mocks.getSupabaseProjectStatus).not.toHaveBeenCalled();
  });

  it("fails closed when browser-key configuration is rejected", async () => {
    const operation = createRunningSupabaseOperation(
      "configuring_browser_access",
    );
    mocks.getSupabaseProjectStatus.mockResolvedValue({
      projectRef: "project-ref",
      providerStatus: "ACTIVE_HEALTHY",
      ready: true,
      terminalError: false,
    });
    mocks.getSupabaseBrowserConfiguration.mockRejectedValue(
      new IntegrationServiceError(
        "SUPABASE_KEY_REJECTED",
        "raw provider response containing sb_secret_probe",
        502,
      ),
    );

    const result = await refreshIntegrationOperation({
      projectId: "project_1",
      bindingId: "binding_1",
      operationId: operation.id,
      userId: "user_1",
    });

    expect(result).toMatchObject({
      status: "failed",
      errorMessage: "Supabase returned ambiguous or privileged browser keys.",
    });
    expect(JSON.stringify(result)).not.toContain("sb_secret_probe");
    expect(state.binding.config).toMatchObject({
      supabaseBrowserKeyStatus: "rejected",
    });
  });

  it("prevents another user from refreshing the operation", async () => {
    const operation = createRunningSupabaseOperation();

    await expect(
      refreshIntegrationOperation({
        projectId: "project_1",
        bindingId: "binding_1",
        operationId: operation.id,
        userId: "user_2",
      }),
    ).rejects.toMatchObject({ code: "OPERATION_NOT_FOUND", status: 404 });
    expect(mocks.getSupabaseProjectStatus).not.toHaveBeenCalled();
  });

  it("preserves the existing Vercel refresh behavior", async () => {
    state.binding.providerId = "vercel";
    const operation = createOperation({
      userId: "user_1",
      chatId: "project_1",
      connectionId: "connection_1",
      projectIntegrationId: "binding_1",
      providerId: "vercel",
      kind: "vercel_deploy",
      status: "running",
      externalId: "deployment_1",
      metadata: {},
    });
    mocks.providerFetch.mockResolvedValue({
      readyState: "READY",
      url: "preview.example.vercel.app",
    });

    const result = await refreshIntegrationOperation({
      projectId: "project_1",
      bindingId: "binding_1",
      operationId: operation.id,
      userId: "user_1",
    });

    expect(result).toMatchObject({
      status: "succeeded",
      url: "https://preview.example.vercel.app",
    });
  });
});

async function executeBackend(
  action: Record<string, unknown> = {
    action: "supabase_apply_backend",
    plan: getAuthenticatedTasksBackendPlan(),
    approval: { approved: true },
  },
  userId = "user_1",
) {
  return executeIntegrationAction({
    projectId: "project_1",
    bindingId: "binding_1",
    userId,
    action: action as never,
  });
}

describe("Supabase authenticated tasks backend operation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.operations = [];
    state.binding.providerId = "supabase";
    state.binding.status = "ready";
    state.binding.config = {
      supabaseProjectRef: "project-ref",
      supabaseProjectUrl: "https://project-ref.supabase.co",
    };
    state.auditEvents = [];
    state.operationCounter = 0;
    state.transactionTail = Promise.resolve();
    mocks.executeApprovedSupabaseQuery.mockResolvedValue({ result: [] });
    mocks.verifyAuthenticatedTasksBackend.mockResolvedValue({
      table: true,
      columns: true,
      rowLevelSecurity: true,
      authenticatedGrants: true,
      ownershipPolicies: true,
      anonAccessRevoked: true,
    });
  });

  it("requires approval and rejects unsupported or altered templates", async () => {
    await expect(
      executeBackend({
        action: "supabase_apply_backend",
        plan: getAuthenticatedTasksBackendPlan(),
        approval: { approved: false },
      }),
    ).rejects.toMatchObject({ code: "SUPABASE_BACKEND_APPROVAL_REQUIRED" });
    await expect(
      executeBackend({
        action: "supabase_apply_backend",
        plan: {
          ...getAuthenticatedTasksBackendPlan(),
          migrationChecksum: "0".repeat(64),
        },
        approval: { approved: true },
      }),
    ).rejects.toMatchObject({ code: "SUPABASE_BACKEND_PLAN_UNSUPPORTED" });
    expect(mocks.executeApprovedSupabaseQuery).not.toHaveBeenCalled();
  });

  it("applies, verifies, and records the successful migration", async () => {
    const result = await executeBackend();

    expect(result).toMatchObject({ status: "succeeded", phase: "ready" });
    expect(mocks.executeApprovedSupabaseQuery).toHaveBeenCalledOnce();
    expect(mocks.verifyAuthenticatedTasksBackend).toHaveBeenCalledOnce();
    expect(state.binding.config).toMatchObject({
      supabaseBackend: {
        status: "ready",
        verification: {
          table: true,
          columns: true,
          rowLevelSecurity: true,
          authenticatedGrants: true,
          ownershipPolicies: true,
          anonAccessRevoked: true,
        },
      },
    });
    expect(state.auditEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: "supabase_backend_approved" }),
        expect.objectContaining({ action: "supabase_backend_verified" }),
      ]),
    );
  });

  it("prevents duplicate and concurrent migration execution", async () => {
    let releaseExecution!: () => void;
    mocks.executeApprovedSupabaseQuery.mockImplementation(
      () =>
        new Promise((resolve) => {
          releaseExecution = () => resolve({ result: [] });
        }),
    );

    const first = executeBackend();
    await vi.waitFor(() => expect(state.operations).toHaveLength(1));
    const duplicate = await executeBackend();
    expect(duplicate).toMatchObject({
      id: state.operations[0].id,
      status: "running",
    });
    releaseExecution();
    const completed = await first;
    const afterSuccess = await executeBackend();

    expect(completed.id).toBe(duplicate.id);
    expect(afterSuccess.id).toBe(completed.id);
    expect(mocks.executeApprovedSupabaseQuery).toHaveBeenCalledTimes(1);
    expect(state.operations).toHaveLength(1);
  });

  it("enforces Squid project ownership", async () => {
    await expect(executeBackend(undefined, "user_2")).rejects.toMatchObject({
      code: "INTEGRATION_NOT_FOUND",
    });
    expect(mocks.executeApprovedSupabaseQuery).not.toHaveBeenCalled();
  });

  it("marks a 403 as reauthorization required without retrying", async () => {
    mocks.executeApprovedSupabaseQuery.mockRejectedValue(
      new IntegrationServiceError(
        "SUPABASE_REQUEST_FAILED",
        "raw provider response sb_secret_do_not_log",
        403,
      ),
    );

    const result = await executeBackend();
    expect(result).toMatchObject({
      status: "failed",
      phase: "reauthorization_required",
      errorMessage: "Reconnect Supabase to grant Database Write access.",
    });
    expect(mocks.executeApprovedSupabaseQuery).toHaveBeenCalledOnce();
    expect(mocks.verifyAuthenticatedTasksBackend).not.toHaveBeenCalled();
    expect(state.binding.config).toMatchObject({
      supabaseBackend: { status: "reauthorization_required" },
    });
    expect(JSON.stringify(state.operations)).not.toContain(
      "sb_secret_do_not_log",
    );
  });

  it("fails closed and sanitizes incomplete verification", async () => {
    mocks.verifyAuthenticatedTasksBackend.mockRejectedValue(
      new IntegrationServiceError(
        "SUPABASE_BACKEND_VERIFICATION_FAILED",
        "Supabase backend verification did not confirm the required table security.",
        409,
      ),
    );

    const result = await executeBackend();
    expect(result).toMatchObject({
      status: "failed",
      phase: "verification_failed",
    });
    expect(state.binding.config).toMatchObject({
      supabaseBackend: { status: "verification_failed" },
    });
  });

  it("does not persist raw provider failures", async () => {
    mocks.executeApprovedSupabaseQuery.mockRejectedValue(
      new Error("database-password management-token raw-response"),
    );
    const result = await executeBackend();
    expect(result.errorMessage).toBe(
      "The Supabase tasks backend could not be applied and verified.",
    );
    expect(JSON.stringify(state.operations)).not.toMatch(
      /database-password|management-token|raw-response/,
    );
  });
});
