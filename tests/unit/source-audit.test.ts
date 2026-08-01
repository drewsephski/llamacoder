import { describe, expect, it } from "vitest";

import { analyzeSourceBundle } from "@/features/source-audit/analyze";

function file(path: string, content: string) {
  return { path: `project-main/${path}`, content, bytes: content.length };
}

describe("analyzeSourceBundle", () => {
  it("passes a portable React project with a reproducible build", () => {
    const report = analyzeSourceBundle({
      source: { kind: "zip", label: "project.zip" },
      auditedAt: new Date("2026-08-01T16:00:00.000Z"),
      files: [
        file(
          "package.json",
          JSON.stringify({
            scripts: { dev: "vite", build: "vite build" },
            dependencies: { react: "19.2.0" },
            devDependencies: { vite: "8.0.0", "@vitejs/plugin-react": "6.0.0" },
          }),
        ),
        file("pnpm-lock.yaml", "lockfileVersion: '9.0'"),
        file(
          "src/App.tsx",
          "export default function App(){return <main>Ready</main>}",
        ),
        file("src/main.tsx", "import App from './App'; console.log(App)"),
      ],
    });

    expect(report.overallStatus).toBe("passed");
    expect(report.framework).toBe("React + Vite");
    expect(report.findings).toHaveLength(5);
  });

  it("fails without echoing a possible hardcoded credential", () => {
    const possibleSecret = "sk_live_private_value_123456";
    const report = analyzeSourceBundle({
      source: { kind: "github", label: "owner/repo" },
      files: [
        file(
          "package.json",
          JSON.stringify({
            scripts: { build: "vite build" },
            dependencies: { react: "19" },
          }),
        ),
        file("package-lock.json", "{}"),
        file(
          "src/App.tsx",
          `const apiKey = "${possibleSecret}"; export default function App(){return <main />}`,
        ),
      ],
    });

    expect(report.overallStatus).toBe("failed");
    expect(JSON.stringify(report)).not.toContain(possibleSecret);
    expect(
      report.findings.find((finding) => finding.id === "secret_exposure")
        ?.status,
    ).toBe("failed");
  });

  it("flags undocumented environment values and recognized platform coupling for review", () => {
    const report = analyzeSourceBundle({
      source: { kind: "zip", label: "export.zip" },
      files: [
        file(
          "package.json",
          JSON.stringify({
            scripts: { build: "vite build" },
            dependencies: { react: "19" },
          }),
        ),
        file("pnpm-lock.yaml", "lockfileVersion: '9.0'"),
        file(
          "src/App.tsx",
          `import "lovable-tagger"; const endpoint = import.meta.env.VITE_API_URL; export default function App(){return <main>{endpoint}</main>}`,
        ),
      ],
    });

    expect(report.overallStatus).toBe("review");
    expect(
      report.findings.find((finding) => finding.id === "environment_setup")
        ?.status,
    ).toBe("review");
    expect(
      report.findings.find((finding) => finding.id === "platform_portability")
        ?.details,
    ).toContain("Lovable coupling detected");
  });

  it("discloses when a large repository was only partially inspected", () => {
    const report = analyzeSourceBundle({
      source: { kind: "github", label: "owner/large-repo" },
      files: [
        file(
          "package.json",
          JSON.stringify({ scripts: { build: "vite build" } }),
        ),
        file("src/App.tsx", "export default function App(){return <main /> }"),
      ],
      inspection: {
        eligibleFiles: 950,
        inspectedFiles: 600,
        skippedFiles: 350,
      },
    });

    expect(report.scope).toContain(
      "600 of 950 supported files were inspected; 350 were skipped by bounded file-count, file-size, or total-text limits.",
    );
  });
});
