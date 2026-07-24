import { describe, expect, test } from "vitest";

import { buildWebResearchAgentInstructions } from "@/features/generation/research-prompts";

describe("buildWebResearchAgentInstructions", () => {
  test("forces a search call when the user explicitly requested research", () => {
    const prompt = buildWebResearchAgentInstructions({
      forceSearch: true,
      recentOnly: true,
      researchWindow: {
        startDate: "2026-01-11",
        endDate: "2026-07-11",
      },
      suggestedQuery: "current official UFC rankings",
      reason: "explicit",
    });

    expect(prompt).toContain("You MUST call web_search");
    expect(prompt).toContain("current official UFC rankings");
    expect(prompt).toContain("2026-01-11");
    expect(prompt).toContain("semantic intent");
  });

  test("keeps optional search guidance for technical reference turns", () => {
    const prompt = buildWebResearchAgentInstructions({
      forceSearch: false,
      recentOnly: false,
      reason: "technical-reference",
      liveApiVerificationRequired: true,
    });

    expect(prompt).toContain("Official documentation or provider behavior");
    expect(prompt).toContain("at most one web_search call");
    expect(prompt).toContain("Live API verification");
    expect(prompt).not.toContain("You MUST call web_search");
  });

  test("includes guided template research modes when required", () => {
    const prompt = buildWebResearchAgentInstructions({
      forceSearch: true,
      recentOnly: false,
      companyLandingResearchRequired: true,
      liveApiDashboardResearchRequired: true,
      localBusinessResearchRequired: true,
    });

    expect(prompt).toContain("Company landing research mode");
    expect(prompt).toContain("Live API dashboard research mode");
    expect(prompt).toContain("Local business research mode");
    expect(prompt).toContain(
      "continue this same turn and output the complete requested application code",
    );
  });
});
