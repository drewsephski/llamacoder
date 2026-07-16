ALTER TABLE "GalleryPublication"
ADD COLUMN "thumbnailUrl" TEXT,
ADD COLUMN "thumbnailStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN "thumbnailCapturedMessageId" TEXT,
ADD COLUMN "thumbnailError" TEXT,
ADD COLUMN "thumbnailUpdatedAt" TIMESTAMP(3);

CREATE INDEX "GalleryPublication_thumbnailStatus_thumbnailUpdatedAt_idx"
ON "GalleryPublication"("thumbnailStatus", "thumbnailUpdatedAt");
