import type { GeneratedFile } from "@/lib/generated-files";

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

/**
 * Approximate relative luminance for a Tailwind color class like "neutral-500".
 * Falls back to neutral scale for unknown families.
 */
function getLuminance(colorClass: string): number | null {
  const match = colorClass.match(/^(\w+)-(\d{2,3})$/);
  if (!match) return null;

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
 * Matches patterns like: bg-neutral-950 text-neutral-50, bg-white text-black, etc.
 */
function extractColorPairs(line: string): Array<{ bg: string; fg: string }> {
  const pairs: Array<{ bg: string; fg: string }> = [];

  const bgClasses =
    line.match(/\b(bg-(?:\w+)-\d{2,3}|bg-white|bg-black|bg-transparent)\b/g) ??
    [];
  const textClasses =
    line.match(/\b(text-(?:\w+)-\d{2,3}|text-white|text-black)\b/g) ?? [];

  for (const bg of bgClasses) {
    const bgValue = bg.replace("bg-", "");
    if (bgValue === "transparent") continue;

    for (const text of textClasses) {
      const fgValue = text.replace("text-", "");
      pairs.push({ bg: bgValue, fg: fgValue });
    }
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
      const pairs = extractColorPairs(line);

      for (const pair of pairs) {
        const bgLum = getLuminance(pair.bg);
        const fgLum = getLuminance(pair.fg);
        if (bgLum === null || fgLum === null) continue;

        checkedPairs++;
        const ratio = contrastRatio(bgLum, fgLum);
        const roundedRatio = Math.round(ratio * 100) / 100;

        if (ratio >= WCAG_AA_NORMAL) {
          passedPairs++;
          continue;
        }

        if (ratio >= WCAG_AA_LARGE) {
          passedPairs++;
          violations.push({
            file: file.path,
            line: i + 1,
            background: pair.bg,
            foreground: pair.fg,
            estimatedRatio: roundedRatio,
            requiredRatio: WCAG_AA_LARGE,
            severity: "warning",
            message: `bg-${pair.bg}/text-${pair.fg} passes large text only (${roundedRatio}:1). Normal text requires ${WCAG_AA_NORMAL}:1.`,
          });
        } else {
          violations.push({
            file: file.path,
            line: i + 1,
            background: pair.bg,
            foreground: pair.fg,
            estimatedRatio: roundedRatio,
            requiredRatio: WCAG_AA_NORMAL,
            severity: "error",
            message: `bg-${pair.bg}/text-${pair.fg} fails WCAG AA (${roundedRatio}:1 < ${WCAG_AA_NORMAL}:1).`,
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
