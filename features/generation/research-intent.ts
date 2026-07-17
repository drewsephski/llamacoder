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
  | "external-facts";

export type ApiDocumentationAssessment = {
  hasApiContext: boolean;
  hasCompleteEndpointContract: boolean;
  referencedUrls: string[];
};

export type WebsiteReferenceIntent = {
  required: boolean;
  url: string | null;
  hostname: string | null;
};

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
  /\b(?:weather|forecast|breaking news|election results)\b/i,
  /\b(?:laws?|regulations?|president|prime minister|CEO)\b.{0,60}\b(?:current|currently|latest|today|now|in office|effective)\b/i,
];

const TEMPORAL_CUE_PATTERNS = [
  /\b(?:current|currently|latest|live|today(?:'s)?|tonight|now|newest|recent(?:ly)?|up[- ]to[- ]date|most recent|as of|this (?:week|month|quarter|season|year))\b/i,
];

const VERIFICATION_PATTERNS = [
  /\b(?:fact[- ]check|source[- ]grounded|with sources|provide sources|cite|citation|evidence|according to official)\b/i,
  /\b(?:verify|confirm|validate|double[- ]check)\b.{0,80}\b(?:claim|fact|accuracy|information|source|citation|evidence|official|current|latest|external)\b/i,
  /\b(?:claim|fact|accuracy|information|source|citation|evidence|official|current|latest|external)\b.{0,80}\b(?:verify|confirm|validate|double[- ]check)\b/i,
];

const TECHNICAL_REFERENCE_PATTERNS = [
  /\b(?:API|SDK|framework|library|package|dependency|provider|platform|service|model)\b.{0,80}\b(?:docs?|documentation|version|support|compatib(?:le|ility)|integration|migration|upgrade|deprecat(?:ed|ion)|best practices?)\b/i,
  /\b(?:docs?|documentation|release notes?|changelog)\b.{0,80}\b(?:API|SDK|framework|library|package|dependency|provider|platform|service|model|GitHub|npm|pnpm|Vercel|OpenAI|Anthropic|Supabase|Stripe|Next\.?js|React|Tailwind|shadcn)\b/i,
  /\b(?:install|configure|integrate|connect|deploy|authenticate|authorize)\b.{0,80}\b(?:API|SDK|package|provider|platform|service|library|framework)\b/i,
];

const RECOMMENDATION_PATTERNS = [
  /\b(?:recommend(?:ation|ed)?|alternatives?|compare|comparison|versus|vs\.?|pros? and cons?|tradeoffs?|which should|what should)\b/i,
];

const EXTERNAL_REFERENCE_PATTERNS = [
  /https?:\/\/|\bwww\.|\b[a-z0-9-]+\.(?:com|org|net|io|dev|ai)\b/i,
];

const EXTERNAL_RECOMMENDATION_SUBJECT_PATTERNS = [
  /\b(?:API|SDK|framework|library|package|dependency|provider|platform|service|model|vendor|tool|database|hosting|payment|auth)\b/i,
  /\b(?:buy|book|visit|travel|restaurant|hotel|pricing|availability)\b/i,
  /\b(?:GitHub|npm|pnpm|Vercel|OpenAI|Anthropic|Supabase|Stripe|Next\.?js|React|Tailwind|shadcn)\b/i,
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

const MAX_RESEARCH_QUERY_CHARACTERS = 240;
const MAX_RESEARCH_QUERY_WORDS = 32;

const WEBSITE_REFERENCE_PATTERNS = [
  /\b(?:clone|recreate|replicate|copy)\b[\s\S]{0,160}?\b(https?:\/\/[^\s<>"'`]+)/i,
  /\b(?:website|web\s*site|site|webpage|landing\s+page|interface|design|app)\b[\s\S]{0,80}?\b(?:like|similar\s+to|based\s+on|inspired\s+by|matching)\s+(https?:\/\/[^\s<>"'`]+)/i,
  /\b(?:use|take)\s+(https?:\/\/[^\s<>"'`]+)[\s\S]{0,80}?\bas\s+(?:an?\s+)?(?:visual|design|website|site)?\s*reference\b/i,
];

const TARGETED_EDIT_OBJECTIVE_PATTERN =
  /\bUser requested edit:\s*([\s\S]*?)(?=\n\s*\nSelected element context:|$)/i;

const API_CONTEXT_PATTERN =
  /\b(?:api|endpoint|base url|request|response|fetch|webhook|sdk|authentication|authorization)\b|https?:\/\/(?:api\.|developer\.)[^\s]+|https?:\/\/[^\s]+\/(?:api|docs?|reference|swagger|openapi)(?:[/?#]|$)/i;
const HTTP_ENDPOINT_PATTERN =
  /\b(?:GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s+(https?:\/\/[^\s,;)}\]]+|\/[A-Za-z0-9_~!$&'()*+,;=:@%./{}-]+)/i;
const DESCRIBED_URL_ENDPOINT_PATTERN =
  /https?:\/\/[^\s,;)}\]]+\s+(?:returns?|retrieves?|gets?|lists?|searches?|creates?|updates?|deletes?|sends?|submits?|provides?|fetches?|loads?|looks? up|converts?|calculates?|is used (?:to|for))/i;
const ENDPOINT_PURPOSE_PATTERN =
  /(?:\breturns?|\bretrieves?|\bgets?|\blists?|\bsearches?|\bcreates?|\bupdates?|\bdeletes?|\bsends?|\bsubmits?|\bprovides?|\bfetches?|\bloads?|\blooks? up|\bconverts?|\bcalculates?|\bused (?:to|for)|(?:\s[-–—:]\s|\s->\s)\S)/i;
const BASE_URL_PATTERN = /\bbase\s*url\s*[:=-]\s*https?:\/\/[^\s]+/i;

function extractUrls(value: string) {
  return Array.from(
    new Set(
      value
        .match(/https?:\/\/[^\s<>"'`]+/gi)
        ?.map((url) => url.replace(/[),.;!?\]}]+$/, "")) ?? [],
    ),
  );
}

/**
 * Targeted preview edits include DOM metadata and current source after the
 * user's instruction. Those implementation details are useful to codegen but
 * must never be treated as research intent or forwarded as a search query.
 */
export function extractResearchObjective(value: string) {
  const targetedEditObjective = value.match(
    TARGETED_EDIT_OBJECTIVE_PATTERN,
  )?.[1];

  return (targetedEditObjective ?? value).trim();
}

/**
 * Recognizes prompts that use an exact webpage as a visual implementation
 * reference. These should stay anchored to that page instead of drifting into
 * semantic search results for similarly named products.
 */
export function detectWebsiteReferenceIntent(
  value: string,
): WebsiteReferenceIntent {
  const objective = extractResearchObjective(value);
  const matchedUrl = WEBSITE_REFERENCE_PATTERNS.reduce<string | null>(
    (match, pattern) => match ?? objective.match(pattern)?.[1] ?? null,
    null,
  );

  if (!matchedUrl) {
    return { required: false, url: null, hostname: null };
  }

  const normalizedUrl = matchedUrl.replace(/[),.;!?\]}]+$/, "");
  try {
    const url = new URL(normalizedUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { required: false, url: null, hostname: null };
    }

    return {
      required: true,
      url: url.toString(),
      hostname: url.hostname.toLowerCase(),
    };
  } catch {
    return { required: false, url: null, hostname: null };
  }
}

function hasDescribedEndpoint(value: string) {
  if (DESCRIBED_URL_ENDPOINT_PATTERN.test(value)) return true;

  return value
    .split(/\r?\n|(?<=;)\s+/)
    .some(
      (line) =>
        HTTP_ENDPOINT_PATTERN.test(line) && ENDPOINT_PURPOSE_PATTERN.test(line),
    );
}

/**
 * Distinguishes an API reference that needs documentation research from an
 * implementation contract the user already supplied. A contract is complete
 * enough to skip discovery only when it contains a resolvable base/absolute
 * URL and at least one endpoint paired with its concrete behavior.
 */
export function assessApiDocumentation(
  messages: Array<{ content: string }>,
): ApiDocumentationAssessment {
  const content = messages
    .map((message) => extractResearchObjective(message.content))
    .filter(Boolean)
    .join("\n");
  const referencedUrls = extractUrls(content);
  const hasApiContext = API_CONTEXT_PATTERN.test(content);
  const hasResolvableBase =
    BASE_URL_PATTERN.test(content) ||
    HTTP_ENDPOINT_PATTERN.test(content) ||
    DESCRIBED_URL_ENDPOINT_PATTERN.test(content);

  return {
    hasApiContext,
    hasCompleteEndpointContract:
      hasApiContext && hasResolvableBase && hasDescribedEndpoint(content),
    referencedUrls,
  };
}

function matchesAny(value: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(value));
}

function limitQuery(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  const words: string[] = [];

  for (const word of normalized.split(" ")) {
    if (words.length >= MAX_RESEARCH_QUERY_WORDS) break;
    const candidate = [...words, word].join(" ");
    if (candidate.length > MAX_RESEARCH_QUERY_CHARACTERS) break;
    words.push(word);
  }

  return words.join(" ") || normalized.slice(0, MAX_RESEARCH_QUERY_CHARACTERS);
}

function getErrorTechnology(value: string) {
  if (/\.tsx?\b/i.test(value)) {
    return /\.tsx\b/i.test(value) ? "React TypeScript" : "TypeScript";
  }
  if (/\.jsx\b/i.test(value)) return "React JavaScript";
  if (/\.m?js\b/i.test(value)) return "JavaScript";
  if (/\bReact\b/i.test(value)) return "React";
  return "JavaScript";
}

function extractErrorQuery(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return null;

  const technology = getErrorTechnology(normalized);
  const undefinedIdentifier = normalized.match(
    /\b([A-Za-z_$][\w$]*)\s+is not defined\b/i,
  );
  if (undefinedIdentifier) {
    return `${technology} ${undefinedIdentifier[1]} is not defined missing import`;
  }

  const missingName = normalized.match(
    /\b(?:Cannot find name|Unknown identifier)\s+['"`]?([A-Za-z_$][\w$]*)/i,
  );
  if (missingName) {
    return `${technology} cannot find name ${missingName[1]} missing import`;
  }

  const missingModule = normalized.match(
    /\b(?:Module not found(?::\s*Error)?\s*:?\s*(?:Can't resolve)?|Cannot find module)\s+['"`]([^'"`]+)['"`]/i,
  );
  if (missingModule) {
    return `${technology} cannot resolve module ${missingModule[1]}`;
  }

  const undefinedProperty = normalized.match(
    /\bCannot read propert(?:y|ies) of (undefined|null)(?:\s*\(reading ['"`]([^'"`]+)['"`]\))?/i,
  );
  if (undefinedProperty) {
    const property = undefinedProperty[2]
      ? ` reading ${undefinedProperty[2]}`
      : "";
    return `${technology} cannot read properties of ${undefinedProperty[1]}${property}`;
  }

  const diagnostic = normalized.match(
    /\b(?:TypeError|ReferenceError|SyntaxError|Build error|Compile error|TS\d+)\s*:\s*([^|^]{2,180})/i,
  );
  if (diagnostic) {
    return `${technology} ${diagnostic[0]}`;
  }

  const errorMarkerIndex = value.search(
    /(?:here(?:'s| is) the error|error output|stack trace)\s*:?/i,
  );
  if (errorMarkerIndex !== -1) {
    const diagnosticLine = value
      .slice(errorMarkerIndex)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(
        (line) =>
          line.length > 1 &&
          !/(?:here(?:'s| is) the error|error output|stack trace)\s*:?/i.test(
            line,
          ) &&
          !/^(?:>|\^|\|)|^\d+\s*\||^at\s+/i.test(line),
      )
      .map((line) =>
        line
          .replace(
            /^(?:[./\\\w-]+\/)*[\w.-]+\.(?:tsx?|jsx?|m?js|css|json)\s*:\s*/i,
            "",
          )
          .replace(/\s*\(\d+:\d+\)\s*$/, ""),
      )
      .find(Boolean);

    if (diagnosticLine) {
      return `${technology} ${diagnosticLine}`;
    }
  }

  return null;
}

/**
 * Converts a user request into a bounded search objective. Error logs receive
 * special handling so code frames, line numbers, and source snippets never
 * become a search query.
 */
export function buildResearchQuery(value: string) {
  const objective = extractResearchObjective(value);
  const errorQuery = extractErrorQuery(objective);
  if (errorQuery) return limitQuery(errorQuery);

  const websiteReference = detectWebsiteReferenceIntent(objective);
  if (
    websiteReference.required &&
    websiteReference.url &&
    websiteReference.hostname
  ) {
    return limitQuery(
      `site:${websiteReference.hostname} ${websiteReference.url} homepage design layout typography colors sections interactions`,
    );
  }

  const apiDocumentation = assessApiDocumentation([{ content: objective }]);
  if (
    apiDocumentation.hasApiContext &&
    apiDocumentation.referencedUrls.length > 0 &&
    !apiDocumentation.hasCompleteEndpointContract
  ) {
    return limitQuery(
      `${apiDocumentation.referencedUrls.join(" ")} official API documentation endpoints authentication response schema`,
    );
  }

  const lookupSubject = objective.match(
    /\blook\s+(.{2,180}?)\s+up\b(?:\s+before\b.*)?/i,
  )?.[1];
  const withoutSearchInstructions = (lookupSubject ?? objective)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(
      /^\s*(?:please\s+)?retry\s+this\s+with\s+(?:a\s+)?(?:web|internet|online)\s*(?:search|research)?\s*:?\s*/i,
      "",
    )
    .replace(
      /\b(?:use|do|run)\s+(?:a\s+)?(?:web|internet|online)\s*(?:search|research)?\b\s*(?:to|for)?\s*/gi,
      " ",
    )
    .replace(
      /\bsearch\s+(?:the\s+)?(?:web|internet|online)\b\s*(?:to|for)?\s*/gi,
      " ",
    )
    .replace(
      /\b(?:browse|research)\s+(?:the\s+)?(?:web|internet|online)\b\s*(?:to|for)?\s*/gi,
      " ",
    )
    .replace(
      /^\s*(?:please\s+)?(?:build|create|make|show|find|get|tell me about)\s+(?:me\s+)?(?:an?\s+)?/i,
      "",
    )
    .replace(
      /\b(?:before|while)\s+(?:building|creating|making|updating)\s+(?:this|the app).*$/i,
      "",
    )
    .replace(/\s+([,.:;!?])/g, "$1");

  return limitQuery(withoutSearchInstructions || objective);
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
      (matchesAny(content, EXTERNAL_REFERENCE_PATTERNS) ||
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

  if (matchesAny(content, VERIFICATION_PATTERNS)) {
    return {
      reason: "verification",
      freshness: "evergreen",
      explicitlyRequested: false,
    };
  }

  if (matchesAny(content, TECHNICAL_REFERENCE_PATTERNS)) {
    return {
      reason: "technical-reference",
      freshness: "evergreen",
      explicitlyRequested: false,
    };
  }

  if (
    matchesAny(content, RECOMMENDATION_PATTERNS) &&
    matchesAny(content, EXTERNAL_RECOMMENDATION_SUBJECT_PATTERNS)
  ) {
    return {
      reason: "recommendation",
      freshness: "evergreen",
      explicitlyRequested: false,
    };
  }

  if (matchesAny(content, EXTERNAL_REFERENCE_PATTERNS)) {
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
 * incorrect or stale. Search is intentionally conservative: ordinary builds,
 * local edits, and stable questions continue without a separate research call.
 */
export function detectResearchIntent(
  messages: Array<{ content: string }>,
): ResearchIntent {
  const apiDocumentation = assessApiDocumentation(messages);

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const content = extractResearchObjective(messages[index]?.content ?? "");
    if (!content) continue;

    const classification = classifyResearch(content);
    if (classification) {
      const messageApiDocumentation = assessApiDocumentation([{ content }]);
      const isApiReferenceOnly =
        messageApiDocumentation.hasApiContext &&
        (classification.reason === "technical-reference" ||
          classification.reason === "external-facts");
      if (isApiReferenceOnly && apiDocumentation.hasCompleteEndpointContract) {
        continue;
      }

      return {
        required: true,
        ...classification,
        query: buildResearchQuery(content),
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
