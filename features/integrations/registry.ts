export type IntegrationPolicyStatus = "approved" | "conditional" | "blocked";

export type IntegrationProvider = {
  id: string;
  name: string;
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
  verifiedAt: string;
};

const providers = [
  {
    id: "rest-countries",
    name: "REST Countries",
    capabilities: ["country search", "country metadata", "flags"],
    keywords: ["rest countries", "country explorer", "countries api"],
    hosts: ["restcountries.com"],
    docsUrl: "https://restcountries.com/",
    baseUrl: "https://restcountries.com/v3.1",
    auth: "none",
    runtime: "browser",
    requiredSecrets: [],
    corsCompatible: true,
    policyStatus: "approved",
    commercialUse: "review_required",
    attribution: null,
    limits:
      "Cache stable country metadata and avoid unnecessary repeat requests.",
    guidance:
      "Use field filtering and validate only the country fields the interface renders.",
    verifiedAt: "2026-07-11",
  },
  {
    id: "frankfurter",
    name: "Frankfurter",
    capabilities: ["exchange rates", "currency conversion"],
    keywords: ["frankfurter", "exchange rate", "currency converter"],
    hosts: ["api.frankfurter.app"],
    docsUrl: "https://frankfurter.dev/",
    baseUrl: "https://api.frankfurter.app",
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
    verifiedAt: "2026-07-11",
  },
  {
    id: "hacker-news",
    name: "Hacker News API",
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
    verifiedAt: "2026-07-11",
  },
  {
    id: "open-meteo",
    name: "Open-Meteo",
    capabilities: ["weather", "forecast", "geocoding", "air quality"],
    keywords: ["open meteo", "open-meteo", "weather", "forecast"],
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
    verifiedAt: "2026-07-11",
  },
  {
    id: "github",
    name: "GitHub API",
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
    verifiedAt: "2026-07-11",
  },
  {
    id: "coingecko",
    name: "CoinGecko API",
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
    verifiedAt: "2026-07-11",
  },
  {
    id: "nominatim-public",
    name: "Public Nominatim",
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
    verifiedAt: "2026-07-11",
  },
  {
    id: "supabase",
    name: "Supabase",
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
    verifiedAt: "2026-07-11",
  },
  {
    id: "stripe",
    name: "Stripe",
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
    verifiedAt: "2026-07-11",
  },
  {
    id: "resend",
    name: "Resend",
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
    verifiedAt: "2026-07-11",
  },
  {
    id: "vercel",
    name: "Vercel",
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
    verifiedAt: "2026-07-11",
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
    ...matches.map(
      (provider) =>
        `- ${provider.name} [${provider.id}]: policy=${provider.policyStatus}; auth=${provider.auth}; runtime=${provider.runtime}; commercialUse=${provider.commercialUse}; docs=${provider.docsUrl}; base=${provider.baseUrl}. ${provider.guidance}${provider.attribution ? ` Attribution: ${provider.attribution}` : ""}${provider.limits ? ` Limits: ${provider.limits}` : ""}`,
    ),
    "For a blocked provider, do not generate the integration. Present a setup-required state and a compliant alternative instead.",
    "Record the registry provider id in integrations.ts as providerId.",
    "=== END SQUID INTEGRATION REGISTRY ===",
  ].join("\n");
}
