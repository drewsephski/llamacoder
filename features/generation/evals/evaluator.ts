import { createHash } from "node:crypto";

import type { GeneratedFile } from "@/lib/generated-files";
import type {
  DesignFingerprint,
  EvaluatorScores,
  GenerationEvalCase,
} from "@/features/generation/evals/contracts";

const REQUIRED_VIEWPORTS = ["1440", "768", "414", "375", "320"] as const;

export function deriveOverallEvalStatus(input: {
  stages: Record<
    "static" | "runtime" | "visual" | "independentEvaluation",
    { status: "passed" | "failed" | "incomplete" }
  >;
  missingRequirements: readonly string[];
  excludedPresent: readonly string[];
  screenshots: Partial<Record<(typeof REQUIRED_VIEWPORTS)[number], string>>;
  interactionPassed: boolean | null;
  evaluatorScores: EvaluatorScores | null;
}): "passed" | "failed" | "incomplete" {
  if (Object.values(input.stages).some((stage) => stage.status === "failed")) {
    return "failed";
  }
  if (
    Object.values(input.stages).some((stage) => stage.status === "incomplete")
  ) {
    return "incomplete";
  }
  if (
    input.missingRequirements.length > 0 ||
    input.excludedPresent.length > 0
  ) {
    return "failed";
  }
  const scores = input.evaluatorScores
    ? Object.values(input.evaluatorScores)
    : [];
  const evaluatorPasses =
    scores.length > 0 &&
    scores.every((score) => score >= 3.5) &&
    scores.reduce((sum, score) => sum + score, 0) / scores.length >= 4;
  const complete =
    Object.values(input.stages).every((stage) => stage.status === "passed") &&
    REQUIRED_VIEWPORTS.every((viewport) =>
      Boolean(input.screenshots[viewport]),
    ) &&
    input.interactionPassed === true &&
    evaluatorPasses;
  return complete ? "passed" : "incomplete";
}

function sourceText(files: readonly GeneratedFile[]): string {
  return files
    .map((file) => `${file.path}\n${file.code}`)
    .join("\n")
    .toLowerCase();
}

function terms(value: string): string[] {
  return value.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

function mentions(source: string, requirement: string): boolean {
  const meaningful = terms(requirement).filter((term) => term.length >= 4);
  return (
    meaningful.length > 0 && meaningful.every((term) => source.includes(term))
  );
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

const MAX_EVALUATOR_FILE_CHARS = 200_000;
const OMITTED_SOURCE_EXTENSIONS =
  /\.(?:png|jpe?g|gif|webp|svg|ico|woff2?|ttf|otf|mp4|webm|mp3|wav|pdf)$/i;
const SECRET_ASSIGNMENT =
  /\b(api[_-]?key|secret|token|password)\b\s*[:=]\s*["'][^"']+["']/gi;

export function buildSanitizedSourceEvidence(files: readonly GeneratedFile[]) {
  return files.map((file) => {
    const omitted =
      OMITTED_SOURCE_EXTENSIONS.test(file.path) ||
      file.code.length > MAX_EVALUATOR_FILE_CHARS;
    const content = omitted
      ? null
      : file.code.replace(SECRET_ASSIGNMENT, '$1="[REDACTED]"');
    return {
      path: file.path,
      sha256: sha256(file.code),
      bytes: Buffer.byteLength(file.code, "utf8"),
      omitted,
      omissionReason: omitted
        ? OMITTED_SOURCE_EXTENSIONS.test(file.path)
          ? "binary-or-asset-extension"
          : "source-too-large"
        : null,
      content,
    };
  });
}

export function evaluateSourceCoverage(
  testCase: GenerationEvalCase,
  files: readonly GeneratedFile[],
) {
  const source = sourceText(files);
  const covered = testCase.mustHave.filter((item) => mentions(source, item));
  const missing = testCase.mustHave.filter((item) => !covered.includes(item));
  const excludedPresent = testCase.excluded.filter((item) =>
    mentions(source, item),
  );
  return { covered, missing, excludedPresent };
}

export function inferDesignFingerprint(
  files: readonly GeneratedFile[],
): DesignFingerprint {
  const source = sourceText(files);
  const sectionSequence = Array.from(
    source.matchAll(
      /<(?:section|header|main|footer)[^>]*(?:id|data-section)=["']([^"']+)/g,
    ),
    (match) => match[1]!,
  ).slice(0, 12);
  const darkSignals = (
    source.match(/bg-(?:neutral|zinc|stone)-(?:8|9)\d\d/g) ?? []
  ).length;
  const lightSignals = (source.match(/bg-(?:white|neutral-50|stone-50)/g) ?? [])
    .length;
  const hasWorkbenchRegions =
    /\b(?:workbench|toolbar|inspector|timeline|canvas|side(?:bar|rail)|data-region=["'](?:toolbar|inspector|canvas))\b/.test(
      source,
    );
  const hasArticleStructure = /<article\b|table of contents|\bcolophon\b/.test(
    source,
  );
  const hasMarketingStructure =
    /\b(?:hero|pricing|testimonial|waitlist|contact sales|start trial)\b/.test(
      source,
    );
  const scope = hasWorkbenchRegions
    ? "product-workbench"
    : hasArticleStructure
      ? "editorial"
      : hasMarketingStructure
        ? "marketing"
        : "unknown";
  const macrostructure = hasWorkbenchRegions
    ? "Workbench"
    : hasArticleStructure
      ? "Long Document"
      : hasMarketingStructure
        ? "Marquee Hero or marketing-unknown"
        : "unknown";

  return {
    scope,
    macrostructure,
    nav: /<nav\b/.test(source) ? "present" : "none",
    footer: /<footer\b/.test(source) ? "present" : "none",
    paperBand:
      darkSignals > lightSignals
        ? "dark"
        : lightSignals > 0
          ? "light"
          : "unknown",
    displayStyle: /font-mono/.test(source)
      ? "mono"
      : /font-serif/.test(source)
        ? "serif"
        : "sans-or-unknown",
    accentHue:
      source.match(
        /(?:text|bg|border)-(blue|cyan|teal|emerald|red|orange|amber|rose|purple|violet)-/,
      )?.[1] ?? "neutral-or-unknown",
    sectionSequence,
  };
}

export function compareObservedFingerprints(
  left: DesignFingerprint,
  right: DesignFingerprint,
): number | null {
  const comparablePairs = [
    [left.scope, right.scope],
    [left.macrostructure, right.macrostructure],
    [left.nav, right.nav],
    [left.footer, right.footer],
    [left.paperBand, right.paperBand],
    [left.displayStyle, right.displayStyle],
    [left.accentHue, right.accentHue],
  ].filter(
    ([a, b]) =>
      !a.includes("unknown") &&
      !b.includes("unknown") &&
      a !== "none" &&
      b !== "none",
  );
  const leftSections = new Set(left.sectionSequence);
  const rightSections = new Set(right.sectionSequence);
  const sectionUnion = new Set([...leftSections, ...rightSections]);
  const sectionScore =
    sectionUnion.size > 0
      ? [...leftSections].filter((section) => rightSections.has(section))
          .length / sectionUnion.size
      : null;
  const scores: number[] = comparablePairs.map(([a, b]) => (a === b ? 1 : 0));
  if (sectionScore !== null) scores.push(sectionScore);
  if (scores.length === 0) return null;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function buildIndependentEvaluatorInput(input: {
  testCase: GenerationEvalCase;
  generatedFiles: readonly GeneratedFile[];
  screenshotPaths: Partial<
    Record<"1440" | "768" | "414" | "375" | "320", string>
  >;
  interactionNotes: readonly string[];
  staticDiagnostics: readonly string[];
  requirementCoverage: {
    covered: readonly string[];
    missing: readonly string[];
    excludedPresent: readonly string[];
  };
}) {
  const sourceEvidence = buildSanitizedSourceEvidence(input.generatedFiles);
  return {
    originalRequest: input.testCase.prompt,
    context: input.testCase.context,
    acceptance: {
      mustHave: input.testCase.mustHave,
      excluded: input.testCase.excluded,
      expectedScope: input.testCase.expectedScope,
      expectedMacrostructure: input.testCase.expectedMacrostructure,
      primaryInteraction: input.testCase.primaryInteraction,
      referenceArtifact: input.testCase.referenceArtifact ?? null,
    },
    generatedManifest: sourceEvidence.map(
      ({ path, sha256, bytes, omitted }) => ({
        path,
        sha256,
        bytes,
        omitted,
      }),
    ),
    generatedSourceEvidence: sourceEvidence,
    staticDiagnostics: input.staticDiagnostics,
    requirementCoverage: input.requirementCoverage,
    screenshots: input.screenshotPaths,
    interactionNotes: input.interactionNotes,
    instruction:
      "Evaluate independently from the generator. Score each dimension 1-5, list observable failures, and name only files that a targeted repair may change. Do not infer visual quality without screenshots.",
  };
}
