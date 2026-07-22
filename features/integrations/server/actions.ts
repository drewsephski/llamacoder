import "server-only";

import type { IntegrationOperation, Prisma } from "@prisma/client";

import type { z } from "zod";
import type { integrationActionInputSchema } from "@/features/integrations/contracts";
import {
  listGitHubRepositories,
  publishGitHubBundle,
} from "@/features/integrations/server/github";
import { getProjectExportBundle } from "@/features/integrations/server/project-artifact";
import { IntegrationServiceError } from "@/features/integrations/server/service";
import {
  deployVercelBundle,
  listVercelProjects,
} from "@/features/integrations/server/vercel";
import {
  configureSupabaseAuthMode,
  createSupabaseProject,
  executeApprovedSupabaseDatabaseQuery,
  getSupabaseProjectBrowserConfiguration,
  getSupabaseProjectProvisioningStatus,
  listSupabaseOrganizations,
  listSupabaseProjects,
} from "@/features/integrations/server/supabase";
import {
  AUTHENTICATED_TASKS_MIGRATION_SQL,
  buildAuthenticatedTasksMigrationId,
  isAuthenticatedTasksBackendPlan,
  verifyAuthenticatedTasksBackend,
} from "@/features/integrations/server/supabase-authenticated-tasks";
import {
  getAuthenticatedTasksBackendPlan,
  supabaseAuthModeSchema,
} from "@/features/integrations/supabase-backend";
import { getPrisma } from "@/lib/prisma";
import {
  getAuthorizedProjectIntegration,
  providerFetch,
} from "@/features/integrations/server/provider-client";

type ActionInput = z.infer<typeof integrationActionInputSchema>;

export const SUPABASE_PROVISIONING_TIMEOUT_MS = 15 * 60 * 1_000;

type SupabaseProvisioningPhase =
  | "creating_project"
  | "waiting_for_supabase"
  | "configuring_browser_access"
  | "ready"
  | "failed"
  | "timed_out";

function readOperationMetadata(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function readMetadataString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readOperationPhase(value: unknown) {
  return readMetadataString(readOperationMetadata(value), "phase");
}

function serializeOperation(operation: {
  id: string;
  projectIntegrationId: string;
  providerId: string;
  kind: string;
  status: string;
  externalId: string | null;
  url: string | null;
  commitSha: string | null;
  errorMessage: string | null;
  metadata?: unknown;
  createdAt: Date;
  completedAt: Date | null;
}) {
  return {
    id: operation.id,
    projectIntegrationId: operation.projectIntegrationId,
    providerId: operation.providerId,
    kind: operation.kind,
    status: operation.status,
    phase: readOperationPhase(operation.metadata),
    externalId: operation.externalId,
    url: operation.url,
    commitSha: operation.commitSha,
    errorMessage: operation.errorMessage,
    createdAt: operation.createdAt.toISOString(),
    completedAt: operation.completedAt?.toISOString() ?? null,
  };
}

async function requireBinding({
  projectId,
  bindingId,
  userId,
}: {
  projectId: string;
  bindingId: string;
  userId: string;
}) {
  const binding = await getPrisma().projectIntegration.findFirst({
    where: { id: bindingId, chatId: projectId, connection: { userId } },
  });
  if (!binding) {
    throw new IntegrationServiceError(
      "INTEGRATION_NOT_FOUND",
      "Integration not found.",
      404,
    );
  }
  if (binding.status !== "ready") {
    throw new IntegrationServiceError(
      "INTEGRATION_NOT_READY",
      "Verify the connection before using it.",
      409,
    );
  }
  return binding;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type SupabaseProvisionAction = Extract<
  ActionInput,
  { action: "supabase_provision" }
>;

type SupabaseApplyBackendAction = Extract<
  ActionInput,
  { action: "supabase_apply_backend" }
>;

type SupabaseBindProjectAction = Extract<
  ActionInput,
  { action: "supabase_bind_project" }
>;

type SupabaseConfigureAuthModeAction = Extract<
  ActionInput,
  { action: "supabase_configure_auth_mode" }
>;

function buildSupabaseOperationMetadata(action: SupabaseProvisionAction) {
  const metadata: Record<string, unknown> = {};
  if (action.messageId) metadata.messageId = action.messageId;
  if (action.organizationId) metadata.organizationId = action.organizationId;
  if (action.region) metadata.region = action.region;
  if (action.projectName) metadata.projectName = action.projectName;
  if (action.authMode) metadata.authMode = action.authMode;
  return metadata;
}

function safeSupabaseOperationError(error: unknown) {
  if (error instanceof IntegrationServiceError) {
    if (
      error.code === "AUTHORIZATION_REQUIRED" ||
      (error.code === "SUPABASE_REQUEST_FAILED" &&
        (error.status === 401 || error.status === 403))
    ) {
      return {
        code: "SUPABASE_RECONNECT_REQUIRED",
        message: "Reconnect Supabase to continue project provisioning.",
      };
    }
    if (error.code === "SUPABASE_KEY_MISSING") {
      return {
        code: error.code,
        message: "Supabase did not provide a browser-safe publishable key.",
      };
    }
    if (error.code === "SUPABASE_KEY_REJECTED") {
      return {
        code: error.code,
        message: "Supabase returned ambiguous or privileged browser keys.",
      };
    }
    if (error.code === "SUPABASE_PROJECT_URL_INVALID") {
      return {
        code: error.code,
        message: "Supabase did not provide a valid project URL.",
      };
    }
    if (error.code === "SUPABASE_REQUEST_FAILED" && error.status === 429) {
      return {
        code: "SUPABASE_RATE_LIMITED",
        message: "Supabase rate-limited the provisioning check. Retry shortly.",
      };
    }
    if (error.code === "SUPABASE_PROJECT_LIMIT_REACHED") {
      return {
        code: error.code,
        message:
          "This Supabase account has reached its active-project limit. Choose an existing project or free capacity in Supabase.",
      };
    }
  }
  return {
    code: "SUPABASE_PROVISION_FAILED",
    message: "Supabase project provisioning could not be completed.",
  };
}

async function beginSupabaseProvisioningOperation({
  projectId,
  userId,
  binding,
  action,
}: {
  projectId: string;
  userId: string;
  binding: Awaited<ReturnType<typeof requireBinding>>;
  action: SupabaseProvisionAction;
}) {
  return getPrisma().$transaction(async (tx) => {
    const lockKey = `supabase-provision:${binding.id}`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`;

    const existingOperation = await tx.integrationOperation.findFirst({
      where: {
        chatId: projectId,
        projectIntegrationId: binding.id,
        userId,
        providerId: "supabase",
        kind: "supabase_provision",
        status: "running",
      },
      orderBy: { createdAt: "desc" },
    });
    if (existingOperation) {
      const existingMetadata = readOperationMetadata(
        existingOperation.metadata,
      );
      if (
        !supabaseAuthModeSchema.safeParse(existingMetadata.authMode).success
      ) {
        const updated = await tx.integrationOperation.update({
          where: { id: existingOperation.id },
          data: {
            metadata: {
              ...existingMetadata,
              authMode: action.authMode,
            } as Prisma.InputJsonValue,
          },
        });
        return { operation: updated, created: false };
      }
      return { operation: existingOperation, created: false };
    }

    const currentBinding = await tx.projectIntegration.findUnique({
      where: { id: binding.id },
      select: { config: true },
    });
    const bindingConfig = isRecord(currentBinding?.config)
      ? currentBinding.config
      : {};
    const projectRef = readMetadataString(bindingConfig, "supabaseProjectRef");
    const projectUrl = readMetadataString(bindingConfig, "supabaseProjectUrl");
    const phase: SupabaseProvisioningPhase = projectRef
      ? "waiting_for_supabase"
      : "creating_project";
    const metadata = {
      ...buildSupabaseOperationMetadata(action),
      phase,
      ...(projectRef ? { projectRef } : {}),
    };
    const operation = await tx.integrationOperation.create({
      data: {
        userId,
        chatId: projectId,
        connectionId: binding.connectionId,
        projectIntegrationId: binding.id,
        providerId: "supabase",
        kind: "supabase_provision",
        status: "running",
        externalId: projectRef,
        url: projectUrl,
        metadata: metadata as Prisma.InputJsonValue,
      },
    });
    return { operation, created: true };
  });
}

async function failSupabaseProvisioningOperation({
  operation,
  binding,
  userId,
  phase,
  errorCode,
  errorMessage,
  providerStatus,
}: {
  operation: {
    id: string;
    metadata: unknown;
    externalId: string | null;
  };
  binding: Awaited<ReturnType<typeof requireBinding>>;
  userId: string;
  phase: "failed" | "timed_out";
  errorCode: string;
  errorMessage: string;
  providerStatus?: string | null;
}) {
  return getPrisma().$transaction(async (tx) => {
    if (
      errorCode === "SUPABASE_KEY_MISSING" ||
      errorCode === "SUPABASE_KEY_REJECTED"
    ) {
      const currentBinding = await tx.projectIntegration.findUnique({
        where: { id: binding.id },
        select: { config: true },
      });
      const existingConfig = isRecord(currentBinding?.config)
        ? currentBinding.config
        : {};
      await tx.projectIntegration.update({
        where: { id: binding.id },
        data: {
          config: {
            ...existingConfig,
            supabaseBrowserKeyStatus:
              errorCode === "SUPABASE_KEY_MISSING" ? "missing" : "rejected",
          } as Prisma.InputJsonValue,
        },
      });
    }

    const metadata = {
      ...readOperationMetadata(operation.metadata),
      phase,
      errorCode,
      ...(providerStatus ? { providerStatus } : {}),
    };
    await tx.integrationAuditEvent.create({
      data: {
        userId,
        providerId: "supabase",
        action:
          phase === "timed_out"
            ? "supabase_provision_timed_out"
            : "supabase_provision_failed",
        environment: binding.environment,
        connectionId: binding.connectionId,
        projectIntegrationId: binding.id,
        metadata: {
          phase,
          errorCode,
          projectRef: operation.externalId,
          providerStatus: providerStatus ?? null,
        },
      },
    });
    return tx.integrationOperation.update({
      where: { id: operation.id },
      data: {
        status: phase,
        errorMessage,
        metadata: metadata as Prisma.InputJsonValue,
        completedAt: new Date(),
      },
    });
  });
}

export async function listIntegrationResources(input: {
  projectId: string;
  bindingId: string;
  userId: string;
  resourceType?: "organizations" | "projects";
  organizationId?: string | null;
}) {
  const binding = await requireBinding(input);
  if (binding.providerId === "github") return listGitHubRepositories(input);
  if (binding.providerId === "vercel") return listVercelProjects(input);
  if (binding.providerId === "supabase") {
    return input.resourceType === "projects"
      ? listSupabaseProjects(input)
      : listSupabaseOrganizations(input);
  }
  throw new IntegrationServiceError(
    "RESOURCES_UNSUPPORTED",
    "This integration does not expose selectable resources.",
    400,
  );
}

async function executeSupabaseBindProjectAction({
  projectId,
  bindingId,
  userId,
  binding,
  action,
}: {
  projectId: string;
  bindingId: string;
  userId: string;
  binding: Awaited<ReturnType<typeof requireBinding>>;
  action: SupabaseBindProjectAction;
}) {
  if (action.authMode && !action.authModeApproval?.approved) {
    throw new IntegrationServiceError(
      "SUPABASE_AUTH_MODE_APPROVAL_REQUIRED",
      "Explicit approval is required before changing Supabase Auth mode.",
      409,
    );
  }
  if (action.authMode) {
    await configureSupabaseAuthMode({
      projectId,
      bindingId,
      userId,
      projectRef: action.projectRef,
      mode: action.authMode,
    });
  }
  const browserConfiguration = await getSupabaseProjectBrowserConfiguration({
    projectId,
    bindingId,
    userId,
    projectRef: action.projectRef,
  });

  const operation = await getPrisma().$transaction(async (tx) => {
    const lockKey = `supabase-bind-project:${binding.id}`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`;
    const currentBinding = await tx.projectIntegration.findUnique({
      where: { id: binding.id },
      select: { config: true },
    });
    const currentConfig = isRecord(currentBinding?.config)
      ? currentBinding.config
      : {};
    const alreadyBound =
      readMetadataString(currentConfig, "supabaseProjectRef") ===
        action.projectRef &&
      Boolean(readMetadataString(currentConfig, "supabaseProjectUrl")) &&
      Boolean(readMetadataString(currentConfig, "supabasePublishableKey"));
    if (alreadyBound) {
      const existing = await tx.integrationOperation.findFirst({
        where: {
          chatId: projectId,
          projectIntegrationId: binding.id,
          userId,
          providerId: "supabase",
          kind: "supabase_bind_project",
          externalId: action.projectRef,
          status: "succeeded",
        },
        orderBy: { createdAt: "desc" },
      });
      if (existing) return existing;
    }

    const nextConfig = { ...currentConfig };
    if (
      readMetadataString(currentConfig, "supabaseProjectRef") !==
      action.projectRef
    ) {
      delete nextConfig.supabaseBackend;
    }
    Object.assign(nextConfig, browserConfiguration.config);
    await tx.projectIntegration.update({
      where: { id: binding.id },
      data: {
        status: "ready",
        config: nextConfig as Prisma.InputJsonValue,
      },
    });
    await tx.integrationAuditEvent.create({
      data: {
        userId,
        providerId: "supabase",
        action: "supabase_project_bound",
        environment: binding.environment,
        connectionId: binding.connectionId,
        projectIntegrationId: binding.id,
        metadata: {
          projectRef: action.projectRef,
          providerStatus: browserConfiguration.providerStatus,
        },
      },
    });
    const completedAt = new Date();
    return tx.integrationOperation.create({
      data: {
        userId,
        chatId: projectId,
        connectionId: binding.connectionId,
        projectIntegrationId: binding.id,
        providerId: "supabase",
        kind: "supabase_bind_project",
        status: "succeeded",
        externalId: action.projectRef,
        url: browserConfiguration.runtimeConfig.url,
        metadata: {
          phase: "ready",
          projectRef: action.projectRef,
          providerStatus: browserConfiguration.providerStatus,
        },
        completedAt,
      },
    });
  });
  return serializeOperation(operation);
}

async function executeSupabaseConfigureAuthModeAction({
  projectId,
  bindingId,
  userId,
  binding,
  action,
}: {
  projectId: string;
  bindingId: string;
  userId: string;
  binding: Awaited<ReturnType<typeof requireBinding>>;
  action: SupabaseConfigureAuthModeAction;
}) {
  if (!action.approval.approved) {
    throw new IntegrationServiceError(
      "SUPABASE_AUTH_MODE_APPROVAL_REQUIRED",
      "Explicit approval is required before changing Supabase Auth mode.",
      409,
    );
  }
  const config = isRecord(binding.config) ? binding.config : {};
  const projectRef = readMetadataString(config, "supabaseProjectRef");
  if (!projectRef) {
    throw new IntegrationServiceError(
      "SUPABASE_PROJECT_NOT_BOUND",
      "Connect a Supabase project before configuring authentication mode.",
      409,
    );
  }

  const externalId = projectRef;
  const started = await getPrisma().$transaction(async (tx) => {
    const lockKey = `supabase-auth-mode:${binding.id}`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`;
    const existing = await tx.integrationOperation.findFirst({
      where: {
        chatId: projectId,
        projectIntegrationId: binding.id,
        userId,
        providerId: "supabase",
        kind: "supabase_configure_auth_mode",
        externalId,
        status: { in: ["running", "succeeded"] },
      },
      orderBy: { createdAt: "desc" },
    });
    if (
      existing &&
      readMetadataString(readOperationMetadata(existing.metadata), "mode") ===
        action.mode
    ) {
      return { operation: existing, created: false };
    }
    const operation = await tx.integrationOperation.create({
      data: {
        userId,
        chatId: projectId,
        connectionId: binding.connectionId,
        projectIntegrationId: binding.id,
        providerId: "supabase",
        kind: "supabase_configure_auth_mode",
        status: "running",
        externalId,
        metadata: {
          phase: "configuring_auth",
          projectRef,
          mode: action.mode,
        },
      },
    });
    return { operation, created: true };
  });
  if (!started.created) return serializeOperation(started.operation);

  try {
    const authState = await configureSupabaseAuthMode({
      projectId,
      bindingId,
      userId,
      projectRef,
      mode: action.mode,
    });
    const completedAt = new Date();
    const operation = await getPrisma().integrationOperation.update({
      where: { id: started.operation.id },
      data: {
        status: "succeeded",
        metadata: {
          phase: "ready",
          projectRef,
          mode: authState.mode,
          outcome: "configured",
        },
        completedAt,
      },
    });
    return serializeOperation(operation);
  } catch (error) {
    await getPrisma().integrationOperation.update({
      where: { id: started.operation.id },
      data: {
        status: "failed",
        errorMessage: "Supabase authentication mode could not be configured.",
        metadata: {
          phase: "failed",
          projectRef,
          mode: action.mode,
        },
        completedAt: new Date(),
      },
    });
    throw error;
  }
}

async function executeSupabaseProvisioningAction({
  projectId,
  bindingId,
  userId,
  binding,
  action,
}: {
  projectId: string;
  bindingId: string;
  userId: string;
  binding: Awaited<ReturnType<typeof requireBinding>>;
  action: SupabaseProvisionAction;
}) {
  if (action.authMode && !action.authModeApproval?.approved) {
    throw new IntegrationServiceError(
      "SUPABASE_AUTH_MODE_APPROVAL_REQUIRED",
      "Select and approve a Supabase Auth mode before creating a project.",
      409,
    );
  }
  const started = await beginSupabaseProvisioningOperation({
    projectId,
    userId,
    binding,
    action,
  });
  if (!started.created || started.operation.externalId) {
    return serializeOperation(started.operation);
  }

  try {
    const createdProject = await createSupabaseProject({
      projectId,
      bindingId,
      userId,
      organizationId: action.organizationId,
      region: action.region,
      projectName: action.projectName,
    });
    const updated = await getPrisma().$transaction(async (tx) => {
      const previousConfig = await tx.projectIntegration.findUnique({
        where: { id: binding.id },
        select: { config: true },
      });
      const existingConfig = isRecord(previousConfig?.config)
        ? previousConfig.config
        : {};
      await tx.projectIntegration.update({
        where: { id: binding.id },
        data: {
          config: {
            ...existingConfig,
            ...createdProject.config,
          } as Prisma.InputJsonValue,
        },
      });
      await tx.integrationAuditEvent.create({
        data: {
          userId,
          providerId: "supabase",
          action: "supabase_project_created",
          environment: binding.environment,
          connectionId: binding.connectionId,
          projectIntegrationId: binding.id,
          metadata: createdProject.metadata,
        },
      });
      return tx.integrationOperation.update({
        where: { id: started.operation.id },
        data: {
          status: "running",
          externalId: createdProject.projectRef,
          url: createdProject.url,
          errorMessage: null,
          metadata: {
            ...readOperationMetadata(started.operation.metadata),
            ...readOperationMetadata(createdProject.metadata),
            phase: "waiting_for_supabase",
            projectRef: createdProject.projectRef,
          } as Prisma.InputJsonValue,
        },
      });
    });
    return serializeOperation(updated);
  } catch (error) {
    const safeError = safeSupabaseOperationError(error);
    const failed = await failSupabaseProvisioningOperation({
      operation: started.operation,
      binding,
      userId,
      phase: "failed",
      errorCode: safeError.code,
      errorMessage: safeError.message,
    });
    return serializeOperation(failed);
  }
}

function safeSupabaseBackendError(error: unknown) {
  if (error instanceof IntegrationServiceError) {
    if (error.status === 401 || error.code === "AUTHORIZATION_REQUIRED") {
      return {
        code: "SUPABASE_CONNECTION_EXPIRED",
        message: "The Supabase connection expired. Reconnect Supabase.",
        reauthorizationRequired: true,
      };
    }
    if (error.status === 403) {
      return {
        code: "SUPABASE_DATABASE_REAUTHORIZATION_REQUIRED",
        message: "Reconnect Supabase to grant Database Write access.",
        reauthorizationRequired: true,
      };
    }
    if (error.code === "SUPABASE_BACKEND_VERIFICATION_FAILED") {
      return {
        code: error.code,
        message: error.message,
        reauthorizationRequired: false,
      };
    }
    if (error.status === 429) {
      return {
        code: "SUPABASE_BACKEND_RATE_LIMITED",
        message: "Supabase rate-limited the backend operation. Retry shortly.",
        reauthorizationRequired: false,
      };
    }
  }
  return {
    code: "SUPABASE_BACKEND_FAILED",
    message: "The Supabase tasks backend could not be applied and verified.",
    reauthorizationRequired: false,
  };
}

async function executeSupabaseBackendAction({
  projectId,
  bindingId,
  userId,
  binding,
  action,
}: {
  projectId: string;
  bindingId: string;
  userId: string;
  binding: Awaited<ReturnType<typeof requireBinding>>;
  action: SupabaseApplyBackendAction;
}) {
  if (!action.approval.approved) {
    throw new IntegrationServiceError(
      "SUPABASE_BACKEND_APPROVAL_REQUIRED",
      "Explicit approval is required before creating the Supabase tasks backend.",
      409,
    );
  }
  if (!isAuthenticatedTasksBackendPlan(action.plan)) {
    throw new IntegrationServiceError(
      "SUPABASE_BACKEND_PLAN_UNSUPPORTED",
      "The requested Supabase backend template or security behavior is unsupported.",
      400,
    );
  }

  const currentBinding = await getPrisma().projectIntegration.findUnique({
    where: { id: binding.id },
    select: { config: true },
  });
  const config = isRecord(currentBinding?.config) ? currentBinding.config : {};
  const projectRef = readMetadataString(config, "supabaseProjectRef");
  const projectUrl = readMetadataString(config, "supabaseProjectUrl");
  if (!projectRef || !projectUrl) {
    throw new IntegrationServiceError(
      "SUPABASE_PROJECT_NOT_READY",
      "Finish Supabase project provisioning before approving the backend.",
      409,
    );
  }

  const plan = getAuthenticatedTasksBackendPlan();
  const migrationId = buildAuthenticatedTasksMigrationId({
    squidProjectId: projectId,
    supabaseProjectRef: projectRef,
  });
  const started = await getPrisma().$transaction(async (tx) => {
    const lockKey = `supabase-backend:${migrationId}`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`;
    const existing = await tx.integrationOperation.findFirst({
      where: {
        chatId: projectId,
        projectIntegrationId: binding.id,
        userId,
        providerId: "supabase",
        kind: "supabase_backend_migration",
        externalId: migrationId,
        status: { in: ["running", "succeeded"] },
      },
      orderBy: { createdAt: "desc" },
    });
    if (existing) return { operation: existing, created: false };

    const startedAt = new Date();
    const operation = await tx.integrationOperation.create({
      data: {
        userId,
        chatId: projectId,
        connectionId: binding.connectionId,
        projectIntegrationId: binding.id,
        providerId: "supabase",
        kind: "supabase_backend_migration",
        status: "running",
        externalId: migrationId,
        metadata: {
          phase: "applying_backend",
          template: plan.template,
          version: plan.version,
          migrationChecksum: plan.migrationChecksum,
          projectRef,
          startedAt: startedAt.toISOString(),
        },
      },
    });
    await tx.projectIntegration.update({
      where: { id: binding.id },
      data: {
        config: {
          ...config,
          supabaseBackend: { status: "applying", plan },
        } as Prisma.InputJsonValue,
      },
    });
    await tx.integrationAuditEvent.create({
      data: {
        userId,
        providerId: "supabase",
        action: "supabase_backend_approved",
        environment: binding.environment,
        connectionId: binding.connectionId,
        projectIntegrationId: binding.id,
        metadata: {
          template: plan.template,
          version: plan.version,
          migrationChecksum: plan.migrationChecksum,
          projectRef,
          destructive: false,
        },
      },
    });
    return { operation, created: true };
  });
  if (!started.created) return serializeOperation(started.operation);

  try {
    await executeApprovedSupabaseDatabaseQuery({
      projectId,
      bindingId,
      userId,
      projectRef,
      query: AUTHENTICATED_TASKS_MIGRATION_SQL,
      approval: { approved: true, approvedByUserId: userId },
    });
    await getPrisma().integrationOperation.update({
      where: { id: started.operation.id },
      data: {
        metadata: {
          ...readOperationMetadata(started.operation.metadata),
          phase: "verifying_backend",
        } as Prisma.InputJsonValue,
      },
    });
    const verification = await verifyAuthenticatedTasksBackend({
      projectId,
      bindingId,
      userId,
      projectRef,
    });
    const verifiedAt = new Date();
    const completed = await getPrisma().$transaction(async (tx) => {
      const latestBinding = await tx.projectIntegration.findUnique({
        where: { id: binding.id },
        select: { config: true },
      });
      const latestConfig = isRecord(latestBinding?.config)
        ? latestBinding.config
        : {};
      await tx.projectIntegration.update({
        where: { id: binding.id },
        data: {
          status: "ready",
          config: {
            ...latestConfig,
            supabaseBackend: {
              status: "ready",
              plan,
              verifiedAt: verifiedAt.toISOString(),
              verification,
            },
          } as Prisma.InputJsonValue,
        },
      });
      await tx.integrationAuditEvent.create({
        data: {
          userId,
          providerId: "supabase",
          action: "supabase_backend_verified",
          environment: binding.environment,
          connectionId: binding.connectionId,
          projectIntegrationId: binding.id,
          metadata: {
            template: plan.template,
            version: plan.version,
            migrationChecksum: plan.migrationChecksum,
            projectRef,
            verification,
          },
        },
      });
      return tx.integrationOperation.update({
        where: { id: started.operation.id },
        data: {
          status: "succeeded",
          errorMessage: null,
          metadata: {
            ...readOperationMetadata(started.operation.metadata),
            phase: "ready",
            completedAt: verifiedAt.toISOString(),
            verification,
          } as Prisma.InputJsonValue,
          completedAt: verifiedAt,
        },
      });
    });
    return serializeOperation(completed);
  } catch (error) {
    const safeError = safeSupabaseBackendError(error);
    const completedAt = new Date();
    const failed = await getPrisma().$transaction(async (tx) => {
      const latestBinding = await tx.projectIntegration.findUnique({
        where: { id: binding.id },
        select: { config: true },
      });
      const latestConfig = isRecord(latestBinding?.config)
        ? latestBinding.config
        : {};
      const backendState = safeError.reauthorizationRequired
        ? { status: "reauthorization_required" as const, plan }
        : {
            status: "verification_failed" as const,
            plan,
            message: safeError.message,
          };
      await tx.projectIntegration.update({
        where: { id: binding.id },
        data: {
          ...(safeError.reauthorizationRequired
            ? { status: "needs_attention" }
            : {}),
          config: {
            ...latestConfig,
            supabaseBackend: backendState,
          } as Prisma.InputJsonValue,
        },
      });
      if (safeError.reauthorizationRequired) {
        await tx.integrationConnection.update({
          where: { id: binding.connectionId },
          data: {
            status: "needs_attention",
            lastHealthStatus: "failed",
            lastHealthMessage: safeError.message,
            lastHealthCheckAt: completedAt,
          },
        });
      }
      await tx.integrationAuditEvent.create({
        data: {
          userId,
          providerId: "supabase",
          action: safeError.reauthorizationRequired
            ? "supabase_backend_reauthorization_required"
            : "supabase_backend_verification_failed",
          environment: binding.environment,
          connectionId: binding.connectionId,
          projectIntegrationId: binding.id,
          metadata: {
            template: plan.template,
            version: plan.version,
            migrationChecksum: plan.migrationChecksum,
            projectRef,
            errorCode: safeError.code,
          },
        },
      });
      return tx.integrationOperation.update({
        where: { id: started.operation.id },
        data: {
          status: "failed",
          errorMessage: safeError.message,
          metadata: {
            ...readOperationMetadata(started.operation.metadata),
            phase: safeError.reauthorizationRequired
              ? "reauthorization_required"
              : "verification_failed",
            errorCode: safeError.code,
            completedAt: completedAt.toISOString(),
            verification: { status: "failed" },
          } as Prisma.InputJsonValue,
          completedAt,
        },
      });
    });
    return serializeOperation(failed);
  }
}

export async function executeIntegrationAction({
  projectId,
  bindingId,
  userId,
  action,
}: {
  projectId: string;
  bindingId: string;
  userId: string;
  action: ActionInput;
}) {
  const binding = await requireBinding({ projectId, bindingId, userId });
  const expectedProvider =
    action.action === "github_publish"
      ? "github"
      : action.action === "vercel_deploy"
        ? "vercel"
        : "supabase";
  if (binding.providerId !== expectedProvider) {
    throw new IntegrationServiceError(
      "ACTION_PROVIDER_MISMATCH",
      "This action does not match the connected provider.",
      400,
    );
  }
  if (action.action === "supabase_provision") {
    return executeSupabaseProvisioningAction({
      projectId,
      bindingId,
      userId,
      binding,
      action,
    });
  }
  if (action.action === "supabase_bind_project") {
    return executeSupabaseBindProjectAction({
      projectId,
      bindingId,
      userId,
      binding,
      action,
    });
  }
  if (action.action === "supabase_configure_auth_mode") {
    return executeSupabaseConfigureAuthModeAction({
      projectId,
      bindingId,
      userId,
      binding,
      action,
    });
  }
  if (action.action === "supabase_apply_backend") {
    return executeSupabaseBackendAction({
      projectId,
      bindingId,
      userId,
      binding,
      action,
    });
  }
  const operationMetadata: Record<string, unknown> = {};
  if (action.messageId) {
    operationMetadata.messageId = action.messageId;
  }
  const operation = await getPrisma().integrationOperation.create({
    data: {
      userId,
      chatId: projectId,
      connectionId: binding.connectionId,
      projectIntegrationId: binding.id,
      providerId: binding.providerId,
      kind: action.action,
      status: "running",
      metadata: operationMetadata as Prisma.InputJsonValue,
    },
  });
  try {
    const bundle = await getProjectExportBundle({
      projectId,
      messageId: action.messageId!,
      userId,
    });
    const result =
      action.action === "github_publish"
        ? await publishGitHubBundle({
            projectId,
            bindingId,
            userId,
            repository: action.repository,
            branch: action.branch,
            bundle,
          })
        : await deployVercelBundle({
            projectId,
            bindingId,
            userId,
            vercelProjectId: action.projectId,
            target: action.target,
            bundle,
          });
    const completed = await getPrisma().$transaction(async (tx) => {
      await tx.projectIntegration.update({
        where: { id: binding.id },
        data: { config: result.metadata as Prisma.InputJsonValue },
      });
      await tx.integrationAuditEvent.create({
        data: {
          userId,
          providerId: binding.providerId,
          action: action.action,
          environment: binding.environment,
          connectionId: binding.connectionId,
          projectIntegrationId: binding.id,
          metadata: result.metadata as Prisma.InputJsonValue,
        },
      });
      return tx.integrationOperation.update({
        where: { id: operation.id },
        data: {
          status: result.operationStatus,
          externalId: result.externalId,
          url: result.url,
          commitSha: "commitSha" in result ? result.commitSha : null,
          metadata: result.metadata as Prisma.InputJsonValue,
          completedAt:
            result.operationStatus === "succeeded" ? new Date() : null,
        },
      });
    });
    return serializeOperation(completed);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The provider operation failed.";
    await getPrisma().integrationOperation.update({
      where: { id: operation.id },
      data: {
        status: "failed",
        errorMessage: message,
        completedAt: new Date(),
      },
    });
    throw error;
  }
}

async function refreshSupabaseProvisioningOperation({
  projectId,
  bindingId,
  userId,
  operation,
}: {
  projectId: string;
  bindingId: string;
  userId: string;
  operation: IntegrationOperation;
}) {
  const binding = await requireBinding({ projectId, bindingId, userId });
  const elapsedMs = Date.now() - operation.createdAt.getTime();
  if (elapsedMs >= SUPABASE_PROVISIONING_TIMEOUT_MS) {
    const timedOut = await failSupabaseProvisioningOperation({
      operation,
      binding,
      userId,
      phase: "timed_out",
      errorCode: "SUPABASE_PROVISION_TIMEOUT",
      errorMessage:
        "Supabase project provisioning timed out. Retry or reconnect Supabase.",
      providerStatus: readMetadataString(
        readOperationMetadata(operation.metadata),
        "providerStatus",
      ),
    });
    return serializeOperation(timedOut);
  }

  const metadata = readOperationMetadata(operation.metadata);
  const projectRef =
    operation.externalId ?? readMetadataString(metadata, "projectRef");
  if (!projectRef) {
    return serializeOperation(operation);
  }

  try {
    const project = await getSupabaseProjectProvisioningStatus({
      projectId,
      bindingId,
      userId,
      projectRef,
    });
    if (project.terminalError) {
      const failed = await failSupabaseProvisioningOperation({
        operation,
        binding,
        userId,
        phase: "failed",
        errorCode: "SUPABASE_PROJECT_TERMINAL",
        errorMessage: `Supabase reported terminal project status ${project.providerStatus}.`,
        providerStatus: project.providerStatus,
      });
      return serializeOperation(failed);
    }

    const currentPhase = readOperationPhase(operation.metadata);
    if (!project.ready || currentPhase !== "configuring_browser_access") {
      const phase: SupabaseProvisioningPhase = project.ready
        ? "configuring_browser_access"
        : "waiting_for_supabase";
      const updated = await getPrisma().integrationOperation.update({
        where: { id: operation.id },
        data: {
          status: "running",
          externalId: project.projectRef,
          url: project.url ?? operation.url,
          errorMessage: null,
          metadata: {
            ...metadata,
            phase,
            projectRef: project.projectRef,
            providerStatus: project.providerStatus,
          } as Prisma.InputJsonValue,
        },
      });
      return serializeOperation(updated);
    }

    const authModeResult = supabaseAuthModeSchema.safeParse(metadata.authMode);
    if (authModeResult.success) {
      await configureSupabaseAuthMode({
        projectId,
        bindingId,
        userId,
        projectRef: project.projectRef,
        mode: authModeResult.data,
      });
    }
    const browserConfiguration = await getSupabaseProjectBrowserConfiguration({
      projectId,
      bindingId,
      userId,
      projectRef: project.projectRef,
    });
    const completed = await getPrisma().$transaction(async (tx) => {
      const previousConfig = await tx.projectIntegration.findUnique({
        where: { id: binding.id },
        select: { config: true },
      });
      const existingConfig = isRecord(previousConfig?.config)
        ? previousConfig.config
        : {};
      await tx.projectIntegration.update({
        where: { id: binding.id },
        data: {
          config: {
            ...existingConfig,
            ...browserConfiguration.config,
          } as Prisma.InputJsonValue,
        },
      });
      await tx.integrationAuditEvent.create({
        data: {
          userId,
          providerId: "supabase",
          action: "supabase_project_ready",
          environment: binding.environment,
          connectionId: binding.connectionId,
          projectIntegrationId: binding.id,
          metadata: {
            phase: "ready",
            projectRef: project.projectRef,
            providerStatus: browserConfiguration.providerStatus,
          },
        },
      });
      return tx.integrationOperation.update({
        where: { id: operation.id },
        data: {
          status: "succeeded",
          externalId: project.projectRef,
          url: browserConfiguration.runtimeConfig.url,
          errorMessage: null,
          metadata: {
            ...metadata,
            phase: "ready",
            projectRef: project.projectRef,
            providerStatus: browserConfiguration.providerStatus,
          } as Prisma.InputJsonValue,
          completedAt: new Date(),
        },
      });
    });
    return serializeOperation(completed);
  } catch (error) {
    if (
      error instanceof IntegrationServiceError &&
      error.code === "SUPABASE_PROJECT_NOT_READY"
    ) {
      return serializeOperation(operation);
    }
    const safeError = safeSupabaseOperationError(error);
    const failed = await failSupabaseProvisioningOperation({
      operation,
      binding,
      userId,
      phase: "failed",
      errorCode: safeError.code,
      errorMessage: safeError.message,
    });
    return serializeOperation(failed);
  }
}

export async function refreshIntegrationOperation({
  projectId,
  bindingId,
  operationId,
  userId,
}: {
  projectId: string;
  bindingId: string;
  operationId: string;
  userId: string;
}) {
  const operation = await getPrisma().integrationOperation.findFirst({
    where: {
      id: operationId,
      chatId: projectId,
      projectIntegrationId: bindingId,
      userId,
    },
  });
  if (!operation) {
    throw new IntegrationServiceError(
      "OPERATION_NOT_FOUND",
      "Provider operation not found.",
      404,
    );
  }
  if (operation.status !== "running") {
    return serializeOperation(operation);
  }
  if (
    operation.providerId === "supabase" &&
    operation.kind === "supabase_provision"
  ) {
    return refreshSupabaseProvisioningOperation({
      projectId,
      bindingId,
      operation,
      userId,
    });
  }
  if (!operation.externalId || operation.providerId !== "vercel") {
    return serializeOperation(operation);
  }
  const authorized = await getAuthorizedProjectIntegration({
    projectId,
    bindingId,
    userId,
    expectedProvider: "vercel",
  });
  const url = new URL(
    `/v13/deployments/${encodeURIComponent(operation.externalId)}`,
    "https://api.vercel.com",
  );
  if (typeof authorized.metadata.teamId === "string") {
    url.searchParams.set("teamId", authorized.metadata.teamId);
  }
  const body = await providerFetch(
    "vercel",
    authorized.accessToken,
    url.toString(),
  );
  const state =
    body && typeof body === "object" && "readyState" in body
      ? String(body.readyState)
      : "QUEUED";
  const status =
    state === "READY"
      ? "succeeded"
      : state === "ERROR" || state === "CANCELED"
        ? "failed"
        : "running";
  const deploymentUrl =
    body && typeof body === "object" && "url" in body && body.url
      ? `https://${String(body.url)}`
      : operation.url;
  const updated = await getPrisma().integrationOperation.update({
    where: { id: operation.id },
    data: {
      status,
      url: deploymentUrl,
      errorMessage:
        status === "failed"
          ? `Vercel deployment ${state.toLowerCase()}.`
          : null,
      completedAt: status === "running" ? null : new Date(),
    },
  });
  return serializeOperation(updated);
}
