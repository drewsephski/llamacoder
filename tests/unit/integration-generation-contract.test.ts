import { describe, expect, it } from "vitest";

import type { Plan } from "@/features/generation/agent-contracts";
import { createEmptyAppSpec } from "@/features/generation/app-spec";
import {
  buildSelectedApiPurposeStep,
  enforceRequestedPersistenceProvider,
  enforceSelectedProvidersInAppSpec,
  enforceSelectedProvidersInPlan,
  getSelectedProvidersNeedingPurpose,
} from "@/features/integrations/generation-contract";
import { getIntegrationProvider } from "@/features/integrations/registry";

describe("selected API generation contract", () => {
  it("makes every selected API a required app-spec integration", () => {
    const spec = enforceSelectedProvidersInAppSpec(createEmptyAppSpec(), [
      "frankfurter",
      "stripe",
    ]);

    expect(spec.integrations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          providerId: "frankfurter",
          required: true,
          runtime: "browser",
        }),
        expect.objectContaining({
          providerId: "stripe",
          required: true,
          runtime: "server",
          requiredSecrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
        }),
      ]),
    );
    expect(spec.deliveryContract).toBe("frontend_with_backend_blueprint");
    expect(spec.acceptanceCriteria).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Frankfurter [frankfurter]"),
        expect.stringContaining("Stripe [stripe]"),
      ]),
    );
  });

  it("restores a selected API after a model spec update omits it", () => {
    const original = enforceSelectedProvidersInAppSpec(createEmptyAppSpec(), [
      "weather-gov",
    ]);
    const modelUpdate = { ...original, integrations: [] };

    const enforced = enforceSelectedProvidersInAppSpec(modelUpdate, [
      "weather-gov",
    ]);

    expect(enforced.integrations).toEqual([
      expect.objectContaining({
        providerId: "weather-gov",
        required: true,
      }),
    ]);
  });

  it("adds selected APIs to the user-visible plan", () => {
    const plan: Plan = {
      id: "plan_1",
      version: 1,
      title: "Weather dashboard",
      overview: "Build a dashboard.",
      sections: [{ id: "ui", title: "UI", items: ["Dashboard"] }],
      deliveryContract: "browser_frontend",
      confirmedDecisions: 0,
      remainingDecisions: 0,
    };

    const enforced = enforceSelectedProvidersInPlan(plan, ["weather-gov"]);

    expect(enforced.sections.at(-1)).toMatchObject({
      id: "selected-apis",
      title: "Selected APIs (required)",
      items: [expect.stringContaining("weather-gov")],
    });
  });

  it("keeps selected APIs unresolved until they have concrete product jobs", () => {
    const selected = enforceSelectedProvidersInAppSpec(createEmptyAppSpec(), [
      "frankfurter",
    ]);

    expect(
      getSelectedProvidersNeedingPurpose(selected, ["frankfurter"]),
    ).toEqual([expect.objectContaining({ id: "frankfurter" })]);

    const resolved = {
      ...selected,
      integrations: selected.integrations.map((integration) => ({
        ...integration,
        purpose:
          "Convert each trip budget from USD into the traveler's selected currency.",
      })),
    };

    expect(
      getSelectedProvidersNeedingPurpose(resolved, ["frankfurter"]),
    ).toEqual([]);
  });

  it("builds prompt-specific API ideas with the recommendation first", () => {
    const frankfurter = getIntegrationProvider("frankfurter");
    const weather = getIntegrationProvider("weather-gov");
    expect(frankfurter).not.toBeNull();
    expect(weather).not.toBeNull();

    const step = buildSelectedApiPurposeStep({
      prompt: "Build a group travel planner",
      providers: [frankfurter!, weather!],
    });

    expect(step.title).toContain("Frankfurter + National Weather Service");
    expect(step.options[0]).toMatchObject({
      label: expect.stringContaining("Recommended"),
      description: expect.stringContaining("Build a group travel planner"),
    });
    expect(step.options[0].description).toContain("currency conversion");
    expect(step.options[0].description).toContain("forecasts");
  });

  it("adds Supabase when persistence is explicitly confirmed", () => {
    const spec = createEmptyAppSpec();
    const updated = enforceRequestedPersistenceProvider({
      ...spec,
      dataPersistence: {
        ...spec.dataPersistence,
        detected: true,
        confidence: 72,
        recommendation: "require_database",
        status: "connect_confirmed",
        reason: "The app tracks persistent records.",
        useCase: "Workflow data tracking",
        proposedSchema: [
          {
            entity: "contacts",
            purpose: "Store customer records.",
            fields: ["id", "name"],
          },
        ],
      },
    });

    expect(updated.integrations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          providerId: "supabase",
          required: true,
          runtime: "server",
        }),
      ]),
    );
  });

  it("does not add Supabase when persistence is declined", () => {
    const spec = createEmptyAppSpec();
    const updated = enforceRequestedPersistenceProvider({
      ...spec,
      dataPersistence: {
        ...spec.dataPersistence,
        detected: true,
        confidence: 72,
        recommendation: "suggest_database",
        status: "connect_declined",
        reason: "Prototype-first chosen for early iteration.",
        useCase: "CRM / sales pipeline",
        proposedSchema: [],
      },
      integrations: [],
    });

    expect(
      updated.integrations.some(
        (integration) => integration.providerId === "supabase",
      ),
    ).toBe(false);
  });
});
