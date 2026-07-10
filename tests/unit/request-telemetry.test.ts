import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { aiRequestLogCreateMock, creditHoldUpdateManyMock } = vi.hoisted(() => ({
  aiRequestLogCreateMock: vi.fn(),
  creditHoldUpdateManyMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({
    aiRequestLog: { create: aiRequestLogCreateMock },
    creditHold: { updateMany: creditHoldUpdateManyMock },
  }),
}));

import { createRequestTelemetry } from "@/features/generation/server/request-telemetry";

describe("AI request telemetry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T18:00:00.000Z"));
    aiRequestLogCreateMock.mockReset().mockResolvedValue({});
    creditHoldUpdateManyMock.mockReset().mockResolvedValue({ count: 1 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("records first-byte, reasoning, text, effort, and token usage", async () => {
    const telemetry = createRequestTelemetry({
      userId: "user_1",
      chatId: "chat_1",
      messageId: "message_1",
      modelId: "google/gemini-3-flash-preview",
      quality: "high",
      reasoning: {
        enabled: true,
        visible: true,
        mandatory: false,
        effort: "low",
        providerOptions: {
          openrouter: {
            reasoning: { effort: "low", exclude: false },
          },
        },
      },
    });

    vi.advanceTimersByTime(10);
    telemetry.markFirstByte();
    vi.advanceTimersByTime(15);
    telemetry.markChunk("reasoning-delta");
    vi.advanceTimersByTime(35);
    telemetry.markChunk("text-delta");

    await telemetry.record({
      status: "completed",
      finishReason: "stop",
      usage: {
        inputTokens: 120,
        inputTokenDetails: {
          noCacheTokens: 120,
          cacheReadTokens: 0,
          cacheWriteTokens: 0,
        },
        outputTokens: 80,
        outputTokenDetails: {
          textTokens: 60,
          reasoningTokens: 20,
        },
        totalTokens: 200,
      },
    });

    expect(aiRequestLogCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        reasoningEnabled: true,
        reasoningMandatory: false,
        reasoningEffort: "low",
        timeToFirstByteMs: 10,
        timeToFirstReasoningDeltaMs: 25,
        timeToFirstTextDeltaMs: 60,
        inputTokens: 120,
        outputTokens: 80,
        reasoningTokens: 20,
        totalTokens: 200,
        finishReason: "stop",
        status: "completed",
      }),
    });
  });

  it("records a request only once when an error is followed by completion", async () => {
    const telemetry = createRequestTelemetry({
      chatId: "chat_1",
      messageId: "message_1",
      modelId: "openai/gpt-4.1",
      quality: "low",
      reasoning: {
        enabled: false,
        visible: false,
        mandatory: false,
        effort: "none",
      },
    });

    await telemetry.record({ status: "error", error: new Error("provider") });
    await telemetry.record({ status: "completed", finishReason: "stop" });

    expect(aiRequestLogCreateMock).toHaveBeenCalledTimes(1);
    expect(aiRequestLogCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: "error",
        errorMessage: "provider",
        reasoningEffort: "none",
      }),
    });
  });

  it("persists exact OpenRouter cost and accumulates it onto the active hold", async () => {
    const telemetry = createRequestTelemetry({
      userId: "user_1",
      chatId: "chat_1",
      messageId: "message_1",
      modelId: "openai/gpt-4.1",
      creditHoldId: "hold_1",
      requestKind: "generation",
      quality: "low",
      reasoning: {
        enabled: false,
        visible: false,
        mandatory: false,
        effort: "none",
      },
    });

    await telemetry.record({
      status: "completed",
      finishReason: "stop",
      providerRequestId: "request_1",
      providerMetadata: {
        openrouter: {
          provider: "OpenAI",
          usage: {
            cost: 0.12,
            costDetails: { upstreamInferenceCost: 0.1 },
            promptTokens: 2_000,
            promptTokensDetails: { cachedTokens: 500 },
            completionTokens: 1_000,
            completionTokensDetails: { reasoningTokens: 100 },
            totalTokens: 3_000,
          },
        },
      },
    });

    expect(creditHoldUpdateManyMock).toHaveBeenCalledWith({
      where: { id: "hold_1", status: "active" },
      data: {
        providerCostUsd: { increment: 0.12 },
        upstreamInferenceCostUsd: { increment: 0.1 },
        inputTokens: { increment: 2_000 },
        outputTokens: { increment: 1_000 },
        reasoningTokens: { increment: 100 },
        totalTokens: { increment: 3_000 },
        provider: "OpenAI",
        providerRequestId: "request_1",
      },
    });
    expect(aiRequestLogCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        creditHoldId: "hold_1",
        requestKind: "generation",
        provider: "OpenAI",
        providerCostUsd: 0.12,
        upstreamInferenceCostUsd: 0.1,
        cachedInputTokens: 500,
      }),
    });
  });
});
