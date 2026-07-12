import { describe, expect, it } from "vitest";
import { buildExportBundle, getExportFilename } from "@/lib/export-bundle";
import { normalizeGeneratedFiles } from "@/lib/generated-files";

describe("export bundle", () => {
  it("assembles a portable verified repo bundle from generated files", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: [
          'import { Button } from "@/components/ui/button";',
          'import { Card } from "./components/Card";',
          "export default function DemoApp() {",
          "  return <main><Card /><Button>Run</Button></main>;",
          "}",
        ].join("\n"),
      },
      {
        path: "components/Card.tsx",
        code: 'export function Card() { return <section aria-label="Demo" />; }',
      },
      {
        path: "components/Header.tsx",
        code: "export function Header() { return <header />; }",
      },
    ]);

    const bundle = buildExportBundle(files);
    const bundlePaths = new Set(bundle.files.map((file) => file.path));

    expect(bundle.appTitle).toBe("Demo");
    expect(getExportFilename(bundle.appTitle)).toBe("Demo-squidagent.zip");
    expect(bundle.manifest.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "App.tsx",
          generated: true,
        }),
        expect.objectContaining({
          path: "components/ui/button.tsx",
          generated: false,
        }),
      ]),
    );
    expect([...bundlePaths]).toEqual(
      expect.arrayContaining([
        "App.tsx",
        "main.tsx",
        "package.json",
        "squid-manifest.json",
        "squid-quality-report.json",
        "squid-verification-report.json",
        "squid-integrations.json",
        ".env.example",
        "vercel.json",
        "netlify.toml",
        "wrangler.toml",
      ]),
    );
    expect(
      JSON.parse(
        bundle.files.find((file) => file.path === "package.json")!.content,
      ).dependencies,
    ).toMatchObject({
      react: "latest",
      "lucide-react": "latest",
    });
    const tailwindConfig = bundle.files.find(
      (file) => file.path === "tailwind.config.ts",
    )!.content;

    expect(tailwindConfig).toContain("card: {");
    expect(tailwindConfig).toContain("muted: {");
    expect(tailwindConfig).toContain("secondary: {");
    expect(tailwindConfig).toContain("accent: {");
    expect(tailwindConfig).toContain("popover: {");
    expect(tailwindConfig).toContain("destructive: {");
    expect(bundle.verificationReport.status).toBe("verified");
  });

  it("exports API setup notes and publishable environment placeholders", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'import { load } from "./api"; export default function App() { return <button onClick={load}>Load</button>; }',
      },
      {
        path: "api.ts",
        code: [
          "const key = import.meta.env.VITE_MAPS_PUBLISHABLE_KEY;",
          "function isPlace(value: unknown): value is { name: string } { return typeof value === 'object' && value !== null && 'name' in value; }",
          "export async function load(retry = 0): Promise<unknown> {",
          " const controller = new AbortController();",
          " const timeout = setTimeout(() => controller.abort(), 5000);",
          " try { const response = await fetch(`https://api.example.com/places?key=${key}`, { signal: controller.signal }); if (!response.ok) throw new Error('bad'); const data: unknown = await response.json(); if (!isPlace(data)) throw new Error('invalid'); return data; }",
          " catch (error) { if (retry < 2) return load(retry + 1); throw error; } finally { clearTimeout(timeout); }",
          "}",
        ].join("\n"),
      },
      { path: "types.ts", code: "export type Place = { name: string };" },
    ]);
    const bundle = buildExportBundle(files);

    expect(bundle.qualityReport.apiIntegration.status).toBe("setup_required");
    expect(
      bundle.files.find((file) => file.path === ".env.example")?.content,
    ).toContain("VITE_MAPS_PUBLISHABLE_KEY=");
    expect(
      bundle.files.find((file) => file.path === "README.md")?.content,
    ).toContain("API setup required");
  });
});
