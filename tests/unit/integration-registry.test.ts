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
});
