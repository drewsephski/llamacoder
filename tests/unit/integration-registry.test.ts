import { describe, expect, it } from "vitest";

import {
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
      findIntegrationProviderByUrl(
        "https://api.frankfurter.app/latest?from=USD",
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
});
