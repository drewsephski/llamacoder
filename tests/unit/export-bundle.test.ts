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
      react: "19.2.4",
      "react-dom": "19.2.4",
    });
    expect(
      JSON.parse(
        bundle.files.find((file) => file.path === "package.json")!.content,
      ).dependencies["lucide-react"],
    ).toBeUndefined();
    expect(
      JSON.parse(
        bundle.files.find((file) => file.path === "package.json")!.content,
      ).devDependencies,
    ).toMatchObject({
      "@types/react": "^19.1.0",
      "@types/react-dom": "^19.1.0",
      tailwindcss: "3.4.17",
      "tailwindcss-animate": "1.0.7",
      vite: "8.1.3",
    });
    const tailwindConfig = bundle.files.find(
      (file) => file.path === "tailwind.config.ts",
    )!.content;
    const tsconfig = JSON.parse(
      bundle.files.find((file) => file.path === "tsconfig.json")!.content,
    );

    expect(tailwindConfig).toContain('"card": {');
    expect(tailwindConfig).toContain('"muted": {');
    expect(tailwindConfig).toContain('"secondary": {');
    expect(tailwindConfig).toContain('"accent": {');
    expect(tailwindConfig).toContain('"popover": {');
    expect(tailwindConfig).toContain('"destructive": {');
    expect(tailwindConfig).not.toContain("./**/*.{ts,tsx}");
    expect(tailwindConfig).toContain("./components/**/*.{ts,tsx}");
    expect(tailwindConfig).toContain('darkMode: "class"');
    const styles = bundle.files.find(
      (file) => file.path === "styles.css",
    )!.content;
    expect(styles).toContain(".dark {");
    expect(styles).toContain("--background: 0 0% 3.9%;");
    expect(styles).toContain("--foreground: 0 0% 98%;");
    expect(styles).toContain("background-color: hsl(var(--background));");
    expect(tsconfig.compilerOptions.moduleResolution).toBe("Bundler");
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

  it("exports the Supabase adapter with placeholder-only Vite configuration", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: [
          'import { supabase } from "@/lib/supabase";',
          "export default function App() {",
          '  return <main>{supabase ? "Supabase client ready" : "Setup required"}</main>;',
          "}",
        ].join("\n"),
      },
      {
        path: "lib/supabase.ts",
        code: 'export const leaked = "sb_secret_should-be-stripped";',
      },
      {
        path: "squid-runtime/supabase.ts",
        code: 'export const leaked = "management-token";',
      },
    ]);
    const bundle = buildExportBundle(files);
    const byPath = new Map(
      bundle.files.map((file) => [file.path, file.content]),
    );
    const serializedBundle = JSON.stringify(bundle.files);

    expect(byPath.get("lib/supabase.ts")).toContain(
      'import { createClient } from "@supabase/supabase-js"',
    );
    expect(byPath.get("squid-runtime/supabase.ts")).toContain(
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY",
    );
    expect(byPath.get("vite-env.d.ts")).toBe(
      '/// <reference types="vite/client" />\n',
    );
    expect(byPath.get(".env.example")).toContain("VITE_SUPABASE_URL=\n");
    expect(byPath.get(".env.example")).toContain(
      "VITE_SUPABASE_PUBLISHABLE_KEY=\n",
    );
    expect(byPath.get(".env.example")).not.toContain("VITE_SUPABASE_ANON_KEY");
    expect(
      JSON.parse(byPath.get("package.json")!).dependencies[
        "@supabase/supabase-js"
      ],
    ).toBe("2.110.8");
    expect(serializedBundle).not.toMatch(
      /sb_secret_should-be-stripped|management-token/,
    );
  });

  it("exports only imported capability packages and transitive Shadcn dependencies", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: [
          'import { Form } from "@/components/ui/form";',
          'import { ReactFlow } from "@xyflow/react";',
          'import "@xyflow/react/dist/style.css";',
          'import { QRCodeSVG } from "qrcode.react";',
          'export default function App() { return <Form><ReactFlow nodes={[]} edges={[]} /><QRCodeSVG value="demo" /></Form>; }',
        ].join("\n"),
      },
      {
        path: "components/Status.tsx",
        code: "export function Status() { return <p>Ready</p>; }",
      },
      {
        path: "types.ts",
        code: "export type Status = 'ready';",
      },
    ]);
    const bundle = buildExportBundle(files);
    const packageJson = JSON.parse(
      bundle.files.find((file) => file.path === "package.json")!.content,
    );
    const paths = new Set(bundle.files.map((file) => file.path));

    expect(packageJson.dependencies).toMatchObject({
      react: "19.2.4",
      "react-dom": "19.2.4",
      "react-hook-form": "7.81.0",
      "@radix-ui/react-label": "^2.1.0",
      "@radix-ui/react-slot": "^1.1.0",
      "@xyflow/react": "12.11.2",
      "qrcode.react": "4.2.0",
    });
    expect(packageJson.dependencies["@tanstack/react-query"]).toBeUndefined();
    expect(paths.has("components/ui/form.tsx")).toBe(true);
    expect(paths.has("components/ui/label.tsx")).toBe(true);
    expect(paths.has("components/ui/calendar.tsx")).toBe(false);
  });
});
