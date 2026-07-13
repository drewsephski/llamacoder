import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createGitHubInstallationToken: vi.fn(async () => "installation-token"),
}));

vi.mock("@/features/integrations/server/github-app", () => ({
  createGitHubInstallationToken: mocks.createGitHubInstallationToken,
}));

import {
  getIntegrationProvider,
  integrationRegistry,
} from "@/features/integrations/registry";
import { requestProviderHealth } from "@/features/integrations/server/provider-health";

const validPayloads: Record<string, unknown> = {
  "rest-countries": { data: [{ names: { common: "Canada" } }] },
  frankfurter: [{ date: "2026-07-13", base: "USD", quote: "EUR", rate: 0.86 }],
  "hacker-news": [1, 2, 3],
  "open-meteo": {
    current: { temperature_2m: 24.3 },
    current_units: { temperature_2m: "°C" },
  },
  "weather-gov": {
    properties: {
      forecast: "https://api.weather.gov/gridpoints/LOT/75,73/forecast",
      forecastHourly:
        "https://api.weather.gov/gridpoints/LOT/75,73/forecast/hourly",
    },
  },
  github: { login: "octocat" },
  coingecko: { gecko_says: "To the Moon!" },
  supabase: [],
  stripe: { id: "acct_123" },
  resend: { data: [] },
  vercel: { user: { id: "user_123" } },
};

describe("provider health checks", () => {
  it.each(
    integrationRegistry
      .filter((provider) => provider.policyStatus !== "blocked")
      .map((provider) => [provider.id]),
  )("validates the reviewed %s API contract", async (providerId) => {
    const provider = getIntegrationProvider(providerId)!;
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify(validPayloads[providerId]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );

    const result = await requestProviderHealth({
      provider,
      credential: provider.auth === "none" ? null : "credential_123",
      metadata: null,
      fetchImpl: fetchMock as typeof fetch,
    });

    expect(result).toMatchObject({ ok: true });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("fails closed when a successful response violates the reviewed shape", async () => {
    const provider = getIntegrationProvider("frankfurter")!;
    const result = await requestProviderHealth({
      provider,
      credential: null,
      metadata: null,
      fetchImpl: vi.fn(
        async () =>
          new Response(JSON.stringify({ rates: { EUR: "unknown" } }), {
            status: 200,
          }),
      ) as typeof fetch,
    });

    expect(result).toEqual({
      ok: false,
      message:
        "Provider responded, but the payload did not match its reviewed API contract.",
    });
  });

  it("does not make a request when a protected provider has no credential", async () => {
    const fetchMock = vi.fn();
    const result = await requestProviderHealth({
      provider: getIntegrationProvider("stripe")!,
      credential: null,
      metadata: null,
      fetchImpl: fetchMock as typeof fetch,
    });

    expect(result).toEqual({
      ok: false,
      message: "A credential is required before testing.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("checks GitHub App installations with the installation endpoint", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ repositories: [] }), { status: 200 }),
    );
    const result = await requestProviderHealth({
      provider: getIntegrationProvider("github")!,
      credential: null,
      metadata: { installationId: "installation_123" },
      fetchImpl: fetchMock as typeof fetch,
    });

    expect(result).toMatchObject({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/installation/repositories?per_page=1",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer installation-token",
          "X-GitHub-Api-Version": "2026-03-10",
        }),
      }),
    );
  });
});
