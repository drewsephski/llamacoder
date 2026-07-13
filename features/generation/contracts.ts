import { z } from "zod";
import { agentActionSchema } from "@/features/generation/agent-contracts";

export const generationPhaseSchema = z.enum([
  "preparing",
  "interviewing",
  "plan-review",
  "analyzing-reference",
  "reasoning",
  "clarifying",
  "searching",
  "writing-code",
  "finalizing",
]);

export const generationStatusSchema = z.object({
  phase: generationPhaseSchema,
  label: z.string(),
});

export const researchActivitySchema = z.object({
  phase: z.enum(["searching", "complete"]),
  query: z.string().min(2).max(500),
  label: z.string().min(1).max(120),
  sourceCount: z.number().int().min(0).max(20),
});

export const agentActionDataSchema = agentActionSchema;

export const scrapeScreenshotRequestSchema = z.object({
  url: z.string().url(),
});

export const scrapeScreenshotResponseSchema = z.object({
  success: z.boolean(),
  screenshotData: z.string(),
  url: z.string().url(),
});

export type GenerationPhase = z.infer<typeof generationPhaseSchema>;
export type GenerationStatus = z.infer<typeof generationStatusSchema>;
export type ResearchActivity = z.infer<typeof researchActivitySchema>;

export const DEFAULT_GENERATION_STATUS: GenerationStatus = {
  phase: "preparing",
  label: "Preparing your project",
};
