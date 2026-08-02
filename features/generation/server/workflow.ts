import "server-only";

import type { Message, Prisma } from "@prisma/client";

import {
  createFreeRepairAssistantMessage,
  saveStreamedAssistantMessage,
} from "@/features/generation/server/actions";
import { getMessageGeneratedFiles } from "@/features/generation/message-files";
import { consumeCreditsForGeneration } from "@/lib/billing";
import {
  normalizeGeneratedFiles,
  parseStoredGeneratedFiles,
  type GeneratedFile,
} from "@/lib/generated-files";
import { getPrisma } from "@/lib/prisma";
import { extractAllCodeBlocks } from "@/lib/utils";

type GenerationRequestMetadata = {
  kind?: string;
  chargeCredits?: boolean;
  sourceMessageId?: string;
  draftFiles?: unknown;
  registryFiles?: unknown;
};

type InitialGenerationUsage = {
  tokensUsed?: number;
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  providerCostUsd?: number;
  upstreamInferenceCostUsd?: number;
  provider?: string;
};

export class GenerationWorkflowError extends Error {
  constructor(
    public readonly code:
      | "RUN_NOT_FOUND"
      | "RUN_NOT_READY"
      | "RUN_FINALIZING"
      | "NO_GENERATED_FILES"
      | "INSUFFICIENT_CREDITS"
      | "CREDIT_CHECK_FAILED",
    message: string,
  ) {
    super(message);
    this.name = "GenerationWorkflowError";
  }
}

function mergeFiles(...groups: GeneratedFile[][]): GeneratedFile[] {
  const filesByPath = new Map<string, GeneratedFile>();
  groups.forEach((files) => {
    files.forEach((file) => filesByPath.set(file.path, file));
  });
  return normalizeGeneratedFiles(Array.from(filesByPath.values()));
}

export function buildFinalGenerationFiles({
  requestMessage,
  messages,
  generatedText,
}: {
  requestMessage: Pick<Message, "id" | "files" | "position">;
  messages: Array<
    Pick<Message, "id" | "role" | "content" | "files" | "position">
  >;
  generatedText: string;
}) {
  const metadata = requestMessage.files as GenerationRequestMetadata | null;
  const generatedFiles = normalizeGeneratedFiles(
    extractAllCodeBlocks(generatedText),
  );

  if (generatedFiles.length === 0) {
    throw new GenerationWorkflowError(
      "NO_GENERATED_FILES",
      "The saved response ended before any application files were completed. Restart the build to try again.",
    );
  }

  const contractRepairFiles =
    metadata?.kind === "contract_repair"
      ? normalizeGeneratedFiles(parseStoredGeneratedFiles(metadata.draftFiles))
      : [];
  const registryFiles = normalizeGeneratedFiles(
    parseStoredGeneratedFiles(metadata?.registryFiles),
  );
  const sourceMessage =
    metadata?.sourceMessageId && contractRepairFiles.length === 0
      ? messages.find(
          (message) =>
            message.id === metadata.sourceMessageId &&
            message.role === "assistant",
        )
      : null;
  const sourceFiles = sourceMessage
    ? getMessageGeneratedFiles(sourceMessage)
    : [];
  const historicalFiles =
    contractRepairFiles.length > 0 || sourceFiles.length > 0
      ? []
      : messages
          .filter(
            (message) =>
              message.role === "assistant" &&
              message.position < requestMessage.position,
          )
          .flatMap((message) => getMessageGeneratedFiles(message));

  return mergeFiles(
    contractRepairFiles,
    sourceFiles,
    historicalFiles,
    generatedFiles,
    registryFiles,
  );
}

export async function finalizeOwnedGenerationRun({
  runId,
  userId,
}: {
  runId: string;
  userId: string;
}) {
  const prisma = getPrisma();
  let run = await prisma.generationRun.findFirst({
    where: { id: runId, userId },
  });
  if (!run) {
    throw new GenerationWorkflowError(
      "RUN_NOT_FOUND",
      "Generation run was not found.",
    );
  }

  if (run.status === "completed" && run.assistantMessageId) {
    const existing = await prisma.message.findFirst({
      where: {
        id: run.assistantMessageId,
        chatId: run.chatId,
        role: "assistant",
      },
    });
    if (existing) return existing;
  }

  if (!run.partialText.trim()) {
    throw new GenerationWorkflowError(
      "RUN_NOT_READY",
      "Generation output is not ready to finalize.",
    );
  }

  if (run.phase === "continuation_required") {
    throw new GenerationWorkflowError(
      "RUN_NOT_READY",
      run.errorMessage ||
        "The model reached its output limit before the app was complete. Continue or retry before saving this version.",
    );
  }

  const claimed = await prisma.generationRun.updateMany({
    where: {
      id: run.id,
      userId,
      status: { in: ["running", "recoverable"] },
      phase: { not: "server_finalizing" },
      assistantMessageId: null,
    },
    data: {
      phase: "server_finalizing",
      label: "Saving generated app",
      errorMessage: null,
    },
  });

  if (claimed.count === 0) {
    run = await prisma.generationRun.findFirst({
      where: { id: runId, userId },
    });
    if (run?.status === "completed" && run.assistantMessageId) {
      const existing = await prisma.message.findFirst({
        where: {
          id: run.assistantMessageId,
          chatId: run.chatId,
          role: "assistant",
        },
      });
      if (existing) return existing;
    }
    throw new GenerationWorkflowError(
      "RUN_FINALIZING",
      "Generation is already being finalized.",
    );
  }

  try {
    const requestMessage = await prisma.message.findFirst({
      where: {
        id: run.messageId,
        chatId: run.chatId,
        role: "user",
      },
    });
    if (!requestMessage) {
      throw new GenerationWorkflowError(
        "RUN_NOT_FOUND",
        "Generation request message was not found.",
      );
    }
    const messages = await prisma.message.findMany({
      where: {
        chatId: run.chatId,
        position: { lte: requestMessage.position },
      },
      orderBy: { position: "asc" },
    });
    const files = buildFinalGenerationFiles({
      requestMessage,
      messages,
      generatedText: run.partialText,
    });
    const metadata = requestMessage.files as GenerationRequestMetadata | null;
    const isFreeRepair =
      (metadata?.kind === "preview_repair" ||
        metadata?.kind === "preview_repair_request" ||
        metadata?.kind === "contract_repair") &&
      metadata.chargeCredits === false;

    return isFreeRepair
      ? await createFreeRepairAssistantMessage(
          run.chatId,
          requestMessage.id,
          run.partialText,
          files,
          { generationRunId: run.id },
        )
      : await saveStreamedAssistantMessage(run.chatId, run.partialText, files, {
          creditHoldId: run.creditHoldId ?? undefined,
          generationRunId: run.id,
        });
  } catch (error) {
    await prisma.generationRun.updateMany({
      where: {
        id: run.id,
        userId,
        status: { not: "completed" },
        phase: "server_finalizing",
      },
      data: {
        status: "recoverable",
        phase: "finalizing",
        label: "Ready to recover",
        errorMessage:
          error instanceof Error
            ? error.message.slice(0, 2_000)
            : "Unable to finalize generation.",
      },
    });
    throw error;
  }
}

export async function persistInitialGenerationResult({
  userId,
  chat,
  content,
  generatedFiles,
  designScores,
  creditHoldId,
  usage,
}: {
  userId: string;
  chat: { id: string; model: string; title: string };
  content: string;
  generatedFiles: GeneratedFile[];
  designScores: unknown;
  creditHoldId?: string;
  usage: InitialGenerationUsage;
}) {
  const prisma = getPrisma();
  return prisma.$transaction(async (tx) => {
    const createdMessage = await tx.message.create({
      data: {
        role: "assistant",
        content,
        files: generatedFiles.length
          ? (JSON.parse(
              JSON.stringify(generatedFiles),
            ) as Prisma.InputJsonValue)
          : undefined,
        chatId: chat.id,
        position: 2,
        designScores: designScores
          ? (JSON.parse(JSON.stringify(designScores)) as Prisma.InputJsonValue)
          : undefined,
      },
    });

    await tx.chat.update({
      where: { id: chat.id },
      data: {
        hasCode: true,
        generationStatus: "completed",
        generationStartedAt: null,
      },
    });

    const consumeResult = await consumeCreditsForGeneration({
      client: tx,
      userId,
      modelId: chat.model,
      chatId: chat.id,
      messageId: createdMessage.id,
      description: `Code generation - ${chat.title}`,
      phase: "initial_generation",
      status: "completed",
      creditHoldId,
      tokensUsed: usage.tokensUsed,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      generatedText: content,
      providerCostUsd: usage.providerCostUsd,
      upstreamInferenceCostUsd: usage.upstreamInferenceCostUsd,
      reasoningTokens: usage.reasoningTokens,
      provider: usage.provider,
    });

    if (!consumeResult.success) {
      throw new GenerationWorkflowError(
        consumeResult.error === "INSUFFICIENT_CREDITS"
          ? "INSUFFICIENT_CREDITS"
          : "CREDIT_CHECK_FAILED",
        consumeResult.error === "INSUFFICIENT_CREDITS"
          ? "Credits were no longer available."
          : "Unable to consume generation credits.",
      );
    }

    return createdMessage;
  });
}
