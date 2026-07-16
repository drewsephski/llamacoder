import "server-only";

import { randomUUID } from "node:crypto";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import type { GalleryThumbnailJob } from "@/features/gallery/server/thumbnail";

function getRequiredEnvironmentValue(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for gallery thumbnails.`);
  return value;
}

function getStorageConfig() {
  return {
    bucket: getRequiredEnvironmentValue("S3_UPLOAD_BUCKET"),
    region: getRequiredEnvironmentValue("S3_UPLOAD_REGION"),
    accessKeyId: getRequiredEnvironmentValue("S3_UPLOAD_KEY"),
    secretAccessKey: getRequiredEnvironmentValue("S3_UPLOAD_SECRET"),
  };
}

function createStorageClient({
  region,
  accessKeyId,
  secretAccessKey,
}: ReturnType<typeof getStorageConfig>) {
  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getObjectUrl({
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

function getObjectKey(
  thumbnailUrl: string,
  { bucket, region }: ReturnType<typeof getStorageConfig>,
) {
  const url = new URL(thumbnailUrl);
  const expectedHostname = `${bucket}.s3.${region}.amazonaws.com`;
  if (url.protocol !== "https:" || url.hostname !== expectedHostname) {
    throw new Error("Gallery thumbnail URL does not match configured storage.");
  }

  const key = url.pathname
    .replace(/^\//, "")
    .split("/")
    .map((segment) => decodeURIComponent(segment))
    .join("/");
  if (!key.startsWith("squid-gallery/")) {
    throw new Error("Gallery thumbnail URL has an invalid object key.");
  }
  return key;
}

export async function uploadGalleryThumbnail(
  job: GalleryThumbnailJob,
  body: Buffer,
) {
  const config = getStorageConfig();
  const key = `squid-gallery/${job.publicationId}/${job.messageId}-${randomUUID()}.jpg`;
  const client = createStorageClient(config);

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: "image/jpeg",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return getObjectUrl({
    bucket: config.bucket,
    key,
    region: config.region,
  });
}

export async function getGalleryThumbnailObject(thumbnailUrl: string) {
  const config = getStorageConfig();
  const key = getObjectKey(thumbnailUrl, config);
  const client = createStorageClient(config);

  return client.send(
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );
}
