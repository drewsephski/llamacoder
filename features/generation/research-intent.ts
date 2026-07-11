export type ResearchIntent = {
  required: boolean;
  explicitlyRequested: boolean;
  freshness: "recent" | "evergreen";
  reason: ResearchReason | null;
  query: string | null;
};

export type ResearchReason =
  | "explicit"
  | "time-sensitive"
  | "verification"
  | "technical-reference"
  | "recommendation"
  | "external-facts"
  | "new-build";

const EXPLICIT_RESEARCH_PATTERNS = [
  /\b(?:web|internet|online)\s+(?:search|research)\b/i,
  /\b(?:use|do|run)\s+(?:a\s+)?(?:web|internet|online)\s*(?:search|research)?\b/i,
  /\bsearch\s+(?:the\s+)?(?:web|internet|online)\b/i,
  /\b(?:browse|research)\s+(?:the\s+)?(?:web|internet|online)\b/i,
  /\blook\s+(?:it|this|that|them|those|the\s+\w+(?:\s+\w+)?)\s+up\b/i,
];

const TIME_SENSITIVE_PATTERNS = [
  /\b(?:current|latest|live|today(?:'s)?|up[- ]to[- ]date|most recent)\s+(?:(?:official|UFC|fighter|team|league|product|API)\s+){0,2}(?:rankings?|standings?|scores?|results?|schedule|roster|lineup|stats?|statistics|records?|prices?|pricing|rates?|odds|news|weather|forecast|laws?|regulations?|rules?|versions?|documentation|docs)\b/i,
  /\b(?:rankings?|standings?|scores?|results?|schedule|roster|lineup|odds)\s+(?:right now|today|this (?:week|month|season|year)|for\s+20\d{2})\b/i,
  /\b(?:actual|real|official)\s+(?:UFC\s+)?(?:rankings?|standings?|scores?|results?|schedule|roster|lineup|stats?|records?|prices?|pricing|odds|data)\b/i,
  /\b(?:stock|share|crypto|bitcoin|ethereum)\s+(?:price|quote|rate)\b/i,
  /\b(?:exchange|interest|mortgage)\s+rates?\b/i,
];

const TEMPORAL_CUE_PATTERNS = [
  /\b(?:current|currently|latest|live|today(?:'s)?|tonight|now|newest|recent(?:ly)?|up[- ]to[- ]date|most recent|as of|this (?:week|month|quarter|season|year))\b/i,
];

const VERIFICATION_PATTERNS = [
  /\b(?:verify|fact[- ]check|confirm|validate|double[- ]check|source|citation|cite|evidence)\b/i,
  /\b(?:official|real|actual|accurate|factual|source[- ]grounded)\b/i,
];

const TECHNICAL_REFERENCE_PATTERNS = [
  /\b(?:API|SDK|framework|library|package|dependency|provider|platform|service|model)\b.{0,80}\b(?:docs?|documentation|version|support|compatib(?:le|ility)|integration|migration|upgrade|deprecat(?:ed|ion)|best practices?)\b/i,
  /\b(?:docs?|documentation|release notes?|changelog|GitHub|npm|pnpm|Vercel|OpenAI|Anthropic|Supabase|Stripe|Next\.?js|React|Tailwind|shadcn)\b/i,
  /\b(?:install|configure|integrate|connect|deploy|authenticate|authorize)\b.{0,80}\b(?:API|SDK|package|provider|platform|service|library|framework)\b/i,
];

const RECOMMENDATION_PATTERNS = [
  /\b(?:recommend(?:ation|ed)?|best(?!\s+practices?\b)|top|leading|popular|alternatives?|compare|comparison|versus|vs\.?|pros? and cons?|tradeoffs?|which should|what should)\b/i,
  /\b(?:buy|book|visit|travel|restaurant|hotel|pricing|availability)\b/i,
];

const EXTERNAL_FACT_PATTERNS = [
  /https?:\/\/|\bwww\.|\b[a-z0-9-]+\.(?:com|org|net|io|dev|ai)\b/i,
  /\b(?:news|weather|forecast|sports?|rankings?|standings?|scores?|schedule|roster|stats?|prices?|pricing|rates?|odds|laws?|regulations?|policy|elections?|president|CEO|company|market|research|paper|study|statistics|dataset|release)\b/i,
];

const GENERAL_INFORMATION_PATTERNS = [
  /^\s*(?:what|why|when|where|who|which|how)\b/i,
  /\b(?:explain|summarize|research|analyze|review|tell me about)\b/i,
];

const LOCAL_CONTEXT_PATTERNS = [
  /\b(?:this|the)\s+(?:app|component|code|file|implementation|function|page|button|layout|error|bug)\b/i,
  /\b(?:provided|attached|local|existing)\s+(?:code|files?|context|implementation|app|project)\b/i,
  /\b(?:TypeError|ReferenceError|SyntaxError|stack trace)\b/i,
];

const NEW_BUILD_PATTERNS = [
  /\b(?:build|create|design|make|generate)\b.{0,100}\b(?:app|application|site|website|dashboard|product|tool|experience|landing page)\b/i,
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

function classifyResearch(content: string): {
  reason: ResearchReason;
  freshness: ResearchIntent["freshness"];
  explicitlyRequested: boolean;
} | null {
  const explicitlyRequested = matchesAny(content, EXPLICIT_RESEARCH_PATTERNS);
  const timeSensitive =
    matchesAny(content, TIME_SENSITIVE_PATTERNS) ||
    (matchesAny(content, TEMPORAL_CUE_PATTERNS) &&
      (matchesAny(content, EXTERNAL_FACT_PATTERNS) ||
        matchesAny(content, TECHNICAL_REFERENCE_PATTERNS)));

  if (explicitlyRequested) {
    return {
      reason: "explicit",
      freshness: timeSensitive ? "recent" : "evergreen",
      explicitlyRequested: true,
    };
  }
  if (timeSensitive) {
    return {
      reason: "time-sensitive",
      freshness: "recent",
      explicitlyRequested: false,
    };
  }

  const evergreenClassifiers: Array<{
    reason: ResearchReason;
    patterns: RegExp[];
  }> = [
    { reason: "verification", patterns: VERIFICATION_PATTERNS },
    { reason: "recommendation", patterns: RECOMMENDATION_PATTERNS },
    { reason: "technical-reference", patterns: TECHNICAL_REFERENCE_PATTERNS },
    { reason: "external-facts", patterns: EXTERNAL_FACT_PATTERNS },
    { reason: "new-build", patterns: NEW_BUILD_PATTERNS },
  ];

  const match = evergreenClassifiers.find(({ patterns }) =>
    matchesAny(content, patterns),
  );
  if (match) {
    return {
      reason: match.reason,
      freshness: "evergreen",
      explicitlyRequested: false,
    };
  }

  if (
    matchesAny(content, GENERAL_INFORMATION_PATTERNS) &&
    !matchesAny(content, LOCAL_CONTEXT_PATTERNS)
  ) {
    return {
      reason: "external-facts",
      freshness: "evergreen",
      explicitlyRequested: false,
    };
  }

  return null;
}

/**
 * Detects requests where generating without fresh external facts would be
 * less accurate, current, or useful. The policy intentionally defaults toward
 * research for externally verifiable questions and new products, while local
 * edits and purely creative instructions continue without search.
 */
export function detectResearchIntent(
  messages: Array<{ content: string }>,
): ResearchIntent {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const content = messages[index]?.content?.trim();
    if (!content) continue;

    const classification = classifyResearch(content);
    if (classification) {
      return {
        required: true,
        ...classification,
        query: normalizeQuery(content),
      };
    }
  }

  return {
    required: false,
    explicitlyRequested: false,
    freshness: "evergreen",
    reason: null,
    query: null,
  };
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
