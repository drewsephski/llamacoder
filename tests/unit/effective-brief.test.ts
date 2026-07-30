import { describe, expect, it } from "vitest";

import { createEmptyAppSpec } from "@/features/generation/app-spec";
import {
  resolveEffectiveBrief,
  serializeEffectiveBrief,
} from "@/features/generation/effective-brief";

describe("effective brief", () => {
  it("lets the latest explicit design instruction outrank the original prompt", () => {
    const spec = {
      ...createEmptyAppSpec(),
      overview: {
        purpose: "Generate and edit music",
        appType: "AI music workbench",
        audience: ["music producers"],
      },
      design: { visualDirection: "dark atmospheric" },
    };

    const brief = resolveEffectiveBrief({
      originalIntent: "Build a dark atmospheric AI music product",
      latestUserRequest:
        "Make it light and editorial. Remove the atmospheric styling.",
      appSpec: spec,
    });

    expect(brief.design.tone.toLowerCase()).toContain("editorial");
    expect(brief.design.stylePack).toBeNull();
    expect(brief.design.scope).toBe("product-workbench");
    expect(brief.design.macrostructure).toBe("Workbench");
    expect(serializeEffectiveBrief(brief)).toContain(
      "latest explicit user instruction > approved specification",
    );
  });

  it("retains the existing visual system for a non-design follow-up", () => {
    const originalIntent = "Build an analytics dashboard for sales teams";
    const initial = resolveEffectiveBrief({
      originalIntent,
      latestUserRequest: originalIntent,
      appSpec: createEmptyAppSpec(),
      latestRequestIsInitialBuild: true,
    });
    const followUp = resolveEffectiveBrief({
      originalIntent,
      latestUserRequest: "Fix filtering",
      appSpec: createEmptyAppSpec(),
    });

    expect(followUp.design.scope).toBe("product-workbench");
    expect(followUp.design.stylePack).toBe(initial.design.stylePack);
  });

  it("uses the initial request to establish an editorial document structure", () => {
    const brief = resolveEffectiveBrief({
      originalIntent: "",
      latestUserRequest: "Build an editorial publication",
      appSpec: createEmptyAppSpec(),
      latestRequestIsInitialBuild: true,
    });

    expect(brief.design.scope).toBe("editorial");
    expect(brief.design.macrostructure).toBe("Long Document");
  });

  it("keeps a dark-theme request out of light-first style packs", () => {
    const prompt =
      "Build a modern landing page for an AI startup with animated features, pricing, testimonials, and a sleek dark theme.";
    const brief = resolveEffectiveBrief({
      originalIntent: prompt,
      latestUserRequest: prompt,
      appSpec: createEmptyAppSpec(),
      latestRequestIsInitialBuild: true,
    });

    expect(brief.design.requestedLuminosity).toBe("dark-first");
    expect(brief.design.stylePack).not.toBeNull();
    expect(brief.design.stylePack).not.toBe("kineticAwwwards");
  });

  it.each([
    "Redesign this as a landing page",
    "Make this a landing page",
    "Replace the dashboard with a marketing site",
    "Convert the current tool into a publication",
  ])("recognizes explicit structural conversion: %s", (latestUserRequest) => {
    const brief = resolveEffectiveBrief({
      originalIntent: "Build an analytics dashboard",
      latestUserRequest,
      appSpec: createEmptyAppSpec(),
    });

    expect(brief.design.scope).not.toBe("product-workbench");
    expect(["marketing", "editorial"]).toContain(brief.design.scope);
  });

  it("uses nullable chrome decisions for product and component scopes", () => {
    const product = resolveEffectiveBrief({
      originalIntent: "Build an analytics dashboard",
      latestUserRequest: "Add filtering to the dashboard",
      appSpec: createEmptyAppSpec(),
    });
    expect(product.design.macrostructure).toBe("Workbench");
    expect(product.design.navigation).toBe("integrated-toolbar");
    expect(product.design.footer).toBe("none");

    const component = resolveEffectiveBrief({
      originalIntent: "",
      latestUserRequest: "Redesign just this button",
      appSpec: createEmptyAppSpec(),
    });
    expect(component.design.scope).toBe("component");
    expect(component.design.macrostructure).toContain("component scope");
  });
});
