import {
  sourceAuditReportSchema,
  type AuditableSourceFile,
  type SourceAuditReport,
} from "@/features/source-audit/contracts";

const SOURCE_FILE_PATTERN = /\.(?:[cm]?[jt]sx?|css|scss)$/i;
const ENTRYPOINTS = [
  "App.tsx",
  "src/App.tsx",
  "src/main.tsx",
  "app/page.tsx",
  "pages/index.tsx",
  "index.html",
];
const LOCKFILES = [
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
];
const SECRET_ASSIGNMENT_PATTERN =
  /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|secret|password|private[_-]?key|service[_-]?role)\b\s*[:=]\s*["'`]([^"'`\s]{12,})["'`]/gi;
const ENV_REFERENCE_PATTERN =
  /\b(?:process\.env\.|import\.meta\.env\.)([A-Z][A-Z0-9_]*)\b/g;
const PLATFORM_COUPLING_PATTERNS = [
  { label: "Lovable", pattern: /\blovable-tagger\b/i },
  { label: "Replit", pattern: /from\s+["']@replit\//i },
  { label: "Base44", pattern: /from\s+["']@base44\//i },
];

export function analyzeSourceBundle({
  files,
  source,
  auditedAt = new Date(),
}: {
  files: AuditableSourceFile[];
  source: SourceAuditReport["source"];
  auditedAt?: Date;
}): SourceAuditReport {
  const rootPrefix = findSharedRoot(files.map((file) => file.path));
  const normalizedFiles = files.map((file) => ({
    ...file,
    path: rootPrefix ? file.path.slice(rootPrefix.length) : file.path,
  }));
  const byPath = new Map(normalizedFiles.map((file) => [file.path, file]));
  const packageFile = byPath.get("package.json");
  const packageJson = parsePackageJson(packageFile?.content);
  const dependencies = {
    ...(packageJson?.dependencies ?? {}),
    ...(packageJson?.devDependencies ?? {}),
  };
  const sourceFiles = normalizedFiles.filter((file) =>
    SOURCE_FILE_PATTERN.test(file.path),
  );
  const entrypoints = ENTRYPOINTS.filter((path) => byPath.has(path));
  const lockfiles = LOCKFILES.filter((path) => byPath.has(path));
  const envReferences = unique(
    sourceFiles.flatMap((file) =>
      collectMatches(file.content, ENV_REFERENCE_PATTERN),
    ),
  );
  const secretFilePaths = sourceFiles
    .filter((file) => {
      SECRET_ASSIGNMENT_PATTERN.lastIndex = 0;
      return SECRET_ASSIGNMENT_PATTERN.test(file.content);
    })
    .map((file) => file.path);
  const coupledPlatforms = PLATFORM_COUPLING_PATTERNS.filter(({ pattern }) =>
    normalizedFiles.some((file) => pattern.test(file.content)),
  ).map(({ label }) => label);
  const buildScript = packageJson?.scripts?.build;
  const findings: SourceAuditReport["findings"] = [
    {
      id: "project_structure",
      label: "Project structure",
      status:
        packageJson && entrypoints.length > 0
          ? "passed"
          : sourceFiles.length > 0
            ? "review"
            : "failed",
      summary:
        packageJson && entrypoints.length > 0
          ? "A package manifest and recognizable application entry point are present."
          : sourceFiles.length > 0
            ? "Source files were found, but the project structure needs review."
            : "No recognizable application source was found.",
      details: [
        packageJson
          ? "package.json parsed successfully"
          : "package.json missing or invalid",
        entrypoints.length > 0
          ? `Entry points: ${entrypoints.join(", ")}`
          : "No common React or web entry point found",
      ],
    },
    {
      id: "reproducible_build",
      label: "Reproducible build",
      status: buildScript && lockfiles.length > 0 ? "passed" : "review",
      summary:
        buildScript && lockfiles.length > 0
          ? "The archive declares a build command and locks dependency versions."
          : "The handoff is missing a build script or dependency lockfile.",
      details: [
        buildScript ? "Build script declared" : "No build script declared",
        lockfiles.length > 0
          ? `Lockfile: ${lockfiles[0]}`
          : "No supported lockfile found",
      ],
    },
    {
      id: "secret_exposure",
      label: "Client secret exposure",
      status: secretFilePaths.length > 0 ? "failed" : "passed",
      summary:
        secretFilePaths.length > 0
          ? "Possible hardcoded credentials were detected. Values are intentionally not returned."
          : "No obvious hardcoded credential assignment was detected in inspected source files.",
      details:
        secretFilePaths.length > 0
          ? secretFilePaths.slice(0, 5).map((path) => `Review ${path}`)
          : [
              "Pattern-based static scan only; rotate any credential you suspect was exposed.",
            ],
    },
    {
      id: "environment_setup",
      label: "Environment setup",
      status:
        envReferences.length === 0 || byPath.has(".env.example")
          ? "passed"
          : "review",
      summary:
        envReferences.length === 0
          ? "No public runtime environment references were found."
          : byPath.has(".env.example")
            ? "Runtime environment requirements have an example file."
            : "Environment values are referenced without a checked-in .env.example.",
      details: [
        `${envReferences.length} unique environment references`,
        byPath.has(".env.example")
          ? ".env.example included"
          : ".env.example not found",
      ],
    },
    {
      id: "platform_portability",
      label: "Platform portability",
      status: coupledPlatforms.length > 0 ? "review" : "passed",
      summary:
        coupledPlatforms.length > 0
          ? "Platform-specific imports or build helpers need review before migration."
          : "No recognized app-builder runtime dependency was found in inspected source.",
      details:
        coupledPlatforms.length > 0
          ? coupledPlatforms.map((platform) => `${platform} coupling detected`)
          : ["This does not prove deployment compatibility on every host."],
    },
  ];
  const overallStatus = findings.some((finding) => finding.status === "failed")
    ? "failed"
    : findings.some((finding) => finding.status === "review")
      ? "review"
      : "passed";

  return sourceAuditReportSchema.parse({
    schema: "squid.source-audit.v1",
    auditedAt: auditedAt.toISOString(),
    source,
    overallStatus,
    framework: detectFramework(dependencies),
    inventory: {
      filesInspected: normalizedFiles.length,
      sourceFiles: sourceFiles.length,
      totalBytes: normalizedFiles.reduce((sum, file) => sum + file.bytes, 0),
    },
    findings,
    scope: [
      "Static archive inspection only; Squid did not install dependencies or execute the project.",
      "The scan does not access deployment settings, provider dashboards, databases, or production traffic.",
      "Possible credential values are never included in the report.",
    ],
  });
}

function parsePackageJson(value: string | undefined) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as {
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
  } catch {
    return null;
  }
}

function detectFramework(dependencies: Record<string, string>) {
  if (dependencies.next) return "Next.js";
  if (dependencies["@remix-run/react"]) return "Remix";
  if (dependencies["@vitejs/plugin-react"] || dependencies.vite) {
    return dependencies.react ? "React + Vite" : "Vite";
  }
  if (dependencies.react) return "React";
  if (dependencies.vue) return "Vue";
  if (dependencies.svelte) return "Svelte";
  return "Unknown web stack";
}

function findSharedRoot(paths: string[]) {
  const firstSegments = unique(
    paths.map((path) => path.split("/")[0]).filter(Boolean),
  );
  return firstSegments.length === 1 && paths.some((path) => path.includes("/"))
    ? `${firstSegments[0]}/`
    : "";
}

function collectMatches(value: string, pattern: RegExp) {
  const matches: string[] = [];
  pattern.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(value)) !== null) {
    if (match[1]) matches.push(match[1]);
  }
  return matches;
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}
