CREATE TYPE "PublicArtifactVisibility" AS ENUM ('UNLISTED', 'GALLERY');
CREATE TYPE "PublicArtifactStatus" AS ENUM ('ACTIVE', 'REVOKED');

CREATE TABLE "PublicArtifact" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "chatId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "visibility" "PublicArtifactVisibility" NOT NULL DEFAULT 'UNLISTED',
  "status" "PublicArtifactStatus" NOT NULL DEFAULT 'ACTIVE',
  "allowRemixes" BOOLEAN NOT NULL DEFAULT false,
  "allowStarterDownloads" BOOLEAN NOT NULL DEFAULT false,
  "currentRevisionId" TEXT,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PublicArtifact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PublicArtifactRevision" (
  "id" TEXT NOT NULL,
  "artifactId" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PublicArtifactRevision_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "GalleryPublication" ADD COLUMN "publicArtifactId" TEXT;

CREATE UNIQUE INDEX "PublicArtifact_token_key" ON "PublicArtifact"("token");
CREATE UNIQUE INDEX "PublicArtifact_currentRevisionId_key" ON "PublicArtifact"("currentRevisionId");
CREATE UNIQUE INDEX "PublicArtifact_chatId_visibility_key" ON "PublicArtifact"("chatId", "visibility");
CREATE INDEX "PublicArtifact_userId_status_idx" ON "PublicArtifact"("userId", "status");
CREATE INDEX "PublicArtifact_visibility_status_createdAt_idx" ON "PublicArtifact"("visibility", "status", "createdAt");
CREATE UNIQUE INDEX "PublicArtifactRevision_artifactId_messageId_key" ON "PublicArtifactRevision"("artifactId", "messageId");
CREATE INDEX "PublicArtifactRevision_messageId_idx" ON "PublicArtifactRevision"("messageId");
CREATE INDEX "PublicArtifactRevision_artifactId_createdAt_idx" ON "PublicArtifactRevision"("artifactId", "createdAt");
CREATE UNIQUE INDEX "GalleryPublication_publicArtifactId_key" ON "GalleryPublication"("publicArtifactId");

ALTER TABLE "PublicArtifact"
ADD CONSTRAINT "PublicArtifact_chatId_fkey"
FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PublicArtifact"
ADD CONSTRAINT "PublicArtifact_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PublicArtifactRevision"
ADD CONSTRAINT "PublicArtifactRevision_artifactId_fkey"
FOREIGN KEY ("artifactId") REFERENCES "PublicArtifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PublicArtifactRevision"
ADD CONSTRAINT "PublicArtifactRevision_messageId_fkey"
FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PublicArtifact"
ADD CONSTRAINT "PublicArtifact_currentRevisionId_fkey"
FOREIGN KEY ("currentRevisionId") REFERENCES "PublicArtifactRevision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GalleryPublication"
ADD CONSTRAINT "GalleryPublication_publicArtifactId_fkey"
FOREIGN KEY ("publicArtifactId") REFERENCES "PublicArtifact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Existing gallery URLs remain stable. Each published project receives an opaque
-- artifact token and an immutable revision pinned to its currently published message.
INSERT INTO "PublicArtifact" (
  "id",
  "token",
  "chatId",
  "userId",
  "visibility",
  "status",
  "allowRemixes",
  "allowStarterDownloads",
  "revokedAt",
  "createdAt",
  "updatedAt"
)
SELECT
  'pa_' || substr(md5(g."id"), 1, 16),
  md5(random()::text || clock_timestamp()::text || g."id") ||
    md5(g."messageId" || random()::text),
  g."chatId",
  g."userId",
  'GALLERY'::"PublicArtifactVisibility",
  CASE
    WHEN g."isPublished" THEN 'ACTIVE'::"PublicArtifactStatus"
    ELSE 'REVOKED'::"PublicArtifactStatus"
  END,
  g."allowRemixes",
  true,
  g."unpublishedAt",
  g."createdAt",
  g."updatedAt"
FROM "GalleryPublication" g;

INSERT INTO "PublicArtifactRevision" (
  "id",
  "artifactId",
  "messageId",
  "createdAt"
)
SELECT
  'par_' || substr(md5(g."id" || g."messageId"), 1, 16),
  'pa_' || substr(md5(g."id"), 1, 16),
  g."messageId",
  g."publishedAt"
FROM "GalleryPublication" g;

UPDATE "PublicArtifact" a
SET "currentRevisionId" = r."id"
FROM "PublicArtifactRevision" r
WHERE r."artifactId" = a."id";

UPDATE "GalleryPublication" g
SET "publicArtifactId" = 'pa_' || substr(md5(g."id"), 1, 16);

CREATE FUNCTION prevent_public_artifact_revision_update()
RETURNS trigger AS $$
BEGIN
  IF NEW."artifactId" IS DISTINCT FROM OLD."artifactId"
    OR NEW."messageId" IS DISTINCT FROM OLD."messageId"
    OR NEW."createdAt" IS DISTINCT FROM OLD."createdAt"
  THEN
    RAISE EXCEPTION 'PublicArtifactRevision rows are immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "PublicArtifactRevision_immutable"
BEFORE UPDATE ON "PublicArtifactRevision"
FOR EACH ROW EXECUTE FUNCTION prevent_public_artifact_revision_update();
