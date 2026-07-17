import {
  buildGeneratedFilesQualityReport,
  type GeneratedFile,
  type GeneratedFilesQualityReport,
} from "@/lib/generated-files";
import { getRequiredShadcnFiles } from "@/lib/sandpack-config";
import { getRequiredGeneratedAppDependencies } from "@/lib/generated-app-dependencies";
import { generateIntelligentFilename, toTitleCase } from "@/lib/utils";
import { analyzeGeneratedApiIntegration } from "@/lib/generated-api";

export type ExportBundleFile = {
  path: string;
  content: string;
};

export type ExportBundleManifest = {
  appTitle: string;
  packageName: string;
  exportedAt: string;
  source: "Squid";
  files: Array<{
    path: string;
    language?: string;
    bytes: number;
    generated: boolean;
  }>;
};

export type ExportVerificationCheck = {
  name: string;
  status: "passed" | "warning" | "failed";
  message: string;
};

export type ExportVerificationReport = {
  generatedFiles: GeneratedFilesQualityReport;
  checks: ExportVerificationCheck[];
  status: "verified" | "warning" | "failed";
};

export type ExportBundle = {
  appTitle: string;
  packageName: string;
  files: ExportBundleFile[];
  manifest: ExportBundleManifest;
  qualityReport: GeneratedFilesQualityReport;
  verificationReport: ExportVerificationReport;
};

const BASE_DEPENDENCIES = {
  react: "19.2.4",
  "react-dom": "19.2.4",
};

export function getExportAppTitle(files: GeneratedFile[]) {
  if (files.length === 1) {
    return generateIntelligentFilename(files[0].code, files[0].language).name;
  }

  const appFile = files.find(
    (file) => file.path === "App.tsx" || file.path.endsWith("App.tsx"),
  );

  if (appFile) {
    const appMatch = appFile.code.match(/function\s+(\w+App|\w+Component|\w+)/);

    if (appMatch) {
      return toTitleCase(appMatch[1].replace(/(App|Component)$/, ""));
    }
  }

  const firstFile = files[0];
  if (!firstFile) return "App";

  const name =
    firstFile.path
      .split("/")
      .pop()
      ?.replace(/\.\w+$/, "") || "App";

  return toTitleCase(name.replace(/(App|Component)$/, ""));
}

export function getExportPackageName(appTitle: string) {
  return (
    appTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "squid-generated-app"
  );
}

export function getExportFilename(appTitle: string) {
  return `${appTitle.replace(/[^a-zA-Z0-9]/g, "-")}-squidagent.zip`;
}

export function inferPackageDependencies(
  files: Array<{ code: string }>,
): Record<string, string> {
  const source = files.map((file) => file.code).join("\n");
  return {
    ...BASE_DEPENDENCIES,
    ...getRequiredGeneratedAppDependencies([source]),
  };
}

export function buildExportBundle(files: GeneratedFile[]): ExportBundle {
  const appTitle = getExportAppTitle(files);
  const packageName = getExportPackageName(appTitle);
  const qualityReport = buildGeneratedFilesQualityReport(files);
  const bundleFiles = assembleExportFiles({
    files,
    appTitle,
    packageName,
    qualityReport,
  });
  const manifest = buildManifest({
    appTitle,
    packageName,
    generatedFiles: files,
    bundleFiles,
  });
  const verificationReport = verifyExportBundle({
    files: bundleFiles,
    generatedFiles: files,
    qualityReport,
  });

  return {
    appTitle,
    packageName,
    files: [
      ...bundleFiles.filter((file) => file.path !== "squid-manifest.json"),
      {
        path: "squid-manifest.json",
        content: JSON.stringify(manifest, null, 2),
      },
      {
        path: "squid-verification-report.json",
        content: JSON.stringify(verificationReport, null, 2),
      },
    ],
    manifest,
    qualityReport,
    verificationReport,
  };
}

function assembleExportFiles({
  files,
  appTitle,
  packageName,
  qualityReport,
}: {
  files: GeneratedFile[];
  appTitle: string;
  packageName: string;
  qualityReport: GeneratedFilesQualityReport;
}) {
  const bundleFiles = new Map<string, string>();
  const apiIntegration = analyzeGeneratedApiIntegration(files);

  for (const file of files) {
    bundleFiles.set(file.path, file.code);
  }

  const requiredShadcnFiles = getRequiredShadcnFiles(files);
  for (const [path, content] of Object.entries(requiredShadcnFiles)) {
    if (path === "/public/index.html") continue;

    const exportPath = path.replace(/^\//, "");
    if (!bundleFiles.has(exportPath)) {
      bundleFiles.set(exportPath, content);
    }
  }

  if (!bundleFiles.has("main.tsx")) {
    bundleFiles.set(
      "main.tsx",
      [
        'import React from "react";',
        'import { createRoot } from "react-dom/client";',
        'import App from "./App";',
        'import "./styles.css";',
        "",
        'createRoot(document.getElementById("root")!).render(',
        "  <React.StrictMode>",
        "    <App />",
        "  </React.StrictMode>,",
        ");",
      ].join("\n"),
    );
  }

  if (!bundleFiles.has("styles.css")) {
    bundleFiles.set("styles.css", buildDefaultStyles());
  }

  bundleFiles.set("index.html", buildIndexHtml(appTitle));
  bundleFiles.set(
    "package.json",
    buildPackageJson(
      packageName,
      Array.from(bundleFiles.values(), (code) => ({ code })),
    ),
  );
  bundleFiles.set("README.md", buildReadme(appTitle, apiIntegration));
  bundleFiles.set(
    ".env.example",
    buildEnvExample(apiIntegration.environmentVariables),
  );
  bundleFiles.set(
    "squid-integrations.json",
    JSON.stringify(apiIntegration, null, 2),
  );
  bundleFiles.set(
    "squid-quality-report.json",
    JSON.stringify(qualityReport, null, 2),
  );
  bundleFiles.set("tsconfig.json", buildTsConfig());
  bundleFiles.set("vite.config.ts", buildViteConfig());
  bundleFiles.set("tailwind.config.ts", buildTailwindConfig());
  bundleFiles.set("postcss.config.js", buildPostcssConfig());
  bundleFiles.set(
    "vercel.json",
    JSON.stringify(
      { rewrites: [{ source: "/(.*)", destination: "/" }] },
      null,
      2,
    ),
  );
  bundleFiles.set("netlify.toml", buildNetlifyConfig());
  bundleFiles.set("wrangler.toml", buildWranglerConfig(packageName));

  return Array.from(bundleFiles.entries()).map(([path, content]) => ({
    path,
    content,
  }));
}

function buildManifest({
  appTitle,
  packageName,
  generatedFiles,
  bundleFiles,
}: {
  appTitle: string;
  packageName: string;
  generatedFiles: GeneratedFile[];
  bundleFiles: ExportBundleFile[];
}): ExportBundleManifest {
  const generatedPaths = new Set(generatedFiles.map((file) => file.path));

  return {
    appTitle,
    packageName,
    exportedAt: new Date().toISOString(),
    source: "Squid",
    files: bundleFiles.map((file) => ({
      path: file.path,
      language: generatedFiles.find((generated) => generated.path === file.path)
        ?.language,
      bytes: byteLength(file.content),
      generated: generatedPaths.has(file.path),
    })),
  };
}

function verifyExportBundle({
  files,
  generatedFiles,
  qualityReport,
}: {
  files: ExportBundleFile[];
  generatedFiles: GeneratedFile[];
  qualityReport: GeneratedFilesQualityReport;
}): ExportVerificationReport {
  const pathSet = new Set(files.map((file) => file.path));
  const packageJson = files.find((file) => file.path === "package.json");
  const packageJsonParsed = parsePackageJson(packageJson?.content);
  const checks: ExportVerificationCheck[] = [
    {
      name: "Generated files",
      status: generatedFiles.length > 0 ? "passed" : "failed",
      message:
        generatedFiles.length > 0
          ? `${generatedFiles.length} generated files included.`
          : "No generated files were found.",
    },
    {
      name: "Entry point",
      status:
        pathSet.has("App.tsx") && pathSet.has("main.tsx") ? "passed" : "failed",
      message:
        pathSet.has("App.tsx") && pathSet.has("main.tsx")
          ? "App.tsx and main.tsx are present."
          : "The bundle needs App.tsx and main.tsx.",
    },
    {
      name: "Package scripts",
      status:
        packageJsonParsed?.scripts?.build && packageJsonParsed?.scripts?.dev
          ? "passed"
          : "failed",
      message:
        packageJsonParsed?.scripts?.build && packageJsonParsed?.scripts?.dev
          ? "dev and build scripts are configured."
          : "package.json is missing dev or build scripts.",
    },
    {
      name: "Deploy configs",
      status:
        pathSet.has("vercel.json") &&
        pathSet.has("netlify.toml") &&
        pathSet.has("wrangler.toml")
          ? "passed"
          : "warning",
      message: "Starter configs are included for Vercel, Netlify, and Workers.",
    },
    {
      name: "Generated diagnostics",
      status:
        qualityReport.status === "passed"
          ? "passed"
          : qualityReport.diagnostics.length > 0
            ? "failed"
            : "warning",
      message:
        qualityReport.status === "passed"
          ? "Generated-file validation passed."
          : `${qualityReport.diagnostics.length} diagnostics and ${qualityReport.accessibilityWarnings.length} accessibility warnings found.`,
    },
    {
      name: "API integration",
      status:
        qualityReport.apiIntegration.status === "blocked"
          ? "failed"
          : qualityReport.apiIntegration.status === "setup_required"
            ? "warning"
            : "passed",
      message:
        qualityReport.apiIntegration.status === "verified"
          ? "API integration verified by static safety checks."
          : qualityReport.apiIntegration.status === "setup_required"
            ? "API setup is required; see README.md and .env.example."
            : qualityReport.apiIntegration.status === "blocked"
              ? "Unsafe or incomplete client API code was detected."
              : "No client API integration detected.",
    },
  ];
  const hasFailed = checks.some((check) => check.status === "failed");
  const hasWarning = checks.some((check) => check.status === "warning");

  return {
    generatedFiles: qualityReport,
    checks,
    status: hasFailed ? "failed" : hasWarning ? "warning" : "verified",
  };
}

function parsePackageJson(content: string | undefined) {
  if (!content) return null;

  try {
    return JSON.parse(content) as {
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
    };
  } catch {
    return null;
  }
}

function byteLength(content: string) {
  return new TextEncoder().encode(content).length;
}

function buildPackageJson(packageName: string, files: Array<{ code: string }>) {
  return JSON.stringify(
    {
      name: packageName,
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: {
        dev: "vite --host 0.0.0.0",
        build: "tsc --noEmit && vite build",
        preview: "vite preview",
        typecheck: "tsc --noEmit",
      },
      dependencies: inferPackageDependencies(files),
      devDependencies: {
        "@types/node": "^20.19.0",
        "@types/react": "^19.1.0",
        "@types/react-dom": "^19.1.0",
        "@vitejs/plugin-react": "6.0.3",
        autoprefixer: "10.4.27",
        postcss: "8.5.16",
        tailwindcss: "3.4.17",
        "tailwindcss-animate": "1.0.7",
        typescript: "5.9.2",
        vite: "8.1.3",
      },
    },
    null,
    2,
  );
}

function buildReadme(
  appTitle: string,
  apiIntegration: ReturnType<typeof analyzeGeneratedApiIntegration>,
) {
  const apiSetup =
    apiIntegration.status === "not_detected"
      ? ["No browser API integration was detected in the generated source."]
      : [
          apiIntegration.status === "setup_required"
            ? "API setup required."
            : apiIntegration.status === "blocked"
              ? "API integration blocked by Squid's static safety checks."
              : "API integration verified by Squid's static safety checks.",
          ...(apiIntegration.endpoints.length
            ? [
                "",
                "Detected API endpoints / attribution:",
                ...apiIntegration.endpoints.map((endpoint) => `- ${endpoint}`),
              ]
            : []),
          ...(apiIntegration.environmentVariables.length
            ? [
                "",
                "Copy `.env.example` to `.env.local` and fill only publishable browser values:",
                ...apiIntegration.environmentVariables.map(
                  (variable) => `- \`${variable}\``,
                ),
              ]
            : []),
          "",
          "Review `integrations.ts` (when generated) and `squid-integrations.json` for provider setup. Confirm the provider's official CORS, attribution, rate-limit, and credential rules before production deployment.",
        ];

  return [
    `# ${appTitle}`,
    "",
    "Generated by Squid.",
    "",
    "## Run locally",
    "",
    "```bash",
    "pnpm install",
    "pnpm dev",
    "```",
    "",
    "## API integrations",
    "",
    ...apiSetup,
    "",
    "## Included artifacts",
    "",
    "- `squid-manifest.json`: generated file manifest and export metadata.",
    "- `squid-quality-report.json`: import, file, and accessibility diagnostics.",
    "- `squid-verification-report.json`: export readiness checks.",
    "- `squid-integrations.json`: detected endpoints, environment variables, and API safety status.",
    "- `.env.example`: publishable browser configuration template. Never put server secrets in VITE_* variables.",
    "- `vercel.json`, `netlify.toml`, and `wrangler.toml`: starter deploy config.",
    "",
    "The verification report is a smoke check, not a substitute for a full production review.",
  ].join("\n");
}

function buildEnvExample(environmentVariables: string[]) {
  return [
    "# Browser-visible values only. Never place secrets, private keys, or privileged tokens here.",
    ...(environmentVariables.length
      ? environmentVariables.map((variable) => `${variable}=`)
      : ["# No publishable API configuration detected."]),
    "",
  ].join("\n");
}

function buildIndexHtml(appTitle: string) {
  return [
    "<!doctype html>",
    '<html lang="en">',
    "  <head>",
    '    <meta charset="UTF-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `    <title>${appTitle}</title>`,
    "  </head>",
    "  <body>",
    '    <div id="root"></div>',
    '    <script type="module" src="/main.tsx"></script>',
    "  </body>",
    "</html>",
  ].join("\n");
}

function buildDefaultStyles() {
  return [
    "@tailwind base;",
    "@tailwind components;",
    "@tailwind utilities;",
    "",
    ":root {",
    "  --background: 0 0% 100%;",
    "  --foreground: 222.2 84% 4.9%;",
    "  --card: 0 0% 100%;",
    "  --card-foreground: 222.2 84% 4.9%;",
    "  --popover: 0 0% 100%;",
    "  --popover-foreground: 222.2 84% 4.9%;",
    "  --primary: 221.2 83.2% 53.3%;",
    "  --primary-foreground: 210 40% 98%;",
    "  --secondary: 210 40% 96.1%;",
    "  --secondary-foreground: 222.2 47.4% 11.2%;",
    "  --muted: 210 40% 96.1%;",
    "  --muted-foreground: 215.4 16.3% 46.9%;",
    "  --accent: 210 40% 96.1%;",
    "  --accent-foreground: 222.2 47.4% 11.2%;",
    "  --destructive: 0 84.2% 60.2%;",
    "  --destructive-foreground: 210 40% 98%;",
    "  --border: 214.3 31.8% 91.4%;",
    "  --input: 214.3 31.8% 91.4%;",
    "  --ring: 221.2 83.2% 53.3%;",
    "  --radius: 0.5rem;",
    "}",
    "",
    "* {",
    "  border-color: hsl(var(--border));",
    "}",
    "",
    "body {",
    "  margin: 0;",
    "  min-width: 320px;",
    "  min-height: 100vh;",
    "}",
  ].join("\n");
}

function buildTsConfig() {
  return JSON.stringify(
    {
      compilerOptions: {
        target: "ES2020",
        useDefineForClassFields: true,
        lib: ["DOM", "DOM.Iterable", "ES2020"],
        allowJs: false,
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        module: "ESNext",
        moduleResolution: "Bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react-jsx",
        baseUrl: ".",
        paths: {
          "@/*": ["./*"],
        },
      },
      include: ["**/*.ts", "**/*.tsx"],
    },
    null,
    2,
  );
}

function buildViteConfig() {
  return [
    'import { defineConfig } from "vite";',
    'import react from "@vitejs/plugin-react";',
    'import path from "node:path";',
    "",
    "export default defineConfig({",
    "  plugins: [react()],",
    "  resolve: {",
    '    alias: { "@": path.resolve(__dirname, ".") },',
    "  },",
    "});",
  ].join("\n");
}

function buildTailwindConfig() {
  return [
    'import type { Config } from "tailwindcss";',
    "",
    "export default {",
    "  content: [",
    '    "./index.html",',
    '    "./{App,main}.tsx",',
    '    "./components/**/*.{ts,tsx}",',
    '    "./features/**/*.{ts,tsx}",',
    '    "./hooks/**/*.{ts,tsx}",',
    '    "./lib/**/*.{ts,tsx}",',
    '    "./pages/**/*.{ts,tsx}",',
    '    "./utils/**/*.{ts,tsx}",',
    '    "./views/**/*.{ts,tsx}",',
    "  ],",
    "  theme: {",
    "    extend: {",
    "      colors: {",
    '        border: "hsl(var(--border))",',
    '        input: "hsl(var(--input))",',
    '        ring: "hsl(var(--ring))",',
    '        background: "hsl(var(--background))",',
    '        foreground: "hsl(var(--foreground))",',
    "        primary: {",
    '          DEFAULT: "hsl(var(--primary))",',
    '          foreground: "hsl(var(--primary-foreground))",',
    "        },",
    "        secondary: {",
    '          DEFAULT: "hsl(var(--secondary))",',
    '          foreground: "hsl(var(--secondary-foreground))",',
    "        },",
    "        destructive: {",
    '          DEFAULT: "hsl(var(--destructive))",',
    '          foreground: "hsl(var(--destructive-foreground))",',
    "        },",
    "        muted: {",
    '          DEFAULT: "hsl(var(--muted))",',
    '          foreground: "hsl(var(--muted-foreground))",',
    "        },",
    "        accent: {",
    '          DEFAULT: "hsl(var(--accent))",',
    '          foreground: "hsl(var(--accent-foreground))",',
    "        },",
    "        popover: {",
    '          DEFAULT: "hsl(var(--popover))",',
    '          foreground: "hsl(var(--popover-foreground))",',
    "        },",
    "        card: {",
    '          DEFAULT: "hsl(var(--card))",',
    '          foreground: "hsl(var(--card-foreground))",',
    "        },",
    "      },",
    "      borderRadius: {",
    '        lg: "var(--radius)",',
    '        md: "calc(var(--radius) - 2px)",',
    '        sm: "calc(var(--radius) - 4px)",',
    "      },",
    "    },",
    "  },",
    '  plugins: [require("tailwindcss-animate")],',
    "} satisfies Config;",
  ].join("\n");
}

function buildPostcssConfig() {
  return [
    "export default {",
    "  plugins: {",
    "    tailwindcss: {},",
    "    autoprefixer: {},",
    "  },",
    "};",
  ].join("\n");
}

function buildNetlifyConfig() {
  return [
    "[build]",
    '  command = "pnpm build"',
    '  publish = "dist"',
    "",
    "[[redirects]]",
    '  from = "/*"',
    '  to = "/index.html"',
    "  status = 200",
  ].join("\n");
}

function buildWranglerConfig(packageName: string) {
  return [`name = "${packageName}"`, 'pages_build_output_dir = "dist"'].join(
    "\n",
  );
}
