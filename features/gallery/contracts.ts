import { z } from "zod";

export const publishProjectSchema = z.object({
  messageId: z.string().min(1),
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(280),
  allowRemixes: z.boolean(),
});

export const gallerySearchSchema = z.object({
  q: z.string().trim().max(80).catch(""),
  remixable: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((value) => value === "true"),
  sort: z.enum(["newest", "oldest"]).catch("newest"),
  page: z.coerce.number().int().positive().catch(1),
});

export type PublishProjectInput = z.infer<typeof publishProjectSchema>;

export type GalleryProjectSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  allowRemixes: boolean;
  publishedAt: Date;
  creator: {
    name: string;
    image: string | null;
  };
};
