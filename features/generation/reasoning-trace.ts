import type { BundledLanguage } from "shiki";

export type ReasoningCodeLanguage = BundledLanguage | "text";

export type ReasoningTraceSegment =
  | { type: "text"; content: string }
  | { type: "code"; code: string; language: ReasoningCodeLanguage };

const LANGUAGE_ALIASES: Record<string, ReasoningCodeLanguage> = {
  csharp: "csharp",
  cs: "csharp",
  cxx: "cpp",
  docker: "dockerfile",
  gql: "graphql",
  js: "javascript",
  kt: "kotlin",
  md: "markdown",
  py: "python",
  rb: "ruby",
  rs: "rust",
  sh: "bash",
  shell: "bash",
  ts: "typescript",
  txt: "text",
  yml: "yaml",
  zsh: "bash",
};

const SUPPORTED_LANGUAGES = new Set<ReasoningCodeLanguage>([
  "bash",
  "c",
  "cpp",
  "csharp",
  "css",
  "diff",
  "dockerfile",
  "go",
  "graphql",
  "html",
  "java",
  "javascript",
  "json",
  "jsonc",
  "jsx",
  "kotlin",
  "markdown",
  "prisma",
  "python",
  "ruby",
  "rust",
  "scss",
  "sql",
  "svelte",
  "swift",
  "text",
  "tsx",
  "typescript",
  "vue",
  "yaml",
]);

export function normalizeReasoningCodeLanguage(
  tag: string,
): ReasoningCodeLanguage {
  const rawLanguage = tag.match(/^\s*([A-Za-z0-9_+#.-]+)/)?.[1]?.toLowerCase();
  if (!rawLanguage) {
    return "text";
  }

  const language = LANGUAGE_ALIASES[rawLanguage] ?? rawLanguage;
  return SUPPORTED_LANGUAGES.has(language as ReasoningCodeLanguage)
    ? (language as ReasoningCodeLanguage)
    : "text";
}

/**
 * Splits a streaming reasoning trace without waiting for the closing fence.
 * This lets code switch to the richer renderer as soon as the opening fence
 * arrives, then continue updating in place as more tokens stream in.
 */
export function parseReasoningTrace(trace: string): ReasoningTraceSegment[] {
  const segments: ReasoningTraceSegment[] = [];
  const lines = trace.split("\n");
  let textLines: string[] = [];
  let codeLines: string[] = [];
  let codeLanguage: ReasoningCodeLanguage | null = null;

  const flushText = () => {
    const content = textLines.join("\n");
    if (content) {
      segments.push({ type: "text", content });
    }
    textLines = [];
  };

  const flushCode = () => {
    if (codeLanguage) {
      segments.push({
        type: "code",
        code: codeLines.join("\n"),
        language: codeLanguage,
      });
    }
    codeLines = [];
    codeLanguage = null;
  };

  for (const line of lines) {
    const fence = line.match(/^\s*```([^`]*)$/);

    if (fence && codeLanguage === null) {
      flushText();
      codeLanguage = normalizeReasoningCodeLanguage(fence[1]);
    } else if (fence && codeLanguage !== null) {
      flushCode();
    } else if (codeLanguage !== null) {
      codeLines.push(line);
    } else {
      textLines.push(line);
    }
  }

  if (codeLanguage !== null) {
    flushCode();
  } else {
    flushText();
  }

  return segments;
}
