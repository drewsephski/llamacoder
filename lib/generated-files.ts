import { getExtensionForLanguage, getLanguageOfFile } from "@/lib/utils";
import { generatedAppRepairCapabilityRules } from "@/lib/generated-app-capabilities";
import {
  analyzeGeneratedApiIntegration,
  type GeneratedApiIntegrationReport,
  validateSelectedApiUsage,
} from "@/lib/generated-api";

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

export type GeneratedFilesQualityReport = {
  generatedAt: string;
  filesGenerated: number;
  sourceFiles: number;
  importsResolved: number;
  unresolvedImports: GeneratedFileDiagnostic[];
  protectedPathsBlocked: number;
  accessibilityWarnings: GeneratedFileDiagnostic[];
  diagnostics: GeneratedFileDiagnostic[];
  apiIntegration: GeneratedApiIntegrationReport;
  status: "passed" | "warning";
};

export type GeneratedFilesStats = {
  protectedPathsBlocked: number;
};

export function parseStoredGeneratedFiles(value: unknown): RawGeneratedFile[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (file): file is RawGeneratedFile =>
      !!file &&
      typeof file === "object" &&
      typeof file.path === "string" &&
      (typeof file.code === "string" || typeof file.content === "string"),
  );
}

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
  "components/ui/form",
  "components/ui/hover-card",
  "components/ui/input",
  "components/ui/label",
  "components/ui/menubar",
  "components/ui/navigation-menu",
  "components/ui/pagination",
  "components/ui/popover",
  "components/ui/progress",
  "components/ui/radio-group",
  "components/ui/resizable",
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
const IMPORT_DECLARATION_REGEX =
  /\bimport\s+(type\s+)?([\s\S]*?)\s+from\s+["']([^"']+)["'];?/g;

type ImportDeclaration = {
  source: string;
  defaultImport?: string;
  namedImports: { imported: string; local: string }[];
};

type ModuleExportSignature = {
  hasDefault: boolean;
  defaultName?: string;
  namedExports: Set<string>;
};

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
    .replace(/^@\//, "")
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
  let protectedPathsBlocked = 0;

  for (const file of files) {
    const path = normalizeGeneratedPath(file.path);
    if (!path) {
      protectedPathsBlocked += 1;
      continue;
    }

    const code = file.code ?? file.content ?? "";
    if (!code.trim()) continue;

    byPath.set(path, {
      path,
      code: normalizeCommonCodegenMistakes(code),
      language: normalizeFenceLanguage(file.language, path),
      fullMatch: file.fullMatch,
    });
  }

  const normalizedFiles = Array.from(byPath.values()).map((file) => ({
    ...file,
    code: rewriteResolvableAliasImports(file, byPath),
  }));

  attachGeneratedFilesStats(normalizedFiles, { protectedPathsBlocked });

  return normalizedFiles;
}

export function attachGeneratedFilesStats<T extends GeneratedFile[]>(
  files: T,
  stats: GeneratedFilesStats,
) {
  Object.defineProperty(files, "protectedPathsBlocked", {
    value: stats.protectedPathsBlocked,
    enumerable: false,
    configurable: true,
  });

  return files;
}

export function readGeneratedFilesStats(files: GeneratedFile[]) {
  return {
    protectedPathsBlocked:
      typeof (files as unknown as { protectedPathsBlocked?: unknown })
        .protectedPathsBlocked === "number"
        ? (files as unknown as { protectedPathsBlocked: number })
            .protectedPathsBlocked
        : 0,
  };
}

export function validateGeneratedFiles(
  files: GeneratedFile[],
  selectedProviderIds: string[] = [],
) {
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

    for (const importDeclaration of extractImportDeclarations(file.code)) {
      const { source } = importDeclaration;
      if (!isInternalGeneratedImport(source)) continue;

      const normalizedSource = normalizeModulePath(source);
      if (PROTECTED_MODULE_PATHS.has(stripExtension(normalizedSource)))
        continue;

      const targetFile = resolveGeneratedImportFile(file.path, source, files);
      if (!targetFile) continue;

      diagnostics.push(
        ...validateImportBindings(file.path, importDeclaration, targetFile),
      );
    }
  }

  diagnostics.push(...validateObviousInteractionFailures(files));
  diagnostics.push(...validateThemeBehavior(files));
  diagnostics.push(...analyzeGeneratedApiIntegration(files).issues);
  diagnostics.push(...validateSelectedApiUsage(files, selectedProviderIds));

  return diagnostics;
}

export function formatGeneratedFileDiagnostics(
  diagnostics: GeneratedFileDiagnostic[],
) {
  return [
    "Generated app validation failed. Repair every issue before returning the changed files:",
    ...diagnostics.map(
      (diagnostic) =>
        `- ${diagnostic.path ? `${diagnostic.path}: ` : ""}${diagnostic.message}`,
    ),
  ].join("\n");
}

export function buildGeneratedFilesQualityReport(
  files: GeneratedFile[],
): GeneratedFilesQualityReport {
  const diagnostics = validateGeneratedFiles(files);
  const unresolvedImports = diagnostics.filter((diagnostic) =>
    diagnostic.message.startsWith("Unresolved internal import"),
  );
  const accessibilityWarnings = validateBasicAccessibility(files);
  const importsResolved = countResolvedInternalImports(files);
  const { protectedPathsBlocked } = readGeneratedFilesStats(files);
  const sourceFiles = files.filter((file) =>
    /\.(tsx|ts|jsx|js)$/i.test(file.path),
  ).length;
  const warningCount = diagnostics.length + accessibilityWarnings.length;
  const apiIntegration = analyzeGeneratedApiIntegration(files);

  return {
    generatedAt: new Date().toISOString(),
    filesGenerated: files.length,
    sourceFiles,
    importsResolved,
    unresolvedImports,
    protectedPathsBlocked,
    accessibilityWarnings,
    diagnostics,
    apiIntegration,
    status: warningCount === 0 ? "passed" : "warning",
  };
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
- Every import style must match the target file's exports: named imports require named exports, and default imports require default exports.
- If a file exports \`export default function Footer()\`, import it as \`import Footer from "./components/Footer"\`; if it exports \`export function Footer()\`, import it as \`import { Footer } from "./components/Footer"\`.
- Do not import custom hooks/utilities unless you also output their files.
- If you call \`cn(...)\`, import it with \`import { cn } from "@/lib/utils"\`.
- Use \`import { motion } from "framer-motion"\` for Framer Motion.
${generatedAppRepairCapabilityRules}
- Replace empty event handlers with a real visible state change. Remove controls that still have no defined outcome.
- If the app uses fetch, check response.ok, use AbortController timeout, bounded retry, and runtime response validation. Never hard-code API credentials or secret-bearing authorization headers.

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

function extractImportDeclarations(code: string) {
  const imports: ImportDeclaration[] = [];
  let match: RegExpExecArray | null;

  IMPORT_DECLARATION_REGEX.lastIndex = 0;

  while ((match = IMPORT_DECLARATION_REGEX.exec(code)) !== null) {
    const clause = match[2].trim();
    const source = match[3];
    const namedImports = extractNamedImports(clause);
    const defaultImport = extractDefaultImport(clause);

    if (!defaultImport && namedImports.length === 0) continue;

    imports.push({
      source,
      defaultImport,
      namedImports,
    });
  }

  return imports;
}

function extractDefaultImport(importClause: string) {
  if (importClause.startsWith("{") || importClause.startsWith("*")) {
    return undefined;
  }

  const withoutNamedBlock = importClause.replace(/{[\s\S]*}/g, "");
  const withoutNamespace = withoutNamedBlock.replace(/\*\s+as\s+\w+/g, "");
  const candidate = withoutNamespace.split(",")[0]?.trim();

  return candidate && /^[A-Za-z_$][\w$]*$/.test(candidate)
    ? candidate
    : undefined;
}

function extractNamedImports(importClause: string) {
  const namedBlock = importClause.match(/{([\s\S]*?)}/)?.[1];
  if (!namedBlock) return [];

  return namedBlock
    .split(",")
    .map((item) => item.trim().replace(/^type\s+/, ""))
    .filter(Boolean)
    .map((item) => {
      const [imported, local] = item
        .split(/\s+as\s+/)
        .map((part) => part.trim());
      return {
        imported,
        local: local || imported,
      };
    })
    .filter(({ imported, local }) =>
      [imported, local].every((name) => /^[A-Za-z_$][\w$]*$/.test(name)),
    );
}

function validateImportBindings(
  importingPath: string,
  importDeclaration: ImportDeclaration,
  targetFile: GeneratedFile,
) {
  if (!/\.(tsx|ts|jsx|js)$/i.test(targetFile.path)) return [];

  const diagnostics: GeneratedFileDiagnostic[] = [];
  const exportSignature = extractModuleExportSignature(targetFile.code);

  if (importDeclaration.defaultImport && !exportSignature.hasDefault) {
    const expectedNamedExport = exportSignature.namedExports.has(
      importDeclaration.defaultImport,
    );

    diagnostics.push({
      path: importingPath,
      message: expectedNamedExport
        ? `Default import "${importDeclaration.defaultImport}" from "${importDeclaration.source}" is invalid because ${targetFile.path} exports "${importDeclaration.defaultImport}" only as a named export. Use import { ${importDeclaration.defaultImport} } from "${importDeclaration.source}" or add a default export.`
        : `Default import "${importDeclaration.defaultImport}" from "${importDeclaration.source}" is invalid because ${targetFile.path} has no default export. Add a default export or change the import to match its named exports.`,
    });
  }

  for (const namedImport of importDeclaration.namedImports) {
    if (namedImport.imported === "default") {
      if (!exportSignature.hasDefault) {
        diagnostics.push({
          path: importingPath,
          message: `Named default import "${namedImport.local}" from "${importDeclaration.source}" is invalid because ${targetFile.path} has no default export.`,
        });
      }
      continue;
    }

    if (exportSignature.namedExports.has(namedImport.imported)) continue;

    const defaultExportHint =
      exportSignature.hasDefault &&
      (!exportSignature.defaultName ||
        exportSignature.defaultName === namedImport.imported)
        ? ` It has a default export; use import ${namedImport.local} from "${importDeclaration.source}" or export "${namedImport.imported}" by name.`
        : "";

    diagnostics.push({
      path: importingPath,
      message: `Named import "${namedImport.imported}" from "${importDeclaration.source}" is invalid because ${targetFile.path} does not export "${namedImport.imported}".${defaultExportHint}`,
    });
  }

  return diagnostics;
}

function extractModuleExportSignature(code: string): ModuleExportSignature {
  const codeWithoutComments = stripCodeComments(code);
  const namedExports = new Set<string>();
  let hasDefault = /\bexport\s+default\b/.test(codeWithoutComments);
  let defaultName = codeWithoutComments.match(
    /\bexport\s+default\s+(?:async\s+)?(?:function|class)?\s*([A-Za-z_$][\w$]*)?/,
  )?.[1];

  for (const regex of [
    /\bexport\s+(?:declare\s+)?(?:async\s+)?(?:function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/g,
    /\bexport\s+(?:declare\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g,
  ]) {
    let match: RegExpExecArray | null;
    regex.lastIndex = 0;

    while ((match = regex.exec(codeWithoutComments)) !== null) {
      namedExports.add(match[1]);
    }
  }

  const exportListRegex =
    /\bexport\s*{([\s\S]*?)}(?:\s*from\s*["'][^"']+["'])?\s*;?/g;
  let exportListMatch: RegExpExecArray | null;

  while (
    (exportListMatch = exportListRegex.exec(codeWithoutComments)) !== null
  ) {
    for (const specifier of exportListMatch[1].split(",")) {
      const cleanSpecifier = specifier.trim().replace(/^type\s+/, "");
      if (!cleanSpecifier) continue;

      const [localName, exportedName = localName] = cleanSpecifier
        .split(/\s+as\s+/)
        .map((part) => part.trim());

      if (!localName || !exportedName) continue;

      if (exportedName === "default") {
        hasDefault = true;
        defaultName = localName === "default" ? defaultName : localName;
      } else if (/^[A-Za-z_$][\w$]*$/.test(exportedName)) {
        namedExports.add(exportedName);
      }
    }
  }

  return {
    hasDefault,
    defaultName,
    namedExports,
  };
}

function stripCodeComments(code: string) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function validateObviousInteractionFailures(files: GeneratedFile[]) {
  const diagnostics: GeneratedFileDiagnostic[] = [];

  for (const file of files) {
    if (!/\.(tsx|jsx)$/i.test(file.path)) continue;

    const code = stripCodeComments(file.code);
    if (
      /\bon(?:Click|Submit|Change|CheckedChange|ValueChange)\s*=\s*\{\s*\([^)]*\)\s*=>\s*(?:\{\s*\}|undefined|null)\s*\}/.test(
        code,
      )
    ) {
      diagnostics.push({
        path: file.path,
        message:
          "Empty event handler. Implement a real visible outcome or remove the inert control.",
      });
    }
  }

  return diagnostics;
}

function validateThemeBehavior(files: GeneratedFile[]) {
  const sourceFiles = files.filter((file) =>
    /\.(tsx|ts|jsx|js)$/i.test(file.path),
  );
  const combinedSource = sourceFiles.map((file) => file.code).join("\n");
  const addsDarkClass =
    /document\.documentElement\.classList\.add\(\s*["'`]dark["'`]/.test(
      combinedSource,
    );
  const removesDarkClass =
    /document\.documentElement\.classList\.remove\(\s*["'`]dark["'`]/.test(
      combinedSource,
    );
  const togglesDarkClass =
    /document\.documentElement\.classList\.toggle\(\s*["'`]dark["'`]/.test(
      combinedSource,
    );
  const hasDarkVariants = /\bdark:[\w\-\[\]/.:%]+/.test(combinedSource);
  const hasThemeStateSetter =
    /\b(?:setIsDark|setDarkMode|setTheme|toggleTheme)\b/.test(combinedSource);
  const hasThemeControl =
    togglesDarkClass ||
    (addsDarkClass && removesDarkClass) ||
    (hasDarkVariants && hasThemeStateSetter);

  if (!hasThemeControl) return [];

  const hasPersistedPreference =
    /localStorage\.getItem\(/.test(combinedSource) &&
    /localStorage\.setItem\(/.test(combinedSource);
  const hasSystemFallback =
    /matchMedia\(\s*["'`]\(prefers-color-scheme:\s*dark\)["'`]\s*\)/.test(
      combinedSource,
    );
  const updatesColorScheme =
    /document\.documentElement\.style\.colorScheme\s*=/.test(combinedSource) ||
    /document\.documentElement\.style\.setProperty\(\s*["'`]color-scheme["'`]/.test(
      combinedSource,
    );
  const updatesRootDarkClass =
    togglesDarkClass || (addsDarkClass && removesDarkClass);

  if (
    updatesRootDarkClass &&
    hasPersistedPreference &&
    hasSystemFallback &&
    updatesColorScheme
  ) {
    return [];
  }

  const themeOwner = sourceFiles.find((file) => {
    const code = file.code;
    return (
      /document\.documentElement\.classList\.toggle\(\s*["'`]dark["'`]/.test(
        code,
      ) ||
      (/document\.documentElement\.classList\.add\(\s*["'`]dark["'`]/.test(
        code,
      ) &&
        /document\.documentElement\.classList\.remove\(\s*["'`]dark["'`]/.test(
          code,
        )) ||
      /\b(?:setIsDark|setDarkMode|setTheme|toggleTheme)\b/.test(code)
    );
  });

  return [
    {
      path: themeOwner?.path,
      message:
        "Theme control is incomplete. Initialize from a persisted localStorage preference with a prefers-color-scheme fallback, persist changes, and update document.documentElement.style.colorScheme together with the root dark class.",
    },
  ];
}

function countResolvedInternalImports(files: GeneratedFile[]) {
  let resolved = 0;

  for (const file of files) {
    for (const source of extractImportSources(file.code)) {
      if (!isInternalGeneratedImport(source)) continue;

      const normalizedSource = normalizeModulePath(source);
      if (PROTECTED_MODULE_PATHS.has(stripExtension(normalizedSource))) {
        resolved += 1;
        continue;
      }

      if (resolveGeneratedImport(file.path, source, files)) {
        resolved += 1;
      }
    }
  }

  return resolved;
}

function validateBasicAccessibility(files: GeneratedFile[]) {
  const warnings: GeneratedFileDiagnostic[] = [];

  for (const file of files) {
    if (!/\.(tsx|jsx)$/i.test(file.path)) continue;

    const emptyButtonMatches = file.code.matchAll(
      /<button\b(?![^>]*aria-label=)[^>]*>\s*(?:<[^>]+>\s*)*<\/button>/g,
    );
    for (const _match of emptyButtonMatches) {
      warnings.push({
        path: file.path,
        message: "Button appears to have no visible text or aria-label.",
      });
    }

    const inputMatches = file.code.matchAll(/<input\b([^>]*)>/g);
    for (const match of inputMatches) {
      const attrs = match[1] || "";
      const hasAccessibleName =
        /\b(?:aria-label|aria-labelledby|id|placeholder)=/.test(attrs) ||
        isWrappedInLabel(file.code, match.index);
      if (!hasAccessibleName) {
        warnings.push({
          path: file.path,
          message:
            "Input appears to be missing an accessible name, id, or placeholder.",
        });
      }
    }

    const imageMatches = file.code.matchAll(/<img\b([^>]*)>/g);
    for (const match of imageMatches) {
      const attrs = match[1] || "";
      if (!/\balt=/.test(attrs)) {
        warnings.push({
          path: file.path,
          message: "Image appears to be missing alt text.",
        });
      }
    }
  }

  return warnings;
}

function isWrappedInLabel(code: string, inputIndex: number) {
  const sourceBeforeInput = code.slice(0, inputIndex);
  const lastLabelOpen = sourceBeforeInput.lastIndexOf("<label");
  const lastLabelClose = sourceBeforeInput.lastIndexOf("</label>");

  return (
    lastLabelOpen > lastLabelClose &&
    code.indexOf("</label>", inputIndex) !== -1
  );
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
  return Boolean(resolveGeneratedImportFile(fromPath, source, files));
}

function resolveGeneratedImportFile(
  fromPath: string,
  source: string,
  files: Iterable<GeneratedFile>,
) {
  const candidates = getImportCandidates(fromPath, source);

  for (const file of files) {
    if (candidates.includes(stripExtension(file.path))) {
      return file;
    }
  }

  return null;
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
  return ensureCnImport(
    normalizeSelectCodegenErrors(
      normalizeClipboardWrites(
        code
          .replace(
            /import\s*{\s*Motion\s*}\s*from\s*["']framer-motion["'];?/g,
            'import { motion } from "framer-motion";',
          )
          .replace(/<Motion(\s|>)/g, "<motion.div$1")
          .replace(/<\/Motion>/g, "</motion.div>"),
      ),
    ),
  );
}

function ensureCnImport(code: string) {
  if (!/\bcn\s*\(/.test(code) || hasCnBinding(code)) return code;

  const libUtilsImportRegex =
    /import\s*{([\s\S]*?)}\s*from\s*["']@\/lib\/utils["'];?/;

  if (libUtilsImportRegex.test(code)) {
    return code.replace(
      libUtilsImportRegex,
      (_match: string, importBlock: string) => {
        const imports = importBlock
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean);

        if (!imports.some((item: string) => /^cn(?:\s+as\s+cn)?$/.test(item))) {
          imports.push("cn");
        }

        return `import { ${imports.join(", ")} } from "@/lib/utils";`;
      },
    );
  }

  return insertImportAfterDirectives(code, 'import { cn } from "@/lib/utils";');
}

function hasCnBinding(code: string) {
  if (
    extractImportDeclarations(code).some(
      (importDeclaration) =>
        importDeclaration.defaultImport === "cn" ||
        importDeclaration.namedImports.some(
          (namedImport) => namedImport.local === "cn",
        ),
    )
  ) {
    return true;
  }

  return /\b(?:const|let|var|function|class)\s+cn\b/.test(
    stripCodeComments(code),
  );
}

function insertImportAfterDirectives(code: string, importLine: string) {
  const lines = code.split("\n");
  let insertIndex = 0;

  while (
    insertIndex < lines.length &&
    (/^\s*$/.test(lines[insertIndex]) ||
      /^\s*["']use\s+\w+["'];?\s*$/.test(lines[insertIndex]))
  ) {
    insertIndex += 1;
  }

  lines.splice(insertIndex, 0, importLine);
  return lines.join("\n");
}

function normalizeSelectCodegenErrors(code: string) {
  const normalized = code
    .replace(
      /import\s*{([\s\S]*?)}\s*from\s*["']@\/components\/ui\/select["'];?/g,
      (match: string, importBlock: string) => {
        if (!/SelectItemText/.test(importBlock)) {
          return match;
        }

        const cleanedItems = importBlock
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean)
          .filter(
            (item: string) => !/^SelectItemText(?:\s+as\s+.*)?$/.test(item),
          );

        if (!cleanedItems.includes("SelectItem")) {
          cleanedItems.push("SelectItem");
        }

        return `import { ${cleanedItems.join(", ")} } from "@/components/ui/select";`;
      },
    )
    .replace(/<\s*SelectItemText\b([^>]*)>/g, "<SelectItem$1>")
    .replace(/<\/\s*SelectItemText\s*>/g, "</SelectItem>")
    .replace(/<\s*Select\.ItemText\b([^>]*)>/g, "<Select.Item$1>")
    .replace(/<\/\s*Select\.ItemText\s*>/g, "</Select.Item>");

  return normalized;
}

function normalizeClipboardWrites(code: string) {
  return code
    .replace(
      /await\s+(?:window\.)?navigator\.clipboard\.writeText\(([^;\n]+)\);/g,
      "await (navigator?.clipboard?.writeText?.($1) ?? Promise.resolve()).catch(() => {});",
    )
    .replace(
      /(^|[^a-zA-Z0-9_$])(?:window\.)?navigator\.clipboard\.writeText\(([^;\n]+)\);/g,
      "$1(navigator?.clipboard?.writeText?.($2) ?? Promise.resolve()).catch(() => {});",
    );
}
