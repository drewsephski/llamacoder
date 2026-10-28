import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentSession: vi.fn(),
  consumeRateLimit: vi.fn(),
  getSignedUrl: vi.fn(),
  lastPutObjectInput: null as Record<string, unknown> | null,
}));

vi.mock("@/features/auth/server/session", () => ({
  getCurrentSession: mocks.getCurrentSession,
}));
vi.mock("@/features/security/server/rate-limit", () => ({
  consumeRateLimit: mocks.consumeRateLimit,
}));
vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class S3Client {},
  PutObjectCommand: class PutObjectCommand {
    constructor(input: Record<string, unknown>) {
      mocks.lastPutObjectInput = input;
    }
  },
}));
vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: mocks.getSignedUrl,
}));

import { POST } from "@/app/api/s3-upload/route";

function request(body: Record<string, unknown>) {
  return new Request("http://localhost/api/s3-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, _nextS3: { strategy: "presigned" } }),
  });
}

describe("S3 upload signer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AWS_ENDPOINT_URL_S3 =
      "https://branch.storage.us-east-1.aws.neon.tech";
    mocks.getCurrentSession.mockResolvedValue({ user: { id: "user_1" } });
    mocks.consumeRateLimit.mockResolvedValue({ allowed: true, remaining: 11 });
    mocks.getSignedUrl.mockResolvedValue("https://uploads.example.com/signed");
    mocks.lastPutObjectInput = null;
    process.env.NEON_UPLOAD_BUCKET = "bucket";
    process.env.AWS_REGION = "us-east-1";
    process.env.AWS_ACCESS_KEY_ID = "access-key";
    process.env.AWS_SECRET_ACCESS_KEY = "secret-key";
  });

  it("authenticates before signing", async () => {
    mocks.getCurrentSession.mockResolvedValue(null);
    const response = await POST(
      request({ filename: "screen.png", filetype: "image/png", filesize: 500 }),
    );
    expect(response.status).toBe(401);
    expect(mocks.getSignedUrl).not.toHaveBeenCalled();
  });

  it("rejects unsupported or oversized files server-side", async () => {
    const response = await POST(
      request({
        filename: "payload.svg",
        filetype: "image/svg+xml",
        filesize: 7 * 1024 * 1024,
      }),
    );
    expect(response.status).toBe(400);
    expect(mocks.consumeRateLimit).not.toHaveBeenCalled();
  });

  it("signs the exact size, MIME type, and owner-scoped key", async () => {
    const response = await POST(
      request({ filename: "screen.png", filetype: "image/png", filesize: 500 }),
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body).toMatchObject({
      bucket: "bucket",
      region: "us-east-1",
      url: "https://uploads.example.com/signed",
      objectUrl: expect.stringMatching(
        /^https:\/\/branch\.storage\.us-east-1\.aws\.neon\.tech\/bucket\/squid-uploads\/user_1\//,
      ),
    });
    expect(body.key).toMatch(/^squid-uploads\/user_1\/[0-9a-f-]+\.png$/);
    expect(mocks.consumeRateLimit).toHaveBeenCalledWith({
      userId: "user_1",
      operation: "upload",
      limit: 12,
      windowMs: 60_000,
    });
    expect(mocks.lastPutObjectInput).toMatchObject({
      Bucket: "bucket",
      Key: body.key,
      ContentType: "image/png",
      ContentLength: 500,
      CacheControl: "max-age=630720000, public",
    });
    expect(mocks.getSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { expiresIn: 300 },
    );
  });

  it("returns 503 when Neon storage is incompletely configured", async () => {
    const endpoint = process.env.AWS_ENDPOINT_URL_S3;
    delete process.env.AWS_ENDPOINT_URL_S3;
    try {
      const response = await POST(
        request({
          filename: "screen.png",
          filetype: "image/png",
          filesize: 500,
        }),
      );
      expect(response.status).toBe(503);
      expect(mocks.getSignedUrl).not.toHaveBeenCalled();
    } finally {
      process.env.AWS_ENDPOINT_URL_S3 = endpoint;
    }
  });
});
