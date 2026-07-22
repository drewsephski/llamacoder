import "server-only";

import type { Prisma } from "@prisma/client";

import type { IntegrationProvider } from "@/features/integrations/registry";
import { createGitHubInstallationToken } from "@/features/integrations/server/github-app";
import { IntegrationServiceError } from "@/features/integrations/server/integration-error";
import type {
  SupabaseManagementCapabilities,
  SupabaseManagementCapabilityStatus,
} from "@/features/integrations/supabase-management-capabilities";

type ProviderHealthResult = {
  ok: boolean;
  message: string;
};

type SupabaseCapabilityIssue = SupabaseManagementCapabilities["issue"];

type SupabaseCapabilityProbe = {
  status: SupabaseManagementCapabilityStatus;
  issue: SupabaseCapabilityIssue;
};

function classifySupabaseCapabilityResponse(
  status: number,
): SupabaseCapabilityProbe {
  if (status >= 200 && status < 300) {
    return { status: "verified", issue: null };
  }
  if (status === 401) {
    return {
      status: "reauthorization_required",
      issue: "connection_expired",
    };
  }
  if (status === 403) {
    return {
      status: "reauthorization_required",
      issue: "insufficient_permissions",
    };
  }
  if (status === 404) {
    return { status: "missing", issue: "project_unavailable" };
  }
  if (status === 429) {
    return { status: "error", issue: "rate_limited" };
  }
  return { status: "error", issue: "provider_unavailable" };
}

async function probeSupabaseManagementCapability({
  credential,
  url,
  fetchImpl,
  request,
}: {
  credential: string;
  url: string;
  fetchImpl: typeof fetch;
  request?: (url: string) => Promise<unknown>;
}): Promise<SupabaseCapabilityProbe> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    if (request) {
      await request(url);
      return { status: "verified", issue: null };
    }
    const response = await fetchImpl(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${credential}`,
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    return classifySupabaseCapabilityResponse(response.status);
  } catch (error) {
    if (error instanceof IntegrationServiceError) {
      return classifySupabaseCapabilityResponse(error.status);
    }
    return { status: "error", issue: "provider_unavailable" };
  } finally {
    clearTimeout(timeout);
  }
}

function selectSupabaseCapabilityIssue(
  probes: SupabaseCapabilityProbe[],
): SupabaseCapabilityIssue {
  const priorities: Exclude<SupabaseCapabilityIssue, null>[] = [
    "connection_expired",
    "insufficient_permissions",
    "rate_limited",
    "provider_unavailable",
    "project_unavailable",
  ];
  return (
    priorities.find((issue) => probes.some((probe) => probe.issue === issue)) ??
    null
  );
}

export async function requestSupabaseManagementCapabilities({
  credential,
  projectRef,
  fetchImpl = fetch,
  request,
}: {
  credential: string;
  projectRef: string | null;
  fetchImpl?: typeof fetch;
  request?: (url: string) => Promise<unknown>;
}): Promise<SupabaseManagementCapabilities> {
  const projectBaseUrl = projectRef
    ? `https://api.supabase.com/v1/projects/${encodeURIComponent(projectRef)}`
    : "https://api.supabase.com/v1/projects";
  const projectsReadPromise = probeSupabaseManagementCapability({
    credential,
    url: projectBaseUrl,
    fetchImpl,
    request,
  });
  const [projectsRead, secretsRead, databaseRead] = await Promise.all([
    projectsReadPromise,
    projectRef
      ? probeSupabaseManagementCapability({
          credential,
          url: `${projectBaseUrl}/api-keys`,
          fetchImpl,
          request,
        })
      : Promise.resolve<SupabaseCapabilityProbe>({
          status: "unverified",
          issue: null,
        }),
    projectRef
      ? probeSupabaseManagementCapability({
          credential,
          url: `${projectBaseUrl}/types/typescript?included_schemas=public`,
          fetchImpl,
          request,
        })
      : Promise.resolve<SupabaseCapabilityProbe>({
          status: "unverified",
          issue: null,
        }),
  ]);

  return {
    projectsRead: projectsRead.status,
    projectsWrite: "unverified",
    secretsRead: secretsRead.status,
    databaseRead: databaseRead.status,
    databaseWrite: "unverified",
    authWrite: "unverified",
    projectRef,
    checkedAt: new Date().toISOString(),
    issue: selectSupabaseCapabilityIssue([
      projectsRead,
      secretsRead,
      databaseRead,
    ]),
  };
}

type HealthCheck = {
  url: string;
  headers: Record<string, string>;
  successMessage: string;
  validate?: (payload: unknown) => boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readInstallationId(metadata: Prisma.JsonValue | null) {
  return metadata &&
    typeof metadata === "object" &&
    !Array.isArray(metadata) &&
    typeof metadata.installationId === "string"
    ? metadata.installationId
    : null;
}

function createHealthCheck({
  provider,
  credential,
  githubInstallation,
}: {
  provider: IntegrationProvider;
  credential: string | null;
  githubInstallation: boolean;
}): HealthCheck | null {
  switch (provider.id) {
    case "rest-countries":
      return {
        url: `${provider.baseUrl}?limit=1`,
        headers: { Authorization: `Bearer ${credential}` },
        successMessage: "REST Countries accepted the key and returned v5 data.",
        validate: (payload) => Array.isArray(payload) || isRecord(payload),
      };
    case "frankfurter":
      return {
        url: `${provider.baseUrl}/rates?base=USD&quotes=EUR`,
        headers: {},
        successMessage:
          "Frankfurter returned a valid v2 exchange-rate payload.",
        validate: (payload) =>
          Array.isArray(payload) &&
          payload.length > 0 &&
          isRecord(payload[0]) &&
          typeof payload[0].date === "string" &&
          typeof payload[0].base === "string" &&
          typeof payload[0].quote === "string" &&
          typeof payload[0].rate === "number",
      };
    case "hacker-news":
      return {
        url: `${provider.baseUrl}/topstories.json`,
        headers: {},
        successMessage: "Hacker News returned a valid story-id feed.",
        validate: (payload) =>
          Array.isArray(payload) &&
          payload.length > 0 &&
          payload.every((item) => typeof item === "number"),
      };
    case "octagon":
      return {
        url: `${provider.baseUrl}/rankings`,
        headers: {},
        successMessage: "Octagon returned a valid MMA rankings payload.",
        validate: (payload) =>
          Array.isArray(payload) &&
          payload.length > 0 &&
          payload.every(
            (division) =>
              isRecord(division) &&
              typeof division.id === "string" &&
              typeof division.categoryName === "string" &&
              isRecord(division.champion) &&
              typeof division.champion.id === "string" &&
              typeof division.champion.championName === "string" &&
              Array.isArray(division.fighters) &&
              division.fighters.every(
                (fighter) =>
                  isRecord(fighter) &&
                  typeof fighter.id === "string" &&
                  typeof fighter.name === "string",
              ),
          ),
      };
    case "art-institute-chicago":
      return {
        url: provider.exampleEndpoint!,
        headers: {
          "AIC-User-Agent": "Squid-Agent (support@squidagent.app)",
        },
        successMessage:
          "Art Institute of Chicago returned a public-domain artwork and IIIF configuration.",
        validate: (payload) =>
          isRecord(payload) &&
          Array.isArray(payload.data) &&
          payload.data.length > 0 &&
          payload.data.every(
            (artwork) =>
              isRecord(artwork) &&
              typeof artwork.id === "number" &&
              typeof artwork.title === "string" &&
              typeof artwork.image_id === "string" &&
              artwork.is_public_domain === true,
          ) &&
          isRecord(payload.config) &&
          typeof payload.config.iiif_url === "string",
      };
    case "usgs-earthquakes":
      return {
        url: provider.exampleEndpoint!,
        headers: { Accept: "application/geo+json, application/json" },
        successMessage: "USGS returned a valid live GeoJSON earthquake feed.",
        validate: (payload) =>
          isRecord(payload) &&
          payload.type === "FeatureCollection" &&
          isRecord(payload.metadata) &&
          typeof payload.metadata.generated === "number" &&
          typeof payload.metadata.count === "number" &&
          Array.isArray(payload.features) &&
          payload.features.every(
            (feature) =>
              isRecord(feature) &&
              typeof feature.id === "string" &&
              isRecord(feature.properties) &&
              (typeof feature.properties.mag === "number" ||
                feature.properties.mag === null) &&
              typeof feature.properties.place === "string" &&
              typeof feature.properties.time === "number" &&
              isRecord(feature.geometry) &&
              feature.geometry.type === "Point" &&
              Array.isArray(feature.geometry.coordinates) &&
              feature.geometry.coordinates.length >= 2 &&
              feature.geometry.coordinates.every(
                (coordinate) => typeof coordinate === "number",
              ),
          ),
      };
    case "met-museum":
      return {
        url: provider.exampleEndpoint!,
        headers: {},
        successMessage: "The Met returned valid artwork search results.",
        validate: (payload) =>
          isRecord(payload) &&
          typeof payload.total === "number" &&
          Array.isArray(payload.objectIDs) &&
          payload.objectIDs.length > 0 &&
          payload.objectIDs.every((objectId) => typeof objectId === "number"),
      };
    case "openfema":
      return {
        url: provider.exampleEndpoint!,
        headers: { Accept: "application/json" },
        successMessage:
          "OpenFEMA returned a valid v2 disaster declaration payload.",
        validate: (payload) =>
          isRecord(payload) &&
          isRecord(payload.metadata) &&
          payload.metadata.version === "v2" &&
          Array.isArray(payload.DisasterDeclarationsSummaries) &&
          payload.DisasterDeclarationsSummaries.length > 0 &&
          payload.DisasterDeclarationsSummaries.every(
            (declaration) =>
              isRecord(declaration) &&
              typeof declaration.disasterNumber === "number" &&
              typeof declaration.state === "string" &&
              typeof declaration.declarationDate === "string" &&
              typeof declaration.incidentType === "string" &&
              typeof declaration.declarationTitle === "string" &&
              typeof declaration.lastRefresh === "string" &&
              (typeof declaration.incidentEndDate === "string" ||
                declaration.incidentEndDate === null),
          ),
      };
    case "federal-register":
      return {
        url: provider.exampleEndpoint!,
        headers: { Accept: "application/json" },
        successMessage:
          "Federal Register returned a valid document-search payload.",
        validate: (payload) =>
          isRecord(payload) &&
          typeof payload.count === "number" &&
          typeof payload.total_pages === "number" &&
          Array.isArray(payload.results) &&
          payload.results.length > 0 &&
          payload.results.every(
            (document) =>
              isRecord(document) &&
              typeof document.document_number === "string" &&
              typeof document.title === "string" &&
              typeof document.type === "string" &&
              typeof document.publication_date === "string" &&
              typeof document.html_url === "string" &&
              (typeof document.pdf_url === "string" ||
                document.pdf_url === null),
          ),
      };
    case "world-bank":
      return {
        url: provider.exampleEndpoint!,
        headers: { Accept: "application/json" },
        successMessage:
          "World Bank returned valid indicator metadata and observations.",
        validate: (payload) => {
          if (
            !Array.isArray(payload) ||
            payload.length !== 2 ||
            !isRecord(payload[0]) ||
            !Array.isArray(payload[1]) ||
            payload[1].length === 0
          ) {
            return false;
          }
          return (
            typeof payload[0].page === "number" &&
            typeof payload[0].lastupdated === "string" &&
            payload[1].every(
              (observation) =>
                isRecord(observation) &&
                isRecord(observation.indicator) &&
                typeof observation.indicator.id === "string" &&
                typeof observation.countryiso3code === "string" &&
                typeof observation.date === "string" &&
                (typeof observation.value === "number" ||
                  observation.value === null),
            )
          );
        },
      };
    case "open-library":
      return {
        url: provider.exampleEndpoint!,
        headers: {
          "User-Agent": "Squid-Agent/1.0 (support@squidagent.app)",
        },
        successMessage: "Open Library returned valid book-search results.",
        validate: (payload) =>
          isRecord(payload) &&
          typeof payload.numFound === "number" &&
          Array.isArray(payload.docs) &&
          payload.docs.length > 0 &&
          payload.docs.every(
            (book) =>
              isRecord(book) &&
              typeof book.key === "string" &&
              typeof book.title === "string" &&
              (book.author_name === undefined ||
                (Array.isArray(book.author_name) &&
                  book.author_name.every(
                    (author) => typeof author === "string",
                  ))) &&
              (book.cover_i === undefined || typeof book.cover_i === "number"),
          ),
      };
    case "open-food-facts":
      return {
        url: provider.exampleEndpoint!,
        headers: {
          "User-Agent": "Squid-Agent/1.0 (support@squidagent.app)",
        },
        successMessage: "Open Food Facts returned a valid v3 product payload.",
        validate: (payload) =>
          isRecord(payload) &&
          payload.status === "success" &&
          isRecord(payload.result) &&
          payload.result.id === "product_found" &&
          isRecord(payload.product) &&
          typeof payload.product.code === "string" &&
          typeof payload.product.product_name === "string" &&
          typeof payload.product.nutriscore_grade === "string" &&
          typeof payload.product.image_front_small_url === "string",
      };
    case "gbif":
      return {
        url: provider.exampleEndpoint!,
        headers: {
          "User-Agent": "Squid-Agent/1.0 (support@squidagent.app)",
        },
        successMessage: "GBIF returned valid licensed occurrence records.",
        validate: (payload) =>
          isRecord(payload) &&
          typeof payload.count === "number" &&
          Array.isArray(payload.results) &&
          payload.results.length > 0 &&
          payload.results.every(
            (occurrence) =>
              isRecord(occurrence) &&
              typeof occurrence.key === "number" &&
              typeof occurrence.scientificName === "string" &&
              typeof occurrence.datasetKey === "string" &&
              typeof occurrence.license === "string" &&
              Array.isArray(occurrence.media),
          ),
      };
    case "openfda":
      return {
        url: provider.exampleEndpoint!,
        headers: { Accept: "application/json" },
        successMessage: "openFDA returned a valid drug-label payload.",
        validate: (payload) =>
          isRecord(payload) &&
          isRecord(payload.meta) &&
          typeof payload.meta.disclaimer === "string" &&
          typeof payload.meta.last_updated === "string" &&
          typeof payload.meta.terms === "string" &&
          typeof payload.meta.license === "string" &&
          Array.isArray(payload.results) &&
          payload.results.length > 0 &&
          payload.results.every(
            (label) =>
              isRecord(label) &&
              typeof label.id === "string" &&
              isRecord(label.openfda),
          ),
      };
    case "open-meteo":
      return {
        url: `${provider.baseUrl}/forecast?latitude=41.8781&longitude=-87.6298&current=temperature_2m&timezone=auto`,
        headers: {},
        successMessage: "Open-Meteo returned valid current weather and units.",
        validate: (payload) =>
          isRecord(payload) &&
          isRecord(payload.current) &&
          typeof payload.current.temperature_2m === "number" &&
          isRecord(payload.current_units) &&
          typeof payload.current_units.temperature_2m === "string",
      };
    case "weather-gov":
      return {
        url: `${provider.baseUrl}/points/41.8781,-87.6298`,
        headers: {
          Accept: "application/geo+json",
          "User-Agent": "Squid-Agent/1.0 (support@squidagent.app)",
        },
        successMessage:
          "National Weather Service returned valid forecast discovery URLs.",
        validate: (payload) =>
          isRecord(payload) &&
          isRecord(payload.properties) &&
          typeof payload.properties.forecast === "string" &&
          typeof payload.properties.forecastHourly === "string",
      };
    case "github":
      return {
        url: githubInstallation
          ? "https://api.github.com/installation/repositories?per_page=1"
          : provider.exampleEndpoint!,
        headers: {
          Authorization: `Bearer ${credential}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2026-03-10",
          "User-Agent": "Squid-Agent/1.0",
        },
        successMessage: githubInstallation
          ? "GitHub accepted the App installation token."
          : "GitHub accepted the connected user token.",
        validate: (payload) =>
          isRecord(payload) &&
          (githubInstallation
            ? Array.isArray(payload.repositories)
            : typeof payload.login === "string"),
      };
    case "coingecko":
      return {
        url: `${provider.baseUrl}/ping`,
        headers: { "x-cg-demo-api-key": credential! },
        successMessage: "CoinGecko accepted the Demo API key.",
        validate: (payload) =>
          isRecord(payload) && typeof payload.gecko_says === "string",
      };
    case "supabase":
      return {
        url: `${provider.baseUrl}/projects`,
        headers: { Authorization: `Bearer ${credential}` },
        successMessage: "Supabase accepted the Management API token.",
        validate: Array.isArray,
      };
    case "stripe":
      return {
        url: `${provider.baseUrl}/account`,
        headers: { Authorization: `Bearer ${credential}` },
        successMessage: "Stripe accepted the secret key.",
        validate: (payload) =>
          isRecord(payload) && typeof payload.id === "string",
      };
    case "resend":
      return {
        url: `${provider.baseUrl}/domains?limit=1`,
        headers: {
          Authorization: `Bearer ${credential}`,
          "User-Agent": "Squid-Agent/1.0",
        },
        successMessage: "Resend accepted the API key.",
        validate: (payload) => isRecord(payload) && Array.isArray(payload.data),
      };
    case "vercel":
      return {
        url: provider.exampleEndpoint!,
        headers: { Authorization: `Bearer ${credential}` },
        successMessage: "Vercel accepted the connected access token.",
        validate: (payload) => isRecord(payload) && isRecord(payload.user),
      };
    default:
      return null;
  }
}

export async function requestProviderHealth({
  provider,
  credential,
  metadata,
  fetchImpl,
}: {
  provider: IntegrationProvider;
  credential: string | null;
  metadata: Prisma.JsonValue | null;
  fetchImpl: typeof fetch;
}): Promise<ProviderHealthResult> {
  const installationId = readInstallationId(metadata);
  let effectiveCredential = credential;
  if (provider.id === "github" && installationId) {
    try {
      effectiveCredential = await createGitHubInstallationToken(
        installationId,
        fetchImpl,
      );
    } catch {
      return {
        ok: false,
        message: "GitHub App installation authorization failed.",
      };
    }
  }

  if (provider.auth !== "none" && !effectiveCredential) {
    return { ok: false, message: "A credential is required before testing." };
  }

  const check = createHealthCheck({
    provider,
    credential: effectiveCredential,
    githubInstallation: Boolean(installationId),
  });
  if (!check) {
    return {
      ok: false,
      message: "This provider does not have a live health check yet.",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetchImpl(check.url, {
      method: "GET",
      headers: check.headers,
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) {
      return {
        ok: false,
        message: `Provider rejected the health check with HTTP ${response.status}.`,
      };
    }
    if (check.validate) {
      const payload: unknown = await response.json();
      if (!check.validate(payload)) {
        return {
          ok: false,
          message:
            "Provider responded, but the payload did not match its reviewed API contract.",
        };
      }
    }
    return { ok: true, message: check.successMessage };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error && error.name === "AbortError"
          ? "Provider health check timed out."
          : "Provider health check could not be completed.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
