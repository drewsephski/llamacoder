"use server";

import { getPrisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  checkCreditAvailability,
  consumeCreditsForGeneration,
  getModelCreditHoldCost,
  releaseCreditHold,
} from "@/lib/billing";
import {
  formatGeneratedFilesMarkdown,
  normalizeGeneratedFiles,
} from "@/lib/generated-files";
import { assertFreeRepairAvailable } from "@/features/generation/free-repair-policy";
import {
  generateFollowUpPrompts,
  saveMessageFollowUpPrompts,
} from "@/lib/follow-up-prompts";
import { extractAllCodeBlocks } from "@/lib/utils";
import {
  agentMessageMetadataSchema,
  formatClarificationAnswers,
  parseAgentMessageMetadata,
  type AgentMessageMetadata,
} from "@/features/generation/agent-contracts";

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
    metadata.kind === "agent_plan_approval" &&
    requestMetadata?.kind === "agent_plan_request"
  ) {
    // Plan approval only requires the boolean to be true.
  } else {
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

export async function createMessage(
  chatId: string,
  text: string,
  role: "assistant" | "user",
  files?: any[],
  options?: { creditHoldId?: string },
) {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to send messages");
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

  const maxPosition =
    chat.messages.length > 0
      ? Math.max(...chat.messages.map((m: any) => m.position))
      : 0;

  // Follow-up user messages only reserve the right to start generation. Credits
  // are charged when the assistant response is successfully persisted.
  const isFollowUpUserMessage = role === "user" && chat.messages.length >= 2;

  if (isFollowUpUserMessage && chat.userId) {
    const creditCheck = await checkCreditAvailability({
      userId: chat.userId,
      modelId: chat.model,
    });

    if (!creditCheck.success) {
      if (creditCheck.error === "INSUFFICIENT_CREDITS") {
        throw new Error("INSUFFICIENT_CREDITS");
      }
      throw new Error("CREDIT_CHECK_FAILED");
    }
  }

  const normalizedFiles =
    role === "assistant" && files ? normalizeGeneratedFiles(files) : files;
  const assistantHasFiles =
    role === "assistant" &&
    Array.isArray(normalizedFiles) &&
    normalizedFiles.length > 0;
  const followUpPrompts =
    role === "assistant"
      ? await generateFollowUpPrompts({
          chat,
          assistantContent: text,
          files: Array.isArray(normalizedFiles) ? normalizedFiles : [],
        })
      : null;

  const messageData = {
    role,
    content: text,
    files: normalizedFiles ? JSON.parse(JSON.stringify(normalizedFiles)) : null,
    position: maxPosition + 1,
    chatId,
  };

  if (role === "assistant" && chat.userId) {
    const newMessage = await prisma.$transaction(async (tx) => {
      const newMessage = await tx.message.create({
        data: messageData,
      });

      if (assistantHasFiles) {
        await tx.chat.update({
          where: { id: chatId },
          data: { hasCode: true },
        });
      }

      const creditCheck = await consumeCreditsForGeneration({
        client: tx,
        userId: chat.userId!,
        modelId: chat.model,
        chatId,
        description: `AI generation - ${chat.model}`,
        phase: "follow_up",
        status: "completed",
        creditHoldId: options?.creditHoldId,
        generatedText: text,
      });

      if (!creditCheck.success) {
        if (creditCheck.error === "INSUFFICIENT_CREDITS") {
          throw new Error("INSUFFICIENT_CREDITS");
        }
        throw new Error("CREDIT_CHECK_FAILED");
      }

      return newMessage;
    });

    if (followUpPrompts) {
      await saveMessageFollowUpPrompts(prisma, newMessage.id, followUpPrompts);
    }

    return newMessage;
  }

  const newMessage = await prisma.message.create({ data: messageData });

  if (followUpPrompts) {
    await saveMessageFollowUpPrompts(prisma, newMessage.id, followUpPrompts);
  }

  if (assistantHasFiles) {
    await prisma.chat.update({
      where: { id: chatId },
      data: { hasCode: true },
    });
  }

  return newMessage;
}

export async function releaseReservedCreditHold(holdId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to release credits");
  }

  const prisma = getPrisma();
  const hold = await prisma.creditHold.findUnique({
    where: { id: holdId },
    select: { userId: true, status: true },
  });

  if (!hold || hold.userId !== session.user.id || hold.status !== "active") {
    return { success: true };
  }

  return releaseCreditHold({ holdId });
}

export async function createPreviewRepairMessage(
  chatId: string,
  error: string,
  options?: { sourceMessageId?: string },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to request a repair");
  }

  const prisma = getPrisma();
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { messages: true },
  });
  if (!chat) notFound();

  if (chat.userId !== session.user.id) {
    throw new Error("You can only repair your own projects");
  }

  const sourceMessage = options?.sourceMessageId
    ? chat.messages.find(
        (message: any) => message.id === options.sourceMessageId,
      )
    : chat.messages
        .slice()
        .reverse()
        .find(
          (message: any) =>
            message.role === "assistant" &&
            Array.isArray(message.files) &&
            message.files.length > 0,
        );
  const sourceFiles =
    sourceMessage?.role === "assistant" && Array.isArray(sourceMessage.files)
      ? normalizeGeneratedFiles(sourceMessage.files as any[])
      : [];
  if (options?.sourceMessageId && sourceMessage?.role !== "assistant") {
    throw new Error("Repair source version was not found");
  }

  const hasAnyGeneratedFiles = chat.messages.some(
    (message: any) =>
      message.role === "assistant" &&
      Array.isArray(message.files) &&
      message.files.length > 0,
  );

  if (!hasAnyGeneratedFiles || !sourceMessage || sourceFiles.length === 0) {
    throw new Error("Repairs require an existing generated version");
  }

  assertFreeRepairAvailable(chat.messages, sourceMessage.id);

  const maxPosition =
    chat.messages.length > 0
      ? Math.max(...chat.messages.map((message: any) => message.position))
      : 0;
  const trimmedError = error.trim().slice(0, 8000);
  const content = `The code is not working. Can you fix it? Here's the error:\n\n${trimmedError}`;

  return await prisma.message.create({
    data: {
      role: "user",
      content,
      files: {
        kind: "preview_repair_request",
        chargeCredits: false,
        sourceMessageId: sourceMessage.id,
        usedAt: null,
      },
      position: maxPosition + 1,
      chatId,
    },
  });
}

export async function createFreeRepairAssistantMessage(
  chatId: string,
  repairMessageId: string,
  text: string,
  files: any[],
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to save a repair");
  }

  const prisma = getPrisma();
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { messages: true },
  });
  if (!chat) notFound();

  if (chat.userId !== session.user.id) {
    throw new Error("You can only repair your own projects");
  }

  const repairMessage = chat.messages.find(
    (message: any) => message.id === repairMessageId,
  );
  const repairMetadata = repairMessage?.files as
    | { kind?: string; chargeCredits?: boolean; usedAt?: string | null }
    | null
    | undefined;

  if (
    !repairMessage ||
    repairMessage.role !== "user" ||
    repairMetadata?.kind !== "preview_repair_request" ||
    repairMetadata.chargeCredits !== false ||
    repairMetadata.usedAt
  ) {
    throw new Error("Repair request is not eligible for a free repair");
  }

  const maxPosition =
    chat.messages.length > 0
      ? Math.max(...chat.messages.map((message: any) => message.position))
      : 0;
  const normalizedFiles = normalizeGeneratedFiles(files);
  const assistantHasFiles = normalizedFiles.length > 0;
  const followUpPrompts = await generateFollowUpPrompts({
    chat,
    assistantContent: text,
    files: normalizedFiles,
  });

  const newMessage = await prisma.$transaction(async (tx) => {
    const newMessage = await tx.message.create({
      data: {
        role: "assistant",
        content: text,
        files: assistantHasFiles
          ? JSON.parse(JSON.stringify(normalizedFiles))
          : null,
        position: maxPosition + 1,
        chatId,
      },
    });

    await tx.message.update({
      where: { id: repairMessageId },
      data: {
        files: {
          ...repairMetadata,
          usedAt: new Date().toISOString(),
        },
      },
    });

    if (assistantHasFiles) {
      await tx.chat.update({
        where: { id: chatId },
        data: { hasCode: true },
      });
    }

    await tx.generationLog.create({
      data: {
        userId: chat.userId!,
        modelId: chat.model,
        creditsUsed: 0,
        estimatedCredits: getModelCreditHoldCost(chat.model),
        actualCredits: 0,
        refundedCredits: 0,
        reason: "Free preview repair",
        phase: "preview_repair",
        status: "free_repair",
        chatId,
      },
    });

    return newMessage;
  });

  await saveMessageFollowUpPrompts(prisma, newMessage.id, followUpPrompts);

  return newMessage;
}

export async function restoreVersionAsCheckpoint({
  chatId,
  sourceMessageId,
  oldVersion,
  newVersion,
}: {
  chatId: string;
  sourceMessageId: string;
  oldVersion: number;
  newVersion: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to restore versions");
  }

  const prisma = getPrisma();
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { messages: true },
  });
  if (!chat) notFound();

  if (chat.userId !== session.user.id) {
    throw new Error("You can only restore your own projects");
  }

  const sourceMessage = chat.messages.find(
    (message: any) => message.id === sourceMessageId,
  );

  if (!sourceMessage || sourceMessage.role !== "assistant") {
    throw new Error("Restore source version was not found");
  }

  const restoredFiles = normalizeGeneratedFiles(
    Array.isArray(sourceMessage.files) && sourceMessage.files.length > 0
      ? (sourceMessage.files as any[])
      : extractAllCodeBlocks(sourceMessage.content),
  );

  if (restoredFiles.length === 0) {
    throw new Error("Restore source version has no files");
  }

  const maxPosition =
    chat.messages.length > 0
      ? Math.max(...chat.messages.map((message: any) => message.position))
      : 0;
  const explanation = `Version ${newVersion} was created by restoring version ${oldVersion}.`;
  const content = `${explanation}\n\n${formatGeneratedFilesMarkdown(restoredFiles)}`;
  const followUpPrompts = await generateFollowUpPrompts({
    chat,
    assistantContent: content,
    files: restoredFiles,
  });

  const newMessage = await prisma.message.create({
    data: {
      role: "assistant",
      content,
      files: JSON.parse(JSON.stringify(restoredFiles)),
      position: maxPosition + 1,
      chatId,
    },
  });

  await saveMessageFollowUpPrompts(prisma, newMessage.id, followUpPrompts);

  await prisma.chat.update({
    where: { id: chatId },
    data: { hasCode: true },
  });

  return newMessage;
}

export async function saveProject(chatId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to save");
  }

  const prisma = getPrisma();
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  if (chat.userId) {
    throw new Error("This project is already saved");
  }

  const updatedChat = await prisma.chat.update({
    where: { id: chatId },
    data: { userId: session.user.id },
  });

  return updatedChat;
}

export async function deleteProject(chatId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to delete projects");
  }

  const prisma = getPrisma();
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  if (chat.userId && chat.userId !== session.user.id) {
    throw new Error("You can only delete your own projects");
  }

  if (!chat.userId) {
    throw new Error("Unsaved projects cannot be deleted");
  }

  await prisma.chat.delete({
    where: { id: chatId },
  });
}

export async function renameProject(chatId: string, newTitle: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to rename projects");
  }

  const prisma = getPrisma();
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  if (chat.userId !== session.user.id) {
    throw new Error("You can only rename your own projects");
  }

  const updatedChat = await prisma.chat.update({
    where: { id: chatId },
    data: { title: newTitle },
  });

  return updatedChat;
}

export async function duplicateProject(chatId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to duplicate projects");
  }

  const prisma = getPrisma();
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { messages: true },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  if (chat.userId && chat.userId !== session.user.id) {
    throw new Error("You can only duplicate your own projects");
  }

  if (!chat.userId) {
    throw new Error("Unsaved projects cannot be duplicated");
  }

  const newChat = await prisma.chat.create({
    data: {
      model: chat.model,
      quality: chat.quality,
      prompt: chat.prompt,
      title: `${chat.title} (copy)`,
      llamaCoderVersion: chat.llamaCoderVersion,
      shadcn: chat.shadcn,
      userId: session.user.id,
      messages: {
        create: chat.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          files: msg.files,
          position: msg.position,
        })),
      },
    },
  });

  return newChat;
}
