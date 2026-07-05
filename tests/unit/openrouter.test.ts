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
} from "@/lib/openrouter";

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

    createOpenRouterModel(openrouter as never, "paid/model", { maxTokens: 200 });

    expect(openrouter).toHaveBeenCalledWith("paid/model", {
      maxTokens: 200,
      models: undefined,
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
