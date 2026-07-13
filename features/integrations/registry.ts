export type IntegrationPolicyStatus = "approved" | "conditional" | "blocked";

export type IntegrationCategory =
  | "data"
  | "developer"
  | "backend"
  | "commerce"
  | "communication"
  | "deployment";

export type IntegrationProvider = {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  capabilities: string[];
  keywords: string[];
  hosts: string[];
  docsUrl: string;
  baseUrl: string;
  auth: "none" | "publishable_key" | "secret" | "oauth";
  runtime: "browser" | "server";
  requiredSecrets: string[];
  corsCompatible: boolean | null;
  policyStatus: IntegrationPolicyStatus;
  commercialUse: "allowed" | "restricted" | "review_required";
  attribution: string | null;
  limits: string | null;
  guidance: string;
  exampleEndpoint: string | null;
  implementationGuidance: string;
  verifiedAt: string;
};

const providers = [
  {
    id: "rest-countries",
    name: "REST Countries",
    category: "data",
    description: "Search normalized country, geography, and flag data.",
    capabilities: ["country search", "country metadata", "flags"],
    keywords: ["rest countries", "country explorer", "countries api"],
    hosts: ["api.restcountries.com", "restcountries.com"],
    docsUrl: "https://restcountries.com/docs",
    baseUrl: "https://api.restcountries.com/countries/v5",
    auth: "secret",
    runtime: "server",
    requiredSecrets: ["REST_COUNTRIES_API_KEY"],
    corsCompatible: false,
    policyStatus: "conditional",
    commercialUse: "review_required",
    attribution: null,
    limits:
      "Version 5 is authenticated and plan limits apply. Cache stable country metadata and request only the fields the app uses.",
    guidance:
      "Use the current v5 API from a server adapter. Do not generate legacy v3.1 endpoints or expose the bearer token in browser code.",
    exampleEndpoint:
      "https://api.restcountries.com/countries/v5?limit=25&q=canada",
    implementationGuidance:
      "Send the provider key as a Bearer token from the server, honor pagination, and derive response guards from the v5 schema instead of reusing legacy v3.1 field names.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "frankfurter",
    name: "Frankfurter",
    category: "data",
    description: "Daily central-bank exchange rates with no API key.",
    capabilities: ["exchange rates", "currency conversion"],
    keywords: ["frankfurter", "exchange rate", "currency converter"],
    hosts: ["api.frankfurter.dev"],
    docsUrl: "https://frankfurter.dev/",
    baseUrl: "https://api.frankfurter.dev/v2",
    auth: "none",
    runtime: "browser",
    requiredSecrets: [],
    corsCompatible: true,
    policyStatus: "approved",
    commercialUse: "review_required",
    attribution: "Rates are sourced from central-bank reference data.",
    limits: "Cache rates according to their published update cadence.",
    guidance:
      "Show the rate date and make clear that reference rates are not live trading quotes.",
    exampleEndpoint:
      "https://api.frankfurter.dev/v2/rates?base=USD&quotes=EUR,GBP",
    implementationGuidance:
      "Use the v2 /rates endpoint. It returns an array of {date, base, quote, rate}; filter by base and quotes, and compute conversions locally because there is no conversion endpoint.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "hacker-news",
    name: "Hacker News API",
    category: "data",
    description: "Official Hacker News stories, comments, and profiles.",
    capabilities: ["technology news", "stories", "comments", "user profiles"],
    keywords: ["hacker news", "startup news", "technology news"],
    hosts: ["hacker-news.firebaseio.com"],
    docsUrl: "https://github.com/HackerNews/API",
    baseUrl: "https://hacker-news.firebaseio.com/v0",
    auth: "none",
    runtime: "browser",
    requiredSecrets: [],
    corsCompatible: true,
    policyStatus: "approved",
    commercialUse: "review_required",
    attribution:
      "Identify Hacker News as the source and link story titles to the source URL.",
    limits: "Bound fan-out when resolving item IDs and cache item responses.",
    guidance:
      "Fetch a bounded list of item IDs, then resolve only the items visible in the interface.",
    exampleEndpoint: "https://hacker-news.firebaseio.com/v0/topstories.json",
    implementationGuidance:
      "Fetch a bounded slice of story IDs, resolve /v0/item/{id}.json with bounded concurrency, and handle null, deleted, or dead items before rendering.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "weather-gov",
    name: "National Weather Service",
    category: "data",
    description: "Official U.S. forecasts, alerts, and observations.",
    capabilities: [
      "United States weather",
      "forecasts",
      "weather alerts",
      "observations",
    ],
    keywords: [
      "national weather service",
      "nws api",
      "weather.gov",
      "api.weather.gov",
    ],
    hosts: ["api.weather.gov"],
    docsUrl: "https://www.weather.gov/documentation/services-web-api",
    baseUrl: "https://api.weather.gov",
    auth: "none",
    runtime: "browser",
    requiredSecrets: [],
    corsCompatible: true,
    policyStatus: "approved",
    commercialUse: "allowed",
    attribution: "Identify the National Weather Service as the data source.",
    limits:
      "Reasonable unpublished rate limits apply. Honor cache headers and retry short-lived rate limits with bounded backoff.",
    guidance:
      "Use only for U.S. locations. Resolve coordinates through /points and follow the returned forecast or forecastHourly URL; never hard-code a forecast office or grid coordinate.",
    exampleEndpoint: "https://api.weather.gov/points/41.8781,-87.6298",
    implementationGuidance:
      "Round WGS84 coordinates to at most four decimal places, fetch /points/{lat},{lon}, validate properties.forecast or properties.forecastHourly, then fetch that returned URL. Cache the point mapping but refresh it periodically. Browsers supply User-Agent automatically; server adapters must send an identifying User-Agent and contact.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "open-meteo",
    name: "Open-Meteo",
    category: "data",
    description: "Forecast, geocoding, and air-quality data for prototypes.",
    capabilities: ["weather", "forecast", "geocoding", "air quality"],
    keywords: ["open meteo", "open-meteo", "open meteo weather"],
    hosts: [
      "api.open-meteo.com",
      "geocoding-api.open-meteo.com",
      "customer-api.open-meteo.com",
    ],
    docsUrl: "https://open-meteo.com/en/docs",
    baseUrl: "https://api.open-meteo.com/v1",
    auth: "none",
    runtime: "browser",
    requiredSecrets: [],
    corsCompatible: true,
    policyStatus: "conditional",
    commercialUse: "restricted",
    attribution:
      "Open-Meteo data requires attribution under its data licenses.",
    limits:
      "The free endpoint is limited and intended for non-commercial use; commercial apps require the customer API and an API key.",
    guidance:
      "Use the free endpoint only for a confirmed non-commercial prototype. For a commercial app, mark setup required and use the customer endpoint through an appropriate credential boundary.",
    exampleEndpoint:
      "https://api.open-meteo.com/v1/forecast?latitude=41.8781&longitude=-87.6298&current=temperature_2m,wind_speed_10m&timezone=auto",
    implementationGuidance:
      "Request explicit current/hourly/daily variables and timezone=auto. Read unit labels from current_units, hourly_units, or daily_units instead of assuming Celsius, km/h, or local time.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "github",
    name: "GitHub API",
    category: "developer",
    description: "Connect repositories, issues, contributors, and source sync.",
    capabilities: ["repositories", "contributors", "issues", "source sync"],
    keywords: ["github", "repository viewer", "repo viewer", "contributors"],
    hosts: ["api.github.com"],
    docsUrl: "https://docs.github.com/en/rest",
    baseUrl: "https://api.github.com",
    auth: "oauth",
    runtime: "server",
    requiredSecrets: ["GITHUB_APP_ID", "GITHUB_APP_PRIVATE_KEY"],
    corsCompatible: true,
    policyStatus: "conditional",
    commercialUse: "allowed",
    attribution: null,
    limits:
      "Unauthenticated REST access is heavily rate-limited; production apps should use a GitHub App or user-authorized token.",
    guidance:
      "Public read-only demos may use unauthenticated requests sparingly. Repository writes and reliable production access require a server-side GitHub App integration.",
    exampleEndpoint: "https://api.github.com/user",
    implementationGuidance:
      "Use a GitHub App installation token for repository operations, send Accept: application/vnd.github+json and X-GitHub-Api-Version: 2026-03-10, and request only the repository permissions the workflow needs.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "coingecko",
    name: "CoinGecko API",
    category: "data",
    description: "Cryptocurrency prices and market data from CoinGecko.",
    capabilities: ["cryptocurrency prices", "market data"],
    keywords: ["coingecko", "crypto price", "crypto tracker", "cryptocurrency"],
    hosts: ["api.coingecko.com", "pro-api.coingecko.com"],
    docsUrl: "https://docs.coingecko.com/",
    baseUrl: "https://api.coingecko.com/api/v3",
    auth: "secret",
    runtime: "server",
    requiredSecrets: ["COINGECKO_API_KEY"],
    corsCompatible: null,
    policyStatus: "conditional",
    commercialUse: "review_required",
    attribution: null,
    limits: "Plan-specific rate limits apply.",
    guidance:
      "Keep API keys in a server runtime. Do not place Demo or Pro keys in generated browser code.",
    exampleEndpoint:
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
    implementationGuidance:
      "For Demo keys use api.coingecko.com with x-cg-demo-api-key; for Pro keys use pro-api.coingecko.com with x-cg-pro-api-key. Keep either key server-side and preserve the requested asset IDs and quote currencies.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "nominatim-public",
    name: "Public Nominatim",
    category: "data",
    description:
      "Public OpenStreetMap geocoding service with strict usage rules.",
    capabilities: ["geocoding", "reverse geocoding", "place search"],
    keywords: ["nominatim", "openstreetmap geocoding", "osm geocoding"],
    hosts: ["nominatim.openstreetmap.org"],
    docsUrl: "https://operations.osmfoundation.org/policies/nominatim/",
    baseUrl: "https://nominatim.openstreetmap.org",
    auth: "none",
    runtime: "server",
    requiredSecrets: [],
    corsCompatible: null,
    policyStatus: "blocked",
    commercialUse: "restricted",
    attribution: "OpenStreetMap attribution is required.",
    limits:
      "The public service has strict usage, caching, and identification requirements.",
    guidance:
      "Do not automatically generate the public Nominatim service into Squid apps. Require the user to choose a compliant commercial provider or a self-hosted Nominatim instance.",
    exampleEndpoint: null,
    implementationGuidance:
      "Do not emit code for the public service. It is explicitly prohibited as a generic geocoder in no-code, low-code, and vibe-coding platforms; use a compliant provider or self-hosted instance instead.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "backend",
    description:
      "Authentication, Postgres data, storage, and server functions.",
    capabilities: ["authentication", "database", "storage", "server functions"],
    keywords: [
      "supabase",
      "database",
      "authentication",
      "user accounts",
      "persistence",
    ],
    hosts: ["supabase.co"],
    docsUrl: "https://supabase.com/docs",
    baseUrl: "https://api.supabase.com/v1",
    auth: "oauth",
    runtime: "server",
    requiredSecrets: [],
    corsCompatible: null,
    policyStatus: "conditional",
    commercialUse: "allowed",
    attribution: null,
    limits: "Project and API limits depend on the connected Supabase plan.",
    guidance:
      "Provisioning, privileged database operations, migrations, and service-role access must stay server-side. Only publishable project values may reach the browser.",
    exampleEndpoint: "https://api.supabase.com/v1/projects",
    implementationGuidance:
      "Use the Management API only from Squid's server with OAuth or a PAT. Generated clients may expose only the project URL and sb_publishable_* key, must rely on Row Level Security, and must never expose sb_secret_* or legacy service_role values.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "commerce",
    description: "Checkout, subscriptions, billing, and verified webhooks.",
    capabilities: ["payments", "checkout", "subscriptions", "webhooks"],
    keywords: ["stripe", "payment", "checkout", "subscription", "billing"],
    hosts: ["api.stripe.com"],
    docsUrl: "https://docs.stripe.com/",
    baseUrl: "https://api.stripe.com/v1",
    auth: "secret",
    runtime: "server",
    requiredSecrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    corsCompatible: false,
    policyStatus: "conditional",
    commercialUse: "allowed",
    attribution: null,
    limits:
      "Provider account, regional availability, and API rate limits apply.",
    guidance:
      "Use server-created Checkout Sessions, validate webhook signatures, and never expose a secret key in generated source.",
    exampleEndpoint: "https://api.stripe.com/v1/checkout/sessions",
    implementationGuidance:
      "Create a new Checkout Session on the server for each payment attempt, redirect or initialize Stripe.js from the returned session data, use idempotency for side effects, and verify Stripe-Signature against the raw webhook body before fulfillment.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "resend",
    name: "Resend",
    category: "communication",
    description: "Transactional email with domain and webhook support.",
    capabilities: ["transactional email", "email webhooks"],
    keywords: ["resend", "send email", "transactional email", "contact form"],
    hosts: ["api.resend.com"],
    docsUrl: "https://resend.com/docs",
    baseUrl: "https://api.resend.com",
    auth: "secret",
    runtime: "server",
    requiredSecrets: ["RESEND_API_KEY"],
    corsCompatible: false,
    policyStatus: "conditional",
    commercialUse: "allowed",
    attribution: null,
    limits: "Sending and domain limits depend on the connected Resend plan.",
    guidance:
      "Send mail from a server runtime with a sending-only key and render an honest setup state until the sending domain is verified.",
    exampleEndpoint: "https://api.resend.com/emails",
    implementationGuidance:
      "POST email from the server with Bearer auth, an identifying User-Agent, and an Idempotency-Key for retryable sends. Require a verified sending domain and never report success before Resend returns an email id.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "deployment",
    description:
      "Preview deployments, projects, domains, and environment values.",
    capabilities: [
      "deployments",
      "preview environments",
      "domains",
      "environment variables",
    ],
    keywords: [
      "vercel",
      "deploy",
      "deployment",
      "preview deployment",
      "custom domain",
    ],
    hosts: ["api.vercel.com"],
    docsUrl: "https://vercel.com/docs/rest-api",
    baseUrl: "https://api.vercel.com",
    auth: "oauth",
    runtime: "server",
    requiredSecrets: [],
    corsCompatible: false,
    policyStatus: "conditional",
    commercialUse: "allowed",
    attribution: null,
    limits: "Deployment and team limits depend on the connected Vercel plan.",
    guidance:
      "Create deployments and environment variables through a server-side Vercel integration with explicit user authorization.",
    exampleEndpoint: "https://api.vercel.com/v2/user",
    implementationGuidance:
      "Use a server-held OAuth or access token, include teamId for team-owned resources, poll deployment state to a terminal result, and never return environment-variable values to the browser.",
    verifiedAt: "2026-07-13",
  },
] as const satisfies readonly IntegrationProvider[];

export const integrationRegistry: readonly IntegrationProvider[] = providers;

export function getIntegrationProvider(id: string) {
  return integrationRegistry.find((provider) => provider.id === id) ?? null;
}

export function findIntegrationProviders(content: string) {
  const normalized = content.toLowerCase();
  return integrationRegistry.filter(
    (provider) =>
      provider.keywords.some((keyword) => normalized.includes(keyword)) ||
      provider.hosts.some((host) => normalized.includes(host)),
  );
}

export function findIntegrationProviderByUrl(value: string) {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return (
      integrationRegistry.find((provider) =>
        provider.hosts.some(
          (host) => hostname === host || hostname.endsWith(`.${host}`),
        ),
      ) ?? null
    );
  } catch {
    return null;
  }
}

export function buildIntegrationRegistryGuidance(content: string) {
  const matches = findIntegrationProviders(content);
  if (matches.length === 0) return "";

  return [
    "",
    "=== SQUID INTEGRATION REGISTRY ===",
    "Apply these reviewed provider policies. They override generic API suggestions:",
    ...matches.map((provider) => formatIntegrationProviderForPrompt(provider)),
    "For a blocked provider, do not generate the integration. Present a setup-required state and a compliant alternative instead.",
    "Record the registry provider id in integrations.ts as providerId.",
    "=== END SQUID INTEGRATION REGISTRY ===",
  ].join("\n");
}

export function buildIntegrationProviderGuidance(providerIds: string[]) {
  const requested = new Set(providerIds);
  const matches = integrationRegistry.filter((provider) =>
    requested.has(provider.id),
  );
  if (matches.length === 0) return "";

  return [
    "=== SELECTED API IMPLEMENTATION GUIDANCE ===",
    "MANDATORY PROVIDER CONTRACT: every provider listed below is an explicit user requirement, not a suggestion.",
    "Use every selected provider in the app plan and generated implementation. Do not omit it, replace it with another provider, or fall back to mock/static data.",
    "For each selected provider, carry its exact providerId into the app specification and integrations.ts, implement its reviewed client or server adapter, and connect it to a user-visible app flow.",
    "If credentials, authorization, or a server runtime are unavailable, keep the selected provider in the implementation and render an honest setup-required state. Never simulate success or substitute a different API.",
    "If a selected provider cannot safely satisfy the request, surface the conflict explicitly instead of generating an app that silently ignores the selection.",
    ...matches.map(formatIntegrationProviderForPrompt),
    "Before finishing, verify that every selected providerId appears in integrations.ts and that its adapter is used by the app. Missing any selected provider is a failed generation.",
    "=== END SELECTED API IMPLEMENTATION GUIDANCE ===",
  ].join("\n");
}

function formatIntegrationProviderForPrompt(provider: IntegrationProvider) {
  return `- ${provider.name} [${provider.id}]: policy=${provider.policyStatus}; auth=${provider.auth}; runtime=${provider.runtime}; commercialUse=${provider.commercialUse}; docs=${provider.docsUrl}; base=${provider.baseUrl}${provider.exampleEndpoint ? `; example=${provider.exampleEndpoint}` : ""}. ${provider.guidance} Implementation: ${provider.implementationGuidance}${provider.attribution ? ` Attribution: ${provider.attribution}` : ""}${provider.limits ? ` Limits: ${provider.limits}` : ""}`;
}
