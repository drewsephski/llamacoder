import { z } from "zod";

export const evalSurfaceSchema = z.enum([
  "workbench",
  "focused-utility",
  "marketing",
  "editorial",
  "component-edit",
  "screenshot-inspired",
  "follow-up-redesign",
  "long-context",
]);

export type EvalSurface = z.infer<typeof evalSurfaceSchema>;

export const generationEvalCaseSchema = z.object({
  id: z.string().min(1),
  surface: evalSurfaceSchema,
  prompt: z.string().min(1),
  mustHave: z.array(z.string()).min(1),
  excluded: z.array(z.string()).default([]),
  expectedScope: z.string().min(1),
  expectedMacrostructure: z.string().min(1),
  primaryInteraction: z.string().min(1),
  context: z.array(z.string()).default([]),
  referenceArtifact: z
    .object({
      path: z.string().min(1),
      provenance: z.string().min(1),
    })
    .optional(),
});

export type GenerationEvalCase = z.infer<typeof generationEvalCaseSchema>;

export const evalDimensions = [
  "requirementAdherence",
  "productSurfaceCorrectness",
  "hallmarkStructure",
  "visualHierarchy",
  "subjectSpecificity",
  "restraint",
  "interactionCompleteness",
  "responsiveBehavior",
  "runtimeHealth",
] as const;

export type EvalDimension = (typeof evalDimensions)[number];

export const evaluatorScoresSchema = z.object(
  Object.fromEntries(
    evalDimensions.map((dimension) => [dimension, z.number().min(1).max(5)]),
  ) as Record<EvalDimension, z.ZodNumber>,
);

export type EvaluatorScores = z.infer<typeof evaluatorScoresSchema>;

export const designFingerprintSchema = z.object({
  scope: z.string(),
  macrostructure: z.string(),
  nav: z.string(),
  footer: z.string(),
  paperBand: z.enum(["dark", "mid", "light", "unknown"]),
  displayStyle: z.string(),
  accentHue: z.string(),
  sectionSequence: z.array(z.string()),
});

export type DesignFingerprint = z.infer<typeof designFingerprintSchema>;

export const viewportSchema = z.enum(["1440", "768", "414", "375", "320"]);
export const screenshotPathsSchema = z.object({
  "1440": z.string().optional(),
  "768": z.string().optional(),
  "414": z.string().optional(),
  "375": z.string().optional(),
  "320": z.string().optional(),
});

export const stageStatusSchema = z.enum(["passed", "failed", "incomplete"]);
const evidenceStageSchema = z.object({
  status: stageStatusSchema,
  failures: z.array(z.string()),
});

export const runProvenanceSchema = z.object({
  promptHash: z.string().min(1),
  candidateSourceHash: z.string().nullable(),
  gitSha: z.string().min(1),
  provider: z.string(),
  providerVersion: z.string(),
  generationParameters: z.record(z.string(), z.unknown()),
  tokenUsage: z.object({
    input: z.number().nonnegative().optional(),
    output: z.number().nonnegative().optional(),
    total: z.number().nonnegative().optional(),
    costUsd: z.number().nonnegative().optional(),
  }),
});

export const generationEvalResultSchema = z.object({
  runId: z.string(),
  caseId: z.string(),
  promptVersion: z.string(),
  model: z.string(),
  status: z.enum(["passed", "failed", "incomplete"]),
  stages: z.object({
    static: evidenceStageSchema,
    runtime: evidenceStageSchema,
    visual: evidenceStageSchema,
    independentEvaluation: evidenceStageSchema,
  }),
  generatedAt: z.string(),
  durationMs: z.number().nonnegative(),
  generatedFiles: z.array(z.string()),
  diagnostics: z.array(z.string()),
  requirementCoverage: z.object({
    covered: z.array(z.string()),
    missing: z.array(z.string()),
    excludedPresent: z.array(z.string()),
  }),
  screenshots: screenshotPathsSchema,
  interaction: z.object({
    attempted: z.boolean(),
    passed: z.boolean().nullable(),
    notes: z.array(z.string()),
  }),
  evaluator: z
    .object({
      scores: evaluatorScoresSchema,
      failures: z.array(z.string()),
      repairFiles: z.array(z.string()),
    })
    .nullable(),
  fingerprint: designFingerprintSchema,
  provenance: runProvenanceSchema,
});

export type GenerationEvalResult = z.infer<typeof generationEvalResultSchema>;
