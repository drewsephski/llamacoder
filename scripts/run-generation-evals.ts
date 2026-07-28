import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { generationEvalCorpus } from "@/features/generation/evals/corpus";
import {
  generationEvalResultSchema,
  type GenerationEvalResult,
} from "@/features/generation/evals/contracts";
import {
  buildIndependentEvaluatorInput,
  deriveOverallEvalStatus,
  evaluateSourceCoverage,
  inferDesignFingerprint,
  sha256,
} from "@/features/generation/evals/evaluator";
import { finalizeGeneratedCodeFromText } from "@/features/generation/server/code-generation-pipeline";

type RunOptions = {
  inputDir: string;
  outputRoot: string;
  promptVersion: string;
  model: string;
  provider?: string;
  providerVersion?: string;
  generationParameters?: Record<string, unknown>;
  runId?: string;
  resume?: boolean;
  selectedCase?: string;
};

function option(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function writeJsonAtomic(target: string, value: unknown) {
  const temporary = `${target}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temporary, target);
}

async function readExistingResult(target: string) {
  try {
    return generationEvalResultSchema.parse(
      JSON.parse(await readFile(target, "utf8")),
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw new Error(`Invalid existing eval result ${target}: ${String(error)}`);
  }
}

function currentGitSha(): string {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim();
  } catch {
    return "unknown";
  }
}

export async function runGenerationEvals(options: RunOptions) {
  const runId = options.runId ?? new Date().toISOString().replace(/[:.]/g, "-");
  const runDir = path.resolve(options.outputRoot, runId);
  await mkdir(runDir, { recursive: true });
  const cases = options.selectedCase
    ? generationEvalCorpus.filter(
        (testCase) => testCase.id === options.selectedCase,
      )
    : generationEvalCorpus;
  if (cases.length === 0)
    throw new Error(`Unknown eval case: ${options.selectedCase}`);

  const results: GenerationEvalResult[] = [];
  for (const testCase of cases) {
    const resultPath = path.join(runDir, `${testCase.id}.json`);
    if (options.resume) {
      const existing = await readExistingResult(resultPath);
      if (existing && existing.status !== "incomplete") {
        results.push(existing);
        continue;
      }
    }

    const startedAt = Date.now();
    const candidatePath = path.resolve(options.inputDir, `${testCase.id}.txt`);
    let candidate = "";
    try {
      candidate = await readFile(candidatePath, "utf8");
    } catch {
      // Missing fixtures are incomplete evidence, not failed generations.
    }
    const finalized = candidate
      ? finalizeGeneratedCodeFromText(candidate)
      : null;
    const files = finalized?.ok ? finalized.generatedFiles : [];
    const diagnostics =
      finalized && !finalized.ok
        ? [
            finalized.message,
            ...(finalized.diagnostics?.map((item) => item.message) ?? []),
          ]
        : candidate
          ? []
          : [`Missing candidate fixture: ${candidatePath}`];
    const requirementCoverage = evaluateSourceCoverage(testCase, files);
    const staticFailures = [
      ...diagnostics,
      ...requirementCoverage.missing.map(
        (item) => `Missing requirement: ${item}`,
      ),
      ...requirementCoverage.excludedPresent.map(
        (item) => `Excluded behavior present: ${item}`,
      ),
    ];
    const staticStatus: "passed" | "failed" | "incomplete" = !candidate
      ? "incomplete"
      : finalized?.ok && staticFailures.length === 0
        ? "passed"
        : "failed";
    const stages = {
      static: { status: staticStatus, failures: staticFailures },
      runtime: {
        status: "incomplete" as const,
        failures: ["Browser runtime adapter not run."],
      },
      visual: {
        status: "incomplete" as const,
        failures: [
          "Missing screenshots at 1440, 768, 414, 375, and 320 pixels.",
        ],
      },
      independentEvaluation: {
        status: "incomplete" as const,
        failures: ["Independent evaluator not run."],
      },
    };
    const screenshots = {};
    const interactionPassed = null;
    const evaluator = null;
    const result = generationEvalResultSchema.parse({
      runId,
      caseId: testCase.id,
      promptVersion: options.promptVersion,
      model: options.model,
      status: deriveOverallEvalStatus({
        stages,
        missingRequirements: requirementCoverage.missing,
        excludedPresent: requirementCoverage.excludedPresent,
        screenshots,
        interactionPassed,
        evaluatorScores: null,
      }),
      stages,
      generatedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      generatedFiles: files.map((file) => file.path),
      diagnostics,
      requirementCoverage,
      screenshots,
      interaction: {
        attempted: false,
        passed: interactionPassed,
        notes: ["Browser interaction adapter not run."],
      },
      evaluator,
      fingerprint: inferDesignFingerprint(files),
      provenance: {
        promptHash: sha256(JSON.stringify(testCase)),
        candidateSourceHash: candidate ? sha256(candidate) : null,
        gitSha: currentGitSha(),
        provider: options.provider ?? "fixture",
        providerVersion: options.providerVersion ?? "unknown",
        generationParameters: options.generationParameters ?? {},
        tokenUsage: {},
      },
    });
    results.push(result);
    await writeJsonAtomic(resultPath, result);
    await writeJsonAtomic(
      path.join(runDir, `${testCase.id}.evaluator-input.json`),
      buildIndependentEvaluatorInput({
        testCase,
        generatedFiles: files,
        screenshotPaths: {},
        interactionNotes: result.interaction.notes,
        staticDiagnostics: diagnostics,
        requirementCoverage,
      }),
    );
  }

  const summary = {
    runId,
    promptVersion: options.promptVersion,
    model: options.model,
    total: results.length,
    passed: results.filter((result) => result.status === "passed").length,
    failed: results.filter((result) => result.status === "failed").length,
    incomplete: results.filter((result) => result.status === "incomplete")
      .length,
    cases: results.map((result) => ({
      caseId: result.caseId,
      status: result.status,
      stages: Object.fromEntries(
        Object.entries(result.stages).map(([name, stage]) => [
          name,
          stage.status,
        ]),
      ),
    })),
  };
  await writeJsonAtomic(path.join(runDir, "summary.json"), summary);
  return { runDir, ...summary };
}

async function main() {
  const inputDir = option("--input-dir");
  if (!inputDir) {
    throw new Error(
      "Missing --input-dir. Provide model outputs as <case-id>.txt files.",
    );
  }
  const parameters = option("--generation-parameters");
  const result = await runGenerationEvals({
    inputDir,
    outputRoot: option("--output-dir") ?? "artifacts/generation-evals",
    promptVersion: option("--prompt-version") ?? "working-tree",
    model: option("--model") ?? "fixture",
    provider: option("--provider"),
    providerVersion: option("--provider-version"),
    generationParameters: parameters
      ? (JSON.parse(parameters) as Record<string, unknown>)
      : {},
    runId: option("--run-id"),
    resume: process.argv.includes("--resume"),
    selectedCase: option("--case"),
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
