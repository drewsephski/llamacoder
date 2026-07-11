import { describe, expect, it } from "vitest";

import {
  normalizeReasoningCodeLanguage,
  parseReasoningTrace,
} from "@/features/generation/reasoning-trace";

describe("parseReasoningTrace", () => {
  it("preserves prose around a fenced code snippet", () => {
    expect(
      parseReasoningTrace(
        "I will extract a helper.\n\n```tsx\nconst total = 2 + 2;\n```\n\nThen I will use it.",
      ),
    ).toEqual([
      { type: "text", content: "I will extract a helper.\n" },
      { type: "code", code: "const total = 2 + 2;", language: "tsx" },
      { type: "text", content: "\nThen I will use it." },
    ]);
  });

  it("renders an unfinished streaming fence as code", () => {
    expect(
      parseReasoningTrace("Checking this:\n```ts\nconst value = 1;"),
    ).toEqual([
      { type: "text", content: "Checking this:" },
      {
        type: "code",
        code: "const value = 1;",
        language: "typescript",
      },
    ]);
  });

  it("supports untyped fences and safely falls back for unknown languages", () => {
    expect(parseReasoningTrace("```\nplain text\n```")).toEqual([
      { type: "code", code: "plain text", language: "text" },
    ]);
    expect(normalizeReasoningCodeLanguage("made-up-lang")).toBe("text");
  });
});
