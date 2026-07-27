import { z } from "zod";

import {
  dataPersistenceIntentSchema,
  type DataPersistenceIntent,
} from "@/features/generation/app-spec";

export const persistenceJudgmentSchema = z
  .object({
    isAppRequest: z.boolean(),
    requiresPersistence: z.boolean(),
    confidence: z.number().min(0).max(100),
    rationale: z.string().trim().min(1).max(240),
    useCase: z.string().trim().min(1).max(120).optional(),
    explicitlyRequested: z.boolean(),
    requirements: z
      .object({
        authentication: z.boolean(),
        storage: z.boolean(),
        realtime: z.boolean(),
      })
      .strict(),
    entities: z
      .array(
        z
          .object({
            name: z.string().trim().min(1).max(64),
            purpose: z.string().trim().min(1).max(160),
          })
          .strict(),
      )
      .max(4),
  })
  .strict();

export type PersistenceJudgment = z.infer<typeof persistenceJudgmentSchema>;

export function persistenceJudgmentToIntent(
  judgment: PersistenceJudgment,
): DataPersistenceIntent {
  const detected = judgment.isAppRequest && judgment.requiresPersistence;

  return dataPersistenceIntentSchema.parse({
    detected,
    confidence: judgment.confidence,
    recommendation: detected ? "require_database" : "prototype",
    useCase: judgment.useCase,
    reason: judgment.rationale,
    explicitlyRequested: detected && judgment.explicitlyRequested,
    status: "not_prompted",
    proposedSchema: detected
      ? judgment.entities.map((entity) => ({
          entity: entity.name,
          purpose: entity.purpose,
        }))
      : [],
  });
}

export function createPersistenceClassificationFallback(): DataPersistenceIntent {
  return dataPersistenceIntentSchema.parse({
    detected: false,
    confidence: 0,
    recommendation: "prototype",
    reason:
      "Persistence classification was unavailable, so database setup was skipped.",
    explicitlyRequested: false,
    status: "not_prompted",
    proposedSchema: [],
  });
}

export function describePersistenceIntent(intent: DataPersistenceIntent) {
  const proposedSchema = intent.proposedSchema
    .map(
      (entity) =>
        `${entity.entity} (${entity.fields?.join(", ") ?? "fields pending"})`,
    )
    .join(", ");
  const decisionLine =
    intent.recommendation === "prototype"
      ? "Prototype-first approach is currently recommended."
      : intent.recommendation === "require_database"
        ? "Persistent storage is strongly recommended."
        : "Persistent storage is recommended.";

  return `Detected persistence need: ${intent.detected ? "Yes" : "No"}.
Confidence: ${intent.confidence} / 100.
Use case: ${intent.useCase ?? "Unknown"}.
Decision: ${decisionLine}
Reason: ${intent.reason ?? "No specific rationale found."}
Proposed schema: ${proposedSchema || "not yet available."}`;
}
