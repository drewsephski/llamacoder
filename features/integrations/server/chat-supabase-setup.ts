import "server-only";

import type { PrismaClient } from "@prisma/client";

import {
  parseAgentMessageMetadata,
  type BackendSetupRequest,
} from "@/features/generation/agent-contracts";
import {
  deriveChatSupabaseSetupView,
  type ChatSupabaseSetupAction,
  type ChatSupabaseSetupState,
} from "@/features/integrations/chat-supabase-setup";
import { executeIntegrationAction } from "@/features/integrations/server/actions";
import {
  IntegrationServiceError,
  getIntegrationWorkspace,
} from "@/features/integrations/server/service";
import { getAuthenticatedTasksBackendPlan } from "@/features/integrations/supabase-backend";
import { getPrisma } from "@/lib/prisma";

async function findOwnedSetupRequest({
  projectId,
  interactionId,
  userId,
  prisma = getPrisma(),
}: {
  projectId: string;
  interactionId: string;
  userId: string;
  prisma?: PrismaClient;
}) {
  const chat = await prisma.chat.findFirst({
    where: { id: projectId, userId },
    select: {
      id: true,
      messages: {
        where: { role: "assistant" },
        select: { id: true, files: true, position: true },
        orderBy: { position: "desc" },
      },
    },
  });
  if (!chat) {
    throw new IntegrationServiceError(
      "PROJECT_NOT_FOUND",
      "Project not found or access was denied.",
      404,
    );
  }
  for (const message of chat.messages) {
    const metadata = parseAgentMessageMetadata(message.files);
    if (
      metadata?.kind === "agent_backend_setup_request" &&
      metadata.request.id === interactionId
    ) {
      return { messageId: message.id, request: metadata.request };
    }
  }
  throw new IntegrationServiceError(
    "SETUP_INTERACTION_NOT_FOUND",
    "This Supabase setup interaction is no longer available.",
    404,
  );
}

export async function getChatSupabaseSetupView({
  projectId,
  interactionId,
  userId,
}: {
  projectId: string;
  interactionId: string;
  userId: string;
}) {
  const [{ request }, workspace] = await Promise.all([
    findOwnedSetupRequest({ projectId, interactionId, userId }),
    getIntegrationWorkspace({ projectId, userId }),
  ]);
  return deriveChatSupabaseSetupView({ request, workspace });
}

function allowedStatesForAction(
  action: ChatSupabaseSetupAction["action"],
): ChatSupabaseSetupState[] {
  switch (action) {
    case "create_project":
    case "bind_project":
      return ["project_setup_required", "failed", "timed_out"];
    case "resume_project":
      return ["failed", "timed_out"];
    case "configure_auth_mode":
      return ["auth_mode_required"];
    case "approve_backend":
      return ["backend_approval_required", "failed"];
  }
}

export async function executeChatSupabaseSetupAction({
  projectId,
  interactionId,
  userId,
  action,
}: {
  projectId: string;
  interactionId: string;
  userId: string;
  action: ChatSupabaseSetupAction;
}) {
  const current = await getChatSupabaseSetupView({
    projectId,
    interactionId,
    userId,
  });
  if (current.continuationStatus !== "pending") {
    throw new IntegrationServiceError(
      "SETUP_INTERACTION_COMPLETED",
      "This setup interaction has already been completed or replaced.",
      409,
    );
  }
  if (!allowedStatesForAction(action.action).includes(current.state)) {
    throw new IntegrationServiceError(
      "SETUP_STATE_CHANGED",
      "Supabase setup changed. Refresh the card before trying that action again.",
      409,
    );
  }
  if (!current.bindingId) {
    throw new IntegrationServiceError(
      "INTEGRATION_NOT_FOUND",
      "Connect Supabase before configuring its project.",
      409,
    );
  }

  const providerAction =
    action.action === "create_project"
      ? {
          action: "supabase_provision" as const,
          organizationId: action.organizationId,
          ...(action.projectName ? { projectName: action.projectName } : {}),
          ...(action.region ? { region: action.region } : {}),
        }
      : action.action === "bind_project"
        ? {
            action: "supabase_bind_project" as const,
            projectRef: action.projectRef,
          }
        : action.action === "resume_project"
          ? { action: "supabase_provision" as const }
          : action.action === "configure_auth_mode"
            ? {
                action: "supabase_configure_auth_mode" as const,
                mode: action.mode,
                approval: action.approval,
              }
            : {
                action: "supabase_apply_backend" as const,
                plan: getAuthenticatedTasksBackendPlan(),
                approval: action.approval,
              };

  return executeIntegrationAction({
    projectId,
    bindingId: current.bindingId,
    userId,
    action: providerAction,
  });
}

export async function getBackendSetupRequestForInteraction(input: {
  projectId: string;
  interactionId: string;
  userId: string;
}): Promise<BackendSetupRequest> {
  return (await findOwnedSetupRequest(input)).request;
}
