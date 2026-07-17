import { describe, expect, it } from "vitest";
import { buildTargetedPreviewEditPrompt } from "@/lib/targeted-preview-edit";

describe("targeted preview edit prompts", () => {
  it("includes the user instruction, selected element context, and selected-version files", () => {
    const prompt = buildTargetedPreviewEditPrompt({
      appTitle: "Landing Page",
      instruction: "Make this CTA button green and more prominent",
      selection: {
        tagName: "button",
        domPath: "main:nth-of-type(1) > button.cta:nth-of-type(1)",
        text: "Get started",
        className: "cta bg-blue-500",
        rect: { x: 20, y: 40, width: 120, height: 44 },
        html: '<button class="cta bg-blue-500">Get started</button>',
      },
      files: [
        {
          path: "App.tsx",
          language: "tsx",
          code: "export default function App() { return <button>Get started</button>; }",
        },
      ],
    });

    expect(prompt).toContain("Make this CTA button green");
    expect(prompt).toContain("Tag: button");
    expect(prompt).toContain("Classes: cta bg-blue-500");
    expect(prompt).toContain("Bounds: 120x44 at 20,40");
    expect(prompt).toContain("```tsx{path=App.tsx}");
    expect(prompt).toContain("return <button>Get started</button>;");
    expect(prompt).toContain("preserve that exact Tailwind family");
    expect(prompt).toContain("complete literal static utilities");
    expect(prompt).toContain("never violet, indigo");
    expect(prompt).toContain(
      "Replace conflicting existing background, text, border, gradient, and dark-mode color utilities",
    );
  });
});
