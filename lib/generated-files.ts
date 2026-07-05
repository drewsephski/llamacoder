import { getExtensionForLanguage, getLanguageOfFile } from "@/lib/utils";

export type RawGeneratedFile = {
  path: string;
  code?: string;
  content?: string;
  language?: string;
  fullMatch?: string;
};

export type GeneratedFile = {
  path: string;
  code: string;
  language: string;
  fullMatch?: string;
};

export type GeneratedFileDiagnostic = {
  path?: string;
  message: string;
};

const PROTECTED_MODULE_PATHS = new Set([
  "components/ui/accordion",
  "components/ui/alert",
  "components/ui/alert-dialog",
  "components/ui/avatar",
  "components/ui/badge",
  "components/ui/breadcrumb",
  "components/ui/button",
  "components/ui/calendar",
  "components/ui/card",
  "components/ui/carousel",
  "components/ui/checkbox",
  "components/ui/collapsible",
  "components/ui/dialog",
  "components/ui/drawer",
  "components/ui/dropdown-menu",
  "components/ui/input",
  "components/ui/label",
  "components/ui/menubar",
  "components/ui/navigation-menu",
  "components/ui/pagination",
  "components/ui/popover",
  "components/ui/progress",
  "components/ui/radio-group",
  "components/ui/scroll-area",
  "components/ui/select",
  "components/ui/separator",
  "components/ui/skeleton",
  "components/ui/slider",
  "components/ui/switch",
  "components/ui/table",
  "components/ui/tabs",
  "components/ui/textarea",
  "components/ui/toast",
  "components/ui/toaster",
  "components/ui/toggle",
  "components/ui/toggle-group",
  "components/ui/tooltip",
  "components/ui/use-toast",
  "components/ui/index",
  "lib/utils",
]);

const IMPORT_SOURCE_REGEX =
  /\b(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;

function stripExtension(path: string) {
  return path.replace(/\.(tsx|ts|jsx|js|json|css)$/i, "");
}

function normalizeModulePath(modulePath: string) {
  return collapsePathSegments(
    modulePath
      .replace(/^@\//, "")
      .replace(/^\//, "")
      .replace(/^\.\//, "")
      .replace(/\\/g, "/")
      .replace(/\/+/g, "/")
      .replace(/^src\//, "")
      .replace(/^app\//, ""),
  );
}

function collapsePathSegments(path: string) {
  const segments: string[] = [];

  for (const segment of path.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      segments.pop();
      continue;
    }
    segments.push(segment);
  }

  return segments.join("/");
}

export function normalizeGeneratedPath(path: string) {
  const normalized = path
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\//, "")
    .replace(/^\.\//, "")
    .replace(/^src\//, "");

  if (!normalized || normalized.includes("..")) return null;

  if (/^app\.tsx$/i.test(normalized)) return "App.tsx";

  const normalizedWithoutExtension = stripExtension(normalized);
  if (PROTECTED_MODULE_PATHS.has(normalizedWithoutExtension)) return null;

  return normalized;
}

export function normalizeGeneratedFiles(files: RawGeneratedFile[]) {
  const byPath = new Map<string, GeneratedFile>();

  for (const file of files) {
    const path = normalizeGeneratedPath(file.path);
    if (!path) continue;

    const code = file.code ?? file.content ?? "";
    if (!code.trim()) continue;

    byPath.set(path, {
      path,
      code: normalizeCommonCodegenMistakes(code),
      language: normalizeFenceLanguage(file.language, path),
      fullMatch: file.fullMatch,
    });
  }

  return Array.from(byPath.values()).map((file) => ({
    ...file,
    code: rewriteResolvableAliasImports(file, byPath),
  }));
}

export function validateGeneratedFiles(files: GeneratedFile[]) {
  const diagnostics: GeneratedFileDiagnostic[] = [];
  const appFile = files.find((file) => file.path === "App.tsx");
  const runnableFiles = files.filter((file) =>
    /\.(tsx|ts|jsx|js)$/i.test(file.path),
  );

  if (!appFile) {
    diagnostics.push({
      message: "Missing App.tsx entry file.",
    });
  }

  if (runnableFiles.length < 3) {
    diagnostics.push({
      message: "Generated app should contain at least 3 source files.",
    });
  }

  for (const file of files) {
    for (const source of extractImportSources(file.code)) {
      if (!isInternalGeneratedImport(source)) continue;

      const normalizedSource = normalizeModulePath(source);
      if (PROTECTED_MODULE_PATHS.has(stripExtension(normalizedSource)))
        continue;

      if (!resolveGeneratedImport(file.path, source, files)) {
        diagnostics.push({
          path: file.path,
          message: `Unresolved internal import "${source}". Generate the imported file or remove the import.`,
        });
      }
    }
  }

  return diagnostics;
}

export function formatGeneratedFilesMarkdown(files: GeneratedFile[]) {
  return files
    .map(
      (file) =>
        `\`\`\`${file.language || getFenceLanguage(file.path)}{path=${file.path}}\n${file.code}\n\`\`\``,
    )
    .join("\n\n");
}

export function buildGeneratedFilesRepairPrompt(
  originalResponse: string,
  files: GeneratedFile[],
  diagnostics: GeneratedFileDiagnostic[],
) {
  const fileList = files.map((file) => `- ${file.path}`).join("\n") || "- none";
  const diagnosticList = diagnostics
    .map((diagnostic) =>
      diagnostic.path
        ? `- ${diagnostic.path}: ${diagnostic.message}`
        : `- ${diagnostic.message}`,
    )
    .join("\n");

  return `Your previous response produced an incomplete or unrunnable generated app.

Diagnostics:
${diagnosticList}

Files found:
${fileList}

Rewrite the app as a complete, runnable multi-file React + TypeScript application.
Requirements:
- Output only complete files in fenced code blocks using \`\`\`tsx{path=App.tsx} format.
- Include App.tsx plus at least two supporting source files.
- Every relative or @/ internal import must resolve to a file you output, except installed shadcn imports under "@/components/ui/*" and "@/lib/utils".
- Do not import custom hooks/utilities unless you also output their files.
- Use \`import { motion } from "framer-motion"\` for Framer Motion.

Original response:
${originalResponse}`;
}

function getFenceLanguage(path: string) {
  const extension = path.split(".").pop()?.toLowerCase();
  if (extension === "tsx" || extension === "jsx") return extension;
  if (extension === "ts") return "ts";
  if (extension === "css") return "css";
  if (extension === "json") return "json";
  return getExtensionForLanguage(getLanguageOfFile(path));
}

function normalizeFenceLanguage(language: string | undefined, path: string) {
  const extension = path.split(".").pop()?.toLowerCase();

  if (extension === "tsx" || extension === "ts") return extension;
  if (extension === "jsx" || extension === "js") return extension;
  if (extension === "css" || extension === "json") return extension;

  if (!language || language === "text") return getFenceLanguage(path);
  if (language === "typescript") return "ts";
  if (language === "javascript") return "js";
  return language;
}

function extractImportSources(code: string) {
  const sources = new Set<string>();
  let match: RegExpExecArray | null;

  IMPORT_SOURCE_REGEX.lastIndex = 0;

  while ((match = IMPORT_SOURCE_REGEX.exec(code)) !== null) {
    sources.add(match[1]);
  }

  return Array.from(sources);
}

function isInternalGeneratedImport(source: string) {
  return (
    source.startsWith("@/") ||
    source.startsWith("/") ||
    source.startsWith("./") ||
    source.startsWith("../")
  );
}

function resolveGeneratedImport(
  fromPath: string,
  source: string,
  files: Iterable<GeneratedFile>,
) {
  const candidates = getImportCandidates(fromPath, source);
  const normalizedFilePaths = new Set(
    Array.from(files, (file) => stripExtension(file.path)),
  );

  return candidates.some((candidate) => normalizedFilePaths.has(candidate));
}

function rewriteResolvableAliasImports(
  file: GeneratedFile,
  filesByPath: Map<string, GeneratedFile>,
) {
  return file.code.replace(
    /(["'])(@\/(?:components|lib|utils|types)\/[^"']+)\1/g,
    (fullMatch, quote: string, source: string) => {
      const normalizedSource = normalizeModulePath(source);
      if (PROTECTED_MODULE_PATHS.has(stripExtension(normalizedSource))) {
        return fullMatch;
      }

      const target = resolveGeneratedImportPath(file.path, source, filesByPath);
      if (!target) return fullMatch;

      return `${quote}${getRelativeImportPath(file.path, target)}${quote}`;
    },
  );
}

function resolveGeneratedImportPath(
  fromPath: string,
  source: string,
  filesByPath: Map<string, GeneratedFile>,
) {
  const candidates = getImportCandidates(fromPath, source);

  for (const [path] of filesByPath) {
    if (candidates.includes(stripExtension(path))) return path;
  }

  return null;
}

function getImportCandidates(fromPath: string, source: string) {
  const fromDirectory = fromPath.includes("/")
    ? fromPath.slice(0, fromPath.lastIndexOf("/"))
    : "";

  const base =
    source.startsWith("./") || source.startsWith("../")
      ? normalizeModulePath(`${fromDirectory}/${source}`)
      : normalizeModulePath(source);

  const stripped = stripExtension(base);
  return [stripped, `${stripped}/index`];
}

function getRelativeImportPath(fromPath: string, toPath: string) {
  const fromParts = fromPath.split("/").slice(0, -1);
  const toParts = stripExtension(toPath).split("/");

  while (fromParts.length && toParts.length && fromParts[0] === toParts[0]) {
    fromParts.shift();
    toParts.shift();
  }

  const up = fromParts.map(() => "..");
  const relative = [...up, ...toParts].join("/") || ".";
  return relative.startsWith(".") ? relative : `./${relative}`;
}

function normalizeCommonCodegenMistakes(code: string) {
  return code
    .replace(
      /import\s*{\s*Motion\s*}\s*from\s*["']framer-motion["'];?/g,
      'import { motion } from "framer-motion";',
    )
    .replace(/<Motion(\s|>)/g, "<motion.div$1")
    .replace(/<\/Motion>/g, "</motion.div>");
}
