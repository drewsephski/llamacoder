import { describe, expect, it } from "vitest";

import type { Plan } from "@/features/generation/agent-contracts";
import { createEmptyAppSpec } from "@/features/generation/app-spec";
import {
  enforceSelectedProvidersInAppSpec,
  enforceSelectedProvidersInPlan,
} from "@/features/integrations/generation-contract";

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
});
