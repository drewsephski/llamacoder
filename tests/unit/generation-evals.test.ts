import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { generationEvalCorpus } from "@/features/generation/evals/corpus";
import {
  buildIndependentEvaluatorInput,
  compareObservedFingerprints,
  deriveOverallEvalStatus,
  evaluateSourceCoverage,
  inferDesignFingerprint,
} from "@/features/generation/evals/evaluator";
import type { GeneratedFile } from "@/lib/generated-files";
import { runGenerationEvals } from "@/scripts/run-generation-evals";

const files: GeneratedFile[] = [
  {
    path: "App.tsx",
    language: "tsx",
    code: `export default function App() { return <main className="bg-neutral-950 text-emerald-400 font-mono"><nav>Tools</nav><section id="timeline"><button>Approve clip</button></section></main> }`,
  },
];

describe("generation eval harness", () => {
  it("ships the requested 24-case surface distribution", () => {
    expect(generationEvalCorpus).toHaveLength(24);
    const counts = Object.fromEntries(
      Array.from(new Set(generationEvalCorpus.map((item) => item.surface))).map(
        (surface) => [
          surface,
          generationEvalCorpus.filter((item) => item.surface === surface)
            .length,
        ],
      ),
    );
    expect(counts).toEqual({
      workbench: 4,
      "focused-utility": 4,
      marketing: 4,
      editorial: 3,
      "component-edit": 3,
      "screenshot-inspired": 2,
      "follow-up-redesign": 2,
      "long-context": 2,
    });
    expect(
      generationEvalCorpus
        .filter((item) => item.surface === "screenshot-inspired")
        .every(
          (item) =>
            item.referenceArtifact?.path && item.referenceArtifact.provenance,
        ),
    ).toBe(true);
  });

  it("reports source-grounded coverage without pretending it is visual proof", () => {
    const testCase = generationEvalCorpus[0]!;
    const coverage = evaluateSourceCoverage(testCase, files);
    expect(coverage.covered).toContain("timeline");
    expect(coverage.covered).toContain("approve");
    expect(coverage.missing).toContain("preview");

    const fingerprint = inferDesignFingerprint(files);
    expect(fingerprint.scope).toBe("product-workbench");
    expect(fingerprint.paperBand).toBe("dark");
    expect(fingerprint.displayStyle).toBe("mono");
    expect(fingerprint.sectionSequence).toEqual(["timeline"]);

    const evaluatorInput = buildIndependentEvaluatorInput({
      testCase,
      generatedFiles: files,
      screenshotPaths: {},
      interactionNotes: [],
      staticDiagnostics: [],
      requirementCoverage: coverage,
    });
    expect(evaluatorInput.instruction).toContain(
      "Do not infer visual quality without screenshots",
    );
    expect(evaluatorInput.generatedSourceEvidence[0]).toEqual(
      expect.objectContaining({
        path: "App.tsx",
        omitted: false,
        content: expect.stringContaining("Approve clip"),
        sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      }),
    );
  });

  it("infers observed structure instead of copying corpus expectations", () => {
    const marketingFiles: GeneratedFile[] = [
      {
        path: "App.tsx",
        language: "tsx",
        code: `export default function App() { return <main><section id="hero"><h1>Start trial</h1><section id="pricing">Pricing</section></section></main> }`,
      },
    ];
    const fingerprint = inferDesignFingerprint(marketingFiles);
    expect(fingerprint.scope).toBe("marketing");
    expect(fingerprint.scope).not.toBe(generationEvalCorpus[0]!.expectedScope);
    expect(compareObservedFingerprints(fingerprint, fingerprint)).toBe(1);
  });

  it("requires every evidence stage before an overall pass", () => {
    const scores = {
      requirementAdherence: 4,
      productSurfaceCorrectness: 4,
      hallmarkStructure: 4,
      visualHierarchy: 4,
      subjectSpecificity: 4,
      restraint: 4,
      interactionCompleteness: 4,
      responsiveBehavior: 4,
      runtimeHealth: 4,
    } as const;
    const passedStages = {
      static: { status: "passed" as const },
      runtime: { status: "passed" as const },
      visual: { status: "passed" as const },
      independentEvaluation: { status: "passed" as const },
    };
    expect(
      deriveOverallEvalStatus({
        stages: passedStages,
        missingRequirements: [],
        excludedPresent: [],
        screenshots: {},
        interactionPassed: true,
        evaluatorScores: scores,
      }),
    ).toBe("incomplete");
    expect(
      deriveOverallEvalStatus({
        stages: passedStages,
        missingRequirements: [],
        excludedPresent: [],
        screenshots: {
          "1440": "a.png",
          "768": "b.png",
          "414": "c.png",
          "375": "d.png",
          "320": "e.png",
        },
        interactionPassed: true,
        evaluatorScores: scores,
      }),
    ).toBe("passed");
  });

  it("keeps fixture evidence incomplete, fails exclusions, and preserves missing fixtures", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "generation-evals-"));
    const inputDir = path.join(root, "inputs");
    const outputRoot = path.join(root, "outputs");
    await mkdir(inputDir, { recursive: true });
    await writeFile(
      path.join(inputDir, "workbench-video.txt"),
      [
        "```tsx{path=App.tsx}",
        "export default function App() { return <main><div>timeline preview inspector</div><button>Approve</button></main> }",
        "```",
      ].join("\n"),
    );
    const staticOnly = await runGenerationEvals({
      inputDir,
      outputRoot,
      promptVersion: "test",
      model: "fixture",
      runId: "static-only",
      selectedCase: "workbench-video",
    });
    const staticResult = JSON.parse(
      await readFile(
        path.join(staticOnly.runDir, "workbench-video.json"),
        "utf8",
      ),
    );
    expect(staticResult.stages.static.status).toBe("passed");
    expect(staticResult.status).toBe("incomplete");

    await writeFile(
      path.join(inputDir, "marketing-devtool.txt"),
      [
        "```tsx{path=App.tsx}",
        "export default function App() { return <main>installation workflow technical fabricated metrics</main> }",
        "```",
      ].join("\n"),
    );
    const excluded = await runGenerationEvals({
      inputDir,
      outputRoot,
      promptVersion: "test",
      model: "fixture",
      runId: "excluded",
      selectedCase: "marketing-devtool",
    });
    const excludedResult = JSON.parse(
      await readFile(
        path.join(excluded.runDir, "marketing-devtool.json"),
        "utf8",
      ),
    );
    expect(excludedResult.status).toBe("failed");
    expect(excludedResult.requirementCoverage.excludedPresent).toEqual([
      "fabricated metrics",
    ]);
    const excludedGeneratedAt = excludedResult.generatedAt;
    await writeFile(
      path.join(inputDir, "marketing-devtool.txt"),
      "```tsx{path=App.tsx}\nexport default function App(){return <main>changed</main>}\n```",
    );
    await runGenerationEvals({
      inputDir,
      outputRoot,
      promptVersion: "test",
      model: "fixture",
      runId: "excluded",
      selectedCase: "marketing-devtool",
      resume: true,
    });
    const resumedResult = JSON.parse(
      await readFile(
        path.join(excluded.runDir, "marketing-devtool.json"),
        "utf8",
      ),
    );
    expect(resumedResult.generatedAt).toBe(excludedGeneratedAt);

    const missing = await runGenerationEvals({
      inputDir,
      outputRoot,
      promptVersion: "test",
      model: "fixture",
      runId: "missing",
      selectedCase: "utility-json",
    });
    const missingResult = JSON.parse(
      await readFile(path.join(missing.runDir, "utility-json.json"), "utf8"),
    );
    expect(missingResult.status).toBe("incomplete");
    expect(missingResult.stages.static.status).toBe("incomplete");
  });
});
