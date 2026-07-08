import { describe, expect, it } from "vitest";
import {
  buildGeneratedFilesQualityReport,
  buildGeneratedFilesRepairPrompt,
  formatGeneratedFilesMarkdown,
  normalizeGeneratedFiles,
  normalizeGeneratedPath,
  readGeneratedFilesStats,
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

  it("reports protected files stripped during normalization", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "components/ui/button.tsx",
        code: "export function Button() { return null; }",
      },
      {
        path: "App.tsx",
        code: "export default function App() { return <main />; }",
      },
    ]);

    expect(readGeneratedFilesStats(files)).toEqual({
      protectedPathsBlocked: 1,
    });
    expect(buildGeneratedFilesQualityReport(files)).toMatchObject({
      protectedPathsBlocked: 1,
    });
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

  it("diagnoses generated default and named import/export mismatches", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: [
          'import { Footer } from "./components/Footer";',
          'import Header from "./components/Header";',
          "export default function App() { return <><Header /><Footer /></>; }",
        ].join("\n"),
      },
      {
        path: "components/Footer.tsx",
        code: "export default function Footer() { return <footer />; }",
      },
      {
        path: "components/Header.tsx",
        code: "export function Header() { return <header />; }",
      },
    ]);

    expect(validateGeneratedFiles(files)).toEqual([
      {
        path: "App.tsx",
        message:
          'Named import "Footer" from "./components/Footer" is invalid because components/Footer.tsx does not export "Footer". It has a default export; use import Footer from "./components/Footer" or export "Footer" by name.',
      },
      {
        path: "App.tsx",
        message:
          'Default import "Header" from "./components/Header" is invalid because components/Header.tsx exports "Header" only as a named export. Use import { Header } from "./components/Header" or add a default export.',
      },
    ]);
  });

  it("reports missing App.tsx and minimum source-file diagnostics", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "components/Widget.tsx",
        code: "export const Widget = () => null;",
      },
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
    expect(repairPrompt).toContain(
      'Use `import { motion } from "framer-motion"`',
    );
    expect(repairPrompt).toContain(
      "Every import style must match the target file's exports",
    );
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

  it("normalizes invalid Select export patterns", () => {
    const [file] = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'import { Select, SelectItemText } from "@/components/ui/select";\nexport default function App() { return <SelectItemText>System</SelectItemText>; }',
      },
    ]);

    expect(file.code).not.toContain("SelectItemText");
    expect(file.code).toContain(
      'import { Select, SelectItem } from "@/components/ui/select";',
    );
    expect(file.code).toContain("<SelectItem>System</SelectItem>");
  });

  it("adds the platform cn import when generated JSX calls cn", () => {
    const [file] = normalizeGeneratedFiles([
      {
        path: "components/FeatureGrid.tsx",
        code: [
          '"use client";',
          'import { Card } from "@/components/ui/card";',
          "export function FeatureGrid() {",
          '  return <div className={cn("p-3 rounded-lg", "bg-blue-500")} />;',
          "}",
        ].join("\n"),
      },
    ]);

    expect(file.code).toContain('import { cn } from "@/lib/utils";');
    expect(file.code.indexOf('import { cn } from "@/lib/utils";')).toBeLessThan(
      file.code.indexOf('import { Card } from "@/components/ui/card";'),
    );
  });

  it("normalizes clipboard calls to avoid unhandled permission errors", () => {
    const [file] = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'export default async function App() { await navigator.clipboard.writeText("ok"); }',
      },
    ]);

    expect(file.code).toContain(
      'await (navigator?.clipboard?.writeText?.("ok") ?? Promise.resolve()).catch(() => {});',
    );
  });

  it("builds a quality report from file, import, and accessibility diagnostics", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: [
          'import { Header } from "./components/Header";',
          'import { Missing } from "./components/Missing";',
          "export default function App() { return <><Header /><button></button></>; }",
        ].join("\n"),
      },
      {
        path: "components/Header.tsx",
        code: "export function Header() { return <header />; }",
      },
      {
        path: "components/Footer.tsx",
        code: "export function Footer() { return <footer />; }",
      },
    ]);

    const report = buildGeneratedFilesQualityReport(files);

    expect(report.filesGenerated).toBe(3);
    expect(report.importsResolved).toBe(1);
    expect(report.unresolvedImports).toEqual([
      expect.objectContaining({ path: "App.tsx" }),
    ]);
    expect(report.accessibilityWarnings).toEqual([
      expect.objectContaining({
        message: "Button appears to have no visible text or aria-label.",
      }),
    ]);
    expect(report.status).toBe("warning");
  });
});
