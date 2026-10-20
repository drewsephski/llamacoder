import { describe, expect, it } from "vitest";

import {
  DEFAULT_MODEL,
  GEMINI_3_5_FLASH_LITE_MODEL,
  isPlanModeAvailable,
} from "@/lib/constants";

describe("model capabilities", () => {
  it.each([
    ["deepseek/deepseek-v4-flash", true],
    [DEFAULT_MODEL, true],
    [GEMINI_3_5_FLASH_LITE_MODEL, false],
    ["google/gemini-3.8-flash", true],
    ["anthropic/claude-opus-5.5", true],
    ["openai/gpt-6-luna", true],
    ["anthropic/claude-haiku-5.5", true],
    ["z-ai/glm-5.3-flash", true],
    ["unknown/model", false],
  ])("returns Plan-mode availability for %s", (model, expected) => {
    expect(isPlanModeAvailable(model)).toBe(expected);
  });
});
