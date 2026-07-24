type GeneratedFile = {
  path: string;
  code: string;
};

export type ContrastViolation = {
  file: string;
  line: number;
  background: string;
  foreground: string;
  estimatedRatio: number;
  requiredRatio: number;
  severity: "error" | "warning";
  message: string;
};

export type ContrastAuditReport = {
  violations: ContrastViolation[];
  checkedPairs: number;
  passedPairs: number;
  filesChecked: number;
  status: "pass" | "warning" | "fail";
};

/**
 * Tailwind v3 color luminance table (approximate relative luminance values).
 * Values are the Y component in CIE XYZ for sRGB, pre-multiplied by 1.
 * White = 1.0, Black = 0.0.
 */
const TAILWIND_LUMINANCE: Record<string, number> = {
  "50": 0.975,
  "100": 0.935,
  "200": 0.875,
  "300": 0.795,
  "400": 0.69,
  "500": 0.555,
  "600": 0.42,
  "700": 0.31,
  "800": 0.215,
  "900": 0.14,
  "950": 0.075,
};

const ACCENT_LUMINANCE: Record<string, Record<string, number>> = {
  red: {
    "50": 0.975,
    "100": 0.93,
    "200": 0.865,
    "300": 0.77,
    "400": 0.64,
    "500": 0.51,
    "600": 0.4,
    "700": 0.31,
    "800": 0.225,
    "900": 0.165,
    "950": 0.09,
  },
  orange: {
    "50": 0.975,
    "100": 0.935,
    "200": 0.87,
    "300": 0.78,
    "400": 0.67,
    "500": 0.555,
    "600": 0.44,
    "700": 0.34,
    "800": 0.25,
    "900": 0.18,
    "950": 0.1,
  },
  amber: {
    "50": 0.975,
    "100": 0.935,
    "200": 0.87,
    "300": 0.78,
    "400": 0.67,
    "500": 0.555,
    "600": 0.44,
    "700": 0.34,
    "800": 0.25,
    "900": 0.18,
    "950": 0.1,
  },
  yellow: {
    "50": 0.975,
    "100": 0.94,
    "200": 0.88,
    "300": 0.81,
    "400": 0.72,
    "500": 0.6,
    "600": 0.47,
    "700": 0.36,
    "800": 0.27,
    "900": 0.2,
    "950": 0.12,
  },
  lime: {
    "50": 0.97,
    "100": 0.93,
    "200": 0.86,
    "300": 0.77,
    "400": 0.66,
    "500": 0.54,
    "600": 0.42,
    "700": 0.33,
    "800": 0.24,
    "900": 0.18,
    "950": 0.1,
  },
  green: {
    "50": 0.97,
    "100": 0.93,
    "200": 0.86,
    "300": 0.77,
    "400": 0.66,
    "500": 0.54,
    "600": 0.42,
    "700": 0.33,
    "800": 0.24,
    "900": 0.18,
    "950": 0.1,
  },
  emerald: {
    "50": 0.97,
    "100": 0.93,
    "200": 0.86,
    "300": 0.77,
    "400": 0.66,
    "500": 0.54,
    "600": 0.42,
    "700": 0.33,
    "800": 0.24,
    "900": 0.18,
    "950": 0.1,
  },
  teal: {
    "50": 0.97,
    "100": 0.935,
    "200": 0.87,
    "300": 0.78,
    "400": 0.67,
    "500": 0.55,
    "600": 0.43,
    "700": 0.33,
    "800": 0.24,
    "900": 0.175,
    "950": 0.1,
  },
  cyan: {
    "50": 0.97,
    "100": 0.935,
    "200": 0.87,
    "300": 0.78,
    "400": 0.67,
    "500": 0.55,
    "600": 0.43,
    "700": 0.33,
    "800": 0.24,
    "900": 0.175,
    "950": 0.1,
  },
  sky: {
    "50": 0.97,
    "100": 0.935,
    "200": 0.87,
    "300": 0.78,
    "400": 0.67,
    "500": 0.55,
    "600": 0.43,
    "700": 0.33,
    "800": 0.24,
    "900": 0.175,
    "950": 0.1,
  },
  blue: {
    "50": 0.97,
    "100": 0.935,
    "200": 0.87,
    "300": 0.78,
    "400": 0.67,
    "500": 0.55,
    "600": 0.43,
    "700": 0.33,
    "800": 0.24,
    "900": 0.175,
    "950": 0.1,
  },
  indigo: {
    "50": 0.97,
    "100": 0.93,
    "200": 0.865,
    "300": 0.77,
    "400": 0.65,
    "500": 0.53,
    "600": 0.41,
    "700": 0.31,
    "800": 0.22,
    "900": 0.16,
    "950": 0.09,
  },
  violet: {
    "50": 0.97,
    "100": 0.93,
    "200": 0.865,
    "300": 0.77,
    "400": 0.65,
    "500": 0.53,
    "600": 0.41,
    "700": 0.31,
    "800": 0.22,
    "900": 0.16,
    "950": 0.09,
  },
  purple: {
    "50": 0.97,
    "100": 0.93,
    "200": 0.865,
    "300": 0.77,
    "400": 0.65,
    "500": 0.53,
    "600": 0.41,
    "700": 0.31,
    "800": 0.22,
    "900": 0.16,
    "950": 0.09,
  },
  fuchsia: {
    "50": 0.97,
    "100": 0.93,
    "200": 0.865,
    "300": 0.77,
    "400": 0.65,
    "500": 0.53,
    "600": 0.41,
    "700": 0.31,
    "800": 0.22,
    "900": 0.16,
    "950": 0.09,
  },
  pink: {
    "50": 0.97,
    "100": 0.93,
    "200": 0.865,
    "300": 0.77,
    "400": 0.65,
    "500": 0.53,
    "600": 0.41,
    "700": 0.31,
    "800": 0.22,
    "900": 0.16,
    "950": 0.09,
  },
  rose: {
    "50": 0.97,
    "100": 0.93,
    "200": 0.865,
    "300": 0.77,
    "400": 0.65,
    "500": 0.53,
    "600": 0.41,
    "700": 0.31,
    "800": 0.22,
    "900": 0.16,
    "950": 0.09,
  },
};

const GENERATED_THEME_SEMANTICS = {
  light: {
    background: "0 0% 100%",
    foreground: "0 0% 3.9%",
    card: "0 0% 100%",
    "card-foreground": "0 0% 3.9%",
    popover: "0 0% 100%",
    "popover-foreground": "0 0% 3.9%",
    primary: "0 0% 9%",
    "primary-foreground": "0 0% 98%",
    secondary: "0 0% 96.1%",
    "secondary-foreground": "0 0% 9%",
    muted: "0 0% 96.1%",
    "muted-foreground": "0 0% 45.1%",
    accent: "0 0% 96.1%",
    "accent-foreground": "0 0% 9%",
    destructive: "0 84.2% 60.2%",
    "destructive-foreground": "0 0% 98%",
  },
  dark: {
    background: "0 0% 3.9%",
    foreground: "0 0% 98%",
    card: "0 0% 3.9%",
    "card-foreground": "0 0% 98%",
    popover: "0 0% 3.9%",
    "popover-foreground": "0 0% 98%",
    primary: "0 0% 98%",
    "primary-foreground": "0 0% 9%",
    secondary: "0 0% 14.9%",
    "secondary-foreground": "0 0% 98%",
    muted: "0 0% 14.9%",
    "muted-foreground": "0 0% 63.9%",
    accent: "0 0% 14.9%",
    "accent-foreground": "0 0% 98%",
    destructive: "0 62.8% 30.6%",
    "destructive-foreground": "0 0% 98%",
  },
} as const;

function getThemeSemanticLuminance(
  themeMode: "light" | "dark",
  colorClass: string,
) {
  const value =
    GENERATED_THEME_SEMANTICS[themeMode][
      colorClass as keyof (typeof GENERATED_THEME_SEMANTICS)[typeof themeMode]
    ];
  if (!value) return null;
  return hslToLuminance(value);
}

function hslToLuminance(colorClass: string): number | null {
  if (colorClass === "white") return 1.0;
  if (colorClass === "black") return 0.0;

  const normalized = colorClass.trim();
  const match = normalized.match(
    /^(\d{1,3}(?:\.\d+)?)\s+(\d{1,3}(?:\.\d+)?)%\s+(\d{1,3}(?:\.\d+)?)%$/,
  );
  if (!match) return null;

  const h = Number(match[1]);
  const s = Number(match[2]) / 100;
  const l = Number(match[3]) / 100;

  const hueToRgb = (p: number, q: number, tRaw: number) => {
    let t = tRaw;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;

    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const hue = h / 360;
  const sat = s;
  const lightness = l;

  const q =
    lightness < 0.5 ? lightness * (1 + sat) : lightness + sat - lightness * sat;
  const p = 2 * lightness - q;

  const rgb = [
    hueToRgb(p, q, hue + 1 / 3),
    hueToRgb(p, q, hue),
    hueToRgb(p, q, hue - 1 / 3),
  ].map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function isThemeAwareSemantic(colorClass: string) {
  return colorClass in GENERATED_THEME_SEMANTICS.light;
}

function parseColorClass(colorClass: string) {
  return colorClass.split("/")[0];
}

function getLuminanceForTheme(
  colorClass: string,
  themeMode: "light" | "dark",
): number | null {
  const normalized = parseColorClass(colorClass);

  if (isThemeAwareSemantic(normalized)) {
    return getThemeSemanticLuminance(themeMode, normalized);
  }

  const match = normalized.match(/^([a-z]+)-(\d{2,3})$/);
  if (!match) {
    return hslToLuminance(normalized);
  }

  const family = match[1];
  const shade = match[2];
  if (family === "white") return 1.0;
  if (family === "black") return 0.0;

  const familyLuminance = ACCENT_LUMINANCE[family] ?? TAILWIND_LUMINANCE;
  return familyLuminance[shade] ?? null;
}

/**
 * WCAG 2.0 contrast ratio from two relative luminance values.
 */
function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Extract background/foreground color pairs from a single line of code.
 * Applies interaction-aware fallback so state variants inherit base colors when needed.
 */
type HoverAwareInteractionState =
  | "base"
  | "hover"
  | "active"
  | "focus"
  | "disabled";

const HOVER_FILTER_UTIL_RE =
  /(?:^|\s)(?:[a-z0-9-]+:)*(?:hover|active|focus):(?:backdrop-)?(?:brightness|contrast|saturate|grayscale|sepia|invert|hue-rotate|blur|drop-shadow)-[^\s]+/;

function hasUnsafeHoverFilterClasses(className: string) {
  return HOVER_FILTER_UTIL_RE.test(className);
}

function getInteractionState(variants: string): HoverAwareInteractionState {
  const states = variants
    .split(":")
    .filter(Boolean)
    .map((value) => value.toLowerCase());

  if (states.some((state) => state.includes("hover"))) {
    return "hover";
  }
  if (states.some((state) => state.includes("active"))) {
    return "active";
  }
  if (states.some((state) => state.includes("focus"))) {
    return "focus";
  }
  if (states.some((state) => state.includes("disabled"))) {
    return "disabled";
  }

  return "base";
}

interface StateColorTokens {
  bg: string[];
  fg: string[];
}

function extractColorPairs(
  line: string,
): Array<{ bg: string; fg: string; interaction: HoverAwareInteractionState }> {
  const pairs: Array<{
    bg: string;
    fg: string;
    interaction: HoverAwareInteractionState;
  }> = [];
  const tokensByState: Record<HoverAwareInteractionState, StateColorTokens> = {
    base: { bg: [], fg: [] },
    hover: { bg: [], fg: [] },
    active: { bg: [], fg: [] },
    focus: { bg: [], fg: [] },
    disabled: { bg: [], fg: [] },
  };
  const seen = new Set<string>();
  const classTokenRegex =
    /\b(?:[a-z0-9-]+:)*(bg|text)-([a-z0-9-]+(?:\/[\d.]+)?)\b/g;

  const addPair = (
    interaction: HoverAwareInteractionState,
    bg: string,
    fg: string,
  ) => {
    const key = `${interaction}|${bg}|${fg}`;
    if (seen.has(key)) return;
    seen.add(key);
    pairs.push({ bg, fg, interaction });
  };
  const addCrossProduct = (
    interaction: HoverAwareInteractionState,
    bgValues: string[],
    fgValues: string[],
  ) => {
    for (const bg of bgValues) {
      for (const fg of fgValues) {
        addPair(interaction, bg, fg);
      }
    }
  };

  for (const match of line.matchAll(classTokenRegex)) {
    const [_, type, rawValue] = match;
    const value = parseColorClass(rawValue);
    if (!type || !value || value === "transparent") continue;

    const full = match[0];
    const marker = `${type}-`;
    const markerIndex = full.indexOf(marker);
    const variants = markerIndex === -1 ? "" : full.slice(0, markerIndex);
    const interactionState = getInteractionState(variants);

    if (type === "bg") {
      tokensByState[interactionState].bg.push(value);
    } else {
      tokensByState[interactionState].fg.push(value);
    }
  }

  const baseBg = tokensByState.base.bg;
  const baseFg = tokensByState.base.fg;

  addCrossProduct("base", baseBg, baseFg);

  for (const interaction of ["hover", "active", "focus", "disabled"] as const) {
    const interactionTokens = tokensByState[interaction];
    const effectiveBg =
      interactionTokens.bg.length > 0 ? interactionTokens.bg : baseBg;
    const effectiveFg =
      interactionTokens.fg.length > 0 ? interactionTokens.fg : baseFg;

    if (effectiveBg.length === 0 || effectiveFg.length === 0) continue;
    addCrossProduct(interaction, effectiveBg, effectiveFg);
  }

  return pairs;
}

const WCAG_AA_NORMAL = 4.5;
const WCAG_AA_LARGE = 3.0;

/**
 * Run a contrast audit on generated files.
 * Checks bg/text pairs for WCAG AA compliance.
 */
export function auditContrast(files: GeneratedFile[]): ContrastAuditReport {
  const violations: ContrastViolation[] = [];
  let checkedPairs = 0;
  let passedPairs = 0;

  for (const file of files) {
    if (!file.path.match(/\.(tsx?|jsx?|css)$/)) continue;

    const lines = file.code.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const hasUnscannedHoverFilter = hasUnsafeHoverFilterClasses(line);
      const pairs = extractColorPairs(line);

      if (hasUnscannedHoverFilter) {
        // Advisory only: hard-rejecting filter hovers pushed the model to inject
        // mismatched hover:bg/hover:text pairs (often gray-900) onto secondary
        // CTAs and nav Login buttons that otherwise matched the design.
        violations.push({
          file: file.path,
          line: i + 1,
          background: "hover-state",
          foreground: "hover-state",
          estimatedRatio: 0,
          requiredRatio: WCAG_AA_NORMAL,
          severity: "warning",
          message:
            "State transitions use filter-style utilities (hover/active/focus brightness/contrast/saturate/hue/etc.). Prefer cohesive design-owned hover styles; explicit hover:bg-*/hover:text-* pairs are optional when the resting text color should persist.",
        });
      }

      for (const pair of pairs) {
        const lightBgLum = getLuminanceForTheme(pair.bg, "light");
        const lightFgLum = getLuminanceForTheme(pair.fg, "light");
        const darkBgLum = getLuminanceForTheme(pair.bg, "dark");
        const darkFgLum = getLuminanceForTheme(pair.fg, "dark");
        if (
          lightBgLum === null ||
          lightFgLum === null ||
          darkBgLum === null ||
          darkFgLum === null
        ) {
          continue;
        }

        checkedPairs++;
        const lightRatio = contrastRatio(lightBgLum, lightFgLum);
        const darkRatio = contrastRatio(darkBgLum, darkFgLum);
        const minRatio = Math.min(lightRatio, darkRatio);
        const roundedMinRatio = Math.round(minRatio * 100) / 100;
        const roundedLightRatio = Math.round(lightRatio * 100) / 100;
        const roundedDarkRatio = Math.round(darkRatio * 100) / 100;

        const isStatefulPair = pair.interaction !== "base";
        if (minRatio >= WCAG_AA_NORMAL) {
          passedPairs++;
          continue;
        }

        // Interactive-state contrast is advisory. Hard-failing hover/active/focus
        // pairs caused regenerate loops that injected gray hover:text onto
        // branded secondary CTAs and nav controls.
        if (isStatefulPair) {
          violations.push({
            file: file.path,
            line: i + 1,
            background: pair.bg,
            foreground: pair.fg,
            estimatedRatio: roundedMinRatio,
            requiredRatio: WCAG_AA_NORMAL,
            severity: "warning",
            message: `bg-${pair.bg}/text-${pair.fg} may be low-contrast in the ${pair.interaction} state (${roundedMinRatio}:1). Ratios: light ${roundedLightRatio}:1, dark ${roundedDarkRatio}:1. Keep hover styles consistent with the resting treatment rather than forcing a gray fallback.`,
          });
          continue;
        }

        if (minRatio >= WCAG_AA_LARGE) {
          passedPairs++;
          violations.push({
            file: file.path,
            line: i + 1,
            background: pair.bg,
            foreground: pair.fg,
            estimatedRatio: roundedMinRatio,
            requiredRatio: WCAG_AA_LARGE,
            severity: "warning",
            message: `bg-${pair.bg}/text-${pair.fg} passes large text only in dark/light themes at worst (${roundedMinRatio}:1). Ratios: light ${roundedLightRatio}:1, dark ${roundedDarkRatio}:1.`,
          });
        } else {
          violations.push({
            file: file.path,
            line: i + 1,
            background: pair.bg,
            foreground: pair.fg,
            estimatedRatio: roundedMinRatio,
            requiredRatio: WCAG_AA_NORMAL,
            severity: "error",
            message: `bg-${pair.bg}/text-${pair.fg} fails default state contrast in at least one theme (${roundedMinRatio}:1). Ratios: light ${roundedLightRatio}:1, dark ${roundedDarkRatio}:1. Improve to at least ${WCAG_AA_NORMAL}:1.`,
          });
        }
      }
    }
  }

  const sourceFiles = files.filter((f) => f.path.match(/\.(tsx?|jsx?|css)$/));
  const filesChecked = sourceFiles.length;

  const hasErrors = violations.some((v) => v.severity === "error");
  const hasWarnings = violations.some((v) => v.severity === "warning");

  return {
    violations,
    checkedPairs,
    passedPairs,
    filesChecked,
    status: hasErrors ? "fail" : hasWarnings ? "warning" : "pass",
  };
}

/**
 * Format a contrast audit report as a human-readable string for logging.
 */
export function formatContrastReport(report: ContrastAuditReport): string {
  if (report.violations.length === 0) {
    return `Contrast audit: PASS — ${report.checkedPairs} pairs checked across ${report.filesChecked} files, all passing.`;
  }

  const errorCount = report.violations.filter(
    (v) => v.severity === "error",
  ).length;
  const warningCount = report.violations.filter(
    (v) => v.severity === "warning",
  ).length;

  const lines = [
    `Contrast audit: ${report.status.toUpperCase()} — ${report.checkedPairs} pairs checked, ${report.passedPairs} passed, ${errorCount} errors, ${warningCount} warnings across ${report.filesChecked} files.`,
    "",
    ...report.violations
      .slice(0, 20)
      .map(
        (v) =>
          `  ${v.severity === "error" ? "ERROR" : "WARN"}  ${v.file}:${v.line} — ${v.message}`,
      ),
  ];

  if (report.violations.length > 20) {
    lines.push(`  ... and ${report.violations.length - 20} more violations`);
  }

  return lines.join("\n");
}
