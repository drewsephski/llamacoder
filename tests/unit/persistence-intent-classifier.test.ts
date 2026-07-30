import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateTextMock } = vi.hoisted(() => ({
  generateTextMock: vi.fn(),
}));

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();
  return { ...actual, generateText: generateTextMock };
});

import { classifyPersistenceIntent } from "@/features/generation/server/persistence-intent-classifier";

describe("AI persistence classifier", () => {
  beforeEach(() => {
    generateTextMock.mockReset();
  });

  it("returns the structured todo-app judgment", async () => {
    generateTextMock.mockResolvedValueOnce({
      output: {
        isAppRequest: true,
        requiresPersistence: true,
        confidence: 99,
        rationale: "Todo items must survive refresh and be retrieved later.",
        useCase: "Todo app",
        explicitlyRequested: false,
        requirements: {
          authentication: false,
          storage: false,
          realtime: false,
          privilegedServerLogic: false,
        },
        entities: [
          {
            name: "tasks",
            purpose: "Store todo items.",
            fields: ["title: text", "completed: boolean"],
            relationships: [],
          },
        ],
      },
    });

    const result = await classifyPersistenceIntent({
      model: "test-model" as never,
      recentUserRequests: ["Build a todo app"],
    });

    expect(result).toMatchObject({
      outcome: "classified",
      intent: { detected: true, recommendation: "require_database" },
    });
    expect(generateTextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        timeout: { totalMs: 8_000 },
        system: expect.stringMatching(
          /habit[\s\S]*todo lists[\s\S]*every form[\s\S]*counterfactual[\s\S]*landing page[\s\S]*returning/i,
        ),
      }),
    );
  });

  it("gives the model semantic guidance for implied habit history", async () => {
    generateTextMock.mockResolvedValueOnce({
      output: {
        isAppRequest: true,
        requiresPersistence: true,
        confidence: 98,
        rationale:
          "A habit tracker must retain completions, progress, and streak history across visits.",
        useCase: "Habit tracker",
        explicitlyRequested: false,
        requirements: {
          authentication: false,
          storage: false,
          realtime: false,
          privilegedServerLogic: false,
        },
        entities: [
          {
            name: "habits",
            purpose: "Store tracked habits.",
            fields: ["name: text", "frequency: text"],
            relationships: [],
          },
          {
            name: "habit_entries",
            purpose: "Store dated completions and streak history.",
            fields: ["habit_id: uuid", "completed_on: date"],
            relationships: ["habit_entries belong to habits"],
          },
        ],
      },
    });

    const result = await classifyPersistenceIntent({
      model: "test-model" as never,
      recentUserRequests: ["Build me a habit tracker app"],
    });

    expect(result).toMatchObject({
      outcome: "classified",
      intent: {
        detected: true,
        recommendation: "require_database",
        explicitlyRequested: false,
        proposedSchema: [
          { entity: "habits" },
          { entity: "habit_entries" },
        ],
      },
    });
    expect(generateTextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "USER REQUEST 1:\nBuild me a habit tracker app",
        system: expect.stringContaining(
          "even when the user never says \"database\", \"save\", or \"persist\"",
        ),
      }),
    );
  });

  it("keeps a structured static landing-page judgment hidden", async () => {
    generateTextMock.mockResolvedValueOnce({
      output: {
        isAppRequest: true,
        requiresPersistence: false,
        confidence: 99,
        rationale: "The landing page is static and has no forms.",
        useCase: "Static landing page",
        explicitlyRequested: false,
        requirements: {
          authentication: false,
          storage: false,
          realtime: false,
          privilegedServerLogic: false,
        },
        entities: [],
      },
    });

    const result = await classifyPersistenceIntent({
      model: "test-model" as never,
      recentUserRequests: ["Build a static landing page"],
    });

    expect(result).toMatchObject({
      outcome: "classified",
      intent: { detected: false, recommendation: "prototype" },
    });
  });

  it("retries and requires a backend decision when classification stays unavailable", async () => {
    generateTextMock.mockRejectedValue(new Error("invalid model output"));

    const result = await classifyPersistenceIntent({
      model: "test-model" as never,
      recentUserRequests: ["Build a todo app"],
    });

    expect(result).toMatchObject({
      outcome: "fallback",
      intent: { detected: true, recommendation: "suggest_database" },
    });
    expect(generateTextMock).toHaveBeenCalledTimes(2);
  });

  it("treats an explicit Supabase follow-up as an app modification", async () => {
    generateTextMock.mockResolvedValueOnce({
      output: {
        isAppRequest: true,
        requiresPersistence: true,
        confidence: 100,
        rationale: "The user explicitly requested Supabase for the existing app.",
        useCase: "Habit tracker backend",
        explicitlyRequested: true,
        requirements: {
          authentication: true,
          storage: false,
          realtime: true,
          privilegedServerLogic: false,
        },
        entities: [
          {
            name: "habits",
            purpose: "Store each user's habits.",
            fields: ["name: text", "user_id: uuid"],
            relationships: [],
          },
        ],
      },
    });

    const result = await classifyPersistenceIntent({
      model: "test-model" as never,
      existingAppContext: "Purpose: Personal habit tracker",
      recentUserRequests: ["Build a habit tracker", "add supabase"],
    });

    expect(result).toMatchObject({
      outcome: "classified",
      intent: {
        detected: true,
        explicitlyRequested: true,
        requirements: { authentication: true, realtime: true },
        proposedSchema: [{ entity: "habits", fields: ["name: text", "user_id: uuid"] }],
      },
    });
    expect(generateTextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringMatching(
          /EXISTING APP CONTEXT[\s\S]*USER REQUEST 1[\s\S]*USER REQUEST 2:\nadd supabase/,
        ),
        system: expect.stringContaining(
          'Never interpret a short follow-up such as "add supabase" as a static or non-app request',
        ),
      }),
    );
  });
});
