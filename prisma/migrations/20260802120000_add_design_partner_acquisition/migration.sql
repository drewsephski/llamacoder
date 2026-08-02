ALTER TABLE "Chat"
ADD COLUMN "acquisitionSource" TEXT,
ADD COLUMN "acquisitionMedium" TEXT,
ADD COLUMN "acquisitionCampaign" TEXT,
ADD COLUMN "acquisitionContent" TEXT,
ADD COLUMN "acquisitionTerm" TEXT,
ADD COLUMN "acquisitionReferrer" TEXT,
ADD COLUMN "acquisitionLandingPath" TEXT;

CREATE INDEX "Chat_acquisitionSource_createdAt_idx"
ON "Chat"("acquisitionSource", "createdAt");

CREATE TABLE "DesignPartnerApplication" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "companyName" TEXT,
  "portfolioUrl" TEXT,
  "projectSummary" TEXT NOT NULL,
  "timeline" TEXT NOT NULL,
  "preferredContact" TEXT NOT NULL,
  "permissionToContact" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'new',
  "acquisitionSource" TEXT,
  "acquisitionMedium" TEXT,
  "acquisitionCampaign" TEXT,
  "acquisitionContent" TEXT,
  "acquisitionTerm" TEXT,
  "acquisitionReferrer" TEXT,
  "acquisitionLandingPath" TEXT,
  "notificationStatus" TEXT NOT NULL DEFAULT 'pending',
  "notificationError" TEXT,
  "notifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "DesignPartnerApplication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DesignPartnerApplication_email_createdAt_idx"
ON "DesignPartnerApplication"("email", "createdAt");

CREATE INDEX "DesignPartnerApplication_status_createdAt_idx"
ON "DesignPartnerApplication"("status", "createdAt");

CREATE INDEX "DesignPartnerApplication_acquisitionSource_createdAt_idx"
ON "DesignPartnerApplication"("acquisitionSource", "createdAt");

CREATE INDEX "DesignPartnerApplication_notificationStatus_updatedAt_idx"
ON "DesignPartnerApplication"("notificationStatus", "updatedAt");
