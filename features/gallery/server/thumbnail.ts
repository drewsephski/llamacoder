import "server-only";

import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Stagehand } from "@browserbasehq/stagehand";
import { revalidatePath } from "next/cache";

import { getAppOrigin } from "@/lib/app-origin";
import { getPrisma } from "@/lib/prisma";

const THUMBNAIL_WIDTH = 1280;
const THUMBNAIL_HEIGHT = 800;
const THUMBNAIL_READY_TIMEOUT_MS = 60_000;
const MAX_STORED_ERROR_LENGTH = 500;

export type GalleryThumbnailJob = {
  publicationId: string;
  messageId: string;
  slug: string;
};

type ThumbnailResult =
  | { status: "ready"; url: string }
  | { status: "failed"; error: string };

function getRequiredEnvironmentValue(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for gallery thumbnails.`);
  return value;
}

function getPublicObjectUrl({
  bucket,
  key,
  region,
}: {
  bucket: string;
  key: string;
  region: string;
}) {
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}

async function captureThumbnail(slug: string) {
  const origin = getAppOrigin();
  const isLocalCapture = new URL(origin).hostname === "localhost";
  const stagehand = isLocalCapture
    ? new Stagehand({ env: "LOCAL", disablePino: true })
    : new Stagehand({
        apiKey: getRequiredEnvironmentValue("BROWSERBASE_API_KEY"),
        projectId: getRequiredEnvironmentValue("BROWSERBASE_PROJECT_ID"),
        env: "BROWSERBASE",
        disablePino: true,
      });

  try {
    await stagehand.init();
    const page =
      stagehand.context.pages()[0] ?? (await stagehand.context.newPage());
    await page.setViewportSize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
      deviceScaleFactor: 1,
    });
    await page.goto(`${origin}/gallery/${encodeURIComponent(slug)}/preview`, {
      waitUntil: "domcontentloaded",
      timeoutMs: 30_000,
    });
    await page.waitForSelector(".sp-preview-iframe", {
      timeout: THUMBNAIL_READY_TIMEOUT_MS,
    });
    await page.waitForSelector('[data-gallery-preview-status="ready"]', {
      timeout: THUMBNAIL_READY_TIMEOUT_MS,
    });
    await page.waitForTimeout(1_000);

    return await page.screenshot({
      type: "jpeg",
      quality: 78,
      fullPage: false,
      animations: "disabled",
      caret: "hide",
      scale: "css",
    });
  } finally {
    await Promise.resolve(stagehand.close()).catch((error: unknown) => {
      console.warn("Failed to close gallery thumbnail browser session:", error);
    });
  }
}

async function uploadThumbnail(job: GalleryThumbnailJob, body: Buffer) {
  const bucket = getRequiredEnvironmentValue("S3_UPLOAD_BUCKET");
  const region = getRequiredEnvironmentValue("S3_UPLOAD_REGION");
  const accessKeyId = getRequiredEnvironmentValue("S3_UPLOAD_KEY");
  const secretAccessKey = getRequiredEnvironmentValue("S3_UPLOAD_SECRET");
  const key = `squid-gallery/${job.publicationId}/${job.messageId}-${randomUUID()}.jpg`;
  const client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: "image/jpeg",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return getPublicObjectUrl({ bucket, key, region });
}

export async function captureAndPersistGalleryThumbnail(
  job: GalleryThumbnailJob,
): Promise<ThumbnailResult> {
  const prisma = getPrisma();

  try {
    const screenshot = await captureThumbnail(job.slug);
    const url = await uploadThumbnail(job, screenshot);
    const updated = await prisma.galleryPublication.updateMany({
      where: {
        id: job.publicationId,
        messageId: job.messageId,
        isPublished: true,
        thumbnailStatus: "pending",
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
      error instanceof Error ? error.message : "Thumbnail capture failed.";
    const storedError = message.slice(0, MAX_STORED_ERROR_LENGTH);
    await prisma.galleryPublication.updateMany({
      where: {
        id: job.publicationId,
        messageId: job.messageId,
        isPublished: true,
        thumbnailStatus: "pending",
      },
      data: {
        thumbnailStatus: "failed",
        thumbnailError: storedError,
        thumbnailUpdatedAt: new Date(),
      },
    });
    console.error("Gallery thumbnail capture failed:", {
      publicationId: job.publicationId,
      messageId: job.messageId,
      error: storedError,
    });
    revalidatePath("/gallery");
    return { status: "failed", error: storedError };
  }
}

export async function processGalleryThumbnailBatch({
  limit = 3,
  userId,
}: {
  limit?: number;
  userId?: string;
} = {}) {
  const prisma = getPrisma();
  const stalePendingCutoff = new Date(Date.now() - 5 * 60 * 1000);
  const failedRetryCutoff = new Date(Date.now() - 60 * 60 * 1000);
  const publications = await prisma.galleryPublication.findMany({
    where: {
      isPublished: true,
      ...(userId ? { userId } : {}),
      OR: [
        {
          thumbnailStatus: "failed",
          thumbnailUpdatedAt: { lt: failedRetryCutoff },
        },
        {
          thumbnailStatus: "pending",
          thumbnailUpdatedAt: null,
        },
        {
          thumbnailStatus: "pending",
          thumbnailUpdatedAt: { lt: stalePendingCutoff },
        },
      ],
    },
    orderBy: [{ thumbnailStatus: "desc" }, { publishedAt: "desc" }],
    take: Math.max(1, Math.min(limit, 10)),
    select: { id: true, messageId: true, slug: true },
  });

  const results: ThumbnailResult[] = [];
  const claimedAt = new Date();
  const claims = await Promise.all(
    publications.map((publication) =>
      prisma.galleryPublication.updateMany({
        where: {
          id: publication.id,
          messageId: publication.messageId,
          isPublished: true,
          OR: [
            {
              thumbnailStatus: "failed",
              thumbnailUpdatedAt: { lt: failedRetryCutoff },
            },
            {
              thumbnailStatus: "pending",
              thumbnailUpdatedAt: null,
            },
            {
              thumbnailStatus: "pending",
              thumbnailUpdatedAt: { lt: stalePendingCutoff },
            },
          ],
        },
        data: {
          thumbnailStatus: "pending",
          thumbnailError: null,
          thumbnailUpdatedAt: claimedAt,
        },
      }),
    ),
  );

  const claimedPublications = publications.filter(
    (_publication, index) => claims[index]?.count === 1,
  );
  for (const publication of claimedPublications) {
    results.push(
      await captureAndPersistGalleryThumbnail({
        publicationId: publication.id,
        messageId: publication.messageId,
        slug: publication.slug,
      }),
    );
  }

  return {
    processed: results.length,
    ready: results.filter((result) => result.status === "ready").length,
    failed: results.filter((result) => result.status === "failed").length,
  };
}
