"use server";

import type { Message } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getCurrentSession } from "@/features/auth/server/session";
import {
  checkCreditAvailability,
  consumeCreditsForGeneration,
  getModelCreditHoldCost,
  releaseCreditHold,
} from "@/lib/billing";
import {
  formatGeneratedFilesMarkdown,
  normalizeGeneratedFiles,
  type GeneratedFile,
  type RawGeneratedFile,
} from "@/lib/generated-files";
import { validateSelectedApiUsage } from "@/lib/generated-api";
import {
  generateFollowUpPrompts,
  saveMessageFollowUpPrompts,
} from "@/lib/follow-up-prompts";
import type { PreviewElementSelection } from "@/lib/targeted-preview-edit";
import type { RequestModeMetadata } from "@/features/projects/contracts";
import { getMessageGeneratedFiles } from "@/features/generation/message-files";
import { findOwnedProjectWithMessages } from "@/features/projects/server/access";

function getAssistantMessageFiles(message: Message) {
  if (message?.role !== "assistant") return [];
  return getMessageGeneratedFiles(message);
}

function findSourceAssistantMessage(
  messages: Message[],
  sourceMessageId?: string,
) {
  const sourceMessage = sourceMessageId
    ? messages.find((message) => message.id === sourceMessageId)
    : messages
        .slice()
        .filter(
          (message) =>
            message.role === "assistant" &&
            getAssistantMessageFiles(message).length > 0,
        )
        .sort((a, b) => b.position - a.position)[0];

  return sourceMessage?.role === "assistant" &&
    getAssistantMessageFiles(sourceMessage).length > 0
    ? sourceMessage
    : null;
}

function getCheckpointMetadata(messages: Message[]) {
  const latestUserMessage = messages
    .filter((message) => message.role === "user")
    .sort((a, b) => b.position - a.position)[0];
  const metadata = latestUserMessage?.files as
    | RequestModeMetadata
    | null
    | undefined;
  const hasPreviousVersion = messages.some(
    (message) =>
      message.role === "assistant" &&
      getAssistantMessageFiles(message).length > 0,
  );

  if (metadata?.kind === "targeted_element_edit") {
    const target =
      metadata.selection?.ariaLabel ||
      metadata.selection?.text ||
      metadata.selection?.tagName;
    return {
      versionKind: "targeted_edit",
      changeSummary: `Changed selected ${String(target || "element")
        .trim()
        .slice(0, 48)}`,
    };
  }
  if (
    metadata?.kind === "preview_repair" ||
    metadata?.kind === "preview_repair_request"
  ) {
    return { versionKind: "repair", changeSummary: "Repaired preview" };
  }

  const request = latestUserMessage?.content
    .replace(/\s+/g, " ")
    .trim()
    .replace(
      /^(please\s+)?(build|create|make|update|change|add)\s+(me\s+)?/i,
      "",
    )
    .slice(0, 64);
  return {
    versionKind: hasPreviousVersion ? "edit" : "generation",
    changeSummary: request
      ? `${hasPreviousVersion ? "Updated" : "Built"} ${request}`
      : hasPreviousVersion
        ? "Updated app"
        : "Initial build",
  };
}

async function createChargeableEditRequestMessage({
  chatId,
  text,
  kind,
  sourceMessageId,
  selection,
}: {
  chatId: string;
  text: string;
  kind: "app_edit_request" | "targeted_element_edit";
  sourceMessageId?: string;
  selection?: PreviewElementSelection;
}) {
  const session = await getCurrentSession();

  if (!session) {
    throw new Error("You must be signed in to send messages");
  }

  const prisma = getPrisma();
  const chat = await findOwnedProjectWithMessages(chatId, session.user.id);
  if (!chat) notFound();

  const trimmedText = text.trim().slice(0, 8000);
  if (!trimmedText) {
    throw new Error("Edit request cannot be empty");
  }

  const sourceMessage = findSourceAssistantMessage(
    chat.messages,
    sourceMessageId,
  );

  if (!sourceMessage) {
    throw new Error("Edits require an existing generated version");
  }

  const creditCheck = await checkCreditAvailability({
    userId: session.user.id,
    modelId: chat.model,
  });

  if (!creditCheck.success) {
    if (creditCheck.error === "INSUFFICIENT_CREDITS") {
      throw new Error("INSUFFICIENT_CREDITS");
    }
    throw new Error("CREDIT_CHECK_FAILED");
  }

  const maxPosition =
    chat.messages.length > 0
      ? Math.max(...chat.messages.map((message) => message.position))
      : 0;
  const metadata: RequestModeMetadata = {
    kind,
    sourceMessageId: sourceMessage.id,
    chargeCredits: true,
    ...(selection ? { selection } : {}),
  };

  return await prisma.message.create({
    data: {
      role: "user",
      content: trimmedText,
      files: metadata,
      position: maxPosition + 1,
      chatId,
    },
  });
}

export async function createMessage(
  chatId: string,
  text: string,
  role: "assistant" | "user",
  files?: RawGeneratedFile[],
  options?: { creditHoldId?: string },
) {
  // Check authentication
  const session = await getCurrentSession();

  if (!session) {
    throw new Error("You must be signed in to send messages");
  }

  const prisma = getPrisma();
  const chat = await findOwnedProjectWithMessages(chatId, session.user.id);
  if (!chat) notFound();

  const maxPosition =
    chat.messages.length > 0
      ? Math.max(...chat.messages.map((message) => message.position))
      : 0;

  // Follow-up user messages only reserve the right to start generation. Credits
  // are charged when the assistant response is successfully persisted.
  const isFollowUpUserMessage = role === "user" && chat.messages.length >= 2;

  if (isFollowUpUserMessage) {
    const creditCheck = await checkCreditAvailability({
      userId: session.user.id,
      modelId: chat.model,
    });

    if (!creditCheck.success) {
      if (creditCheck.error === "INSUFFICIENT_CREDITS") {
        throw new Error("INSUFFICIENT_CREDITS");
      }
      throw new Error("CREDIT_CHECK_FAILED");
    }
  }

  const normalizedFiles: GeneratedFile[] = files
    ? normalizeGeneratedFiles(files)
    : [];
  const assistantHasFiles = role === "assistant" && normalizedFiles.length > 0;
  if (assistantHasFiles) {
    const selectedBindings = await prisma.projectIntegration.findMany({
      where: { chatId },
      select: { providerId: true },
    });
    const selectedProviderIds = selectedBindings.map(
      (binding) => binding.providerId,
    );
    const selectedApiDiagnostics = validateSelectedApiUsage(
      normalizedFiles,
      selectedProviderIds,
    );

    if (selectedApiDiagnostics.length > 0) {
      if (options?.creditHoldId) {
        await releaseCreditHold({ holdId: options.creditHoldId });
      }
      throw new Error(
        `SELECTED_API_CONTRACT_VIOLATION: ${selectedApiDiagnostics
          .map((diagnostic) => diagnostic.message)
          .join(" ")}`,
      );
    }
  }
  const followUpPrompts =
    role === "assistant"
      ? await generateFollowUpPrompts({
          chat,
          assistantContent: text,
          files: normalizedFiles,
        })
      : null;

  const messageData = {
    role,
    content: text,
    files:
      normalizedFiles.length > 0
        ? JSON.parse(JSON.stringify(normalizedFiles))
        : null,
    position: maxPosition + 1,
    chatId,
    ...(role === "assistant" ? getCheckpointMetadata(chat.messages) : {}),
  };

  if (role === "assistant") {
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
        userId: session.user.id,
        modelId: chat.model,
        chatId,
        messageId: newMessage.id,
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
  const session = await getCurrentSession();

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

export async function createAppEditRequestMessage(
  chatId: string,
  text: string,
  options?: { sourceMessageId?: string },
) {
  return createChargeableEditRequestMessage({
    chatId,
    text,
    kind: "app_edit_request",
    sourceMessageId: options?.sourceMessageId,
  });
}

export async function createTargetedElementEditMessage(
  chatId: string,
  text: string,
  selection: PreviewElementSelection,
  options?: { sourceMessageId?: string },
) {
  return createChargeableEditRequestMessage({
    chatId,
    text,
    kind: "targeted_element_edit",
    sourceMessageId: options?.sourceMessageId,
    selection,
  });
}

export async function createPreviewRepairMessage(
  chatId: string,
  error: string,
  options?: { sourceMessageId?: string },
) {
  const session = await getCurrentSession();

  if (!session) {
    throw new Error("You must be signed in to request a repair");
  }

  const prisma = getPrisma();
  const chat = await findOwnedProjectWithMessages(chatId, session.user.id);
  if (!chat) notFound();

  const sourceMessage = options?.sourceMessageId
    ? chat.messages.find((message) => message.id === options.sourceMessageId)
    : chat.messages
        .slice()
        .reverse()
        .find(
          (message) =>
            message.role === "assistant" &&
            Array.isArray(message.files) &&
            message.files.length > 0,
        );
  const sourceFiles =
    sourceMessage?.role === "assistant"
      ? getMessageGeneratedFiles(sourceMessage)
      : [];
  if (options?.sourceMessageId && sourceMessage?.role !== "assistant") {
    throw new Error("Repair source version was not found");
  }

  const hasAnyGeneratedFiles = chat.messages.some(
    (message) =>
      message.role === "assistant" &&
      Array.isArray(message.files) &&
      message.files.length > 0,
  );

  if (!hasAnyGeneratedFiles || !sourceMessage || sourceFiles.length === 0) {
    throw new Error("Repairs require an existing generated version");
  }

  const maxPosition =
    chat.messages.length > 0
      ? Math.max(...chat.messages.map((message) => message.position))
      : 0;
  const trimmedError = error.trim().slice(0, 8000);
  const content = `The code is not working. Can you fix it? Here's the error:\n\n${trimmedError}`;

  return await prisma.message.create({
    data: {
      role: "user",
      content,
      files: {
        kind: "preview_repair",
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
  files: RawGeneratedFile[],
) {
  const session = await getCurrentSession();

  if (!session) {
    throw new Error("You must be signed in to save a repair");
  }

  const prisma = getPrisma();
  const chat = await findOwnedProjectWithMessages(chatId, session.user.id);
  if (!chat) notFound();

  const repairMessage = chat.messages.find(
    (message) => message.id === repairMessageId,
  );
  const repairMetadata = repairMessage?.files as
    | { kind?: string; chargeCredits?: boolean; usedAt?: string | null }
    | null
    | undefined;
  const isPreviewRepair =
    repairMetadata?.kind === "preview_repair" ||
    repairMetadata?.kind === "preview_repair_request";

  if (
    !repairMessage ||
    repairMessage.role !== "user" ||
    !isPreviewRepair ||
    repairMetadata.chargeCredits !== false ||
    repairMetadata.usedAt
  ) {
    throw new Error("Repair request is not eligible for a free repair");
  }

  const maxPosition =
    chat.messages.length > 0
      ? Math.max(...chat.messages.map((message) => message.position))
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
        versionKind: "repair",
        changeSummary: "Repaired preview",
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
        userId: session.user.id,
        modelId: chat.model,
        creditsUsed: 0,
        estimatedCredits: getModelCreditHoldCost(chat.model),
        actualCredits: 0,
        refundedCredits: 0,
        reason: "Free preview repair",
        phase: "preview_repair",
        status: "free_repair",
        chatId,
        messageId: newMessage.id,
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
  const session = await getCurrentSession();

  if (!session) {
    throw new Error("You must be signed in to restore versions");
  }

  const prisma = getPrisma();
  const chat = await findOwnedProjectWithMessages(chatId, session.user.id);
  if (!chat) notFound();

  const sourceMessage = chat.messages.find(
    (message) => message.id === sourceMessageId,
  );

  if (!sourceMessage || sourceMessage.role !== "assistant") {
    throw new Error("Restore source version was not found");
  }

  const restoredFiles = getMessageGeneratedFiles(sourceMessage);

  if (restoredFiles.length === 0) {
    throw new Error("Restore source version has no files");
  }

  const maxPosition =
    chat.messages.length > 0
      ? Math.max(...chat.messages.map((message) => message.position))
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
      versionKind: "restore",
      changeSummary: `Restored v${oldVersion}`,
    },
  });

  await saveMessageFollowUpPrompts(prisma, newMessage.id, followUpPrompts);

  await prisma.chat.update({
    where: { id: chatId },
    data: { hasCode: true },
  });

  return newMessage;
}

export async function restoreSelectedFilesAsCheckpoint({
  chatId,
  sourceMessageId,
  paths,
}: {
  chatId: string;
  sourceMessageId: string;
  paths: string[];
}) {
  const session = await getCurrentSession();
  if (!session) throw new Error("You must be signed in to restore files");

  const prisma = getPrisma();
  const chat = await findOwnedProjectWithMessages(chatId, session.user.id);
  if (!chat) notFound();

  const source = chat.messages.find((message) => message.id === sourceMessageId);
  const latest = chat.messages
    .filter(
      (message) =>
        message.role === "assistant" && getMessageGeneratedFiles(message).length > 0,
    )
    .sort((a, b) => b.position - a.position)[0];
  if (!source || source.role !== "assistant" || !latest) {
    throw new Error("A source and current version are required");
  }

  const requestedPaths = new Set(paths.map((path) => path.trim()).filter(Boolean));
  if (requestedPaths.size === 0 || requestedPaths.size > 50) {
    throw new Error("Select between 1 and 50 files to restore");
  }
  const sourceFiles = new Map(
    getMessageGeneratedFiles(source).map((file) => [file.path, file]),
  );
  const restoredFiles = new Map(
    getMessageGeneratedFiles(latest).map((file) => [file.path, file]),
  );
  for (const path of requestedPaths) {
    const sourceFile = sourceFiles.get(path);
    if (sourceFile) restoredFiles.set(path, sourceFile);
    else restoredFiles.delete(path);
  }

  const files = normalizeGeneratedFiles(Array.from(restoredFiles.values()));
  const maxPosition = Math.max(...chat.messages.map((message) => message.position));
  const selectedPaths = Array.from(requestedPaths);
  const explanation = `Restored ${selectedPaths.length} file${selectedPaths.length === 1 ? "" : "s"} from an earlier checkpoint without changing other current files.`;
  const content = `${explanation}\n\n${formatGeneratedFilesMarkdown(files)}`;
  const newMessage = await prisma.message.create({
    data: {
      role: "assistant",
      content,
      files: JSON.parse(JSON.stringify(files)),
      position: maxPosition + 1,
      chatId,
      versionKind: "selective_restore",
      changeSummary: `Restored ${selectedPaths.join(", ").slice(0, 64)}`,
    },
  });
  await prisma.chat.update({ where: { id: chatId }, data: { hasCode: true } });
  return newMessage;
}
