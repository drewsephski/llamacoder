import { z } from "zod";

export type PreviewElementSelection = {
  tagName: string;
  domPath: string;
  text: string;
  id?: string;
  className?: string;
  role?: string;
  ariaLabel?: string;
  href?: string;
  imageAlt?: string;
  attributes?: Record<string, string>;
  rect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  html?: string;
};

export const previewElementSelectionSchema: z.ZodType<PreviewElementSelection> =
  z.object({
    tagName: z.string(),
    domPath: z.string(),
    text: z.string(),
    id: z.string().optional(),
    className: z.string().optional(),
    role: z.string().optional(),
    ariaLabel: z.string().optional(),
    href: z.string().optional(),
    imageAlt: z.string().optional(),
    attributes: z.record(z.string(), z.string()).optional(),
    rect: z
      .object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
      })
      .optional(),
    html: z.string().optional(),
  });
