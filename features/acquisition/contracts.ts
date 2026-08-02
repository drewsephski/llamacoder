import { z } from "zod";

const optionalAttributionValue = z
  .string()
  .trim()
  .max(240)
  .optional();

export const acquisitionAttributionSchema = z.object({
  source: optionalAttributionValue,
  medium: optionalAttributionValue,
  campaign: optionalAttributionValue,
  content: optionalAttributionValue,
  term: optionalAttributionValue,
  referrer: z
    .string()
    .trim()
    .max(1_000)
    .url()
    .optional(),
  landingPath: z
    .string()
    .trim()
    .max(500)
    .regex(/^\//, "Landing path must be site-relative")
    .optional(),
});

export type AcquisitionAttribution = z.infer<
  typeof acquisitionAttributionSchema
>;

export function readAcquisitionAttribution({
  url,
  referrer,
}: {
  url: URL;
  referrer?: string;
}): AcquisitionAttribution | undefined {
  const source =
    url.searchParams.get("utm_source")?.trim() ||
    url.searchParams.get("source")?.trim() ||
    undefined;
  const attribution = acquisitionAttributionSchema.parse({
    source,
    medium: url.searchParams.get("utm_medium") ?? undefined,
    campaign: url.searchParams.get("utm_campaign") ?? undefined,
    content: url.searchParams.get("utm_content") ?? undefined,
    term: url.searchParams.get("utm_term") ?? undefined,
    referrer: referrer?.trim() || undefined,
    landingPath: url.pathname,
  });

  return Object.values(attribution).some(Boolean) ? attribution : undefined;
}

export function acquisitionChatFields(attribution?: AcquisitionAttribution) {
  if (!attribution) return {};

  return {
    acquisitionSource: attribution.source,
    acquisitionMedium: attribution.medium,
    acquisitionCampaign: attribution.campaign,
    acquisitionContent: attribution.content,
    acquisitionTerm: attribution.term,
    acquisitionReferrer: attribution.referrer,
    acquisitionLandingPath: attribution.landingPath,
  };
}
