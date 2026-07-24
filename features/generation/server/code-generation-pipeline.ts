import {
  auditContrast,
  type ContrastViolation,
} from "@/features/generation/contrast-audit";
import {
  extractDesignScores,
  type DesignScores,
} from "@/features/generation/design-quality-scoring";
import {
  buildGeneratedFilesRepairPrompt,
  formatGeneratedFilesMarkdown,
  normalizeGeneratedFiles,
  validateGeneratedFiles,
  type GeneratedFile,
  type GeneratedFileDiagnostic,
} from "@/lib/generated-files";
import { getOpenRouterUsageMetadata } from "@/lib/openrouter";
import { extractAllCodeBlocks } from "@/lib/utils";

export type GenerationUsageTotals = {
  tokensUsed?: number;
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  providerCostUsd?: number;
  upstreamInferenceCostUsd?: number;
  provider?: string;
};

export type GenerateTextLikeResponse = {
  text: string;
  usage?: {
    totalTokens?: unknown;
    inputTokens?: unknown;
    promptTokens?: unknown;
    outputTokens?: unknown;
    completionTokens?: unknown;
    outputTokenDetails?: { reasoningTokens?: unknown };
  };
  providerMetadata?: unknown;
};

export type GeneratedCodePipelineSuccess = {
  ok: true;
  generatedText: string;
  generatedFiles: GeneratedFile[];
  content: string;
  designScores: DesignScores | null;
  usage: GenerationUsageTotals;
};

export type GeneratedCodePipelineFailure = {
  ok: false;
  error:
    | "EMPTY_MODEL_RESPONSE"
    | "UNRUNNABLE_GENERATED_CODE"
    | "CONTRAST_VIOLATION";
  message: string;
  diagnostics?: GeneratedFileDiagnostic[];
  violations?: ContrastViolation[];
};

export type GeneratedCodePipelineResult =
  | GeneratedCodePipelineSuccess
  | GeneratedCodePipelineFailure;

export function extractUsageFromGenerateTextResponse(
  response: GenerateTextLikeResponse,
): GenerationUsageTotals {
  const usage = response.usage;
  const providerUsage = getOpenRouterUsageMetadata(response.providerMetadata);

  return {
    tokensUsed:
      providerUsage?.totalTokens ??
      (typeof usage?.totalTokens === "number" ? usage.totalTokens : undefined),
    inputTokens:
      providerUsage?.inputTokens ??
      (typeof usage?.inputTokens === "number"
        ? usage.inputTokens
        : typeof usage?.promptTokens === "number"
          ? usage.promptTokens
          : undefined),
    outputTokens:
      providerUsage?.outputTokens ??
      (typeof usage?.outputTokens === "number"
        ? usage.outputTokens
        : typeof usage?.completionTokens === "number"
          ? usage.completionTokens
          : undefined),
    reasoningTokens: providerUsage?.reasoningTokens,
    providerCostUsd: providerUsage?.providerCostUsd,
    upstreamInferenceCostUsd: providerUsage?.upstreamInferenceCostUsd,
    provider: providerUsage?.provider,
  };
}

export function mergeGenerationUsage(
  base: GenerationUsageTotals,
  addition: GenerationUsageTotals,
): GenerationUsageTotals {
  return {
    tokensUsed: sumOptional(base.tokensUsed, addition.tokensUsed),
    inputTokens: sumOptional(base.inputTokens, addition.inputTokens),
    outputTokens: sumOptional(base.outputTokens, addition.outputTokens),
    reasoningTokens: sumOptional(
      base.reasoningTokens,
      addition.reasoningTokens,
    ),
    providerCostUsd: sumOptional(
      base.providerCostUsd,
      addition.providerCostUsd,
    ),
    upstreamInferenceCostUsd: sumOptional(
      base.upstreamInferenceCostUsd,
      addition.upstreamInferenceCostUsd,
    ),
    provider: addition.provider ?? base.provider,
  };
}

function sumOptional(left?: number, right?: number) {
  if (left === undefined && right === undefined) return undefined;
  return (left ?? 0) + (right ?? 0);
}

function parseGeneratedOutput(text: string) {
  const generatedFiles = normalizeGeneratedFiles(extractAllCodeBlocks(text));
  const content = generatedFiles.length
    ? formatGeneratedFilesMarkdown(generatedFiles)
    : text;

  return { generatedFiles, content };
}

export function finalizeGeneratedCodeFromText(
  text: string,
): GeneratedCodePipelineResult {
  if (!text.trim()) {
    return {
      ok: false,
      error: "EMPTY_MODEL_RESPONSE",
      message: "The model returned an empty response. Please retry.",
    };
  }

  const parsed = parseGeneratedOutput(text);
  const diagnostics = validateGeneratedFiles(parsed.generatedFiles);

  if (!parsed.content.trim()) {
    return {
      ok: false,
      error: "EMPTY_MODEL_RESPONSE",
      message: "The model returned an empty response. Please retry.",
    };
  }

  if (diagnostics.length > 0) {
    return {
      ok: false,
      error: "UNRUNNABLE_GENERATED_CODE",
      message:
        "The model returned code with import/export issues that could not be repaired automatically. Please retry generation.",
      diagnostics,
    };
  }

  const contrastReport = auditContrast(parsed.generatedFiles);
  const designScores = extractDesignScores(text);

  if (
    contrastReport.violations.some(
      (violation) => violation.severity === "error",
    )
  ) {
    return {
      ok: false,
      error: "CONTRAST_VIOLATION",
      message:
        "Generated app contrast issues are likely to reduce text visibility in a theme. Please regenerate.",
      violations: contrastReport.violations,
    };
  }

  return {
    ok: true,
    generatedText: text,
    generatedFiles: parsed.generatedFiles,
    content: parsed.content,
    designScores,
    usage: {},
  };
}

export function getCodeGenerationRunFinalizeState(text: string): {
  status: "recoverable" | "failed";
  phase: string;
  label: string;
  partialText: string;
  errorMessage?: string;
  completedAt?: Date;
} {
  if (!text.trim()) {
    return {
      status: "failed",
      phase: "finalizing",
      label: "Generation failed",
      partialText: text,
      errorMessage: "The model returned an empty response. Please retry.",
      completedAt: new Date(),
    };
  }

  const finalized = finalizeGeneratedCodeFromText(text);
  if (finalized.ok) {
    return {
      status: "recoverable",
      phase: "finalizing",
      label: "Ready to save",
      partialText: finalized.content,
    };
  }

  if (finalized.error === "UNRUNNABLE_GENERATED_CODE") {
    return {
      status: "recoverable",
      phase: "validation_repair",
      label: "Fixing generated app",
      partialText: text,
      errorMessage: finalized.message,
    };
  }

  if (finalized.error === "CONTRAST_VIOLATION") {
    return {
      status: "recoverable",
      phase: "finalizing",
      label: "Ready to save",
      partialText: text,
      errorMessage: finalized.message,
    };
  }

  return {
    status: "failed",
    phase: "finalizing",
    label: "Generation failed",
    partialText: text,
    errorMessage: finalized.message,
    completedAt: new Date(),
  };
}

export async function runGeneratedCodePipeline({
  generate,
  userContent,
  allowRepair = true,
}: {
  generate: (userContent: string) => Promise<GenerateTextLikeResponse>;
  userContent: string;
  allowRepair?: boolean;
}): Promise<GeneratedCodePipelineResult> {
  const initialResponse = await generate(userContent);

  if (!initialResponse.text.trim()) {
    return {
      ok: false,
      error: "EMPTY_MODEL_RESPONSE",
      message: "The model returned an empty response. Please retry.",
    };
  }

  let generatedText = initialResponse.text;
  let usage = extractUsageFromGenerateTextResponse(initialResponse);
  let parsed = parseGeneratedOutput(generatedText);
  let diagnostics = validateGeneratedFiles(parsed.generatedFiles);

  if (allowRepair && diagnostics.length > 0) {
    const repairResponse = await generate(
      buildGeneratedFilesRepairPrompt(
        generatedText,
        parsed.generatedFiles,
        diagnostics,
      ),
    );
    usage = mergeGenerationUsage(
      usage,
      extractUsageFromGenerateTextResponse(repairResponse),
    );

    const repairedParsed = parseGeneratedOutput(repairResponse.text);
    const repairedDiagnostics = validateGeneratedFiles(
      repairedParsed.generatedFiles,
    );

    if (repairResponse.text.trim() && repairedDiagnostics.length === 0) {
      generatedText = repairResponse.text;
      parsed = repairedParsed;
      diagnostics = repairedDiagnostics;
    }
  }

  const finalized = finalizeGeneratedCodeFromText(generatedText);
  if (!finalized.ok) {
    return finalized;
  }

  return {
    ...finalized,
    generatedText,
    usage,
  };
}
