import { buildIntegrationRegistryGuidance } from "@/features/integrations/registry";

export type LiveApiIntent = {
  required: boolean;
  kind: "none" | "public_candidate" | "server_required";
  reason: string | null;
};

const NO_API_PATTERNS = [
  /\b(?:calculator|portfolio|brochure|landing page|static site|timer|counter|unit converter)\b/i,
];

const SERVER_SIDE_BEHAVIOR_PATTERNS = [
  /\b(?:send|submit)\b.{0,50}\b(?:contact form|email|message|notification)\b/i,
  /\b(?:save|sync|persist|store)\b.{0,60}\b(?:user|project|account|shared|cloud|database|data)\b/i,
  /\b(?:payment|checkout|subscription|oauth|private api|secret key|server function|authentication|sign[ -]?in)\b/i,
];

const ACTIONABLE_WEBHOOK_PATTERNS = [
  /\b(?:configure|connect|enable|handle|implement|integrate|listen for|process|receive|register|set up|verify|wire)\b.{0,80}\bwebhooks?\b/i,
  /\bwebhooks?\b.{0,80}\b(?:endpoint|handler|listener|payload|receiver|secret|signature|URL)\b/i,
];

const PRESENTATIONAL_REQUEST_PATTERNS = [
  /\b(?:brochure|landing page|marketing page|marketing site|product page|static site)\b/i,
];

const LIVE_DATA_PATTERNS = [
  /\b(?:live|current|latest|real[- ]time|up[- ]to[- ]date|today(?:'s)?)\b.{0,80}\b(?:data|weather|forecast|rankings?|standings?|scores?|results?|schedule|prices?|rates?|odds|news|events?|products?|inventory|repositories|repos?)\b/i,
  /\b(?:weather|forecast|rankings?|standings?|scores?|exchange rates?|stock prices?|public dataset|government data|github repositor(?:y|ies)|json endpoint|public api|maps?)\b/i,
  /\b(?:fetch|load|display|show|use|connect to|integrate)\b.{0,80}\b(?:api|endpoint|feed|live data|current data)\b/i,
  /https?:\/\/[^\s]+/i,
];

export function detectLiveApiIntent(content: string): LiveApiIntent {
  const normalized = content.trim();
  if (!normalized) return { required: false, kind: "none", reason: null };

  const requestsServerBehavior =
    SERVER_SIDE_BEHAVIOR_PATTERNS.some((pattern) => pattern.test(normalized)) ||
    ACTIONABLE_WEBHOOK_PATTERNS.some((pattern) => pattern.test(normalized));
  const requestsLiveData = LIVE_DATA_PATTERNS.some((pattern) =>
    pattern.test(normalized),
  );
  const isPresentationalRequest = PRESENTATIONAL_REQUEST_PATTERNS.some(
    (pattern) => pattern.test(normalized),
  );

  // Product descriptions often mention payments, auth, or webhooks as subject
  // matter. A landing-page brief should not become an integration request
  // unless it also asks for concrete runtime behavior.
  if (
    isPresentationalRequest &&
    !requestsLiveData &&
    !ACTIONABLE_WEBHOOK_PATTERNS.some((pattern) => pattern.test(normalized)) &&
    !/\b(?:(?:add|configure|connect|enable|implement|integrate|set up|wire)\b.{0,80}|(?:functional|working)\b.{0,40})\b(?:authentication|checkout|oauth|payment|sign[ -]?in|subscription)\b/i.test(
      normalized,
    )
  ) {
    return { required: false, kind: "none", reason: null };
  }

  if (requestsServerBehavior) {
    return {
      required: true,
      kind: "server_required",
      reason:
        "The requested behavior needs credentials, persistence, or an external side effect.",
    };
  }

  if (requestsLiveData) {
    return {
      required: true,
      kind: "public_candidate",
      reason: "The requested functionality depends on live external data.",
    };
  }

  if (NO_API_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return { required: false, kind: "none", reason: null };
  }

  return { required: false, kind: "none", reason: null };
}

export function buildLiveApiGenerationContract(
  intent: LiveApiIntent,
  integrationContext = "",
) {
  if (!intent.required) return "";

  const registryGuidance = buildIntegrationRegistryGuidance(integrationContext);

  if (intent.kind === "server_required") {
    return `

=== INTEGRATION SAFETY BOUNDARY ===
This request needs a server-side integration. The generated runtime is browser-only, so do not put secrets, private tokens, OAuth client secrets, privileged database keys, payments, email sending, or write-capable authenticated requests in client code. Build the complete frontend and an honest setup-required state. Record the proposed integration in integrations.ts with runtime: "server", its official docsUrl, auth mode, and requiredSecrets. Do not simulate a successful external side effect.
=== END INTEGRATION SAFETY BOUNDARY ===${registryGuidance}`;
  }

  return `

    === LIVE API APP CONTRACT ===
    The app must use live data from the exact API contract established by the verified research brief, selected-provider guidance, or complete endpoint details supplied by the user. Those sources are authoritative; never substitute a different provider, endpoint version, or remembered contract.
- Use native fetch through a typed client in a dedicated api/ or services/ file.
- Direct browser calls are allowed only when auth is "none" or "publishable_key" and the official docs establish browser CORS support. Never embed a secret.
- Handle response.ok, an AbortController timeout, bounded retry with backoff, loading, empty, and actionable error states.
- Validate unknown response JSON at runtime with explicit type guards before rendering. Do not use unchecked casts.
- Validate required functional fields, but do not reject an otherwise valid payload because optional metadata is absent. Use exact field names from an official sample or a verified live response.
- Preserve documented unit metadata and normalize values explicitly before rendering so one screen never mixes Celsius/Fahrenheit, meters/miles, or other incompatible units without labels.
- Never try to set browser-forbidden request headers such as User-Agent, Origin, Host, Referer, Cookie, or Content-Length. The browser owns them.
- Create integrations.ts exporting structured metadata for each API: name, purpose, docsUrl, baseUrl, auth, requiredSecrets, corsCompatible, and runtime.
- For a publishable key, read a clearly named VITE_* variable. Never hard-code it. Render a setup-required state when it is absent.
    - Include visible source attribution in the app where the provider requires it.
    - Do not replace requested live behavior with mock, sample, placeholder, hard-coded, or randomly generated data. Unless the user explicitly requested an offline demo, a failed request must render an honest error or setup-required state rather than fake success.
    - Never invent endpoints, query parameters, headers, response fields, auth rules, or CORS support. If the supplied or researched contract does not establish a detail needed for a safe implementation, expose that limitation honestly instead of guessing.
    === END LIVE API APP CONTRACT ===${registryGuidance}`;
}
