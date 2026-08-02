import "server-only";

import type { DesignPartnerApplicationInput } from "@/features/design-partners/contracts";
import { getPrisma } from "@/lib/prisma";

export async function submitDesignPartnerApplication(
  input: DesignPartnerApplicationInput,
) {
  const prisma = getPrisma();
  const existing = await prisma.designPartnerApplication.findFirst({
    where: {
      email: input.email,
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1_000) },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (existing) return { id: existing.id, created: false };

  const application = await prisma.designPartnerApplication.create({
    data: {
      name: input.name,
      email: input.email,
      role: input.role,
      companyName: input.companyName,
      portfolioUrl: input.portfolioUrl,
      projectSummary: input.projectSummary,
      timeline: input.timeline,
      preferredContact: input.preferredContact,
      permissionToContact: input.permissionToContact,
      acquisitionSource: input.attribution?.source,
      acquisitionMedium: input.attribution?.medium,
      acquisitionCampaign: input.attribution?.campaign,
      acquisitionContent: input.attribution?.content,
      acquisitionTerm: input.attribution?.term,
      acquisitionReferrer: input.attribution?.referrer,
      acquisitionLandingPath: input.attribution?.landingPath,
    },
    select: { id: true },
  });

  return { id: application.id, created: true };
}
