import { describe, expect, it } from "vitest";
import {
  appSpecSchema,
  createEmptyAppSpec,
  hasHighImpactUnresolved,
  isReadyForPlan,
  mergeSpecUpdate,
  parseAppSpec,
  serializeSpecForPrompt,
  type AppSpec,
} from "@/features/generation/app-spec";

describe("createEmptyAppSpec", () => {
  it("creates a spec with interviewing status and version 1", () => {
    const spec = createEmptyAppSpec();
    expect(spec.status).toBe("interviewing");
    expect(spec.version).toBe(1);
    expect(spec.deliveryContract).toBe("browser_frontend");
    expect(spec.features.mustHave).toEqual([]);
    expect(spec.unresolvedDecisions).toEqual([]);
  });
});

describe("parseAppSpec", () => {
  it("parses a valid spec", () => {
    const input = {
      version: 1,
      status: "approved",
      overview: { name: "Calculator" },
      features: {
        mustHave: ["arithmetic"],
        niceToHave: ["history"],
        excluded: [],
      },
    } as unknown as Parameters<typeof appSpecSchema.parse>[0];
    const result = parseAppSpec(input);
    expect(result).not.toBeNull();
    expect(result?.status).toBe("approved");
    expect(result?.overview.name).toBe("Calculator");
    expect(result?.features.niceToHave).toEqual(["history"]);
  });

  it("returns null for invalid spec", () => {
    expect(parseAppSpec({ status: "bogus" })).toBeNull();
  });
});

describe("mergeSpecUpdate", () => {
  it("deep-merges nested objects", () => {
    const spec = createEmptyAppSpec();
    const merged = mergeSpecUpdate(spec, {
      overview: { name: "App1", purpose: "Thing" },
      features: { mustHave: ["auth"], niceToHave: [], excluded: [] },
    });
    expect(merged.overview.name).toBe("App1");
    expect(merged.overview.purpose).toBe("Thing");
    expect(merged.overview.audience).toBeUndefined();
    expect(merged.features.mustHave).toEqual(["auth"]);
  });

  it("accumulates askedQuestionIds with dedup", () => {
    const spec = createEmptyAppSpec();
    const merged1 = mergeSpecUpdate(spec, {
      askedQuestionIds: ["q1", "q2"],
    });
    const merged2 = mergeSpecUpdate(merged1, {
      askedQuestionIds: ["q2", "q3"],
    });
    expect(merged2.askedQuestionIds).toEqual(["q1", "q2", "q3"]);
  });

  it("replaces arrays wholesale for list fields like userFlows", () => {
    const spec = createEmptyAppSpec();
    const merged = mergeSpecUpdate(spec, {
      userFlows: [{ name: "Login", description: "User logs in" }],
    });
    expect(merged.userFlows).toHaveLength(1);
    expect(merged.userFlows[0].name).toBe("Login");
  });

  it("returns the same spec when update is null", () => {
    const spec = createEmptyAppSpec();
    const merged = mergeSpecUpdate(spec, null);
    expect(merged).toBe(spec);
  });
});

describe("serializeSpecForPrompt", () => {
  it("emits compact form with high-impact unresolved topics", () => {
    const spec: AppSpec = appSpecSchema.parse({
      status: "interviewing",
      overview: { name: "Calculator", purpose: "Do math" },
      features: { mustHave: ["add", "subtract"] },
      unresolvedDecisions: [
        {
          id: "auth",
          topic: "Authentication",
          question: "Need auth?",
          impact: "high",
        },
        {
          id: "color",
          topic: "Color scheme",
          question: "Dark or light?",
          impact: "low",
        },
      ],
      askedQuestionIds: ["q1"],
    });
    const text = serializeSpecForPrompt(spec, "compact");
    expect(text).toContain("[Workflow status: interviewing]");
    expect(text).toContain("App: Calculator");
    expect(text).toContain("Must-have: add; subtract");
    expect(text).toContain("UNRESOLVED HIGH-IMPACT: Authentication");
    // In compact mode, the low-impact unresolved decision should not appear
    expect(text).not.toContain("Color scheme");
    expect(text).toContain("Asked question IDs: q1");
  });

  it("includes low-impact unresolved in full mode", () => {
    const spec: AppSpec = appSpecSchema.parse({
      status: "interviewing",
      unresolvedDecisions: [
        {
          id: "auth",
          topic: "Authentication",
          question: "Need auth?",
          impact: "high",
        },
        {
          id: "color",
          topic: "Color scheme",
          question: "Dark or light?",
          impact: "low",
        },
      ],
    });
    const text = serializeSpecForPrompt(spec, "full");
    expect(text).toContain("Other unresolved: [low] Color scheme");
  });

  it("makes backend blueprint scope and runtime limits explicit", () => {
    const spec = appSpecSchema.parse({
      deliveryContract: "frontend_with_backend_blueprint",
      architecture: { authentication: "email login", persistence: "Postgres" },
    });
    const text = serializeSpecForPrompt(spec, "full");
    expect(text).toContain("Frontend + portable backend blueprint");
    expect(text).toContain("Do not simulate managed auth");
  });
});

describe("hasHighImpactUnresolved", () => {
  it("returns false for empty decisions", () => {
    expect(hasHighImpactUnresolved(createEmptyAppSpec())).toBe(false);
  });

  it("returns true when any decision is high-impact", () => {
    const spec: AppSpec = appSpecSchema.parse({
      unresolvedDecisions: [
        { id: "x", topic: "X", question: "?", impact: "low" },
        { id: "auth", topic: "Auth", question: "?", impact: "high" },
      ],
    });
    expect(hasHighImpactUnresolved(spec)).toBe(true);
  });
});

describe("isReadyForPlan", () => {
  it("returns true for spec without high-impact unresolved", () => {
    expect(isReadyForPlan(createEmptyAppSpec())).toBe(true);
  });

  it("returns false when high-impact unresolved exists", () => {
    const spec: AppSpec = appSpecSchema.parse({
      unresolvedDecisions: [
        { id: "auth", topic: "Auth", question: "?", impact: "high" },
      ],
    });
    expect(isReadyForPlan(spec)).toBe(false);
  });

  it("returns false when awaiting approval or approved", () => {
    const spec: AppSpec = appSpecSchema.parse({ status: "awaiting_approval" });
    expect(isReadyForPlan(spec)).toBe(false);
    const specApproved: AppSpec = appSpecSchema.parse({ status: "approved" });
    expect(isReadyForPlan(specApproved)).toBe(false);
  });
});
