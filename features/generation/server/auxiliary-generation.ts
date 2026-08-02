import "server-only";

import { generateText } from "ai";

type AuxiliaryTelemetry = {
  markFirstByte: () => void;
  record: (event: {
    status: "completed" | "error";
    usage?: Awaited<ReturnType<typeof generateText>>["usage"];
    finishReason?: string;
    providerMetadata?: unknown;
    providerMetadataByStep?: readonly unknown[];
    providerRequestId?: string;
    provider?: string;
    error?: unknown;
  }) => Promise<void>;
};

type AuxiliaryGenerationOptions = {
  request: Parameters<typeof generateText>[0];
  maxOutputTokens: number;
  timeoutMs: number;
  maxRetries?: number;
  telemetry?: AuxiliaryTelemetry;
};

/**
 * Reliability boundary for non-streaming, non-authoritative model calls.
 * Callers provide workload-specific prompts while this helper owns timeouts,
 * retry policy, AI SDK token limits, and request telemetry.
 */
export async function runAuxiliaryGeneration({
  request,
  maxOutputTokens,
  timeoutMs,
  maxRetries = 1,
  telemetry,
}: AuxiliaryGenerationOptions) {
  try {
    const result = await generateText({
      ...request,
      maxOutputTokens,
      maxRetries,
      timeout: { totalMs: timeoutMs },
    });

    telemetry?.markFirstByte();
    const steps = result.steps ?? [];
    await telemetry?.record({
      status: "completed",
      usage: result.totalUsage ?? result.usage,
      finishReason: result.finishReason,
      providerMetadata: result.providerMetadata,
      providerMetadataByStep: steps.map((step) => step.providerMetadata),
      providerRequestId: result.response?.id,
      provider: steps.at(-1)?.model.provider,
    });

    return result;
  } catch (error) {
    await telemetry?.record({ status: "error", error });
    throw error;
  }
}
