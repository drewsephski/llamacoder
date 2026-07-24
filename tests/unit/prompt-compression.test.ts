import { describe, expect, test } from "vitest";
import {
  estimateTokens,
  getCompressedCodingPrompt,
  shouldUseCompressedPrompt,
} from "@/lib/prompt-compression";

describe("prompt-compression", () => {
  test("shouldUseCompressedPrompt triggers on message count threshold", () => {
    expect(shouldUseCompressedPrompt(11, 0)).toBe(false);
    expect(shouldUseCompressedPrompt(12, 0)).toBe(true);
  });

  test("shouldUseCompressedPrompt triggers on estimated context tokens", () => {
    expect(shouldUseCompressedPrompt(0, 5_999)).toBe(false);
    expect(shouldUseCompressedPrompt(0, 6_000)).toBe(true);
  });

  test("getCompressedCodingPrompt preserves hard technical rules", () => {
    const prompt = getCompressedCodingPrompt();

    expect(prompt).toContain("Multi-file structure");
    expect(prompt).toContain("Every import must resolve");
    expect(prompt).toContain("Live API safety");
  });

  test("estimateTokens uses the 4-char heuristic", () => {
    expect(estimateTokens("abcd")).toBe(1);
    expect(estimateTokens("a".repeat(40))).toBe(10);
  });
});
