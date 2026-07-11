import { describe, expect, it } from "vitest";

import { isPlanModeAvailable } from "@/lib/constants";

describe("model capabilities", () => {
  it.each([
    ["deepseek/deepseek-v4-flash", true],
    ["google/gemini-2.5-flash-lite", true],
    ["google/gemini-3-flash-preview", true],
    ["openai/gpt-4.1", false],
    ["anthropic/claude-opus-4.8", true],
    ["anthropic/claude-sonnet-5", true],
    ["x-ai/grok-4.5", false],
    ["deepseek/deepseek-v4-pro", true],
    ["z-ai/glm-5.2", true],
    ["unknown/model", false],
  ])("returns Plan-mode availability for %s", (model, expected) => {
    expect(isPlanModeAvailable(model)).toBe(expected);
  });
});
