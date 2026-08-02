import { z } from "zod";

import { acquisitionAttributionSchema } from "@/features/acquisition/contracts";

export const DESIGN_PARTNER_ROLES = [
  "freelance_designer",
  "agency_owner",
  "product_lead",
  "founder",
  "developer",
  "other",
] as const;

export const DESIGN_PARTNER_TIMELINES = [
  "this_month",
  "next_month",
  "exploring",
] as const;

export const DESIGN_PARTNER_CONTACT_METHODS = [
  "email",
  "linkedin",
  "x",
] as const;

const optionalUrl = z
  .string()
  .trim()
  .max(2_048)
  .optional()
  .transform((value) => value || undefined)
  .refine(
    (value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
      } catch {
        return false;
      }
    },
    { message: "Use a valid http or https URL." },
  );

export const designPartnerApplicationSchema = z.object({
  name: z
    .string({ error: "Enter your name." })
    .trim()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(120, { message: "Name must be 120 characters or fewer." }),
  email: z
    .string({ error: "Enter your work email." })
    .trim()
    .toLowerCase()
    .email({ message: "Enter a valid email address." })
    .max(320, { message: "Email must be 320 characters or fewer." }),
  role: z.enum(DESIGN_PARTNER_ROLES, { error: "Choose your role." }),
  companyName: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((value) => value || undefined),
  portfolioUrl: optionalUrl,
  projectSummary: z
    .string({ error: "Tell us what you want to prototype." })
    .trim()
    .min(40, {
      message: "Add a little more detail, at least 40 characters.",
    })
    .max(1_500, {
      message: "Keep the project description under 1,500 characters.",
    }),
  timeline: z.enum(DESIGN_PARTNER_TIMELINES, {
    error: "Choose the project timing.",
  }),
  preferredContact: z.enum(DESIGN_PARTNER_CONTACT_METHODS, {
    error: "Choose how you would like us to reply.",
  }),
  permissionToContact: z.literal(true, {
    error: "Confirm that we may contact you about this application.",
  }),
  attribution: acquisitionAttributionSchema.optional(),
  website: z.string().max(0).optional(),
});

export type DesignPartnerApplicationInput = z.infer<
  typeof designPartnerApplicationSchema
>;
