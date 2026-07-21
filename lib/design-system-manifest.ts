export type DesignRoleContrastTargets = {
  bodyText?: number;
  largeText?: number;
  interactive?: number;
  focusRing?: number;
  disabled?: number;
};

export type RawDesignSystemManifestRole = {
  background: string;
  foreground: string;
  border?: string;
  contrastTargets?: DesignRoleContrastTargets;
};

export type RawDesignSystemManifest = {
  colorRoles?: Record<string, RawDesignSystemManifestRole>;
  contrastTargets?: DesignRoleContrastTargets;
  surfaceInteractions?: Record<string, string>;
};

export const DESIGN_MANIFEST_CONSTANT_NAME = "__designSystemManifest";

export const REQUIRED_COLOR_ROLES = [
  "canvas",
  "surface",
  "mutedSurface",
  "inverse",
  "primary",
  "secondary",
  "accent",
  "success",
  "destructive",
] as const;

export const CONDITIONAL_COLOR_ROLES = [
  "overlay",
  "input",
  "table",
  "toast",
  "chart",
] as const;

export const REQUIRED_SURFACE_INTERACTION_STATES = [
  "hover",
  "active",
  "focus",
  "selected",
  "loading",
  "disabled",
  "success",
  "error",
] as const;

export const REQUIRED_CONTRAST_TARGETS = {
  bodyText: 4.5,
  largeText: 3,
  interactive: 4.5,
  focusRing: 3,
  disabled: 3,
} as const;

export type AppCodeFile = {
  path: string;
  code: string;
};

export function extractManifestObject(code: string): string | null {
  const marker = `const ${DESIGN_MANIFEST_CONSTANT_NAME}`;
  const markerIndex = code.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const start = code.indexOf("{", markerIndex);
  if (start === -1) {
    return null;
  }

  let depth = 0;
  for (let i = start; i < code.length; i++) {
    const char = code[i];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return code.slice(start, i + 1);
      }
    }
  }

  return null;
}

export function parseDesignSystemManifestFromCode(
  code: string,
): RawDesignSystemManifest | null {
  const manifestSource = extractManifestObject(code);
  if (!manifestSource) {
    return null;
  }

  try {
    return JSON.parse(manifestSource) as RawDesignSystemManifest;
  } catch {
    return null;
  }
}

function parseTailwindStyleValueToken(className: string): string | null {
  const normalized = className.trim();
  if (!normalized || /[\[\]#()]/.test(normalized)) {
    return null;
  }

  const rawClass = normalized.split(":").at(-1) ?? "";
  const withoutOpacity = rawClass.split("/")[0]?.trim();
  if (!withoutOpacity) {
    return null;
  }

  const utilitySeparator = withoutOpacity.indexOf("-");
  if (utilitySeparator === -1) {
    return null;
  }

  const token = withoutOpacity.slice(utilitySeparator + 1);
  if (!token) return null;

  return token;
}

export function collectManifestColorTokens(
  manifest: RawDesignSystemManifest | null,
): Set<string> | null {
  if (!manifest) return null;

  const roles = manifest.colorRoles;
  if (!roles || typeof roles !== "object" || Array.isArray(roles)) return null;

  const tokens = new Set<string>();

  for (const role of Object.values(roles)) {
    if (!role || typeof role !== "object") continue;

    if (typeof role.background === "string") {
      const token = parseTailwindStyleValueToken(role.background);
      if (token) tokens.add(token);
    }

    if (typeof role.foreground === "string") {
      const token = parseTailwindStyleValueToken(role.foreground);
      if (token) tokens.add(token);
    }

    if (typeof role.border === "string") {
      const token = parseTailwindStyleValueToken(role.border);
      if (token) tokens.add(token);
    }
  }

  return tokens.size > 0 ? tokens : null;
}

export function collectManifestColorTokensFromFiles(
  files: AppCodeFile[],
): Set<string> | null {
  const appFile = files.find((file) => file.path === "App.tsx");
  if (!appFile) return null;

  const manifest = parseDesignSystemManifestFromCode(appFile.code);
  return collectManifestColorTokens(manifest);
}

export function parseManifestFromFiles(
  files: AppCodeFile[],
): RawDesignSystemManifest | null {
  const appFile = files.find((file) => file.path === "App.tsx");
  if (!appFile) return null;

  return parseDesignSystemManifestFromCode(appFile.code);
}
