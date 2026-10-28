import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { s3SendMock, clientConfigMock } = vi.hoisted(() => ({
  s3SendMock: vi.fn(),
  clientConfigMock: vi.fn(),
}));

vi.mock("@aws-sdk/client-s3", () => ({
  GetObjectCommand: class {
    input: unknown;
    constructor(input: unknown) {
      this.input = input;
    }
  },
  PutObjectCommand: class {
    input: unknown;
    constructor(input: unknown) {
      this.input = input;
    }
  },
  S3Client: class {
    constructor(config: unknown) {
      clientConfigMock(config);
    }
    send = s3SendMock;
  },
}));

import { getGalleryThumbnailObject } from "@/features/gallery/server/thumbnail-storage";

describe("gallery thumbnail storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AWS_ENDPOINT_URL_S3 =
      "https://branch.storage.us-east-1.aws.neon.tech";
    process.env.NEON_GALLERY_BUCKET = "squid-assets";
    process.env.AWS_REGION = "us-east-1";
    process.env.AWS_ACCESS_KEY_ID = "s3-key";
    process.env.AWS_SECRET_ACCESS_KEY = "s3-secret";
    vi.stubEnv("S3_UPLOAD_BUCKET", "old-assets");
    vi.stubEnv("S3_UPLOAD_REGION", "us-east-1");
  });

  afterEach(() => vi.unstubAllEnvs());

  it("reads only gallery objects from the configured private bucket", async () => {
    s3SendMock.mockResolvedValue({ ContentType: "image/jpeg" });

    await getGalleryThumbnailObject(
      "https://branch.storage.us-east-1.aws.neon.tech/squid-assets/squid-gallery/publication%201/message.jpg",
    );

    expect(s3SendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Bucket: "squid-assets",
          Key: "squid-gallery/publication 1/message.jpg",
        },
      }),
    );
    expect(clientConfigMock).toHaveBeenCalledWith({
      endpoint: "https://branch.storage.us-east-1.aws.neon.tech",
      region: "us-east-1",
      forcePathStyle: true,
      credentials: { accessKeyId: "s3-key", secretAccessKey: "s3-secret" },
    });
  });

  it("reads a migrated legacy URL from Neon without contacting AWS", async () => {
    await getGalleryThumbnailObject(
      "https://old-assets.s3.us-east-1.amazonaws.com/squid-gallery/publication/message.jpg",
    );
    expect(s3SendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Bucket: "squid-assets",
          Key: "squid-gallery/publication/message.jpg",
        },
      }),
    );
    expect(clientConfigMock).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: "https://branch.storage.us-east-1.aws.neon.tech",
      }),
    );
  });

  it.each([
    "https://branch.storage.us-east-1.aws.neon.tech/other-bucket/squid-gallery/a.jpg",
    "https://branch.storage.us-east-1.aws.neon.tech/squid-assets/squid-uploads/a.jpg",
    "https://branch.storage.us-east-1.aws.neon.tech/squid-assets/squid-gallery/%2e%2e%2fprivate.jpg",
    "https://unconfigured.s3.us-east-1.amazonaws.com/squid-gallery/a.jpg",
  ])("rejects objects outside the gallery boundary: %s", async (url) => {
    await expect(getGalleryThumbnailObject(url)).rejects.toThrow();
    expect(s3SendMock).not.toHaveBeenCalled();
  });

  it("rejects unexpected hosts instead of turning the proxy into an SSRF path", async () => {
    await expect(
      getGalleryThumbnailObject(
        "https://attacker.example/squid-gallery/publication_1/message.jpg",
      ),
    ).rejects.toThrow("does not match configured storage");

    expect(s3SendMock).not.toHaveBeenCalled();
  });
});
