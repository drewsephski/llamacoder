import "server-only";

import { randomUUID } from "node:crypto";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

import type { GalleryThumbnailJob } from "@/features/gallery/server/thumbnail";
import {
  createObjectStorageClient,
  getObjectStorageConfig,
  getObjectStorageUrl,
  type ObjectStorageConfig,
} from "@/lib/object-storage";

function getObjectKey(thumbnailUrl: string, config: ObjectStorageConfig) {
  const url = new URL(thumbnailUrl);
  const prefix = `${encodeURIComponent(config.bucket)}/`;
  let pathname = url.pathname.replace(/^\//, "");
  const isNeonObject =
    url.origin === config.endpoint && pathname.startsWith(prefix);
  // Older publications retain S3 URLs during migration. Their objects must
  // already have been copied into Neon with the same key; never read AWS.
  const legacyBucket = process.env.S3_UPLOAD_BUCKET?.trim();
  const legacyRegion = process.env.S3_UPLOAD_REGION?.trim();
  const isMigratedLegacyObject =
    Boolean(legacyBucket && legacyRegion) &&
    url.hostname === `${legacyBucket}.s3.${legacyRegion}.amazonaws.com`;
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    url.search ||
    url.hash ||
    (!isNeonObject && !isMigratedLegacyObject)
  ) {
    throw new Error("Gallery thumbnail URL does not match configured storage.");
  }
  if (isNeonObject) pathname = pathname.slice(prefix.length);
  const key = pathname
    .split("/")
    .map((segment) => decodeURIComponent(segment))
    .join("/");
  if (
    !key.startsWith("squid-gallery/") ||
    key
      .split("/")
      .some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new Error("Gallery thumbnail URL has an invalid object key.");
  }
  return key;
}

export async function uploadGalleryThumbnail(
  job: GalleryThumbnailJob,
  body: Buffer,
) {
  const config = getObjectStorageConfig("NEON_GALLERY_BUCKET");
  const key = `squid-gallery/${job.publicationId}/${job.messageId}-${randomUUID()}.jpg`;
  const client = createObjectStorageClient(config);

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: "image/jpeg",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return getObjectStorageUrl(config, key);
}

export async function getGalleryThumbnailObject(thumbnailUrl: string) {
  const config = getObjectStorageConfig("NEON_GALLERY_BUCKET");
  const key = getObjectKey(thumbnailUrl, config);
  const client = createObjectStorageClient(config);

  return client.send(
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );
}
