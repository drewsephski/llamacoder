import { S3Client } from "@aws-sdk/client-s3";

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for Neon object storage.`);
  return value;
}

export function getObjectStorageConfig(
  bucketVariable: "NEON_GALLERY_BUCKET" | "NEON_UPLOAD_BUCKET",
) {
  const endpoint = new URL(required("AWS_ENDPOINT_URL_S3"));
  if (
    endpoint.protocol !== "https:" ||
    endpoint.username ||
    endpoint.password ||
    endpoint.pathname !== "/" ||
    endpoint.search ||
    endpoint.hash
  ) {
    throw new Error("AWS_ENDPOINT_URL_S3 must be an HTTPS storage origin.");
  }

  return {
    bucket: required(bucketVariable),
    endpoint: endpoint.origin,
    region: required("AWS_REGION"),
    accessKeyId: required("AWS_ACCESS_KEY_ID"),
    secretAccessKey: required("AWS_SECRET_ACCESS_KEY"),
  };
}

export type ObjectStorageConfig = ReturnType<typeof getObjectStorageConfig>;

export function createObjectStorageClient(config: ObjectStorageConfig) {
  return new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export function getObjectStorageUrl(
  { endpoint, bucket }: Pick<ObjectStorageConfig, "endpoint" | "bucket">,
  key: string,
) {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `${endpoint}/${encodeURIComponent(bucket)}/${encodedKey}`;
}
