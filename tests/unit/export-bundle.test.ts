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
        code: "export function Card() { return <section aria-label=\"Demo\" />; }",
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
});
