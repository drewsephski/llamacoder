import "server-only";

import { revalidatePath } from "next/cache";

import { uploadGalleryThumbnail } from "@/features/gallery/server/thumbnail-storage";
import { getPrisma } from "@/lib/prisma";

export const THUMBNAIL_WIDTH = 1280;
export const THUMBNAIL_HEIGHT = 720;
export const MAX_THUMBNAIL_BYTES = 800_000;
const MAX_STORED_ERROR_LENGTH = 500;

export type GalleryThumbnailJob = {
  publicationId: string;
  messageId: string;
  slug: string;
};

type ThumbnailResult =
  | { status: "ready"; url: string }
  | { status: "failed"; error: string };

export function validateGalleryThumbnailUpload(body: Buffer) {
  if (body.byteLength === 0) {
    throw new Error("Gallery preview image is empty.");
  }
  if (body.byteLength > MAX_THUMBNAIL_BYTES) {
    throw new Error("Gallery preview image is too large.");
  }
  if (body[0] !== 0xff || body[1] !== 0xd8) {
    throw new Error("Gallery preview image must be a JPEG.");
  }
}

export async function persistGalleryThumbnail(
  job: GalleryThumbnailJob,
  screenshot: Buffer,
): Promise<ThumbnailResult> {
  const prisma = getPrisma();

  try {
    validateGalleryThumbnailUpload(screenshot);
    const url = await uploadGalleryThumbnail(job, screenshot);
    const updated = await prisma.galleryPublication.updateMany({
      where: {
        id: job.publicationId,
        messageId: job.messageId,
        isPublished: true,
      },
      data: {
        thumbnailUrl: url,
        thumbnailStatus: "ready",
        thumbnailCapturedMessageId: job.messageId,
        thumbnailError: null,
        thumbnailUpdatedAt: new Date(),
      },
    });

    if (updated.count > 0) revalidatePath("/gallery");
    return { status: "ready", url };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Thumbnail upload failed.";
    const storedError = message.slice(0, MAX_STORED_ERROR_LENGTH);
    await prisma.galleryPublication.updateMany({
      where: {
        id: job.publicationId,
        messageId: job.messageId,
        isPublished: true,
      },
      data: {
        thumbnailStatus: "failed",
        thumbnailError: storedError,
        thumbnailUpdatedAt: new Date(),
      },
    });
    console.error("Gallery thumbnail upload failed:", {
      publicationId: job.publicationId,
      messageId: job.messageId,
      error: storedError,
    });
    revalidatePath("/gallery");
    return { status: "failed", error: storedError };
  }
}

export async function resetStaleGalleryThumbnails({
  stalePendingMinutes = 60,
}: {
  stalePendingMinutes?: number;
} = {}) {
  const prisma = getPrisma();
  const stalePendingCutoff = new Date(
    Date.now() - stalePendingMinutes * 60 * 1000,
  );
  const result = await prisma.galleryPublication.updateMany({
    where: {
      isPublished: true,
      thumbnailStatus: "pending",
      thumbnailUpdatedAt: { lt: stalePendingCutoff },
    },
    data: {
      thumbnailStatus: "failed",
      thumbnailError:
        "Preview image was not uploaded. Open Publish and retry the preview.",
      thumbnailUpdatedAt: new Date(),
    },
  });

  return {
    markedFailed: result.count,
  };
}
