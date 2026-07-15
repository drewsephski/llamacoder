import { describe, expect, it } from "vitest";

import {
  buildIntegrationProviderGuidance,
  buildIntegrationRegistryGuidance,
  findIntegrationProviderByUrl,
  findIntegrationProviders,
  getIntegrationProvider,
} from "@/features/integrations/registry";

describe("integration registry", () => {
  it("matches providers from product language and endpoint URLs", () => {
    expect(
      findIntegrationProviders("Build a weather dashboard with Open-Meteo").map(
        (provider) => provider.id,
      ),
    ).toContain("open-meteo");
    expect(
      findIntegrationProviders("Use the National Weather Service API").map(
        (provider) => provider.id,
      ),
    ).toContain("weather-gov");
    expect(
      findIntegrationProviderByUrl(
        "https://api.frankfurter.dev/v2/rates?base=USD",
      )?.id,
    ).toBe("frankfurter");
  });

  it("blocks public Nominatim from automatic generation", () => {
    const provider = getIntegrationProvider("nominatim-public");
    expect(provider).toMatchObject({
      policyStatus: "blocked",
      commercialUse: "restricted",
    });

    const guidance = buildIntegrationRegistryGuidance(
      "Use https://nominatim.openstreetmap.org for address search",
    );
    expect(guidance).toContain("policy=blocked");
    expect(guidance).toContain("do not generate the integration");
  });

  it("marks credentialed production providers as server integrations", () => {
    expect(getIntegrationProvider("rest-countries")).toMatchObject({
      auth: "secret",
      runtime: "server",
      baseUrl: "https://api.restcountries.com/countries/v5",
    });
    expect(getIntegrationProvider("stripe")).toMatchObject({
      auth: "secret",
      runtime: "server",
      requiredSecrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    });
    expect(getIntegrationProvider("supabase")).toMatchObject({
      auth: "oauth",
      runtime: "server",
    });
  });

  it("gives the AI exact usage guidance for providers selected in the UI", () => {
    const guidance = buildIntegrationProviderGuidance([
      "frankfurter",
      "supabase",
    ]);

    expect(guidance).toContain(
      "every provider listed below is an explicit user requirement",
    );
    expect(guidance).toContain("api.frankfurter.dev/v2");
    expect(guidance).toContain("array of {date, base, quote, rate}");
    expect(guidance).toContain("sb_publishable_*");
    expect(guidance).toContain("must never expose sb_secret_*");
    expect(guidance).toContain(
      "Missing any selected provider is a failed generation",
    );
  });

  it("requires NWS point discovery instead of hard-coded forecast grids", () => {
    const guidance = buildIntegrationProviderGuidance(["weather-gov"]);

    expect(guidance).toContain("/points/{lat},{lon}");
    expect(guidance).toContain("never hard-code a forecast office or grid");
    expect(guidance).toContain("properties.forecastHourly");
  });

  it("registers Octagon as a browser-safe MMA data provider", () => {
    expect(getIntegrationProvider("octagon")).toMatchObject({
      name: "UFC API",
      auth: "none",
      runtime: "browser",
      corsCompatible: true,
      commercialUse: "review_required",
      baseUrl: "https://api.octagon-api.com",
    });
    expect(
      findIntegrationProviders("Build an MMA fighter rankings app").map(
        (provider) => provider.id,
      ),
    ).toContain("octagon");
    expect(
      findIntegrationProviderByUrl(
        "https://api.octagon-api.com/division/flyweight",
      )?.id,
    ).toBe("octagon");

    const guidance = buildIntegrationProviderGuidance(["octagon"]);
    expect(guidance).toContain("/division/{divisionId}");
    expect(guidance).toContain("fighter measurements and records are strings");
    expect(guidance).toContain("detail endpoints may return 404");
  });

  it.each([
    ["art-institute-chicago", "Art Institute of Chicago", "approved"],
    ["usgs-earthquakes", "USGS Earthquakes", "approved"],
    ["met-museum", "The Met Collection", "approved"],
    ["openfema", "OpenFEMA", "approved"],
    ["federal-register", "Federal Register", "approved"],
    ["world-bank", "World Bank Indicators", "approved"],
    ["open-library", "Open Library", "conditional"],
    ["open-food-facts", "Open Food Facts", "conditional"],
    ["gbif", "GBIF", "conditional"],
    ["openfda", "openFDA", "conditional"],
  ] as const)(
    "registers %s as the reviewed browser provider %s",
    (providerId, name, policyStatus) => {
      expect(getIntegrationProvider(providerId)).toMatchObject({
        name,
        auth: "none",
        runtime: "browser",
        corsCompatible: true,
        policyStatus,
        verifiedAt: "2026-07-14",
      });
    },
  );

  it.each([
    [
      "https://api.artic.edu/api/v1/artworks/27992",
      "art-institute-chicago",
    ],
    [
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
      "usgs-earthquakes",
    ],
    [
      "https://collectionapi.metmuseum.org/public/collection/v1/objects/436535",
      "met-museum",
    ],
    [
      "https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries",
      "openfema",
    ],
    [
      "https://www.federalregister.gov/api/v1/documents.json",
      "federal-register",
    ],
    [
      "https://api.worldbank.org/v2/country/USA/indicator/SP.POP.TOTL",
      "world-bank",
    ],
    ["https://openlibrary.org/search.json?q=dune", "open-library"],
    [
      "https://world.openfoodfacts.org/api/v3/product/3017620422003.json",
      "open-food-facts",
    ],
    ["https://api.gbif.org/v1/occurrence/search", "gbif"],
    ["https://api.fda.gov/drug/label.json", "openfda"],
  ] as const)("maps %s to %s", (url, providerId) => {
    expect(findIntegrationProviderByUrl(url)?.id).toBe(providerId);
  });

  it.each([
    ["Build a public-domain artwork explorer", "art-institute-chicago"],
    ["Build a live earthquake map", "usgs-earthquakes"],
    ["Build a Met museum exhibit builder", "met-museum"],
    ["Build a FEMA disaster declarations dashboard", "openfema"],
    ["Build a Federal Register policy tracker", "federal-register"],
    ["Build a World Bank GDP dashboard", "world-bank"],
    ["Build a book search API reading list", "open-library"],
    ["Build a barcode nutrition scanner", "open-food-facts"],
    ["Build a wildlife sightings map with GBIF", "gbif"],
    ["Build an FDA recall explorer", "openfda"],
  ] as const)("discovers %s as %s", (prompt, providerId) => {
    expect(
      findIntegrationProviders(prompt).map((provider) => provider.id),
    ).toContain(providerId);
  });

  it("carries provider-specific rights and safety rules into generation", () => {
    const guidance = buildIntegrationProviderGuidance([
      "art-institute-chicago",
      "usgs-earthquakes",
      "met-museum",
      "openfema",
      "federal-register",
      "world-bank",
      "open-library",
      "open-food-facts",
      "gbif",
      "openfda",
    ]);

    expect(guidance).toContain("query[term][is_public_domain]=true");
    expect(guidance).toContain("[longitude, latitude, depthKm]");
    expect(guidance).toContain("bounded concurrency");
    expect(guidance).toContain("not real-time emergency instructions");
    expect(guidance).toContain("not the official legal edition");
    expect(guidance).toContain("two-element array");
    expect(guidance).toContain("not high-traffic commercial infrastructure");
    expect(guidance).toContain("crowdsourced and potentially incomplete");
    expect(guidance).toContain("licenses vary by publisher");
    expect(guidance).toContain("must not be used to make medical-care decisions");
  });
});
