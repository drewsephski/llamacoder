import "server-only";

import type { Prisma } from "@prisma/client";

import type { IntegrationProvider } from "@/features/integrations/registry";
import { createGitHubInstallationToken } from "@/features/integrations/server/github-app";

type ProviderHealthResult = {
  ok: boolean;
  message: string;
};

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
