export type ResearchIntent = {
  required: boolean;
  explicitlyRequested: boolean;
  query: string | null;
};

const EXPLICIT_RESEARCH_PATTERNS = [
  /\b(?:web|internet|online)\s+(?:search|research)\b/i,
  /\b(?:use|do|run)\s+(?:a\s+)?(?:web|internet|online)\s*(?:search|research)?\b/i,
  /\bsearch\s+(?:the\s+)?(?:web|internet|online)\b/i,
  /\b(?:browse|research)\s+(?:the\s+)?(?:web|internet|online)\b/i,
  /\blook\s+(?:it|this|that|them|those|the\s+\w+(?:\s+\w+)?)\s+up\b/i,
];

const CURRENT_FACT_PATTERNS = [
  /\b(?:current|latest|live|today(?:'s)?|up[- ]to[- ]date|most recent)\s+(?:(?:official|UFC|fighter|team|league|product|API)\s+){0,2}(?:rankings?|standings?|scores?|results?|schedule|roster|lineup|stats?|statistics|records?|prices?|pricing|rates?|odds|news|weather|forecast|laws?|regulations?|rules?|versions?|documentation|docs)\b/i,
  /\b(?:rankings?|standings?|scores?|results?|schedule|roster|lineup|odds)\s+(?:right now|today|this (?:week|month|season|year)|for\s+20\d{2})\b/i,
  /\b(?:actual|real|official)\s+(?:UFC\s+)?(?:rankings?|standings?|scores?|results?|schedule|roster|lineup|stats?|records?|prices?|pricing|odds|data)\b/i,
  /\b(?:stock|share|crypto|bitcoin|ethereum)\s+(?:price|quote|rate)\b/i,
  /\b(?:exchange|interest|mortgage)\s+rates?\b/i,
];

const EXPLICIT_READ_ONLY_PATTERNS = [
  /\b(?:do not|don't|dont|without)\s+(?:modify|change|edit|update|alter|rewrite|build|implement)(?:ing)?\b/i,
  /\b(?:no|without)\s+(?:code|file|app)\s+(?:changes?|edits?|updates?|modifications?)\b/i,
  /\b(?:answer|research|summarize|explain|review|analyze)\s+(?:this\s+)?(?:only|without\s+(?:code|changes?))\b/i,
];

const CODE_CHANGE_PATTERNS = [
  /\b(?:build|create|add|implement|change|modify|edit|update|remove|fix|redesign|refactor|replace|integrate|wire)\b/i,
];

const INFORMATION_REQUEST_PATTERNS = [
  /^\s*(?:what|why|when|where|who|which|how|can you explain|could you explain)\b/i,
  /\b(?:search|research|summarize|explain|review|analyze|look\s+(?:it|this|that|them|those)\s+up|tell me)\b/i,
];

function matchesAny(value: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(value));
}

function normalizeQuery(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 500);
}

/**
 * Detects requests where generating without fresh external facts would be
 * unreliable. Explicit requests are always honored; a deliberately narrow
 * volatile-fact vocabulary covers common cases where research is essential.
 */
export function detectResearchIntent(
  messages: Array<{ content: string }>,
): ResearchIntent {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const content = messages[index]?.content?.trim();
    if (!content) continue;

    const explicitlyRequested = matchesAny(content, EXPLICIT_RESEARCH_PATTERNS);
    if (explicitlyRequested || matchesAny(content, CURRENT_FACT_PATTERNS)) {
      return {
        required: true,
        explicitlyRequested,
        query: normalizeQuery(content),
      };
    }
  }

  return { required: false, explicitlyRequested: false, query: null };
}

/**
 * Protects informational chat turns from the low-latency code-generation
 * fallback. Explicit no-change instructions always win; otherwise a request
 * must look informational and contain no concrete file-change verb.
 */
export function shouldAnswerWithoutCode(content: string) {
  const normalized = content.trim();
  if (!normalized) return false;

  if (matchesAny(normalized, EXPLICIT_READ_ONLY_PATTERNS)) {
    return true;
  }

  return (
    matchesAny(normalized, INFORMATION_REQUEST_PATTERNS) &&
    !matchesAny(normalized, CODE_CHANGE_PATTERNS)
  );
}
