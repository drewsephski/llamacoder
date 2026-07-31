import { describe, expect, it } from "vitest";

import { getMessageGeneratedFiles } from "@/features/generation/message-files";

describe("getMessageGeneratedFiles", () => {
  it("does not reinterpret conversational code examples as app files", () => {
    expect(
      getMessageGeneratedFiles({
        content:
          "Here is a focused example:\n\n```tsx{path=Example.tsx}\nexport function Example() { return null; }\n```",
        files: { kind: "agent_response", sources: [] },
      }),
    ).toEqual([]);
  });

  it("continues to recover generated files from legacy message content", () => {
    expect(
      getMessageGeneratedFiles({
        content:
          "```tsx{path=App.tsx}\nexport default function App() { return null; }\n```",
        files: null,
      }),
    ).toMatchObject([
      {
        path: "App.tsx",
        language: "tsx",
        code: "export default function App() { return null; }",
      },
    ]);
  });
});
