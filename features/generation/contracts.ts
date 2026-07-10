import { z } from "zod";

export const generationPhaseSchema = z.enum([
  "preparing",
  "analyzing-reference",
  "reasoning",
  "writing-code",
  "finalizing",
]);

export const generationStatusSchema = z.object({
  phase: generationPhaseSchema,
  label: z.string(),
});

export const scrapeScreenshotResponseSchema = z.object({
  success: z.boolean(),
  screenshotData: z.string(),
  url: z.string().url(),
});

export type GenerationPhase = z.infer<typeof generationPhaseSchema>;
export type GenerationStatus = z.infer<typeof generationStatusSchema>;

export const DEFAULT_GENERATION_STATUS: GenerationStatus = {
  phase: "preparing",
  label: "Preparing your project",
};
