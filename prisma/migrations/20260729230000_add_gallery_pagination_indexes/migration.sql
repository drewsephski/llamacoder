CREATE INDEX "GalleryPublication_isPublished_publishedAt_id_idx"
ON "GalleryPublication"("isPublished", "publishedAt", "id");

CREATE INDEX "GalleryPublication_allowRemixes_isPublished_publishedAt_id_idx"
ON "GalleryPublication"("allowRemixes", "isPublished", "publishedAt", "id");
