import { describe, expect, it } from "vitest";

import type { BackendSetupRequest } from "@/features/generation/agent-contracts";
import { deriveChatSupabaseSetupView } from "@/features/integrations/chat-supabase-setup";
import type { IntegrationWorkspace } from "@/features/integrations/contracts";
import { getAuthenticatedTasksBackendPlan } from "@/features/integrations/supabase-backend";

const continuation: BackendSetupRequest["continuation"] = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  originalMessageId: "message_1",
  originalUserRequest: "Build an app",
  mode: "direct",
  status: "pending",
};

function request(
  requirements: BackendSetupRequest["requirements"],
): BackendSetupRequest {
  return {
    id: "setup_1",
    title: "Connect a backend before Squid builds",
    description: "This app needs Supabase.",
    capabilities: ["Browser-safe runtime"],
    requirements,
    continuation,
  };
}

function workspace(
  options: {
    runtimeReady?: boolean;
    authReady?: boolean;
    backendStatus?: "approval_required" | "applying" | "ready";
    operationPhase?: string;
  } = {},
): IntegrationWorkspace {
  const plan = getAuthenticatedTasksBackendPlan();
  return {
    providers: [],
    integrations: [
      {
        id: "binding_1",
        projectId: "project_1",
        providerId: "supabase",
        environment: "development",
        status: "ready",
        createdAt: new Date(0).toISOString(),
        updatedAt: new Date(0).toISOString(),
        config: {
          ...(options.authReady
            ? {
                supabaseAuth: {
                  status: "ready",
                  mode: "verified_email",
                  configuredAt: new Date(0).toISOString(),
                },
              }
            : {}),
        },
        supabaseManagementCapabilities: null,
        supabaseBackend:
          options.backendStatus === "ready"
            ? {
                status: "ready",
                plan,
                verifiedAt: new Date(0).toISOString(),
                verification: {
                  table: true,
                  columns: true,
                  rowLevelSecurity: true,
                  authenticatedGrants: true,
                  ownershipPolicies: true,
                  anonAccessRevoked: true,
                },
              }
            : options.backendStatus
              ? { status: options.backendStatus, plan }
              : { status: "approval_required", plan },
        connection: {
          id: "connection_1",
          displayName: "Supabase",
          authType: "oauth",
          status: "ready",
          hasCredential: true,
          lastHealthStatus: "healthy",
          lastHealthMessage: null,
          lastHealthCheckAt: new Date(0).toISOString(),
        },
      },
    ],
    recentOperations: options.operationPhase
      ? [
          {
            id: "operation_1",
            projectIntegrationId: "binding_1",
            providerId: "supabase",
            kind: "supabase_backend_migration",
            status: "running",
            phase: options.operationPhase,
            externalId: null,
            url: null,
            commitSha: null,
            errorMessage: null,
            createdAt: new Date(0).toISOString(),
            completedAt: null,
          },
        ]
      : [],
    browserRuntime: {
      supabase: options.runtimeReady
        ? {
            status: "ready",
            config: {
              url: "https://project-ref.supabase.co",
              publishableKey: "sb_publishable_test",
            },
          }
        : { status: "not_connected" },
    },
  };
}

describe("chat Supabase setup state mapper", () => {
  it("explains account and persistent-data requirements in plain language", () => {
    const view = deriveChatSupabaseSetupView({
      request: request({
        database: true,
        authentication: true,
        storage: false,
        realtime: false,
        privilegedServerLogic: false,
        backendTemplate: "authenticated_tasks",
      }),
      workspace: {
        ...workspace(),
        integrations: [],
      },
    });

    expect(view.state).toBe("connection_required");
    expect(view.message).toBe(
      "This app needs user accounts and a backend to securely save persistent data across devices.",
    );
  });

  it("surfaces only the persisted sanitized provisioning failure", () => {
    const base = workspace();
    const view = deriveChatSupabaseSetupView({
      request: request({
        database: true,
        authentication: true,
        storage: false,
        realtime: false,
        privilegedServerLogic: false,
        backendTemplate: "authenticated_tasks",
      }),
      workspace: {
        ...base,
        recentOperations: [
          {
            id: "operation_capacity",
            projectIntegrationId: "binding_1",
            providerId: "supabase",
            kind: "supabase_provision",
            status: "failed",
            phase: "failed",
            externalId: null,
            url: null,
            commitSha: null,
            errorMessage:
              "This Supabase account has reached its active-project limit. Choose an existing project or free capacity in Supabase.",
            createdAt: new Date(0).toISOString(),
            completedAt: new Date(0).toISOString(),
          },
        ],
      },
    });

    expect(view.state).toBe("failed");
    expect(view.message).toBe(
      "This Supabase account has reached its active-project limit. Choose an existing project or free capacity in Supabase.",
    );
  });

  it("completes a runtime-only request at browser runtime readiness", () => {
    const view = deriveChatSupabaseSetupView({
      request: request({
        database: true,
        authentication: false,
        storage: false,
        realtime: false,
        privilegedServerLogic: false,
      }),
      workspace: workspace({ runtimeReady: true }),
    });

    expect(view.state).toBe("runtime_ready");
  });

  it("waits for Auth configuration when authentication is required", () => {
    const view = deriveChatSupabaseSetupView({
      request: request({
        database: false,
        authentication: true,
        storage: false,
        realtime: false,
        privilegedServerLogic: false,
      }),
      workspace: workspace({ runtimeReady: true }),
    });

    expect(view.state).toBe("auth_mode_required");
  });

  it("waits for verified backend setup for authenticated task apps", () => {
    const setupRequest = request({
      database: true,
      authentication: true,
      storage: false,
      realtime: false,
      privilegedServerLogic: false,
      backendTemplate: "authenticated_tasks",
    });
    expect(
      deriveChatSupabaseSetupView({
        request: setupRequest,
        workspace: workspace({ runtimeReady: true, authReady: true }),
      }).state,
    ).toBe("backend_approval_required");
    expect(
      deriveChatSupabaseSetupView({
        request: setupRequest,
        workspace: workspace({
          runtimeReady: true,
          authReady: true,
          backendStatus: "applying",
          operationPhase: "verifying_backend",
        }),
      }).state,
    ).toBe("backend_verifying");
    expect(
      deriveChatSupabaseSetupView({
        request: setupRequest,
        workspace: workspace({
          runtimeReady: true,
          authReady: true,
          backendStatus: "ready",
        }),
      }).state,
    ).toBe("ready");
  });
});
