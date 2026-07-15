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
  octagon: [
    {
      id: "lightweight",
      categoryName: "Lightweight",
      champion: { id: "champion-id", championName: "Champion" },
      fighters: [{ id: "fighter-id", name: "Fighter" }],
    },
  ],
  "art-institute-chicago": {
    data: [
      {
        id: 119335,
        title: "Baroque Pearl Mounted as a Cat Holding a Mouse",
        image_id: "image-id",
        is_public_domain: true,
      },
    ],
    config: { iiif_url: "https://www.artic.edu/iiif/2" },
  },
  "usgs-earthquakes": {
    type: "FeatureCollection",
    metadata: { generated: 1_773_700_000_000, count: 1 },
    features: [
      {
        id: "us7000test",
        properties: {
          mag: 4.2,
          place: "Test Region",
          time: 1_773_699_000_000,
        },
        geometry: { type: "Point", coordinates: [-122.1, 37.4, 8.2] },
      },
    ],
  },
  "met-museum": { total: 2, objectIDs: [436524, 436535] },
  openfema: {
    metadata: { version: "v2" },
    DisasterDeclarationsSummaries: [
      {
        disasterNumber: 5644,
        state: "CO",
        declarationDate: "2026-07-05T00:00:00.000Z",
        incidentType: "Fire",
        declarationTitle: "WILLOW FIRE",
        lastRefresh: "2026-07-07T19:21:25.720Z",
        incidentEndDate: null,
      },
    ],
  },
  "federal-register": {
    count: 1,
    total_pages: 1,
    results: [
      {
        document_number: "2026-14195",
        title: "Example Rule",
        type: "Rule",
        publication_date: "2026-07-14",
        html_url: "https://www.federalregister.gov/documents/example",
        pdf_url: "https://www.govinfo.gov/content/pkg/example.pdf",
      },
    ],
  },
  "world-bank": [
    { page: 1, lastupdated: "2026-07-13" },
    [
      {
        indicator: { id: "NY.GDP.MKTP.CD" },
        countryiso3code: "USA",
        date: "2025",
        value: 30_769_700_000_000,
      },
    ],
  ],
  "open-library": {
    numFound: 1,
    docs: [
      {
        key: "/works/OL27482W",
        title: "The Hobbit",
        author_name: ["J.R.R. Tolkien"],
        cover_i: 14_627_509,
      },
    ],
  },
  "open-food-facts": {
    status: "success",
    result: { id: "product_found" },
    product: {
      code: "3017620422003",
      product_name: "Nutella",
      nutriscore_grade: "e",
      image_front_small_url: "https://images.openfoodfacts.org/example.jpg",
    },
  },
  gbif: {
    count: 1,
    results: [
      {
        key: 5_104_646_682,
        scientificName: "Panthera leo (Linnaeus, 1758)",
        datasetKey: "dataset-key",
        license: "http://creativecommons.org/licenses/by-nc/4.0/legalcode",
        media: [{ type: "StillImage" }],
      },
    ],
  },
  openfda: {
    meta: {
      disclaimer: "Do not rely on openFDA for medical decisions.",
      last_updated: "2026-07-14",
      terms: "https://open.fda.gov/terms/",
      license: "https://open.fda.gov/license/",
    },
    results: [{ id: "label-id", openfda: { brand_name: ["Advil"] } }],
  },
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
