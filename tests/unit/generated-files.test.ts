import { describe, expect, it } from "vitest";
import {
  buildGeneratedFilesRepairPrompt,
  formatGeneratedFilesMarkdown,
  normalizeGeneratedFiles,
  normalizeGeneratedPath,
  validateGeneratedFiles,
} from "@/lib/generated-files";

describe("generated file normalization", () => {
  it("normalizes safe paths and rejects traversal/protected modules", () => {
    expect(normalizeGeneratedPath(" src/App.tsx ")).toBe("App.tsx");
    expect(normalizeGeneratedPath("./components/Card.tsx")).toBe(
      "components/Card.tsx",
    );
    expect(normalizeGeneratedPath("../secret.ts")).toBeNull();
    expect(normalizeGeneratedPath("components/ui/button.tsx")).toBeNull();
    expect(normalizeGeneratedPath("@/lib/utils.ts")).toBeNull();
  });

  it("deduplicates by normalized path and rewrites generated alias imports", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "src/App.tsx",
        code: 'import { Widget } from "@/components/Widget";\nexport default Widget;',
      },
      {
        path: "App.tsx",
        code: 'import { Widget } from "@/components/Widget";\nexport default Widget;',
      },
      {
        path: "components/Widget.tsx",
        code: "export function Widget() { return <section />; }",
      },
    ]);

    expect(files).toHaveLength(2);
    expect(files.find((file) => file.path === "App.tsx")?.code).toContain(
      'from "./components/Widget"',
    );
  });

  it("keeps protected shadcn imports while diagnosing unresolved generated imports", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: [
          'import { Button } from "@/components/ui/button";',
          'import { Missing } from "./Missing";',
          "export default function App() { return <Button />; }",
        ].join("\n"),
      },
      {
        path: "components/Card.tsx",
        code: "export function Card() { return <article />; }",
      },
      {
        path: "components/Chart.tsx",
        code: "export function Chart() { return <figure />; }",
      },
    ]);

    expect(files[0].code).toContain('from "@/components/ui/button"');
    expect(validateGeneratedFiles(files)).toEqual([
      {
        path: "App.tsx",
        message:
          'Unresolved internal import "./Missing". Generate the imported file or remove the import.',
      },
    ]);
  });

  it("reports missing App.tsx and minimum source-file diagnostics", () => {
    const files = normalizeGeneratedFiles([
      { path: "components/Widget.tsx", code: "export const Widget = () => null;" },
    ]);

    expect(validateGeneratedFiles(files)).toEqual([
      { message: "Missing App.tsx entry file." },
      { message: "Generated app should contain at least 3 source files." },
    ]);
  });

  it("formats files as path-tagged markdown and builds actionable repair prompts", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: "export default function App() { return <main />; }",
      },
      { path: "styles.css", code: "main { display: block; }" },
      { path: "data.json", code: '{"ok":true}' },
    ]);
    const markdown = formatGeneratedFilesMarkdown(files);

    expect(markdown).toContain("```tsx{path=App.tsx}");
    expect(markdown).toContain("```css{path=styles.css}");
    expect(markdown).toContain("```json{path=data.json}");

    const repairPrompt = buildGeneratedFilesRepairPrompt("original", files, [
      { path: "App.tsx", message: "bad import" },
    ]);
    expect(repairPrompt).toContain("Diagnostics:");
    expect(repairPrompt).toContain("- App.tsx: bad import");
    expect(repairPrompt).toContain("Use `import { motion } from \"framer-motion\"`");
  });

  it("normalizes common Framer Motion codegen mistakes", () => {
    const [file] = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'import { Motion } from "framer-motion";\nexport default <Motion />;',
      },
    ]);

    expect(file.code).toContain('import { motion } from "framer-motion";');
    expect(file.code).toContain("<motion.div />");
  });
});
