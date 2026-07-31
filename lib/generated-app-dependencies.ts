import { parse } from "@babel/parser";

export type GeneratedAppCapability =
  | "animation"
  | "data"
  | "forms"
  | "mapping"
  | "media"
  | "state"
  | "three-dimensional"
  | "ui"
  | "visualization";

type GeneratedAppDependencyDefinition<PackageName extends string> = {
  version: string;
  companions?: readonly PackageName[];
  capabilities?: readonly GeneratedAppCapability[];
};

function defineGeneratedAppDependencyManifest<
  const Manifest extends Record<
    string,
    GeneratedAppDependencyDefinition<keyof Manifest & string>
  >,
>(manifest: Manifest) {
  return manifest;
}

/**
 * Canonical generated-app package manifest. Versions are declared exactly once
 * here, while companion and capability metadata stay attached to the package
 * that owns the requirement.
 */
export const generatedAppDependencyManifest =
  defineGeneratedAppDependencyManifest({
    "lucide-react": { version: "0.563.0", capabilities: ["ui"] },
    recharts: { version: "2.9.0", capabilities: ["visualization"] },
    "react-router-dom": { version: "6.30.4" },
    "@radix-ui/react-accordion": { version: "^1.2.0", capabilities: ["ui"] },
    "@radix-ui/react-alert-dialog": {
      version: "^1.1.1",
      capabilities: ["ui"],
    },
    "@radix-ui/react-aspect-ratio": { version: "^1.1.0" },
    "@radix-ui/react-avatar": { version: "^1.1.0" },
    "@radix-ui/react-checkbox": { version: "^1.1.1" },
    "@radix-ui/react-collapsible": { version: "^1.1.0" },
    "@radix-ui/react-dialog": { version: "^1.1.1", capabilities: ["ui"] },
    "@radix-ui/react-dropdown-menu": { version: "^2.1.1" },
    "@radix-ui/react-hover-card": { version: "^1.1.1" },
    "@radix-ui/react-label": { version: "^2.1.0" },
    "@radix-ui/react-menubar": { version: "^1.1.1" },
    "@radix-ui/react-navigation-menu": { version: "^1.2.0" },
    "@radix-ui/react-popover": { version: "^1.1.1" },
    "@radix-ui/react-progress": { version: "^1.1.0" },
    "@radix-ui/react-radio-group": { version: "^1.2.0" },
    "@radix-ui/react-scroll-area": { version: "^1.2.10" },
    "@radix-ui/react-select": { version: "^2.1.1" },
    "@radix-ui/react-separator": { version: "^1.1.0" },
    "@radix-ui/react-slider": { version: "^1.2.0" },
    "@radix-ui/react-slot": { version: "^1.1.0" },
    "@radix-ui/react-switch": { version: "^1.1.0" },
    "@radix-ui/react-tabs": { version: "^1.1.0" },
    "@radix-ui/react-toast": { version: "^1.2.1" },
    "@radix-ui/react-toggle": { version: "^1.1.0" },
    "@radix-ui/react-toggle-group": { version: "^1.1.0" },
    "@radix-ui/react-tooltip": { version: "^1.1.2" },
    "@hookform/resolvers": { version: "5.4.0", capabilities: ["forms"] },
    "@tanstack/react-query": { version: "5.101.2", capabilities: ["data"] },
    "@tanstack/react-table": {
      version: "8.21.3",
      capabilities: ["data", "ui"],
    },
    "@xyflow/react": {
      version: "12.11.2",
      capabilities: ["ui", "visualization"],
    },
    "class-variance-authority": { version: "^0.7.0" },
    clsx: { version: "^2.1.1" },
    "date-fns": { version: "^3.6.0" },
    "embla-carousel-react": { version: "^8.1.8" },
    "framer-motion": { version: "^11.15.0", capabilities: ["animation"] },
    motion: { version: "12.43.0", capabilities: ["animation"] },
    gsap: { version: "3.14.2", capabilities: ["animation"] },
    "@types/gsap": { version: "3.0.0" },
    "fuse.js": { version: "7.5.0", capabilities: ["data"] },
    "qrcode.react": { version: "4.2.0", capabilities: ["visualization"] },
    "react-colorful": { version: "5.8.0", capabilities: ["ui"] },
    "react-day-picker": { version: "^8.10.1" },
    "react-dnd": { version: "16.0.1", capabilities: ["ui"] },
    "react-dnd-html5-backend": { version: "16.0.1" },
    "react-dnd-touch-backend": { version: "16.0.1" },
    "@supabase/supabase-js": { version: "2.110.8", capabilities: ["data"] },
    "@supabase/ssr": { version: "0.12.3", capabilities: ["data"] },
    "react-dropzone": { version: "17.0.0", capabilities: ["ui"] },
    "react-hook-form": { version: "7.81.0", capabilities: ["forms"] },
    "react-markdown": { version: "10.1.0", capabilities: ["ui"] },
    "react-resizable-panels": { version: "4.12.2", capabilities: ["ui"] },
    "remark-gfm": { version: "4.0.1" },
    "tailwind-merge": { version: "^2.4.0" },
    "tailwindcss-animate": { version: "^1.0.7", capabilities: ["animation"] },
    vaul: { version: "^0.9.1", capabilities: ["ui"] },
    three: { version: "0.177.0", capabilities: ["three-dimensional"] },
    "@types/three": { version: "0.177.0" },
    "@react-three/fiber": {
      version: "9.6.1",
      capabilities: ["three-dimensional"],
    },
    "@react-three/drei": {
      version: "10.7.7",
      capabilities: ["three-dimensional"],
    },
    "@react-three/postprocessing": {
      version: "3.0.4",
      capabilities: ["three-dimensional"],
    },
    "@react-three/rapier": {
      version: "2.2.0",
      capabilities: ["three-dimensional"],
    },
    "@react-three/cannon": {
      version: "6.6.0",
      capabilities: ["three-dimensional"],
    },
    "@splinetool/react-spline": {
      version: "4.1.0",
      companions: ["@splinetool/runtime"],
      capabilities: ["three-dimensional"],
    },
    "@splinetool/runtime": {
      version: "1.12.98",
      capabilities: ["three-dimensional"],
    },
    "three-stdlib": { version: "2.36.1", capabilities: ["three-dimensional"] },
    maath: { version: "0.10.8", capabilities: ["three-dimensional"] },
    postprocessing: {
      version: "6.39.3",
      capabilities: ["three-dimensional"],
    },
    leva: { version: "0.10.1", capabilities: ["three-dimensional", "ui"] },
    "@paper-design/shaders-react": {
      version: "0.0.77",
      capabilities: ["three-dimensional", "visualization"],
    },
    sonner: { version: "2.0.7", capabilities: ["ui"] },
    "react-leaflet": { version: "5.0.0", capabilities: ["mapping"] },
    leaflet: { version: "1.9.4", capabilities: ["mapping"] },
    "@types/leaflet": { version: "1.9.21" },
    "react-syntax-highlighter": { version: "15.8.0", capabilities: ["ui"] },
    "react-intersection-observer": { version: "9.16.0" },
    cmdk: { version: "1.1.1", capabilities: ["ui"] },
    "hls.js": { version: "1.6.16", capabilities: ["media"] },
    "@uiw/react-md-editor": { version: "4.0.6", capabilities: ["ui"] },
    "@use-gesture/react": { version: "10.3.1", capabilities: ["ui"] },
    "react-countup": { version: "6.5.3", capabilities: ["animation"] },
    "react-resizable": { version: "3.0.4", capabilities: ["ui"] },
    "@types/react-resizable": { version: "3.0.8" },
    "@tanstack/react-virtual": { version: "3.14.7", capabilities: ["ui"] },
    jspdf: { version: "4.2.1", capabilities: ["media"] },
    "@react-pdf/renderer": { version: "4.5.1", capabilities: ["media"] },
    howler: { version: "2.2.4", capabilities: ["media"] },
    "react-arborist": { version: "3.15.0", capabilities: ["ui"] },
    "react-masonry-css": { version: "1.0.16", capabilities: ["ui"] },
    "yet-another-react-lightbox": {
      version: "3.32.1",
      capabilities: ["media"],
    },
    "@tsparticles/react": {
      version: "4.3.2",
      capabilities: ["animation", "visualization"],
    },
    "@tsparticles/engine": {
      version: "4.3.2",
      capabilities: ["animation", "visualization"],
    },
    "@tsparticles/slim": {
      version: "4.3.2",
      capabilities: ["animation", "visualization"],
    },
    "react-parallax": { version: "3.5.2", capabilities: ["animation"] },
    zod: { version: "4.4.3", capabilities: ["data", "forms"] },
    zustand: { version: "5.0.14", capabilities: ["state"] },
  });

export type GeneratedAppPackageName =
  keyof typeof generatedAppDependencyManifest;

/** Compatibility record for Sandpack and trusted registry consumers. */
export const generatedAppDependencies: Readonly<Record<string, string>> =
  Object.freeze(
    Object.fromEntries(
      Object.entries(generatedAppDependencyManifest).map(
        ([packageName, definition]) => [packageName, definition.version],
      ),
    ),
  );

const PROVIDED_GENERATED_APP_PACKAGES = new Set(["react", "react-dom"]);
const NODE_BUILTIN_PACKAGES = new Set([
  "assert",
  "buffer",
  "child_process",
  "cluster",
  "crypto",
  "dgram",
  "dns",
  "events",
  "fs",
  "http",
  "https",
  "module",
  "net",
  "os",
  "path",
  "perf_hooks",
  "process",
  "querystring",
  "readline",
  "stream",
  "string_decoder",
  "timers",
  "tls",
  "tty",
  "url",
  "util",
  "v8",
  "vm",
  "worker_threads",
  "zlib",
]);

export type GeneratedAppImportDiagnostic = {
  path?: string;
  message: string;
  code:
    | "NON_LITERAL_DYNAMIC_IMPORT"
    | "UNSUPPORTED_EXTERNAL_IMPORT"
    | "UNSUPPORTED_NODE_BUILTIN"
    | "UNSUPPORTED_URL_IMPORT";
  source?: string;
  packageName?: string;
};

export type GeneratedAppDependencyPreflight = {
  dependencies: Record<string, string>;
  diagnostics: GeneratedAppImportDiagnostic[];
  importSources: string[];
};

type GeneratedAppSource =
  | string
  | {
      path: string;
      code: string;
    };

type ParsedGeneratedAppImports = {
  sources: string[];
  hasNonLiteralDynamicImport: boolean;
};

export function isSupportedGeneratedAppPackage(
  packageName: string,
): packageName is GeneratedAppPackageName {
  return packageName in generatedAppDependencyManifest;
}

export function getGeneratedAppPackageName(source: string) {
  if (source.startsWith("@")) {
    return source.split("/").slice(0, 2).join("/");
  }

  return source.split("/")[0];
}

export function extractGeneratedAppImportSources(code: string) {
  return new Set(parseGeneratedAppImports(code).sources);
}

export function preflightGeneratedAppImports(
  sourceFiles: Iterable<GeneratedAppSource>,
): GeneratedAppDependencyPreflight {
  const selectedPackages = new Set<GeneratedAppPackageName>();
  const importSources = new Set<string>();
  const diagnostics: GeneratedAppImportDiagnostic[] = [];
  const diagnosticKeys = new Set<string>();

  for (const sourceFile of sourceFiles) {
    const path = typeof sourceFile === "string" ? undefined : sourceFile.path;
    const code = typeof sourceFile === "string" ? sourceFile : sourceFile.code;
    const parsed = parseGeneratedAppImports(code);

    if (parsed.hasNonLiteralDynamicImport) {
      addDiagnostic(diagnostics, diagnosticKeys, {
        path,
        code: "NON_LITERAL_DYNAMIC_IMPORT",
        message:
          "Dynamic imports must use a string literal so Squid can select dependencies deterministically before the preview starts.",
      });
    }

    for (const source of parsed.sources) {
      importSources.add(source);
      if (isInternalGeneratedAppImport(source)) continue;

      const packageName = getGeneratedAppPackageName(source);
      if (PROVIDED_GENERATED_APP_PACKAGES.has(packageName)) continue;

      if (
        source.startsWith("node:") ||
        NODE_BUILTIN_PACKAGES.has(packageName)
      ) {
        addDiagnostic(diagnostics, diagnosticKeys, {
          path,
          source,
          packageName,
          code: "UNSUPPORTED_NODE_BUILTIN",
          message: `Node.js built-in module "${source}" is unavailable in Squid's browser preview. Remove it or use a browser-safe API.`,
        });
        continue;
      }

      if (isAbsoluteUrlImport(source)) {
        addDiagnostic(diagnostics, diagnosticKeys, {
          path,
          source,
          packageName,
          code: "UNSUPPORTED_URL_IMPORT",
          message: `URL import "${source}" is unsupported. Import an allowlisted package by name or include the source in the generated app.`,
        });
        continue;
      }

      if (!isSupportedGeneratedAppPackage(packageName)) {
        addDiagnostic(diagnostics, diagnosticKeys, {
          path,
          source,
          packageName,
          code: "UNSUPPORTED_EXTERNAL_IMPORT",
          message: `Unsupported external package "${packageName}" imported from "${source}". Use a package supported by Squid or remove the import.`,
        });
        continue;
      }

      selectGeneratedAppPackage(packageName, selectedPackages);
    }
  }

  const dependencies = Object.fromEntries(
    Array.from(selectedPackages)
      .sort()
      .map((packageName) => [
        packageName,
        generatedAppDependencyManifest[packageName].version,
      ]),
  );

  return {
    dependencies,
    diagnostics: diagnostics.sort(compareGeneratedAppImportDiagnostics),
    importSources: Array.from(importSources).sort(),
  };
}

export function getRequiredGeneratedAppDependencies(
  sourceFiles: Iterable<string>,
) {
  return preflightGeneratedAppImports(sourceFiles).dependencies;
}

function parseGeneratedAppImports(code: string): ParsedGeneratedAppImports {
  try {
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript", "importAttributes"],
      createImportExpressions: true,
    });
    const sources = new Set<string>();
    let hasNonLiteralDynamicImport = false;

    visitSyntaxNode(ast, (node) => {
      if (
        node.type === "ImportDeclaration" ||
        node.type === "ExportNamedDeclaration" ||
        node.type === "ExportAllDeclaration"
      ) {
        const source = readStringLiteralNode(node.source);
        if (source) sources.add(source);
        return;
      }

      if (node.type === "ImportExpression") {
        const source = readStringLiteralNode(node.source);
        if (source) sources.add(source);
        else hasNonLiteralDynamicImport = true;
        return;
      }

      if (
        node.type === "CallExpression" &&
        isSyntaxNode(node.callee) &&
        node.callee.type === "Import"
      ) {
        const source = Array.isArray(node.arguments)
          ? readStringLiteralNode(node.arguments[0])
          : null;
        if (source) sources.add(source);
        else hasNonLiteralDynamicImport = true;
      }
    });

    return {
      sources: Array.from(sources),
      hasNonLiteralDynamicImport,
    };
  } catch {
    // Generated files render while streaming and can be incomplete. Compilation
    // owns syntax errors; preflight must not invent a terminal import failure.
    return { sources: [], hasNonLiteralDynamicImport: false };
  }
}

type SyntaxNode = {
  type: string;
  [key: string]: unknown;
};

function visitSyntaxNode(value: unknown, visitor: (node: SyntaxNode) => void) {
  if (Array.isArray(value)) {
    for (const item of value) visitSyntaxNode(item, visitor);
    return;
  }
  if (!isSyntaxNode(value)) return;

  visitor(value);
  for (const [key, child] of Object.entries(value)) {
    if (
      key === "loc" ||
      key === "extra" ||
      key === "leadingComments" ||
      key === "innerComments" ||
      key === "trailingComments"
    ) {
      continue;
    }
    if (typeof child === "object" && child !== null) {
      visitSyntaxNode(child, visitor);
    }
  }
}

function isSyntaxNode(value: unknown): value is SyntaxNode {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof value.type === "string"
  );
}

function readStringLiteralNode(value: unknown) {
  return isSyntaxNode(value) && value.type === "StringLiteral"
    ? typeof value.value === "string"
      ? value.value
      : null
    : null;
}
function isInternalGeneratedAppImport(source: string) {
  return (
    source.startsWith(".") || source.startsWith("/") || source.startsWith("@/")
  );
}

function isAbsoluteUrlImport(source: string) {
  try {
    return Boolean(new URL(source).protocol);
  } catch {
    return false;
  }
}

function selectGeneratedAppPackage(
  packageName: GeneratedAppPackageName,
  selectedPackages: Set<GeneratedAppPackageName>,
) {
  if (selectedPackages.has(packageName)) return;
  selectedPackages.add(packageName);

  const definition: GeneratedAppDependencyDefinition<GeneratedAppPackageName> =
    generatedAppDependencyManifest[packageName];
  for (const companion of definition.companions ?? []) {
    selectGeneratedAppPackage(companion, selectedPackages);
  }
}

function addDiagnostic(
  diagnostics: GeneratedAppImportDiagnostic[],
  diagnosticKeys: Set<string>,
  diagnostic: GeneratedAppImportDiagnostic,
) {
  const key = [diagnostic.path, diagnostic.code, diagnostic.source].join(":");
  if (diagnosticKeys.has(key)) return;
  diagnosticKeys.add(key);
  diagnostics.push(diagnostic);
}

function compareGeneratedAppImportDiagnostics(
  left: GeneratedAppImportDiagnostic,
  right: GeneratedAppImportDiagnostic,
) {
  return `${left.path ?? ""}:${left.code}:${left.source ?? ""}`.localeCompare(
    `${right.path ?? ""}:${right.code}:${right.source ?? ""}`,
  );
}
