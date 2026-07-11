import type { LanguageModelUsage } from "ai";

import type {
  GenerationQuality,
  OpenRouterReasoningSelection,
} from "@/lib/openrouter";
import { getOpenRouterUsageMetadata } from "@/lib/openrouter";
import { getPrisma } from "@/lib/prisma";

type TelemetryStatus = "completed" | "error" | "aborted";

type RequestTelemetryOptions = {
  userId?: string;
  chatId: string;
  messageId: string;
  modelId: string;
  creditHoldId?: string;
  requestKind?:
    | "generation"
    | "free_repair"
    | "screenshot"
    | "title"
    | "orchestration"
    | "search";
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
    providerMetadata,
    providerRequestId,
    provider,
    error,
  }: {
    status: TelemetryStatus;
    usage?: LanguageModelUsage;
    finishReason?: string;
    providerMetadata?: unknown;
    providerRequestId?: string;
    provider?: string;
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

    const openRouterUsage = getOpenRouterUsageMetadata(providerMetadata);
    const inputTokens = openRouterUsage?.inputTokens ?? usage?.inputTokens;
    const outputTokens = openRouterUsage?.outputTokens ?? usage?.outputTokens;
    const reasoningTokens =
      openRouterUsage?.reasoningTokens ??
      usage?.outputTokenDetails.reasoningTokens;
    const totalTokens = openRouterUsage?.totalTokens ?? usage?.totalTokens;
    const resolvedProvider = openRouterUsage?.provider ?? provider;
    const prisma = getPrisma();

    try {
      if (options.creditHoldId && status === "completed") {
        await prisma.creditHold.updateMany({
          where: { id: options.creditHoldId, status: "active" },
          data: {
            providerCostUsd: {
              increment: openRouterUsage?.providerCostUsd ?? 0,
            },
            upstreamInferenceCostUsd: {
              increment: openRouterUsage?.upstreamInferenceCostUsd ?? 0,
            },
            inputTokens: { increment: inputTokens ?? 0 },
            outputTokens: { increment: outputTokens ?? 0 },
            reasoningTokens: { increment: reasoningTokens ?? 0 },
            totalTokens: { increment: totalTokens ?? 0 },
            provider: resolvedProvider,
            providerRequestId,
          },
        });
      }

      await prisma.aiRequestLog.create({
        data: {
          userId: options.userId,
          chatId: options.chatId,
          messageId: options.messageId,
          creditHoldId: options.creditHoldId,
          modelId: options.modelId,
          requestKind: options.requestKind ?? "generation",
          quality: options.quality,
          reasoningEnabled: options.reasoning.enabled,
          reasoningMandatory: options.reasoning.mandatory,
          reasoningEffort: options.reasoning.effort,
          timeToFirstByteMs,
          timeToFirstReasoningDeltaMs,
          timeToFirstTextDeltaMs,
          inputTokens,
          outputTokens,
          reasoningTokens,
          totalTokens,
          cachedInputTokens: openRouterUsage?.cachedInputTokens,
          provider: resolvedProvider,
          providerRequestId,
          providerCostUsd: openRouterUsage?.providerCostUsd,
          upstreamInferenceCostUsd: openRouterUsage?.upstreamInferenceCostUsd,
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
