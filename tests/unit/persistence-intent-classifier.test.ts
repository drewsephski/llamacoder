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
        },
        entities: [{ name: "tasks", purpose: "Store todo items." }],
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
        timeout: { totalMs: 2_500 },
        system: expect.stringMatching(
          /todo lists[\s\S]*every form[\s\S]*landing page[\s\S]*ambiguous/i,
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

  it("fails safe when the provider fails or structured output cannot parse", async () => {
    generateTextMock.mockRejectedValueOnce(new Error("invalid model output"));

    const result = await classifyPersistenceIntent({
      model: "test-model" as never,
      recentUserRequests: ["Build a todo app"],
    });

    expect(result).toMatchObject({
      outcome: "fallback",
      intent: { detected: false, recommendation: "prototype" },
    });
  });
});
