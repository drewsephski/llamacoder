CREATE TABLE "GalleryPublication" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "chatId" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "allowRemixes" BOOLEAN NOT NULL DEFAULT false,
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "unpublishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "GalleryPublication_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GalleryPublication_slug_key" ON "GalleryPublication"("slug");
CREATE UNIQUE INDEX "GalleryPublication_chatId_key" ON "GalleryPublication"("chatId");
CREATE UNIQUE INDEX "GalleryPublication_messageId_key" ON "GalleryPublication"("messageId");
CREATE INDEX "GalleryPublication_isPublished_publishedAt_idx" ON "GalleryPublication"("isPublished", "publishedAt");
CREATE INDEX "GalleryPublication_userId_isPublished_idx" ON "GalleryPublication"("userId", "isPublished");
CREATE INDEX "GalleryPublication_allowRemixes_isPublished_idx" ON "GalleryPublication"("allowRemixes", "isPublished");

ALTER TABLE "GalleryPublication"
ADD CONSTRAINT "GalleryPublication_chatId_fkey"
FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GalleryPublication"
ADD CONSTRAINT "GalleryPublication_messageId_fkey"
FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GalleryPublication"
ADD CONSTRAINT "GalleryPublication_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
