import type { Chat, Message, Prisma } from "@prisma/client";
import { z } from "zod";

import { previewElementSelectionSchema } from "@/lib/targeted-preview-edit";
import {
  ACCEPTED_SCREENSHOT_MIME_TYPES,
  MAX_SCREENSHOT_DATA_URL_LENGTH,
  MAX_SCREENSHOT_SIZE_MB,
} from "@/lib/constants";

const imageDataUrlPattern = new RegExp(
  `^data:(${ACCEPTED_SCREENSHOT_MIME_TYPES.join("|")});base64,`,
  "i",
);

export const createProjectRequestSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required"),
  model: z.string().min(1, "Model is required"),
  quality: z.enum(["high", "low"]),
  screenshotUrl: z.string().optional(),
  screenshotData: z
    .string()
    .max(
      MAX_SCREENSHOT_DATA_URL_LENGTH,
      `Image is too large. Please upload an image under ${MAX_SCREENSHOT_SIZE_MB} MB.`,
    )
    .regex(imageDataUrlPattern, "Image must be a PNG, JPEG, or WebP file.")
    .optional(),
});

export type CreateProjectRequest = z.infer<typeof createProjectRequestSchema>;

export const createProjectResponseSchema = z.object({
  chatId: z.string(),
  lastMessageId: z.string(),
  plan: z.string().nullable(),
  hasCode: z.boolean(),
  warnings: z.array(z.string()).optional(),
});

export type CreateProjectResponse = z.infer<typeof createProjectResponseSchema>;

export const remixProjectRequestSchema = z.object({
  messageId: z.string().min(1),
});

export const remixProjectResponseSchema = z.object({
  chatId: z.string().min(1),
});

export const exportVerificationResponseSchema = z.object({
  status: z.enum(["verified", "warning", "failed"]),
});

export type ExportVerificationStatus = z.infer<
  typeof exportVerificationResponseSchema
>["status"];

export const requestModeMetadataSchema = z.object({
  kind: z.enum([
    "app_edit_request",
    "targeted_element_edit",
    "preview_repair",
    "preview_repair_request",
  ]),
  sourceMessageId: z.string(),
  chargeCredits: z.boolean(),
  selection: previewElementSelectionSchema.optional(),
  usedAt: z.string().nullable().optional(),
});

export type RequestModeMetadata = z.infer<typeof requestModeMetadataSchema>;

export type GenerationReceipt = {
  estimatedCredits: number | null;
  actualCredits: number;
  refundedCredits: number;
  phase: string | null;
  status: string;
  exportVerification: "verified" | "warning" | "failed" | null;
};

export type ProjectMessage = Omit<Message, "files" | "followUpPrompts"> & {
  files: Prisma.JsonValue | null;
  followUpPrompts: Prisma.JsonValue | null;
  generationReceipt?: GenerationReceipt | null;
};

export type ProjectWorkspace = Chat & {
  messages: ProjectMessage[];
  totalMessages: number;
  assistantMessagesCountBefore: number;
};

export function parseRequestModeMetadata(
  value: unknown,
): RequestModeMetadata | null {
  const result = requestModeMetadataSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function isPartialSourceRequest(metadata: RequestModeMetadata | null) {
  return (
    metadata?.kind === "app_edit_request" ||
    metadata?.kind === "targeted_element_edit" ||
    metadata?.kind === "preview_repair" ||
    metadata?.kind === "preview_repair_request"
  );
}

export function isPreviewRepairRequest(metadata: RequestModeMetadata | null) {
  return (
    metadata?.kind === "preview_repair" ||
    metadata?.kind === "preview_repair_request"
  );
}
