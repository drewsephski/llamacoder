import { describe, expect, it, vi } from "vitest";
import {
  extractUsageFromGenerateTextResponse,
  finalizeGeneratedCodeFromText,
  getCodeGenerationRunFinalizeState,
  mergeGenerationUsage,
  runGeneratedCodePipeline,
} from "@/features/generation/server/code-generation-pipeline";

const completeGeneratedApp = [
  "```tsx{path=App.tsx}",
  'import { Header } from "./components/Header";',
  'import { Footer } from "./components/Footer";',
  "export default function App() { return <><Header /><Footer /></>; }",
  "```",
  "```tsx{path=components/Header.tsx}",
  "export function Header() { return <header />; }",
  "```",
  "```tsx{path=components/Footer.tsx}",
  "export function Footer() { return <footer />; }",
  "```",
].join("\n");

const invalidImportGeneratedApp = [
  "```tsx{path=App.tsx}",
  'import { Footer } from "./components/Footer";',
  'import Header from "./components/Header";',
  "export default function App() { return <><Header /><Footer /></>; }",
  "```",
  "```tsx{path=components/Header.tsx}",
  "export function Header() { return <header />; }",
  "```",
  "```tsx{path=components/Footer.tsx}",
  "export default function Footer() { return <footer />; }",
  "```",
].join("\n");

describe("code generation pipeline", () => {
  it("merges provider usage totals across repair attempts", () => {
    expect(
      mergeGenerationUsage(
        { tokensUsed: 100, providerCostUsd: 0.01 },
        { tokensUsed: 40, providerCostUsd: 0.02, provider: "openrouter" },
      ),
    ).toEqual({
      tokensUsed: 140,
      inputTokens: undefined,
      outputTokens: undefined,
      reasoningTokens: undefined,
      providerCostUsd: 0.03,
      upstreamInferenceCostUsd: undefined,
      provider: "openrouter",
    });
  });

  it("extracts token usage from generateText responses", () => {
    expect(
      extractUsageFromGenerateTextResponse({
        text: "ok",
        usage: { totalTokens: 12, inputTokens: 8, outputTokens: 4 },
      }),
    ).toEqual({
      tokensUsed: 12,
      inputTokens: 8,
      outputTokens: 4,
      reasoningTokens: undefined,
      providerCostUsd: undefined,
      upstreamInferenceCostUsd: undefined,
      provider: undefined,
    });
  });

  it("accepts valid generated code on the first pass", async () => {
    const generate = vi.fn().mockResolvedValue({ text: completeGeneratedApp });

    const result = await runGeneratedCodePipeline({
      generate,
      userContent: "Build a calculator",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.generatedFiles.map((file) => file.path)).toEqual([
        "App.tsx",
        "components/Header.tsx",
        "components/Footer.tsx",
      ]);
      expect(result.content).toContain("```tsx{path=App.tsx}");
    }
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("repairs import/export mismatches before accepting output", async () => {
    const generate = vi
      .fn()
      .mockResolvedValueOnce({ text: invalidImportGeneratedApp })
      .mockResolvedValueOnce({ text: completeGeneratedApp });

    const result = await runGeneratedCodePipeline({
      generate,
      userContent: "Build a calculator",
    });

    expect(result.ok).toBe(true);
    expect(generate).toHaveBeenCalledTimes(2);
    expect(generate.mock.calls[1][0]).toContain(
      'Named import "Footer" from "./components/Footer" is invalid',
    );
  });

  it("rejects unrepairable generated code", async () => {
    const generate = vi
      .fn()
      .mockResolvedValueOnce({ text: invalidImportGeneratedApp })
      .mockResolvedValueOnce({ text: invalidImportGeneratedApp });

    const result = await runGeneratedCodePipeline({
      generate,
      userContent: "Build a calculator",
    });

    expect(result).toMatchObject({
      ok: false,
      error: "UNRUNNABLE_GENERATED_CODE",
    });
  });

  it("finalizes streamed text without calling the model", () => {
    const result = finalizeGeneratedCodeFromText(completeGeneratedApp);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.generatedFiles).toHaveLength(3);
      expect(result.content).toContain("```tsx{path=App.tsx}");
    }
  });

  it("maps validation failures to stream run repair state", () => {
    expect(
      getCodeGenerationRunFinalizeState(invalidImportGeneratedApp),
    ).toEqual({
      status: "recoverable",
      phase: "validation_repair",
      label: "Fixing generated app",
      partialText: invalidImportGeneratedApp,
      errorMessage:
        "The model returned code with import/export issues that could not be repaired automatically. Please retry generation.",
    });
  });

  it("normalizes valid streamed text before save", () => {
    expect(getCodeGenerationRunFinalizeState(completeGeneratedApp)).toEqual({
      status: "recoverable",
      phase: "finalizing",
      label: "Ready to save",
      partialText: expect.stringContaining("```tsx{path=App.tsx}"),
    });
  });

  it("refuses to finalize syntactically valid output truncated by token limits", () => {
    expect(
      getCodeGenerationRunFinalizeState(completeGeneratedApp, "length"),
    ).toEqual({
      status: "recoverable",
      phase: "continuation_required",
      label: "Generation reached the model limit",
      partialText: completeGeneratedApp,
      errorMessage:
        "The model reached its output limit before the app was complete. Continue or retry before saving this version.",
    });
  });
});
