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
  requiresOpenRouterReasoning,
} from "@/lib/openrouter";
import { SECONDARY_STARTER_MODEL } from "@/lib/constants";

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
    getModelWithFallbacksMock.mockReturnValue(["paid/model"]);
    const openrouter = vi.fn();

    createOpenRouterModel(openrouter as never, "paid/model", {
      maxTokens: 200,
    });

    expect(openrouter).toHaveBeenCalledWith("paid/model", {
      maxTokens: 200,
      models: undefined,
    });
  });

  it("uses normalized routes for removed mandatory-reasoning models", () => {
    getModelWithFallbacksMock.mockImplementation((model: string) => {
      if (model === "x-ai/grok-4.3") return ["minimax/minimax-m3"];
      if (model === "openai/gpt-5.5") return ["openai/gpt-4.1"];
      return [model];
    });

    expect(requiresOpenRouterReasoning("x-ai/grok-4.3")).toBe(false);
    expect(requiresOpenRouterReasoning("openai/gpt-5.5")).toBe(false);
    expect(getOpenRouterProviderOptions("x-ai/grok-4.3")).toEqual({
      openrouter: {
        reasoning: { enabled: false },
      },
    });
  });

  it("keeps reasoning disabled for ordinary models", () => {
    getModelWithFallbacksMock.mockImplementation((model: string) => [model]);

    expect(requiresOpenRouterReasoning(SECONDARY_STARTER_MODEL)).toBe(false);
    expect(getOpenRouterProviderOptions(SECONDARY_STARTER_MODEL)).toEqual({
      openrouter: {
        reasoning: { enabled: false },
      },
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
