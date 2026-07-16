import "server-only";

import { after } from "next/server";

import {
  captureAndPersistGalleryThumbnail,
  type GalleryThumbnailJob,
} from "@/features/gallery/server/thumbnail";

export function scheduleGalleryThumbnailCapture(job: GalleryThumbnailJob) {
  after(async () => {
    await captureAndPersistGalleryThumbnail(job);
  });
}
