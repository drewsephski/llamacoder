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

  it("blocks unsafe or incomplete browser API clients", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'import { load } from "./api"; export default function App() { return <button onClick={load}>Load</button>; }',
      },
      {
        path: "api.ts",
        code: 'const apiKey = "super-secret-token-123"; export async function load() { return fetch("https://api.example.com/data", { headers: { Authorization: "Bearer super-secret-token-123" } }); }',
      },
      { path: "types.ts", code: "export type Data = { id: string };" },
    ]);

    const report = buildGeneratedFilesQualityReport(files);
    expect(report.apiIntegration.status).toBe("blocked");
    expect(report.diagnostics.map((item) => item.message)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Hard-coded API credentials"),
        expect.stringContaining("AbortController"),
        expect.stringContaining("runtime"),
      ]),
    );
  });

  it("blocks browser-forbidden request headers", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'import { load } from "./api"; export default function App() { return <button onClick={load}>Load</button>; }',
      },
      {
        path: "api.ts",
        code: [
          "function isData(value: unknown): value is { id: string } { return typeof value === 'object' && value !== null && 'id' in value; }",
          "export async function load(retry = 0): Promise<unknown> {",
          " const controller = new AbortController();",
          ' const response = await fetch("https://api.example.com", { signal: controller.signal, headers: { "User-Agent": "generated-app" } });',
          " if (!response.ok) throw new Error('bad');",
          " const data: unknown = await response.json(); if (!isData(data)) throw new Error('invalid');",
          " if (retry > 2) throw new Error('retry limit'); return data;",
          "}",
        ].join("\n"),
      },
      { path: "types.ts", code: "export type Data = { id: string };" },
    ]);

    expect(validateGeneratedFiles(files)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("forbidden request headers"),
        }),
      ]),
    );
  });

  it("verifies a defensive public API client", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'import { load } from "./api"; export default function App() { return <button onClick={load}>Load</button>; }',
      },
      {
        path: "api.ts",
        code: [
          "function isData(value: unknown): value is { id: string } {",
          '  return typeof value === "object" && value !== null && typeof (value as { id?: unknown }).id === "string";',
          "}",
          "export async function load(retry = 0): Promise<{ id: string }> {",
          "  const controller = new AbortController();",
          "  const timeout = setTimeout(() => controller.abort(), 5000);",
          "  try {",
          '    const response = await fetch("https://api.example.com/data", { signal: controller.signal });',
          '    if (!response.ok) throw new Error("Request failed");',
          "    const data: unknown = await response.json();",
          '    if (!isData(data)) throw new Error("Invalid response");',
          "    return data;",
          "  } catch (error) {",
          "    if (retry < 2) return load(retry + 1);",
          "    throw error;",
          "  } finally { clearTimeout(timeout); }",
          "}",
        ].join("\n"),
      },
      { path: "types.ts", code: "export type Data = { id: string };" },
    ]);

    expect(buildGeneratedFilesQualityReport(files).apiIntegration.status).toBe(
      "verified",
    );
  });

  it("requires policy review for a conditional provider", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'import { load } from "./api"; export default function App() { return <button onClick={load}>Load</button>; }',
      },
      {
        path: "api.ts",
        code: [
          "function isWeather(value: unknown): value is { latitude: number } { return typeof value === 'object' && value !== null && 'latitude' in value; }",
          "export async function load(retry = 0): Promise<unknown> {",
          " const controller = new AbortController();",
          " const timeout = setTimeout(() => controller.abort(), 5000);",
          " try { const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=41&longitude=-87', { signal: controller.signal }); if (!response.ok) throw new Error('bad'); const data: unknown = await response.json(); if (!isWeather(data)) throw new Error('invalid'); return data; }",
          " catch (error) { if (retry < 2) return load(retry + 1); throw error; } finally { clearTimeout(timeout); }",
          "}",
        ].join("\n"),
      },
      { path: "types.ts", code: "export type Weather = { latitude: number };" },
    ]);

    const integration = buildGeneratedFilesQualityReport(files).apiIntegration;
    expect(integration.status).toBe("setup_required");
    expect(integration.providers).toEqual([
      expect.objectContaining({
        id: "open-meteo",
        policyStatus: "conditional",
      }),
    ]);
    expect(integration.policyWarnings).toEqual(
      expect.arrayContaining([expect.stringContaining("commercial-use terms")]),
    );
  });

  it("blocks endpoints prohibited by the integration registry", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'import { load } from "./api"; export default function App() { return <button onClick={load}>Load</button>; }',
      },
      {
        path: "api.ts",
        code: [
          "function isPlace(value: unknown): value is object { return typeof value === 'object' && value !== null; }",
          "export async function load(retry = 0): Promise<unknown> {",
          " const controller = new AbortController();",
          " const timeout = setTimeout(() => controller.abort(), 5000);",
          " try { const response = await fetch('https://nominatim.openstreetmap.org/search?q=Chicago&format=json', { signal: controller.signal }); if (!response.ok) throw new Error('bad'); const data: unknown = await response.json(); if (!isPlace(data)) throw new Error('invalid'); return data; }",
          " catch (error) { if (retry < 2) return load(retry + 1); throw error; } finally { clearTimeout(timeout); }",
          "}",
        ].join("\n"),
      },
      { path: "types.ts", code: "export type Place = { name: string };" },
    ]);

    const integration = buildGeneratedFilesQualityReport(files).apiIntegration;
    expect(integration.status).toBe("blocked");
    expect(integration.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("blocked"),
        }),
      ]),
    );
  });
});
