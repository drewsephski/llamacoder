# Generation evaluation harness

This harness compares generated-app candidates against a fixed 24-case corpus. It separates evidence into static validation, requirement coverage, browser interaction, screenshots, independent evaluation, and design fingerprints.

## Run fixture evaluation

Store each raw model response as `<case-id>.txt`, then run:

```bash
pnpm eval:generation --input-dir /absolute/path/to/candidates --prompt-version canary-v1 --model model-id
```

Use `--case workbench-video` for one case. Results are written under `artifacts/generation-evals/<run-id>/`; that directory should remain an uncommitted artifact. Resume a terminal case set with the same inputs using `--run-id <id> --resume`. Existing schema-valid passed/failed cases are skipped; incomplete cases are retried.

## Evidence levels

- Static pass: generated files parse, imports validate, contrast validation passes, all requirement phrases/aliases are present, and no exclusion is detected.
- Runtime pass: the Sandpack/browser adapter reaches a healthy terminal state and the primary interaction succeeds.
- Visual pass: screenshots exist at 1440, 768, 414, 375, and 320 pixels and an independent evaluator returns structured scores.

Every result records separate `static`, `runtime`, `visual`, and `independentEvaluation` stages. Overall `passed` is reserved for results where all four stages pass, the primary interaction succeeds, all five screenshots exist, evaluator scores meet the release threshold, requirements are complete, and exclusions are absent. The fixture runner currently implements only the static layer, so even a static pass remains overall `incomplete`.

Evaluator inputs contain sanitized generated source, per-file hashes and sizes, static diagnostics, coverage evidence, screenshot paths, interaction notes, and reference provenance. Binary/asset files and source files over 200 KB are represented by hash and metadata without inline content. Secret-like assignments are redacted.

## Canary release gate

Compare the candidate prompt version with the current baseline using the same corpus and model/provider version, generation parameters, and sample allocation. Fingerprint similarity is computed only from observed fingerprints; `unknown` values are excluded rather than replaced with corpus expectations.

Minimum guarded-canary gate:

- At least 24 completed candidates per prompt version, including every corpus case, and at least 3 repeated generations for each high-variance marketing/screenshot case before broad rollout.
- Zero P0 runtime/security failures and zero missing must-have or present excluded requirements among accepted candidates.
- Mean independent-evaluator score at least 4.0/5, with no dimension below 3.5 and no individual accepted candidate below 3.0 on any dimension.
- Runtime repair rate may not increase by more than 2 percentage points versus baseline.
- Immediate-redesign rate may not increase and should improve by at least 5% relative before claiming a design-quality win.
- Median generation latency may regress by at most 10%; p95 by at most 15%.
- Mean token cost and provider cost may regress by at most 10% unless acceptance improves by a pre-declared larger margin.
- All five viewports and the primary interaction must pass for every result counted as an overall pass.
