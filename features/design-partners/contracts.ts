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
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(320),
  role: z.enum(DESIGN_PARTNER_ROLES),
  companyName: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((value) => value || undefined),
  portfolioUrl: optionalUrl,
  projectSummary: z.string().trim().min(40).max(1_500),
  timeline: z.enum(DESIGN_PARTNER_TIMELINES),
  preferredContact: z.enum(DESIGN_PARTNER_CONTACT_METHODS),
  permissionToContact: z.literal(true),
  attribution: acquisitionAttributionSchema.optional(),
  website: z.string().max(0).optional(),
});

export type DesignPartnerApplicationInput = z.infer<
  typeof designPartnerApplicationSchema
>;
