import { describe, expect, test } from "vitest";
import {
  estimateTokens,
  getCanonicalCodingPrompt,
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

  test("the canonical prompt stays compact without policy drift", () => {
    const prompt = getCompressedCodingPrompt();

    expect(prompt).toBe(getCanonicalCodingPrompt());
    expect(prompt).toContain("## Execution contract");
    expect(prompt).toContain("Every import must resolve");
    expect(prompt).toContain("### Live APIs and persistence");
    expect(prompt).toContain("Keep trivial apps small");
    expect(prompt).toContain(
      "Navigation and footer may be integrated or omitted",
    );
    expect(prompt).toContain("Installed capability catalog");
    expect(prompt).toContain("no specialized package is required");
    expect(prompt).not.toContain('from "/components/');
    expect(prompt).toContain("## Output contract");
    expect(prompt.length).toBeLessThan(14_000);
  });

  test("expands only request-matched capability guidance", () => {
    const mapPrompt = getCanonicalCodingPrompt(
      "Build an interactive map with searchable location markers",
    );

    expect(mapPrompt).toContain("Maps: use `react-leaflet`");
    expect(mapPrompt).toContain("Search: use array filtering");
    expect(mapPrompt).not.toContain("Put rigid bodies inside `Physics`");
  });

  test("estimateTokens uses the 4-char heuristic", () => {
    expect(estimateTokens("abcd")).toBe(1);
    expect(estimateTokens("a".repeat(40))).toBe(10);
  });
});
