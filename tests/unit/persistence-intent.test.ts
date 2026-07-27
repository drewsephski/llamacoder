import { describe, expect, it } from "vitest";

import {
  createPersistenceClassificationFallback,
  persistenceJudgmentSchema,
  persistenceJudgmentToIntent,
} from "@/features/generation/persistence-intent";

describe("persistence intent contract", () => {
  it("maps a structured persistence judgment into the app spec", () => {
    const intent = persistenceJudgmentToIntent({
      isAppRequest: true,
      requiresPersistence: true,
      confidence: 98,
      rationale: "Todo items must remain available after refresh.",
      useCase: "Personal todo manager",
      explicitlyRequested: false,
      requirements: {
        authentication: false,
        storage: false,
        realtime: false,
      },
      entities: [{ name: "tasks", purpose: "Store the user's todo items." }],
    });

    expect(intent).toMatchObject({
      detected: true,
      recommendation: "require_database",
      useCase: "Personal todo manager",
      reason: "Todo items must remain available after refresh.",
      proposedSchema: [
        { entity: "tasks", purpose: "Store the user's todo items." },
      ],
    });
  });

  it("keeps static and non-app judgments off the database path", () => {
    const intent = persistenceJudgmentToIntent({
      isAppRequest: true,
      requiresPersistence: false,
      confidence: 99,
      rationale: "The landing page is entirely static and read-only.",
      useCase: "Static landing page",
      explicitlyRequested: false,
      requirements: {
        authentication: false,
        storage: false,
        realtime: false,
      },
      entities: [],
    });

    expect(intent.detected).toBe(false);
    expect(intent.recommendation).toBe("prototype");
  });

  it("uses a typed hide fallback when classification is unavailable", () => {
    expect(createPersistenceClassificationFallback()).toMatchObject({
      detected: false,
      confidence: 0,
      recommendation: "prototype",
      proposedSchema: [],
    });
  });

  it("rejects free-form or incomplete classifier output", () => {
    expect(
      persistenceJudgmentSchema.safeParse({
        requiresPersistence: "probably",
        rationale: "Needs data",
      }).success,
    ).toBe(false);
  });
});
