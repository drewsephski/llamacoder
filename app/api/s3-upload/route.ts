import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

import { getCurrentSession } from "@/features/auth/server/session";
import { consumeRateLimit } from "@/features/security/server/rate-limit";

const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const requestSchema = z.object({
  filename: z.string().trim().min(1).max(180),
  filetype: z.string().refine((value) => ALLOWED_MIME_TYPES.has(value)),
  filesize: z.number().int().positive().max(MAX_UPLOAD_BYTES),
  _nextS3: z.object({ strategy: z.literal("presigned") }),
});

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = requestSchema.safeParse(
    await request
      .clone()
      .json()
      .catch(() => null),
  );
  if (!parsed.success) {
    return Response.json(
      { error: "Upload must be a PNG, JPEG, or WebP image under 6 MB." },
      { status: 400 },
    );
  }

  const rateLimit = await consumeRateLimit({
    userId: session.user.id,
    operation: "upload",
    limit: 12,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many uploads. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const bucket = process.env.S3_UPLOAD_BUCKET?.trim();
  const region = process.env.S3_UPLOAD_REGION?.trim();
  const accessKeyId = process.env.S3_UPLOAD_KEY?.trim();
  const secretAccessKey = process.env.S3_UPLOAD_SECRET?.trim();
  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    return Response.json(
      { error: "Upload storage is not configured." },
      { status: 503 },
    );
  }

  const extension = parsed.data.filename.split(".").at(-1)?.toLowerCase();
  const key = `squid-uploads/${session.user.id}/${randomUUID()}.${extension || "image"}`;
  const client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
  const url = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: parsed.data.filetype,
      ContentLength: parsed.data.filesize,
      CacheControl: "max-age=630720000, public",
    }),
    { expiresIn: 300 },
  );

  return Response.json({ key, bucket, region, url });
}
