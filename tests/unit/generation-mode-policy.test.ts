import { describe, expect, it } from "vitest";

import { agentActionSchema } from "@/features/generation/agent-contracts";
import {
  appSpecSchema,
  createEmptyAppSpec,
} from "@/features/generation/app-spec";
import { buildPlanModeFallbackInterview } from "@/features/generation/mode-policy";
import { getIntegrationProvider } from "@/features/integrations/registry";

describe("generation mode policy", () => {
  it("builds a deterministic four-question Plan mode fallback", () => {
    const action = buildPlanModeFallbackInterview({
      messageId: "message_1",
      prompt: "Build a group travel planner",
      spec: createEmptyAppSpec(),
      providersNeedingPurpose: [],
    });

    expect(action.action).toBe("interview");
    if (action.action !== "interview") throw new Error("Expected interview");
    expect(action.request.steps).toHaveLength(4);
    expect(action.request.steps.map((step) => step.id)).toEqual([
      "primary-outcome",
      "primary-audience",
      "data-and-accounts",
      "product-character",
    ]);
    expect(
      action.request.steps.every((step) =>
        step.options[0]?.label.includes("Recommended"),
      ),
    ).toBe(true);
    expect(agentActionSchema.safeParse(action).success).toBe(true);
  });

  it("includes selected API intent among the top five Plan mode questions", () => {
    const frankfurter = getIntegrationProvider("frankfurter");
    expect(frankfurter).not.toBeNull();

    const action = buildPlanModeFallbackInterview({
      messageId: "message_2",
      prompt: "Build a group travel planner",
      spec: createEmptyAppSpec(),
      providersNeedingPurpose: [frankfurter!],
    });

    expect(action.action).toBe("interview");
    if (action.action !== "interview") throw new Error("Expected interview");
    expect(action.request.steps).toHaveLength(5);
    expect(action.request.steps[0]).toMatchObject({
      id: "selected-api-purpose-frankfurter",
      title: expect.stringContaining("Frankfurter"),
    });
    expect(agentActionSchema.safeParse(action).success).toBe(true);
  });

  it("adds a persistence decision question when record-tracking intent is detected", () => {
    const action = buildPlanModeFallbackInterview({
      messageId: "message_3",
      prompt: "Build a CRM to track leads and sales stages",
      spec: {
        ...createEmptyAppSpec(),
        dataPersistence: appSpecSchema.parse({
          dataPersistence: {
            detected: true,
            confidence: 72,
            recommendation: "suggest_database",
            status: "not_prompted",
            reason: "Track leads through sales lifecycle.",
            useCase: "CRM / sales pipeline",
            proposedSchema: [
              {
                entity: "contacts",
                purpose: "Store customer records.",
                fields: ["id", "name", "email"],
              },
            ],
          },
        }).dataPersistence,
      },
      providersNeedingPurpose: [],
    });

    expect(action.action).toBe("interview");
    if (action.action !== "interview") throw new Error("Expected interview");
    expect(action.request.steps).toHaveLength(5);
    expect(action.request.steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "data-persistence-connect" }),
      ]),
    );
    expect(agentActionSchema.safeParse(action).success).toBe(true);
  });

  it("does not ask about persistence if Supabase is already selected", () => {
    const action = buildPlanModeFallbackInterview({
      messageId: "message_4",
      prompt: "Build a CRM to track leads and sales stages",
      spec: {
        ...createEmptyAppSpec(),
        integrations: [
          {
            providerId: "supabase",
            name: "Supabase",
            purpose: "Persist lead records.",
            required: true,
            docsUrl: "https://supabase.com/docs",
            baseUrl: "https://api.supabase.com/v1",
            auth: "oauth",
            requiredSecrets: [],
            runtime: "server",
            corsCompatible: true,
          },
        ],
        dataPersistence: appSpecSchema.parse({
          dataPersistence: {
            detected: true,
            confidence: 72,
            recommendation: "suggest_database",
            status: "not_prompted",
            reason: "Track leads through sales lifecycle.",
            useCase: "CRM / sales pipeline",
            proposedSchema: [
              {
                entity: "contacts",
                purpose: "Store customer records.",
                fields: ["id", "name", "email"],
              },
            ],
          },
        }).dataPersistence,
      },
      providersNeedingPurpose: [],
    });

    expect(action.action).toBe("interview");
    if (action.action !== "interview") throw new Error("Expected interview");
    expect(action.request.steps).toHaveLength(4);
    expect(
      action.request.steps.every(
        (step) => step.id !== "data-persistence-connect",
      ),
    ).toBe(true);
  });

  it("rejects undersized interview rounds at the structured-output boundary", () => {
    const parsed = agentActionSchema.safeParse({
      action: "interview",
      request: {
        id: "interview_1",
        title: "Too few questions",
        steps: [
          {
            id: "only-one",
            title: "Only one?",
            options: [{ id: "yes", label: "Yes" }],
          },
        ],
      },
    });

    expect(parsed.success).toBe(false);
  });
});
