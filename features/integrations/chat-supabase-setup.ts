import { z } from "zod";

import type {
  BackendSetupRequest,
  SupabaseSetupRequirements,
} from "@/features/generation/agent-contracts";
import {
  integrationOperationSchema,
  type IntegrationWorkspace,
} from "@/features/integrations/contracts";
import {
  getAuthenticatedTasksBackendPlan,
  readSupabaseAuthState,
  type SupabaseBackendPlan,
} from "@/features/integrations/supabase-backend";

export const chatSupabaseSetupStateSchema = z.enum([
  "connection_required",
  "authorizing",
  "authorization_required",
  "project_setup_required",
  "provisioning",
  "runtime_ready",
  "auth_mode_required",
  "backend_approval_required",
  "backend_applying",
  "backend_verifying",
  "ready",
  "failed",
  "timed_out",
]);

export type ChatSupabaseSetupState = z.infer<
  typeof chatSupabaseSetupStateSchema
>;

export const chatSupabaseSetupViewSchema = z
  .object({
    interactionId: z.string().min(1),
    state: chatSupabaseSetupStateSchema,
    requirements: z.object({
      database: z.boolean(),
      authentication: z.boolean(),
      storage: z.boolean(),
      realtime: z.boolean(),
      privilegedServerLogic: z.boolean(),
      backendTemplate: z.literal("authenticated_tasks").optional(),
    }),
    continuationStatus: z.enum([
      "pending",
      "resumed",
      "ui_only",
      "superseded",
      "cancelled",
    ]),
    bindingId: z.string().nullable(),
    operation: z
      .object({
        id: z.string(),
        kind: z.string(),
        status: z.string(),
        phase: z.string().nullable(),
        errorMessage: z.string().nullable(),
      })
      .nullable(),
    authMode: z.enum(["prototype_instant_signup", "verified_email"]).nullable(),
    backendPlan: z
      .object({
        version: z.literal(1),
        template: z.literal("authenticated_tasks"),
        summary: z.string(),
        migrationChecksum: z.string(),
        destructive: z.literal(false),
      })
      .nullable(),
    message: z.string(),
  })
  .strict();

export type ChatSupabaseSetupView = z.infer<typeof chatSupabaseSetupViewSchema>;

export const chatSupabaseSetupActionResponseSchema = z
  .object({
    operation: integrationOperationSchema,
    view: chatSupabaseSetupViewSchema,
  })
  .strict();

export const chatSupabaseSetupActionSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("create_project"),
      organizationId: z.string().trim().min(1),
      projectName: z.string().trim().min(1).max(120).optional(),
      region: z.enum(["americas", "emea", "apac"]).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal("bind_project"),
      projectRef: z
        .string()
        .trim()
        .min(1)
        .max(128)
        .regex(/^[a-zA-Z0-9_-]+$/),
    })
    .strict(),
  z.object({ action: z.literal("resume_project") }).strict(),
  z
    .object({
      action: z.literal("configure_auth_mode"),
      mode: z.enum(["prototype_instant_signup", "verified_email"]),
      approval: z.object({ approved: z.literal(true) }).strict(),
    })
    .strict(),
  z
    .object({
      action: z.literal("approve_backend"),
      approval: z.object({ approved: z.literal(true) }).strict(),
    })
    .strict(),
]);

export type ChatSupabaseSetupAction = z.infer<
  typeof chatSupabaseSetupActionSchema
>;

function findLatestSupabaseOperation(
  workspace: IntegrationWorkspace,
  bindingId: string,
) {
  return (
    workspace.recentOperations.find(
      (operation) =>
        operation.projectIntegrationId === bindingId &&
        (operation.kind === "supabase_provision" ||
          operation.kind === "supabase_backend_migration"),
    ) ?? null
  );
}

function messageForState(
  state: ChatSupabaseSetupState,
  requirements: SupabaseSetupRequirements,
) {
  switch (state) {
    case "connection_required":
      return requirements.authentication
        ? "This app needs user accounts and a backend to securely save persistent data across devices."
        : "This app needs a backend to securely save data across devices.";
    case "authorizing":
      return "Finish authorizing Supabase in the secure window.";
    case "authorization_required":
      return "Reconnect Supabase to restore the permissions this build needs.";
    case "project_setup_required":
      return "Choose an existing Supabase project or create a new one.";
    case "provisioning":
      return "Supabase is creating and connecting your project.";
    case "runtime_ready":
      return "The browser-safe Supabase connection is ready.";
    case "auth_mode_required":
      return "Choose how new users should sign up.";
    case "backend_approval_required":
      return "Squid will create a tasks database and make sure each signed-in user can access only their own tasks.";
    case "backend_applying":
      return "Squid is creating the tasks database and applying access rules.";
    case "backend_verifying":
      return "Squid is verifying the database structure and security rules.";
    case "ready":
      return "Supabase is ready. Squid can now build authentication and persistent task data.";
    case "timed_out":
      return "Supabase took too long to finish provisioning. You can safely resume the same project.";
    case "failed":
      return "Supabase setup needs attention before this build can continue.";
  }
}

function readyMessage(requirements: SupabaseSetupRequirements) {
  if (requirements.backendTemplate === "authenticated_tasks") {
    return "Supabase is ready. Squid can now build authentication and persistent task data.";
  }
  if (requirements.authentication) {
    return "Supabase is ready. Squid can now build the requested authentication flow.";
  }
  return "The browser-safe Supabase project connection is ready.";
}

export function deriveChatSupabaseSetupView({
  request,
  workspace,
}: {
  request: BackendSetupRequest;
  workspace: IntegrationWorkspace;
}): ChatSupabaseSetupView {
  const integration =
    workspace.integrations.find(
      (candidate) =>
        candidate.providerId === "supabase" &&
        candidate.environment === "development",
    ) ??
    workspace.integrations.find(
      (candidate) => candidate.providerId === "supabase",
    ) ??
    null;
  const operation = integration
    ? findLatestSupabaseOperation(workspace, integration.id)
    : null;
  const authMode = integration
    ? (readSupabaseAuthState(integration.config)?.mode ?? null)
    : null;
  const backendPlan: SupabaseBackendPlan | null = request.requirements
    .backendTemplate
    ? getAuthenticatedTasksBackendPlan()
    : null;

  let state: ChatSupabaseSetupState;
  if (!integration) {
    state = "connection_required";
  } else if (
    integration.status === "authorization_required" ||
    integration.status === "needs_attention" ||
    integration.connection.status === "authorization_required" ||
    integration.connection.status === "needs_attention" ||
    integration.supabaseManagementCapabilities?.issue ===
      "connection_expired" ||
    integration.supabaseManagementCapabilities?.issue ===
      "insufficient_permissions"
  ) {
    state = "authorization_required";
  } else if (
    integration.status === "configured" ||
    integration.connection.status === "configured"
  ) {
    state = "authorizing";
  } else if (workspace.browserRuntime.supabase.status !== "ready") {
    if (operation?.kind === "supabase_provision") {
      state =
        operation.status === "running"
          ? "provisioning"
          : operation.status === "timed_out"
            ? "timed_out"
            : operation.status === "failed"
              ? "failed"
              : "project_setup_required";
    } else if (
      workspace.browserRuntime.supabase.status === "missing_browser_key" ||
      workspace.browserRuntime.supabase.status === "invalid_browser_key" ||
      workspace.browserRuntime.supabase.status === "invalid_project_url"
    ) {
      state = "failed";
    } else {
      state = "project_setup_required";
    }
  } else if (request.requirements.authentication && !authMode) {
    state = "auth_mode_required";
  } else if (request.requirements.backendTemplate) {
    const backend = integration.supabaseBackend;
    if (backend?.status === "reauthorization_required") {
      state = "authorization_required";
    } else if (backend?.status === "applying") {
      state =
        operation?.kind === "supabase_backend_migration" &&
        operation.phase === "verifying_backend"
          ? "backend_verifying"
          : "backend_applying";
    } else if (backend?.status === "ready") {
      state = "ready";
    } else if (backend?.status === "verification_failed") {
      state = "failed";
    } else {
      state = "backend_approval_required";
    }
  } else if (
    request.requirements.storage ||
    request.requirements.privilegedServerLogic
  ) {
    state = "failed";
  } else if (request.requirements.authentication) {
    state = "ready";
  } else {
    state = "runtime_ready";
  }

  return {
    interactionId: request.id,
    state,
    requirements: request.requirements as SupabaseSetupRequirements,
    continuationStatus: request.continuation.status,
    bindingId: integration?.id ?? null,
    operation: operation
      ? {
          id: operation.id,
          kind: operation.kind,
          status: operation.status,
          phase: operation.phase,
          errorMessage: operation.errorMessage,
        }
      : null,
    authMode,
    backendPlan,
    message:
      state === "ready" || state === "runtime_ready"
        ? readyMessage(request.requirements)
        : (state === "failed" || state === "timed_out") &&
            operation?.errorMessage
          ? operation.errorMessage
        : messageForState(state, request.requirements),
  };
}
