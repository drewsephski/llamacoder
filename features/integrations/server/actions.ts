import "server-only";

import type { Prisma } from "@prisma/client";

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
import { getPrisma } from "@/lib/prisma";
import {
  getAuthorizedProjectIntegration,
  providerFetch,
} from "@/features/integrations/server/provider-client";

type ActionInput = z.infer<typeof integrationActionInputSchema>;

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
  createdAt: Date;
  completedAt: Date | null;
}) {
  return {
    ...operation,
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

export async function listIntegrationResources(input: {
  projectId: string;
  bindingId: string;
  userId: string;
}) {
  const binding = await requireBinding(input);
  if (binding.providerId === "github") return listGitHubRepositories(input);
  if (binding.providerId === "vercel") return listVercelProjects(input);
  throw new IntegrationServiceError(
    "RESOURCES_UNSUPPORTED",
    "This integration does not expose selectable resources.",
    400,
  );
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
    action.action === "github_publish" ? "github" : "vercel";
  if (binding.providerId !== expectedProvider) {
    throw new IntegrationServiceError(
      "ACTION_PROVIDER_MISMATCH",
      "This action does not match the connected provider.",
      400,
    );
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
      metadata: { messageId: action.messageId } as Prisma.InputJsonValue,
    },
  });
  try {
    const bundle = await getProjectExportBundle({
      projectId,
      messageId: action.messageId,
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
  if (
    operation.providerId !== "vercel" ||
    operation.status !== "running" ||
    !operation.externalId
  ) {
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
