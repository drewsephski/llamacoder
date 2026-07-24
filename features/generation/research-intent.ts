export type ResearchIntent = {
  candidate: boolean;
  explicitlyRequested: boolean;
  freshness: "recent" | "evergreen";
  reason: ResearchReason | null;
  query: string | null;
};

export type ResearchReason =
  | "explicit"
  | "informational"
  | "technical-reference"
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

export type PortfolioResearchIntent = {
  required: boolean;
  personName: string | null;
  portfolioUrl: string | null;
  linkedinUrl: string | null;
};

export type CompanyLandingResearchIntent = {
  required: boolean;
  companyName: string | null;
  productName: string | null;
  productUrl: string | null;
  competitorUrl: string | null;
};

export type LiveApiDashboardResearchIntent = {
  required: boolean;
  appName: string | null;
  docsUrl: string | null;
  apiBaseUrl: string | null;
  dataFocus: string | null;
};

export type LocalBusinessResearchIntent = {
  required: boolean;
  businessName: string | null;
  city: string | null;
  websiteUrl: string | null;
  listingUrl: string | null;
};

export type GuidedTemplateResearchKind =
  | "portfolio"
  | "company-landing"
  | "live-api-dashboard"
  | "local-business";

export type GuidedTemplateResearchIntent = {
  required: boolean;
  kind: GuidedTemplateResearchKind | null;
};

const PORTFOLIO_BUILD_PATTERNS = [
  /\b(?:build|create|make|design|generate|rebuild|refresh)\b[\s\S]{0,140}?\b(?:portfolio|personal\s+(?:site|website|page))\b/i,
  /\bportfolio\s+(?:site|website|page)\b[\s\S]{0,100}?\bfor\b/i,
];

const COMPANY_LANDING_BUILD_PATTERNS = [
  /\b(?:build|create|make|design|generate|rebuild|refresh)\b[\s\S]{0,160}?\b(?:product\s+landing\s+page|landing\s+page|marketing\s+(?:site|page)|product\s+page)\b/i,
  /\b(?:landing\s+page|marketing\s+(?:site|page))\b[\s\S]{0,100}?\bfor\b/i,
];

const LIVE_API_DASHBOARD_BUILD_PATTERNS = [
  /\b(?:build|create|make|design|generate|rebuild|refresh)\b[\s\S]{0,160}?\b(?:live\s+data\s+dashboard|live\s+dashboard|data\s+dashboard|api\s+dashboard)\b/i,
  /\bdashboard\s+called\b/i,
  /\bdashboard\b[\s\S]{0,140}?\bfrom\s+a\s+public\s+api\b/i,
];

const LOCAL_BUSINESS_BUILD_PATTERNS = [
  /\b(?:build|create|make|design|generate|rebuild|refresh)\b[\s\S]{0,160}?\b(?:restaurant|cafe|coffee\s+shop|bakery|bar|salon|local\s+business|store|shop)\b[\s\S]{0,80}?\b(?:website|site|page)\b/i,
  /\b(?:website|site|page)\b[\s\S]{0,80}?\bfor\b[\s\S]{0,80}?\b(?:restaurant|cafe|coffee\s+shop|bakery|bar|salon|local\s+business|store|shop)\b/i,
  /\b(?:a|an)\s+[\w\s-]{0,60}?\b(?:restaurant|cafe|coffee\s+shop|bakery|bar|salon|local\s+business)\b[\s\S]{0,40}?\bin\b/i,
];

const GUIDED_RESEARCH_PATTERNS = [
  /\bresearch\b/i,
  /\b(?:on|from)\s+the\s+web\b/i,
  /\b(?:real|actual|existing|live)\b[\s\S]{0,48}?\b(?:information|content|projects|bio|experience|skills|employers?|features?|positioning|hours|menu|services?)\b/i,
  /\b(?:scrape|fetch|read)\b[\s\S]{0,80}?\b(?:portfolio|linkedin|profile|site|page|docs?|documentation|listing)\b/i,
  /\bdo not invent\b/i,
  /\busing fetch_url\b/i,
  /\bverify\b[\s\S]{0,60}?\b(?:endpoints?|cors|auth|contract)\b/i,
];

const PORTFOLIO_RESEARCH_PATTERNS = GUIDED_RESEARCH_PATTERNS;

const LOCAL_LOOKUP_PATTERNS = [
  /\blook\s+up\s+(?:the\s+)?(?:code|source|file|component|value|variable|function|import|definition|line|error)\b/i,
  /\b(?:search|find)\s+(?:in|within)\s+(?:the\s+)?(?:code|codebase|project|repo|file|app)\b/i,
];

const WEB_RESEARCH_CUE_PATTERNS = [
  /\b(?:web|internet|online)\s+(?:search|research)\b/i,
  /\bsearch\s+(?:the\s+)?(?:web|internet|online)\b/i,
  /\b(?:use|do|run)\s+(?:a\s+)?(?:web|internet|online)\s*(?:search|research)?\b/i,
  /\blook\s+up\b/i,
  /\blook\s+(?:it|this|that|them|those|the\s+[\w\s]{1,80}?)\s+up\b/i,
  /\b(?:search|find)\s+(?:for|about|on(?:line)?)\b/i,
  /\b(?:research|investigate)\b/i,
  /\b(?:find|get)\s+(?:out|info(?:rmation)?|details)\s+(?:about|on)\b/i,
  /\b(?:on|from)\s+the\s+(?:web|internet)\b/i,
  /\b(?:cite|citations?|fact[- ]check|verify|confirm)\b/i,
];

const RECENT_FACT_CUE_PATTERNS = [
  /\b(?:current|currently|latest|live|today(?:'s)?|now|recent|up[- ]to[- ]date|most recent|actual|official)\b/i,
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
  /\b(?:search|research|summarize|explain|review|analyze|look\s+(?:it|this|that|them|those)\s+up|tell me|compare|contrast|follow)\b/i,
];

const LOCAL_STYLING_PATTERNS = [
  /\b(?:color|colour|font|spacing|padding|margin|layout|style|theme|contrast|rounded|shadow|hover|italic|bold)\b/i,
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
  /\b(?:api|endpoint|base url|request|response|fetch|sdk|authentication|authorization)\b|https?:\/\/(?:api\.|developer\.)[^\s]+|https?:\/\/[^\s]+\/(?:api|docs?|reference|swagger|openapi)(?:[/?#]|$)/i;
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

function mentionsWebResearch(value: string) {
  return (
    matchesAny(value, WEB_RESEARCH_CUE_PATTERNS) &&
    !matchesAny(value, LOCAL_LOOKUP_PATTERNS)
  );
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
    return `${technology} ${undefinedIdentifier[1]} is not defined missing import or name shadowing`;
  }

  const missingName = normalized.match(
    /\b(?:Cannot find name|Unknown identifier)\s+['"`]?([A-Za-z_$][\w$]*)/i,
  );
  if (missingName) {
    return `${technology} cannot find name ${missingName[1]} missing import or name shadowing`;
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

function isClearlyLocalWork(content: string) {
  const objective = extractResearchObjective(content);
  if (!objective) return true;

  if (matchesAny(objective, LOCAL_LOOKUP_PATTERNS)) {
    return true;
  }

  if (
    matchesAny(objective, LOCAL_STYLING_PATTERNS) &&
    !mentionsWebResearch(objective) &&
    extractUrls(objective).length === 0
  ) {
    return true;
  }

  if (
    /\bfix\b/i.test(objective) &&
    /\b(?:this chat|already in|existing code|the code|using the code)\b/i.test(
      objective,
    ) &&
    !mentionsWebResearch(objective)
  ) {
    return true;
  }

  if (detectGuidedTemplateResearchIntent(objective).required) {
    return false;
  }

  if (
    matchesAny(objective, CODE_CHANGE_PATTERNS) &&
    !shouldAnswerWithoutCode(objective) &&
    !mentionsWebResearch(objective) &&
    extractUrls(objective).length === 0 &&
    !assessApiDocumentation([{ content: objective }]).hasApiContext &&
    !matchesAny(objective, RECENT_FACT_CUE_PATTERNS)
  ) {
    return true;
  }

  return false;
}

function inferResearchFreshness(content: string): ResearchIntent["freshness"] {
  return matchesAny(content, RECENT_FACT_CUE_PATTERNS) ? "recent" : "evergreen";
}

function inferResearchReason(content: string): ResearchReason {
  if (mentionsWebResearch(content)) {
    return "explicit";
  }

  if (shouldAnswerWithoutCode(content)) {
    return "informational";
  }

  if (assessApiDocumentation([{ content }]).hasApiContext) {
    return "technical-reference";
  }

  return "external-facts";
}

const RESEARCH_META_STRIP_PATTERNS: Array<RegExp | [RegExp, string]> = [
  [/```[\s\S]*?```/g, " "],
  // Polite / directive wrappers anywhere in the objective
  [/\b(?:can you|could you|please|pls)\s+/gi, " "],
  [
    /\b(?:retry\s+this\s+with\s+)?(?:use\s+)?(?:web|internet|online)\s+(?:search|research)(?:\s+to)?\s*(?:for|get|find|look\s+up|verify)?\s*:?\s*/gi,
    " ",
  ],
  [
    /\b(?:search|find|research|investigate)\s+(?:the\s+)?(?:web|internet|online)\s+(?:for|about)?\s*/gi,
    " ",
  ],
  [
    /\b(?:look\s+(?:it|this|that|them|those)\s+up|look\s+up|search\s+for|find\s+(?:out|info(?:rmation)?|details))\s+(?:about|on|for)?\s*/gi,
    " ",
  ],
  [/^\s*now\s+/i, ""],
  [/\s+(?:on|from)\s+the\s+(?:web|internet)\s*[.!]?\s*$/i, ""],
  [
    /\s+before\s+(?:building|implementing|creating)(?:\s+this|\s+the\s+app)?\s*[.!]?\s*$/i,
    "",
  ],
  [
    /\b(?:and\s+)?(?:do not|don't|dont)\s+(?:modify|change|edit|update|build|implement)(?:\s+\w+){0,6}\s*$/i,
    "",
  ],
];

/**
 * Strips chat meta-instructions so Exa receives a semantic page-intent query
 * (subject + constraint), not a polite chat message.
 */
function distillResearchObjective(value: string) {
  let distilled = value.replace(/\s+/g, " ").trim();

  for (const pattern of RESEARCH_META_STRIP_PATTERNS) {
    if (Array.isArray(pattern)) {
      distilled = distilled
        .replace(pattern[0], pattern[1])
        .replace(/\s+/g, " ")
        .trim();
      continue;
    }
    distilled = distilled.replace(pattern, "").replace(/\s+/g, " ").trim();
  }

  return distilled.replace(/^[:\-–—,]+\s*/, "").trim() || value.trim();
}

function extractPortfolioPersonName(value: string) {
  const patterns = [
    /\bportfolio\s+(?:site|website|page)\s+for\s+([A-Z][\w''-]*(?:\s+[A-Z][\w''-]*)+)/i,
    /\bfor\s+([A-Z][\w''-]*(?:\s+[A-Z][\w''-]*)+)(?:,\s*|\s+a\s+)/,
    /\bfor\s+([A-Z][\w''-]*(?:\s+[A-Z][\w''-]*)+)\b/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern)?.[1]?.trim();
    if (match) return match;
  }

  return null;
}

function extractNamedEntity(value: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = value.match(pattern)?.[1]?.trim();
    if (match) return match;
  }
  return null;
}

function pickUrl(
  urls: string[],
  predicate: (url: string) => boolean,
): string | null {
  return urls.find((url) => predicate(url)) ?? null;
}

/**
 * Detects portfolio builds that should trigger person-level web research and
 * Exa page reads beyond any URLs already linked in the chat.
 */
export function detectPortfolioResearchIntent(
  value: string,
): PortfolioResearchIntent {
  const objective = extractResearchObjective(value);
  const isPortfolioBuild = matchesAny(objective, PORTFOLIO_BUILD_PATTERNS);
  const urls = extractUrls(objective);
  const linkedinUrl = urls.find((url) => /linkedin\.com/i.test(url)) ?? null;
  const portfolioUrl = urls.find((url) => !/linkedin\.com/i.test(url)) ?? null;
  const needsResearch =
    isPortfolioBuild &&
    (matchesAny(objective, PORTFOLIO_RESEARCH_PATTERNS) || urls.length > 0);

  return {
    required: needsResearch,
    personName: extractPortfolioPersonName(objective),
    portfolioUrl,
    linkedinUrl,
  };
}

export function buildPortfolioResearchQuery(value: string) {
  const intent = detectPortfolioResearchIntent(value);
  if (!intent.required) return null;

  const parts = [
    intent.personName,
    "professional portfolio projects experience bio skills",
    intent.portfolioUrl,
    intent.linkedinUrl,
  ].filter(Boolean);

  return limitQuery(parts.join(" "));
}

/**
 * Detects company/product landing builds that should research the brand and
 * scrape product/competitor pages before generation.
 */
export function detectCompanyLandingResearchIntent(
  value: string,
): CompanyLandingResearchIntent {
  const objective = extractResearchObjective(value);
  const isCompanyLandingBuild = matchesAny(
    objective,
    COMPANY_LANDING_BUILD_PATTERNS,
  );
  const urls = extractUrls(objective);
  const productUrl = urls[0] ?? null;
  const competitorUrl = urls[1] ?? null;
  const needsResearch =
    isCompanyLandingBuild &&
    (matchesAny(objective, GUIDED_RESEARCH_PATTERNS) || urls.length > 0);

  const companyName = extractNamedEntity(objective, [
    /\blanding\s+page\s+for\s+([A-Z][\w&.-]*)(?:'s)?/i,
    /\bfor\s+([A-Z][\w&.-]*)(?:'s)\s+/i,
    /\bresearch\s+([A-Z][\w&.-]*)\s+on\s+the\s+web/i,
  ]);
  const productName = extractNamedEntity(objective, [
    /\bfor\s+[A-Z][\w&.-]*(?:'s)\s+([A-Z][\w&.-]*(?:\s+[A-Z][\w&.-]*)*)/,
    /\bproduct\s+(?:called|named)\s+([A-Z][\w&.-]*(?:\s+[A-Z][\w&.-]*)*)/,
  ]);

  return {
    required: needsResearch,
    companyName,
    productName,
    productUrl,
    competitorUrl,
  };
}

export function buildCompanyLandingResearchQuery(value: string) {
  const intent = detectCompanyLandingResearchIntent(value);
  if (!intent.required) return null;

  const parts = [
    intent.companyName,
    intent.productName,
    "company product landing page features positioning pricing",
    intent.productUrl,
    intent.competitorUrl,
  ].filter(Boolean);

  return limitQuery(parts.join(" "));
}

/**
 * Detects live API dashboard builds that should verify docs/contracts via Exa
 * before wiring fetch clients.
 */
export function detectLiveApiDashboardResearchIntent(
  value: string,
): LiveApiDashboardResearchIntent {
  const objective = extractResearchObjective(value);
  const isDashboardBuild = matchesAny(
    objective,
    LIVE_API_DASHBOARD_BUILD_PATTERNS,
  );
  const urls = extractUrls(objective);
  const docsUrl =
    pickUrl(urls, (url) => /docs?|developer|reference|api\./i.test(url)) ??
    urls[0] ??
    null;
  const apiBaseUrl =
    pickUrl(
      urls,
      (url) =>
        url !== docsUrl && /(?:^https?:\/\/api\.|\/api(?:[/?#]|$))/i.test(url),
    ) ?? null;
  const needsResearch =
    isDashboardBuild &&
    (matchesAny(objective, GUIDED_RESEARCH_PATTERNS) || urls.length > 0);

  const appName = extractNamedEntity(objective, [
    /\bcalled\s+([A-Z][\w&.-]*(?:\s+[A-Z][\w&.-]*)*)\s+that\s+displays/i,
    /\bdashboard\s+called\s+([A-Z][\w&.-]*(?:\s+[A-Z][\w&.-]*)*)/,
  ]);
  const dataFocus = extractNamedEntity(objective, [
    /\bdisplays?\s+([\w\s,/-]{3,80}?)\s+from\s+a\s+public\s+api/i,
    /\blive\s+data\b[\s\S]{0,40}?\b(?:for|about|showing)\s+([\w\s,/-]{3,80})/i,
  ]);

  return {
    required: needsResearch,
    appName,
    docsUrl,
    apiBaseUrl,
    dataFocus,
  };
}

export function buildLiveApiDashboardResearchQuery(value: string) {
  const intent = detectLiveApiDashboardResearchIntent(value);
  if (!intent.required) return null;

  const parts = [
    intent.appName,
    intent.dataFocus,
    "official API documentation endpoints authentication CORS response schema",
    intent.docsUrl,
    intent.apiBaseUrl,
  ].filter(Boolean);

  return limitQuery(parts.join(" "));
}

/**
 * Detects local business / restaurant site builds that should research the
 * real venue before generation.
 */
export function detectLocalBusinessResearchIntent(
  value: string,
): LocalBusinessResearchIntent {
  const objective = extractResearchObjective(value);
  const isLocalBusinessBuild = matchesAny(
    objective,
    LOCAL_BUSINESS_BUILD_PATTERNS,
  );
  const urls = extractUrls(objective);
  const listingUrl =
    pickUrl(urls, (url) =>
      /(?:maps\.google|google\.com\/maps|yelp\.com|tripadvisor\.com)/i.test(
        url,
      ),
    ) ?? null;
  const websiteUrl = urls.find((url) => url !== listingUrl) ?? null;
  const needsResearch =
    isLocalBusinessBuild &&
    (matchesAny(objective, GUIDED_RESEARCH_PATTERNS) || urls.length > 0);

  const businessName = extractNamedEntity(objective, [
    /\bwebsite\s+for\s+([A-Z][\w&.-]*(?:\s+[A-Z][\w&.-]*)*),?\s+a\s+/i,
    /\bfor\s+([A-Z][\w&.-]*(?:\s+[A-Z][\w&.-]*)*),\s+a\s+/i,
    /\bresearch\s+([A-Z][\w&.-]*(?:\s+[A-Z][\w&.-]*)*)\s+on\s+the\s+web/,
  ]);
  const city = extractNamedEntity(objective, [
    /\bin\s+([A-Z][\w&.-]*(?:\s+[A-Z][\w&.-]*)*(?:,\s*[A-Z]{2})?)/,
  ]);

  return {
    required: needsResearch,
    businessName,
    city,
    websiteUrl,
    listingUrl,
  };
}

export function buildLocalBusinessResearchQuery(value: string) {
  const intent = detectLocalBusinessResearchIntent(value);
  if (!intent.required) return null;

  const parts = [
    intent.businessName,
    intent.city,
    "restaurant local business hours menu services location reviews",
    intent.websiteUrl,
    intent.listingUrl,
  ].filter(Boolean);

  return limitQuery(parts.join(" "));
}

/**
 * Unified gate for homepage prompt templates that force Exa research even when
 * chat already has linked URLs attached.
 */
export function detectGuidedTemplateResearchIntent(
  value: string,
): GuidedTemplateResearchIntent {
  if (detectPortfolioResearchIntent(value).required) {
    return { required: true, kind: "portfolio" };
  }
  if (detectCompanyLandingResearchIntent(value).required) {
    return { required: true, kind: "company-landing" };
  }
  if (detectLiveApiDashboardResearchIntent(value).required) {
    return { required: true, kind: "live-api-dashboard" };
  }
  if (detectLocalBusinessResearchIntent(value).required) {
    return { required: true, kind: "local-business" };
  }
  return { required: false, kind: null };
}

/**
 * Converts a user request into a bounded Exa search objective. Special cases
 * (errors, visual clones, incomplete API docs) get structured queries; ordinary
 * lookup requests are distilled into semantic search intent.
 */
export function buildResearchQuery(value: string) {
  const objective = extractResearchObjective(value);
  const portfolioQuery = buildPortfolioResearchQuery(objective);
  if (portfolioQuery) return portfolioQuery;

  const companyLandingQuery = buildCompanyLandingResearchQuery(objective);
  if (companyLandingQuery) return companyLandingQuery;

  const localBusinessQuery = buildLocalBusinessResearchQuery(objective);
  if (localBusinessQuery) return localBusinessQuery;

  const liveApiDashboardQuery = buildLiveApiDashboardResearchQuery(objective);
  if (liveApiDashboardQuery) return liveApiDashboardQuery;

  const errorQuery = extractErrorQuery(objective);
  if (errorQuery) return limitQuery(errorQuery);

  const websiteReference = detectWebsiteReferenceIntent(objective);
  if (
    websiteReference.required &&
    websiteReference.url &&
    websiteReference.hostname
  ) {
    return limitQuery(
      `${websiteReference.url} homepage design layout typography colors sections interactions`,
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

  return limitQuery(distillResearchObjective(objective));
}

/**
 * Detects requests where Exa tools may help. This is a coarse server-side gate;
 * when tools are attached, turn-specific prompts decide whether web_search is
 * necessary and how to phrase the query (unless the user forced search).
 */
export function detectResearchIntent(
  messages: Array<{ content: string }>,
): ResearchIntent {
  const apiDocumentation = assessApiDocumentation(messages);

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const content = extractResearchObjective(messages[index]?.content ?? "");
    if (!content || isClearlyLocalWork(content)) continue;

    const messageApiDocumentation = assessApiDocumentation([{ content }]);
    if (
      messageApiDocumentation.hasApiContext &&
      messageApiDocumentation.hasCompleteEndpointContract &&
      apiDocumentation.hasCompleteEndpointContract &&
      !mentionsWebResearch(content)
    ) {
      continue;
    }

    if (
      detectWebsiteReferenceIntent(content).required &&
      !detectGuidedTemplateResearchIntent(content).required
    ) {
      continue;
    }

    const explicitlyRequested = mentionsWebResearch(content);
    const informational = shouldAnswerWithoutCode(content);

    if (
      explicitlyRequested ||
      informational ||
      messageApiDocumentation.hasApiContext ||
      extractUrls(content).length > 0 ||
      matchesAny(content, RECENT_FACT_CUE_PATTERNS)
    ) {
      return {
        candidate: true,
        explicitlyRequested,
        freshness: inferResearchFreshness(content),
        reason: inferResearchReason(content),
        query: buildResearchQuery(content),
      };
    }
  }

  return {
    candidate: false,
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

export type ResolveResearchReasonInput = {
  researchIntent: ResearchIntent;
  searchApproved?: boolean;
  researchCandidate?: boolean;
  effectiveLiveApiRequired?: boolean;
  hasExplicitCompleteCreativeBrief?: boolean;
  portfolioResearchRequired?: boolean;
  companyLandingResearchRequired?: boolean;
  liveApiDashboardResearchRequired?: boolean;
  localBusinessResearchRequired?: boolean;
  guidedTemplateResearchRequired?: boolean;
};

/**
 * Derives the research reason for Exa tool config and agent instructions when
 * detectResearchIntent did not classify the turn (e.g. guided templates or
 * explicit search approval).
 */
export function resolveResearchReason(
  input: ResolveResearchReasonInput,
): ResearchReason | null {
  if (input.researchIntent.reason) {
    return input.researchIntent.reason;
  }

  if (
    input.effectiveLiveApiRequired ||
    input.liveApiDashboardResearchRequired
  ) {
    return "technical-reference";
  }

  if (
    input.hasExplicitCompleteCreativeBrief ||
    input.portfolioResearchRequired ||
    input.companyLandingResearchRequired ||
    input.localBusinessResearchRequired ||
    input.guidedTemplateResearchRequired
  ) {
    return "external-facts";
  }

  if (input.searchApproved || input.researchIntent.explicitlyRequested) {
    return "explicit";
  }

  if (input.researchCandidate) {
    return "external-facts";
  }

  return null;
}
