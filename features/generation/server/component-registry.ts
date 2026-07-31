import "server-only";

import { z } from "zod";

import { isSupportedGeneratedAppPackage } from "@/lib/generated-app-dependencies";
import {
  normalizeGeneratedFiles,
  type GeneratedFile,
  type RawGeneratedFile,
} from "@/lib/generated-files";

const MAX_REGISTRY_ITEMS = 3;
const MAX_REGISTRY_DEPTH = 5;
const MAX_REGISTRY_RESPONSE_BYTES = 1_000_000;
const REGISTRY_TIMEOUT_MS = 10_000;

const TRUSTED_REGISTRIES = {
  "@magicui": {
    homepage: "https://magicui.design",
    itemUrl: (name: string) => `https://magicui.design/r/${name}.json`,
  },
  "@react-bits": {
    homepage: "https://reactbits.dev",
    itemUrl: (name: string) => `https://reactbits.dev/r/${name}.json`,
  },
  "@skiper-ui": {
    homepage: "https://skiper-ui.com",
    itemUrl: (name: string) => `https://skiper-ui.com/registry/${name}.json`,
  },
} as const;

type TrustedRegistryNamespace = keyof typeof TRUSTED_REGISTRIES;

const registryFileSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
  type: z.string().optional(),
  target: z.string().nullish(),
});

const registryItemSchema = z.object({
  name: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
  dependencies: z.array(z.string()).nullish(),
  registryDependencies: z.array(z.string()).nullish(),
  files: z.array(registryFileSchema).min(1),
});

type RegistryItem = z.infer<typeof registryItemSchema>;

export type ComponentRegistryAddress = `${TrustedRegistryNamespace}/${string}`;

export type ResolvedComponentRegistryImport = {
  address: ComponentRegistryAddress;
  title: string;
  description?: string;
  homepage: string;
  files: GeneratedFile[];
  dependencies: string[];
  exports: string[];
  warnings: string[];
};

export class ComponentRegistryError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "UNSUPPORTED_REGISTRY"
      | "INVALID_COMMAND"
      | "FETCH_FAILED"
      | "INVALID_ITEM"
      | "UNSUPPORTED_DEPENDENCY",
  ) {
    super(message);
    this.name = "ComponentRegistryError";
  }
}

const SHADCN_ADD_COMMAND =
  /(?:^|[\s`])(?:(?:pnpm\s+dlx|npx|bunx(?:\s+--bun)?|yarn\s+dlx)\s+)?shadcn(?:@[^\s]+)?\s+add\s+([^\n`]+)/gim;
const REGISTRY_ADDRESS = /@[a-z0-9][a-z0-9_-]*\/[A-Za-z0-9][A-Za-z0-9._-]*/g;

export function extractComponentRegistryAddresses(
  text: string,
): ComponentRegistryAddress[] {
  const addresses = new Set<ComponentRegistryAddress>();

  SHADCN_ADD_COMMAND.lastIndex = 0;
  let commandMatch: RegExpExecArray | null;
  while ((commandMatch = SHADCN_ADD_COMMAND.exec(text)) !== null) {
    for (const match of commandMatch[1].matchAll(REGISTRY_ADDRESS)) {
      const address = match[0];
      const namespace = address.split("/")[0];
      if (namespace in TRUSTED_REGISTRIES) {
        addresses.add(address as ComponentRegistryAddress);
      }
    }
  }

  return Array.from(addresses).slice(0, MAX_REGISTRY_ITEMS);
}

export async function resolveComponentRegistryImports(
  text: string,
): Promise<ResolvedComponentRegistryImport[]> {
  const requestedAddresses = extractAllCommandAddresses(text);
  const unsupportedAddress = requestedAddresses.find(
    (address) => !(address.split("/")[0] in TRUSTED_REGISTRIES),
  );
  if (unsupportedAddress) {
    throw new ComponentRegistryError(
      `${unsupportedAddress} is not in Squid's trusted component registries. Supported registries are ${Object.keys(TRUSTED_REGISTRIES).join(", ")}.`,
      "UNSUPPORTED_REGISTRY",
    );
  }
  if (requestedAddresses.length > MAX_REGISTRY_ITEMS) {
    throw new ComponentRegistryError(
      `Add at most ${MAX_REGISTRY_ITEMS} registry components in one request.`,
      "INVALID_COMMAND",
    );
  }
  const addresses = extractComponentRegistryAddresses(text);
  return Promise.all(addresses.map((address) => resolveRegistryItem(address)));
}

function extractAllCommandAddresses(text: string) {
  const addresses = new Set<string>();
  SHADCN_ADD_COMMAND.lastIndex = 0;
  let commandMatch: RegExpExecArray | null;
  while ((commandMatch = SHADCN_ADD_COMMAND.exec(text)) !== null) {
    for (const match of commandMatch[1].matchAll(REGISTRY_ADDRESS)) {
      addresses.add(match[0]);
    }
  }
  return Array.from(addresses);
}

export function mergeComponentRegistryFiles(
  files: GeneratedFile[],
  imports: ResolvedComponentRegistryImport[],
) {
  const registryFiles = imports.flatMap((item) => item.files);
  return normalizeGeneratedFiles([...files, ...registryFiles]);
}

export function buildComponentRegistryPromptSection(
  imports: ResolvedComponentRegistryImport[],
) {
  if (imports.length === 0) return "";

  const entries = imports.map((item) => {
    const fileLines = item.files.map((file) => `  - ${file.path}`).join("\n");
    const exports =
      item.exports.length > 0
        ? item.exports.join(", ")
        : "inspect the installed file exports";
    const warnings = item.warnings.length
      ? `\nWarnings:\n${item.warnings.map((warning) => `  - ${warning}`).join("\n")}`
      : "";
    return `- ${item.address} (${item.title})\nInstalled files:\n${fileLines}\nAvailable exports: ${exports}${warnings}`;
  });

  return `=== TRUSTED COMPONENT REGISTRY IMPORTS ===
The user explicitly requested these components. Their source files are installed deterministically by Squid and will be present in preview and export. Import and use the requested component in the generated app; do not reproduce, rename, or overwrite its installed source file. Resolve any required props and provide a useful visible integration. If a warning identifies a missing asset, use an explicit user-supplied or stable public asset URL when available and never pretend the asset exists.

${entries.join("\n\n")}
=== END TRUSTED COMPONENT REGISTRY IMPORTS ===`;
}

async function resolveRegistryItem(
  address: ComponentRegistryAddress,
  seen = new Set<string>(),
  depth = 0,
): Promise<ResolvedComponentRegistryImport> {
  if (depth > MAX_REGISTRY_DEPTH) {
    throw new ComponentRegistryError(
      `Registry dependency depth exceeded for ${address}.`,
      "INVALID_ITEM",
    );
  }
  if (seen.has(address)) {
    return emptyResolvedImport(address);
  }
  seen.add(address);

  const [namespace, itemName] = splitAddress(address);
  const registry = TRUSTED_REGISTRIES[namespace];
  const item = await fetchRegistryItem(registry.itemUrl(itemName), address);
  const dependencies = validatePackageDependencies(
    item.dependencies ?? [],
    address,
  );
  const normalizedFiles = normalizeRegistryFiles(item);
  const { files, warnings: assetWarnings } = await resolveRegistryAssets(
    normalizedFiles,
    registry.homepage,
  );
  if (files.length === 0) {
    throw new ComponentRegistryError(
      `${address} did not contain any supported source files.`,
      "INVALID_ITEM",
    );
  }

  const nested = await Promise.all(
    (item.registryDependencies ?? []).map((dependency) => {
      const nestedAddress = normalizeRegistryDependency(dependency);
      return nestedAddress
        ? resolveRegistryItem(nestedAddress, seen, depth + 1)
        : Promise.resolve(null);
    }),
  );
  const nestedItems = nested.filter(
    (value): value is ResolvedComponentRegistryImport => value !== null,
  );
  const allFiles = normalizeGeneratedFiles([
    ...nestedItems.flatMap((nestedItem) => nestedItem.files),
    ...files,
  ]);
  const warnings = [...assetWarnings, ...detectRegistryWarnings(allFiles)];

  return {
    address,
    title: item.title ?? item.name,
    description: item.description,
    homepage: registry.homepage,
    files: allFiles,
    dependencies: Array.from(
      new Set([
        ...nestedItems.flatMap((nestedItem) => nestedItem.dependencies),
        ...dependencies,
      ]),
    ),
    exports: extractExports(allFiles),
    warnings,
  };
}

function splitAddress(address: string): [TrustedRegistryNamespace, string] {
  const separator = address.indexOf("/");
  const namespace = address.slice(0, separator);
  const itemName = address.slice(separator + 1);
  if (
    !(namespace in TRUSTED_REGISTRIES) ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(itemName)
  ) {
    throw new ComponentRegistryError(
      `Unsupported or invalid component registry address: ${address}.`,
      "UNSUPPORTED_REGISTRY",
    );
  }
  return [namespace as TrustedRegistryNamespace, itemName];
}

async function fetchRegistryItem(url: string, address: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REGISTRY_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "error",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new ComponentRegistryError(
        `Unable to load ${address} (${response.status}). Check the component name and try again.`,
        "FETCH_FAILED",
      );
    }
    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > MAX_REGISTRY_RESPONSE_BYTES) {
      throw new ComponentRegistryError(
        `${address} is too large to import safely.`,
        "INVALID_ITEM",
      );
    }
    const text = await response.text();
    if (new TextEncoder().encode(text).length > MAX_REGISTRY_RESPONSE_BYTES) {
      throw new ComponentRegistryError(
        `${address} is too large to import safely.`,
        "INVALID_ITEM",
      );
    }
    const decoded: unknown = JSON.parse(text);
    const candidate = Array.isArray(decoded) ? decoded[0] : decoded;
    return registryItemSchema.parse(candidate);
  } catch (error) {
    if (error instanceof ComponentRegistryError) throw error;
    throw new ComponentRegistryError(
      `Unable to load ${address}: ${error instanceof Error ? error.message : "invalid registry response"}.`,
      "FETCH_FAILED",
    );
  } finally {
    clearTimeout(timeout);
  }
}

function validatePackageDependencies(dependencies: string[], address: string) {
  const packages = dependencies.map(getPackageName);
  const unsupported = packages.filter(
    (dependency) => !isSupportedGeneratedAppPackage(dependency),
  );
  if (unsupported.length > 0) {
    throw new ComponentRegistryError(
      `${address} requires unsupported ${unsupported.length === 1 ? "package" : "packages"}: ${unsupported.join(", ")}.`,
      "UNSUPPORTED_DEPENDENCY",
    );
  }
  return packages;
}

function getPackageName(specifier: string) {
  if (specifier.startsWith("@")) {
    const versionSeparator = specifier.indexOf("@", 1);
    return versionSeparator === -1
      ? specifier
      : specifier.slice(0, versionSeparator);
  }
  return specifier.split("@")[0];
}

function normalizeRegistryFiles(item: RegistryItem) {
  const rawFiles: RawGeneratedFile[] = [];
  for (const file of item.files) {
    if (!/\.(?:tsx?|jsx?|css)$/i.test(file.path)) continue;
    const path = getRegistryFileDestination(file, item.type);
    if (!path) continue;
    rawFiles.push({ path, code: file.content });
  }
  return normalizeGeneratedFiles(rawFiles);
}

function getRegistryFileDestination(
  file: RegistryItem["files"][number],
  itemType?: string,
) {
  if (file.target) return sanitizeRegistryPath(file.target);
  const basename = file.path.split("/").filter(Boolean).at(-1);
  if (!basename) return null;

  const type = file.type ?? itemType;
  if (type === "registry:ui") return `components/ui/${basename}`;
  if (type === "registry:hook") return `hooks/${basename}`;
  if (type === "registry:lib") return `lib/${basename}`;
  return `components/${basename}`;
}

function sanitizeRegistryPath(path: string) {
  const normalized = path
    .replace(/^\//, "")
    .replace(/^src\//, "")
    .replace(/\/+/g, "/");
  if (!normalized || normalized.includes("..")) return null;
  return normalized;
}

function normalizeRegistryDependency(dependency: string) {
  if (dependency.startsWith("@")) {
    const namespace = dependency.split("/")[0];
    return namespace in TRUSTED_REGISTRIES
      ? (dependency as ComponentRegistryAddress)
      : null;
  }
  return null;
}

function extractExports(files: GeneratedFile[]) {
  const exports = new Set<string>();
  for (const file of files) {
    for (const match of file.code.matchAll(
      /\bexport\s+(?:default\s+)?(?:function|class|const|let|var|type|interface)\s+([A-Za-z_$][\w$]*)|\bexport\s*\{([^}]+)\}/g,
    )) {
      if (match[1]) exports.add(match[1]);
      if (match[2]) {
        for (const part of match[2].split(",")) {
          const name = part
            .trim()
            .split(/\s+as\s+/)
            .at(-1);
          if (name) exports.add(name);
        }
      }
    }
  }
  return Array.from(exports).sort();
}

function detectRegistryWarnings(files: GeneratedFile[]) {
  const warnings = new Set<string>();
  const source = files.map((file) => file.code).join("\n");
  for (const match of source.matchAll(
    /["'](\/[^"']+\.(?:png|jpe?g|webp|gif|svg|mp4|webm))["']/gi,
  )) {
    warnings.add(
      `The component references ${match[1]}, but the registry did not include that public asset.`,
    );
  }
  return Array.from(warnings);
}

async function resolveRegistryAssets(files: GeneratedFile[], homepage: string) {
  const assetPaths = new Set<string>();
  for (const file of files) {
    for (const match of file.code.matchAll(
      /["'](\/[^"']+\.(?:png|jpe?g|webp|gif|svg|mp4|webm))["']/gi,
    )) {
      assetPaths.add(match[1]);
    }
  }

  const resolutions = await Promise.all(
    Array.from(assetPaths).map(async (path) => {
      const url = new URL(path, homepage).toString();
      try {
        const response = await fetch(url, {
          method: "HEAD",
          redirect: "error",
          signal: AbortSignal.timeout(REGISTRY_TIMEOUT_MS),
          cache: "no-store",
        });
        return response.ok ? { path, url } : null;
      } catch {
        return null;
      }
    }),
  );
  const resolved = resolutions.filter(
    (value): value is { path: string; url: string } => value !== null,
  );
  if (resolved.length === 0) return { files, warnings: [] as string[] };

  return {
    files: files.map((file) => ({
      ...file,
      code: resolved.reduce(
        (code, asset) => code.replaceAll(asset.path, asset.url),
        file.code,
      ),
    })),
    warnings: resolved.map(
      (asset) =>
        `The registry asset ${asset.path} is loaded from ${asset.url}; download it into the exported app if fully self-contained assets are required.`,
    ),
  };
}

function emptyResolvedImport(
  address: ComponentRegistryAddress,
): ResolvedComponentRegistryImport {
  const [namespace] = splitAddress(address);
  return {
    address,
    title: address,
    homepage: TRUSTED_REGISTRIES[namespace].homepage,
    files: [],
    dependencies: [],
    exports: [],
    warnings: [],
  };
}
