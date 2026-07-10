import { beforeEach, describe, expect, it, vi } from "vitest";

const getModelWithFallbacksMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/model-fallbacks", () => ({
  getModelWithFallbacks: getModelWithFallbacksMock,
}));

import {
  createOpenRouterModel,
  getAIErrorMessage,
  getAIErrorStatus,
  getOpenRouterModelRoute,
  getOpenRouterProviderOptions,
  getOpenRouterReasoningSelection,
  requiresOpenRouterReasoning,
} from "@/lib/openrouter";
import { SAFE_GPT_MODEL, SECONDARY_STARTER_MODEL } from "@/lib/constants";

describe("OpenRouter helpers", () => {
  beforeEach(() => {
    getModelWithFallbacksMock.mockReset();
  });

  it("deduplicates fallback routes and limits them to three", () => {
    getModelWithFallbacksMock.mockReturnValue([
      "primary/model",
      "primary/model",
      "fallback/a",
      "fallback/a",
      "fallback/b",
      "fallback/c",
      "fallback/d",
    ]);

    expect(getOpenRouterModelRoute("primary/model")).toEqual({
      primary: "primary/model",
      fallbacks: ["fallback/a", "fallback/b", "fallback/c"],
    });
  });

  it("omits fallback settings for models without fallbacks", () => {
    getModelWithFallbacksMock.mockReturnValue([SAFE_GPT_MODEL]);
    const openrouter = vi.fn();

    createOpenRouterModel(openrouter as never, SAFE_GPT_MODEL, {
      maxTokens: 200,
    });

    expect(openrouter).toHaveBeenCalledWith(SAFE_GPT_MODEL, {
      maxTokens: 200,
      models: undefined,
      provider: {
        sort: "price",
        max_price: { prompt: 2, completion: 8 },
      },
    });
  });

  it("rejects an unpriced route before making a provider request", () => {
    getModelWithFallbacksMock.mockReturnValue(["unknown/model"]);
    const openrouter = vi.fn();

    expect(() => createOpenRouterModel(openrouter as never, "unknown/model"))
      .toThrow("UNPRICED_MODEL:unknown/model");
    expect(openrouter).not.toHaveBeenCalled();
  });

  it("uses normalized routes for removed mandatory-reasoning models", () => {
    getModelWithFallbacksMock.mockImplementation((model: string) => {
      if (model === "x-ai/grok-4.3") return ["deepseek/deepseek-v4-pro"];
      if (model === "openai/gpt-5.5") return ["openai/gpt-4.1"];
      return [model];
    });

    expect(requiresOpenRouterReasoning("x-ai/grok-4.3")).toBe(false);
    expect(requiresOpenRouterReasoning("openai/gpt-5.5")).toBe(false);
    expect(getOpenRouterProviderOptions("x-ai/grok-4.3", "low")).toEqual({
      openrouter: {
        reasoning: { enabled: false },
      },
    });
  });

  it("keeps reasoning disabled for ordinary models", () => {
    getModelWithFallbacksMock.mockImplementation((model: string) => [model]);

    expect(requiresOpenRouterReasoning(SECONDARY_STARTER_MODEL)).toBe(false);
    expect(
      getOpenRouterProviderOptions(SECONDARY_STARTER_MODEL, "low"),
    ).toEqual({
      openrouter: {
        reasoning: { enabled: false },
      },
    });
  });

  it("always enables mandatory models without sending a disable value", () => {
    getModelWithFallbacksMock.mockImplementation((model: string) => [model]);

    expect(requiresOpenRouterReasoning("x-ai/grok-4.5")).toBe(true);
    expect(getOpenRouterReasoningSelection("x-ai/grok-4.5", "low")).toEqual({
      enabled: true,
      visible: true,
      mandatory: true,
      effort: "low",
      providerOptions: {
        openrouter: {
          reasoning: { effort: "low", exclude: false },
        },
      },
    });
  });

  it("uses low visible reasoning for high-quality optional models", () => {
    getModelWithFallbacksMock.mockImplementation((model: string) => [model]);

    expect(
      getOpenRouterReasoningSelection("google/gemini-3-flash-preview", "high"),
    ).toMatchObject({
      enabled: true,
      visible: true,
      mandatory: false,
      effort: "low",
      providerOptions: {
        openrouter: {
          reasoning: { effort: "low", exclude: false },
        },
      },
    });
  });

  it("does not send reasoning options to non-reasoning models", () => {
    getModelWithFallbacksMock.mockImplementation((model: string) => [model]);

    expect(getOpenRouterReasoningSelection(SAFE_GPT_MODEL, "high")).toEqual({
      enabled: false,
      visible: false,
      mandatory: false,
      effort: "none",
    });
  });

  it("maps provider errors to user-facing messages and statuses", () => {
    const providerError = Object.assign(new Error("Bad gateway"), {
      responseBody: JSON.stringify({ error: { message: "quota exceeded" } }),
      statusCode: 429,
    });

    expect(getAIErrorMessage(providerError)).toBe("quota exceeded");
    expect(getAIErrorStatus(providerError)).toBe(502);
    expect(getAIErrorStatus({ statusCode: 503 })).toBe(503);
    expect(getAIErrorMessage({})).toBe(
      "The model provider returned an unexpected error.",
    );
  });
});
