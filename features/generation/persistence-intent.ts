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
        privilegedServerLogic: z.boolean().default(false),
      })
      .strict(),
    entities: z
      .array(
        z
          .object({
            name: z.string().trim().min(1).max(64),
            purpose: z.string().trim().min(1).max(160),
            fields: z
              .array(z.string().trim().min(1).max(120))
              .max(10)
              .default([]),
            relationships: z
              .array(z.string().trim().min(1).max(160))
              .max(4)
              .default([]),
          })
          .strict(),
      )
      .max(4),
  })
  .strict();

export type PersistenceJudgment = z.infer<typeof persistenceJudgmentSchema>;
export type PersistenceJudgmentInput = z.input<
  typeof persistenceJudgmentSchema
>;

export function persistenceJudgmentToIntent(
  input: PersistenceJudgmentInput,
): DataPersistenceIntent {
  const judgment = persistenceJudgmentSchema.parse(input);
  const detected = judgment.isAppRequest && judgment.requiresPersistence;

  return dataPersistenceIntentSchema.parse({
    detected,
    confidence: judgment.confidence,
    recommendation: detected ? "require_database" : "prototype",
    useCase: judgment.useCase,
    reason: judgment.rationale,
    explicitlyRequested: detected && judgment.explicitlyRequested,
    status: "not_prompted",
    requirements: detected
      ? judgment.requirements
      : {
          authentication: false,
          storage: false,
          realtime: false,
          privilegedServerLogic: false,
        },
    proposedSchema: detected
      ? judgment.entities.map((entity) => ({
          entity: entity.name,
          purpose: entity.purpose,
          fields: entity.fields,
          relationships: entity.relationships,
        }))
      : [],
  });
}

export function createPersistenceClassificationFallback(options?: {
  reviewRecommended?: boolean;
}): DataPersistenceIntent {
  const reviewRecommended = options?.reviewRecommended === true;
  return dataPersistenceIntentSchema.parse({
    detected: reviewRecommended,
    confidence: 0,
    recommendation: reviewRecommended ? "suggest_database" : "prototype",
    reason: reviewRecommended
      ? "Persistence could not be classified reliably, so backend setup should be confirmed before code generation."
      : "No persistence decision was available.",
    explicitlyRequested: false,
    status: "not_prompted",
    requirements: {
      authentication: false,
      storage: false,
      realtime: false,
      privilegedServerLogic: false,
    },
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
