"use server";

import { notFound } from "next/navigation";
import { headers } from "next/headers";

import {
  agentMessageMetadataSchema,
  formatClarificationAnswers,
  parseAgentMessageMetadata,
  type AgentMessageMetadata,
} from "@/features/generation/agent-contracts";
import { auth } from "@/lib/auth";
import { consumeCreditsForGeneration, releaseCreditHold } from "@/lib/billing";
import { getPrisma } from "@/lib/prisma";

type AgentUserResponseMetadata = Extract<
  AgentMessageMetadata,
  {
    kind:
      | "agent_clarification_response"
      | "agent_interview_response"
      | "agent_search_approval_response"
      | "agent_plan_approval";
  }
>;

type AgentAssistantRequestMetadata = Extract<
  AgentMessageMetadata,
  {
    kind:
      | "agent_clarification_request"
      | "agent_interview_request"
      | "agent_plan_request"
      | "agent_search_approval_request"
      | "agent_response";
  }
>;

function isAgentUserResponse(
  metadata: AgentMessageMetadata,
): metadata is AgentUserResponseMetadata {
  return (
    metadata.kind === "agent_clarification_response" ||
    metadata.kind === "agent_interview_response" ||
    metadata.kind === "agent_search_approval_response" ||
    metadata.kind === "agent_plan_approval"
  );
}

function isAgentAssistantMessage(
  metadata: AgentMessageMetadata,
): metadata is AgentAssistantRequestMetadata {
  return (
    metadata.kind === "agent_clarification_request" ||
    metadata.kind === "agent_interview_request" ||
    metadata.kind === "agent_plan_request" ||
    metadata.kind === "agent_search_approval_request" ||
    metadata.kind === "agent_response"
  );
}

async function getOwnedChatForAgentMessage(chatId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("You must be signed in to continue");
  }

  const prisma = getPrisma();
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { messages: true },
  });

  if (!chat) notFound();
  if (chat.userId && chat.userId !== session.user.id) {
    throw new Error("You can only add messages to your own projects");
  }

  return { chat, prisma, session };
}

export async function createAgentUserMessage(
  chatId: string,
  content: string,
  metadataInput: AgentMessageMetadata,
) {
  let metadata = agentMessageMetadataSchema.parse(metadataInput);
  if (!isAgentUserResponse(metadata)) {
    throw new Error("Invalid agent response metadata");
  }
  const requestId = metadata.requestId;

  const { chat, prisma } = await getOwnedChatForAgentMessage(chatId);
  const hasExistingResponse = chat.messages.some((message) => {
    const candidate = parseAgentMessageMetadata(message.files);
    return (
      (candidate?.kind === "agent_clarification_response" ||
        candidate?.kind === "agent_interview_response" ||
        candidate?.kind === "agent_search_approval_response" ||
        candidate?.kind === "agent_plan_approval") &&
      candidate.requestId === requestId
    );
  });
  if (hasExistingResponse) {
    throw new Error("This interaction has already been completed");
  }

  const candidates = await Promise.all(
    chat.messages.map((message) => parseAgentMessageMetadata(message.files)),
  );
  const requestMetadata = candidates.find((candidate) =>
    Boolean(
      candidate &&
        (candidate.kind === "agent_clarification_request" ||
          candidate.kind === "agent_interview_request" ||
          candidate.kind === "agent_search_approval_request" ||
          candidate.kind === "agent_plan_request") &&
        candidate.request.id === requestId,
    ),
  );

  if (
    metadata.kind === "agent_clarification_response" &&
    requestMetadata?.kind === "agent_clarification_request"
  ) {
    for (const step of requestMetadata.request.steps) {
      const selectedIds = metadata.answers[step.id] ?? [];
      const allowedIds = new Set(step.options.map((option) => option.id));
      const maxSelections = step.selectionMode === "multi" ? Infinity : 1;
      if (
        selectedIds.length === 0 ||
        selectedIds.length > maxSelections ||
        selectedIds.some((selectedId) => !allowedIds.has(selectedId))
      ) {
        throw new Error("One or more clarification answers are invalid");
      }
    }

    metadata = {
      ...metadata,
      summary: formatClarificationAnswers(
        requestMetadata.request,
        metadata.answers,
      ),
    };
  } else if (
    metadata.kind === "agent_interview_response" &&
    requestMetadata?.kind === "agent_interview_request"
  ) {
    for (const step of requestMetadata.request.steps) {
      const selectedIds = metadata.answers[step.id] ?? [];
      const allowedIds = new Set(step.options.map((option) => option.id));
      const maxSelections = step.selectionMode === "multi" ? Infinity : 1;
      if (
        selectedIds.length === 0 ||
        selectedIds.length > maxSelections ||
        selectedIds.some((selectedId) => !allowedIds.has(selectedId))
      ) {
        throw new Error("One or more interview answers are invalid");
      }
    }

    metadata = {
      ...metadata,
      summary: formatClarificationAnswers(
        requestMetadata.request,
        metadata.answers,
      ),
    };
  } else if (
    metadata.kind === "agent_search_approval_response" &&
    requestMetadata?.kind === "agent_search_approval_request"
  ) {
    metadata = { ...metadata, query: requestMetadata.request.query };
  } else if (
    !(
      metadata.kind === "agent_plan_approval" &&
      requestMetadata?.kind === "agent_plan_request"
    )
  ) {
    throw new Error("The requested interaction is no longer available");
  }

  const position =
    chat.messages.length > 0
      ? Math.max(...chat.messages.map((message) => message.position)) + 1
      : 0;

  return prisma.message.create({
    data: {
      chatId,
      role: "user",
      content: content.trim().slice(0, 8000),
      files: JSON.parse(JSON.stringify(metadata)),
      position,
    },
  });
}

export async function createAgentAssistantMessage(
  chatId: string,
  content: string,
  metadataInput: AgentMessageMetadata,
  options?: { creditHoldId?: string; chargeCredits?: boolean },
) {
  const metadata = agentMessageMetadataSchema.parse(metadataInput);
  if (!isAgentAssistantMessage(metadata)) {
    throw new Error("Invalid assistant agent metadata");
  }

  const { chat, prisma, session } = await getOwnedChatForAgentMessage(chatId);
  const position =
    chat.messages.length > 0
      ? Math.max(...chat.messages.map((message) => message.position)) + 1
      : 0;
  const messageData = {
    chatId,
    role: "assistant",
    content: content.trim().slice(0, 100_000),
    files: JSON.parse(JSON.stringify(metadata)),
    position,
  };

  if (options?.chargeCredits !== false && chat.userId) {
    return prisma.$transaction(async (tx) => {
      const created = await tx.message.create({ data: messageData });
      const creditResult = await consumeCreditsForGeneration({
        client: tx,
        userId: session.user.id,
        modelId: chat.model,
        chatId,
        description: `AI developer response - ${chat.model}`,
        phase: "follow_up",
        status: "completed",
        creditHoldId: options?.creditHoldId,
        generatedText: content,
      });

      if (!creditResult.success) {
        throw new Error(
          creditResult.error === "INSUFFICIENT_CREDITS"
            ? "INSUFFICIENT_CREDITS"
            : "CREDIT_CHECK_FAILED",
        );
      }

      return created;
    });
  }

  const created = await prisma.message.create({ data: messageData });
  if (options?.creditHoldId) {
    await releaseCreditHold({ holdId: options.creditHoldId });
  }

  return created;
}
