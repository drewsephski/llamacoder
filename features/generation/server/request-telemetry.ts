import type { LanguageModelUsage } from "ai";

import type {
  GenerationQuality,
  OpenRouterReasoningSelection,
} from "@/lib/openrouter";
import { getPrisma } from "@/lib/prisma";

type TelemetryStatus = "completed" | "error" | "aborted";

type RequestTelemetryOptions = {
  userId?: string;
  chatId: string;
  messageId: string;
  modelId: string;
  quality: GenerationQuality;
  reasoning: OpenRouterReasoningSelection;
};

export function createRequestTelemetry(options: RequestTelemetryOptions) {
  const startedAt = new Date();
  const startedAtMs = startedAt.getTime();
  let timeToFirstByteMs: number | undefined;
  let timeToFirstReasoningDeltaMs: number | undefined;
  let timeToFirstTextDeltaMs: number | undefined;
  let recorded = false;

  const elapsed = () => Math.max(0, Date.now() - startedAtMs);

  const markFirstByte = () => {
    timeToFirstByteMs ??= elapsed();
  };

  const markChunk = (type: "reasoning-delta" | "text-delta") => {
    markFirstByte();

    if (type === "reasoning-delta") {
      timeToFirstReasoningDeltaMs ??= elapsed();
    } else {
      timeToFirstTextDeltaMs ??= elapsed();
    }
  };

  const record = async ({
    status,
    usage,
    finishReason,
    error,
  }: {
    status: TelemetryStatus;
    usage?: LanguageModelUsage;
    finishReason?: string;
    error?: unknown;
  }) => {
    if (recorded) return;
    recorded = true;

    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : undefined;

    try {
      await getPrisma().aiRequestLog.create({
        data: {
          userId: options.userId,
          chatId: options.chatId,
          messageId: options.messageId,
          modelId: options.modelId,
          quality: options.quality,
          reasoningEnabled: options.reasoning.enabled,
          reasoningMandatory: options.reasoning.mandatory,
          reasoningEffort: options.reasoning.effort,
          timeToFirstByteMs,
          timeToFirstReasoningDeltaMs,
          timeToFirstTextDeltaMs,
          inputTokens: usage?.inputTokens,
          outputTokens: usage?.outputTokens,
          reasoningTokens: usage?.outputTokenDetails.reasoningTokens,
          totalTokens: usage?.totalTokens,
          finishReason,
          status,
          errorMessage: errorMessage?.slice(0, 2000),
          startedAt,
          completedAt: new Date(),
        },
      });
    } catch (telemetryError) {
      console.error("Failed to record AI request telemetry:", telemetryError);
    }
  };

  return { markFirstByte, markChunk, record };
}
