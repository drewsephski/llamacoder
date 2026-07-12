import { z } from "zod";

import { QuestionFlowStepDefinitionSchema } from "@/components/tool-ui/question-flow/schema";
import {
  appSpecSchema,
  deliveryContractSchema,
} from "@/features/generation/app-spec";

export const agentIntentSchema = z.enum([
  "answer",
  "interview",
  "clarify",
  "search",
  "present_plan",
  "generate_code",
  "resume_generation",
]);

export const searchRequestSchema = z.object({
  id: z.string().min(1),
  query: z.string().min(2).max(500),
  reason: z.string().min(2).max(500),
});

export const clarificationRequestSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  steps: z.array(QuestionFlowStepDefinitionSchema).min(1).max(3),
  deliveryContract: deliveryContractSchema.default("browser_frontend"),
  confirmedDecisions: z.number().int().min(0).default(0),
  remainingDecisions: z.number().int().min(0).default(0),
});

export const planSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  items: z.array(z.string().min(1)),
});

export type PlanSection = z.infer<typeof planSectionSchema>;

export const planSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().min(1).default(1),
  title: z.string().min(1).max(200),
  overview: z.string().min(1).max(500),
  sections: z.array(planSectionSchema).min(1),
  deliveryContract: deliveryContractSchema.default("browser_frontend"),
  confirmedDecisions: z.number().int().min(0).default(0),
  remainingDecisions: z.number().int().min(0).default(0),
});

export type Plan = z.infer<typeof planSchema>;

const partialAppSpecUpdateSchema = appSpecSchema.partial().extend({
  askedQuestionIds: z.array(z.string().min(1)).optional(),
  unresolvedDecisions: z
    .array(
      z.object({
        id: z.string().min(1),
        topic: z.string().min(1),
        question: z.string().min(1),
        impact: z.enum(["low", "medium", "high"]),
      }),
    )
    .optional(),
});

export type SpecUpdate = z.infer<typeof partialAppSpecUpdateSchema>;

export const agentActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("answer"),
    specUpdate: partialAppSpecUpdateSchema.optional(),
  }),
  z.object({
    action: z.literal("interview"),
    request: clarificationRequestSchema,
    specUpdate: partialAppSpecUpdateSchema.optional(),
  }),
  z.object({
    action: z.literal("clarify"),
    request: clarificationRequestSchema,
    specUpdate: partialAppSpecUpdateSchema.optional(),
  }),
  z.object({
    action: z.literal("search"),
    request: searchRequestSchema,
    specUpdate: partialAppSpecUpdateSchema.optional(),
  }),
  z.object({
    action: z.literal("present_plan"),
    plan: planSchema,
    specUpdate: partialAppSpecUpdateSchema.optional(),
  }),
  z.object({
    action: z.literal("generate_code"),
    specUpdate: partialAppSpecUpdateSchema.optional(),
  }),
  z.object({
    action: z.literal("resume_generation"),
    specUpdate: partialAppSpecUpdateSchema.optional(),
  }),
]);

export const sourceUrlSchema = z.object({
  sourceId: z.string().min(1),
  url: z
    .string()
    .url()
    .refine((value) => {
      const protocol = new URL(value).protocol;
      return protocol === "http:" || protocol === "https:";
    }, "Source URL must use HTTP or HTTPS"),
  title: z.string().min(1).max(300).optional(),
});

export const clarificationAnswersSchema = z.record(
  z.string().min(1),
  z.array(z.string().min(1)).min(1),
);

export const agentMessageMetadataSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("agent_clarification_request"),
    request: clarificationRequestSchema,
  }),
  z.object({
    kind: z.literal("agent_clarification_response"),
    requestId: z.string().min(1),
    answers: clarificationAnswersSchema,
    summary: z.array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      }),
    ),
  }),
  z.object({
    kind: z.literal("agent_interview_request"),
    request: clarificationRequestSchema,
  }),
  z.object({
    kind: z.literal("agent_interview_response"),
    requestId: z.string().min(1),
    answers: clarificationAnswersSchema,
    summary: z.array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      }),
    ),
  }),
  z.object({
    kind: z.literal("agent_plan_request"),
    request: planSchema,
  }),
  z.object({
    kind: z.literal("agent_plan_approval"),
    requestId: z.string().min(1),
    approved: z.boolean(),
  }),
  z.object({
    kind: z.literal("agent_search_approval_request"),
    request: searchRequestSchema,
  }),
  z.object({
    kind: z.literal("agent_search_approval_response"),
    requestId: z.string().min(1),
    query: z.string().min(2).max(500),
    approved: z.boolean(),
  }),
  z.object({
    kind: z.literal("agent_response"),
    sources: z.array(sourceUrlSchema).max(20).default([]),
  }),
]);

export type AgentAction = z.infer<typeof agentActionSchema>;
export type AgentIntent = z.infer<typeof agentIntentSchema>;
export type AgentMessageMetadata = z.infer<typeof agentMessageMetadataSchema>;
export type ClarificationAnswers = z.infer<typeof clarificationAnswersSchema>;
export type ClarificationRequest = z.infer<typeof clarificationRequestSchema>;
export type SearchRequest = z.infer<typeof searchRequestSchema>;
export type SourceUrl = z.infer<typeof sourceUrlSchema>;

export function parseAgentMessageMetadata(value: unknown) {
  const parsed = agentMessageMetadataSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function formatClarificationAnswers(
  request: ClarificationRequest,
  answers: ClarificationAnswers,
) {
  return request.steps.map((step) => {
    const selectedIds = answers[step.id] ?? [];
    const labels = selectedIds.map(
      (selectedId) =>
        step.options.find((option) => option.id === selectedId)?.label ??
        selectedId,
    );

    return {
      label: step.title,
      value: labels.join(", "),
    };
  });
}

export const partialAppSpecUpdateForRoute = partialAppSpecUpdateSchema;
