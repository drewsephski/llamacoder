import { describe, expect, it } from "vitest";
import {
  extractAllCodeBlocks,
  extractChatNarration,
  extractFirstCodeBlock,
  generateIntelligentFilename,
  getExtensionForLanguage,
  getLanguageOfFile,
  getMonacoLanguage,
  parseReplySegments,
} from "@/lib/utils";

describe("markdown/code parsing utilities", () => {
  it("extracts the first code block with language and filename metadata", () => {
    const result = extractFirstCodeBlock(
      "Intro\n```tsx{filename=Widget.tsx}\nexport const x = 1;\n```\nOutro",
    );

    expect(result).toMatchObject({
      code: "export const x = 1;",
      language: "tsx",
      filename: { name: "Widget", extension: "tsx" },
    });
  });

  it("extracts all code blocks with path and filename fallbacks", () => {
    expect(
      extractAllCodeBlocks(
        [
          "```tsx{path=App.tsx}",
          "export default function App() { return null; }",
          "```",
          "```css{filename=styles.css}",
          "body {}",
          "```",
          "```python",
          "print('x')",
          "```",
        ].join("\n"),
      ),
    ).toMatchObject([
      { language: "tsx", path: "App.tsx" },
      { language: "css", path: "styles.css" },
      { language: "python", path: "file.py" },
    ]);
  });

  it("parses interleaved reply segments and emits partial streaming fences", () => {
    expect(
      parseReplySegments(
        [
          "Before",
          "```tsx{path=App.tsx}",
          "export default function App() {}",
          "```",
          "After",
        ].join("\n"),
      ),
    ).toEqual([
      { type: "text", content: "Before" },
      {
        type: "file",
        language: "tsx",
        path: "App.tsx",
        code: "export default function App() {}",
        isPartial: false,
      },
      { type: "text", content: "After" },
    ]);

    expect(
      parseReplySegments("```ts{path=lib/x.ts}\nexport const x = 1;"),
    ).toEqual([
      {
        type: "file",
        language: "ts",
        path: "lib/x.ts",
        code: "export const x = 1;",
        isPartial: true,
      },
    ]);
  });

  it("accepts CommonMark-indented generated file fences", () => {
    const response = [
      "Implemented the requested change.",
      "   ```tsx{path=App.tsx}",
      "export default function App() { return <main />; }",
      "   ```   ",
    ].join("\n");

    expect(extractAllCodeBlocks(response)).toMatchObject([
      {
        language: "tsx",
        path: "App.tsx",
        code: "export default function App() { return <main />; }",
      },
    ]);
    expect(parseReplySegments(response)).toEqual([
      { type: "text", content: "Implemented the requested change." },
      {
        type: "file",
        language: "tsx",
        path: "App.tsx",
        code: "export default function App() { return <main />; }",
        isPartial: false,
      },
    ]);
  });

  it("separates generated files from streaming chat narration", () => {
    expect(
      extractChatNarration(
        [
          "Building the polished launch page now.",
          "```tsx{path=App.tsx}",
          "export default function App() { return <main />; }",
          "```",
          "Wiring the responsive navigation next.",
        ].join("\n"),
      ),
    ).toBe(
      "Building the polished launch page now.\n\nWiring the responsive navigation next.",
    );

    expect(extractChatNarration("Working on the app\n``")).toBe(
      "Working on the app",
    );
    expect(
      extractChatNarration(
        "```tsx{path=App.tsx}\nexport default function App() {",
      ),
    ).toBe("");
  });

  it("derives deterministic filenames and language extensions", () => {
    expect(
      generateIntelligentFilename(
        "export default function FancyCard() {}",
        "tsx",
      ),
    ).toEqual({
      name: "fancy-card",
      extension: "tsx",
    });
    expect(getExtensionForLanguage("typescript")).toBe("tsx");
    expect(getExtensionForLanguage("unknown")).toBe("txt");
    expect(getLanguageOfFile("components/App.tsx")).toBe("typescript");
    expect(getMonacoLanguage("bash")).toBe("shell");
  });
});
