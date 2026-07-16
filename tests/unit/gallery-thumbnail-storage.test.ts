import { beforeEach, describe, expect, it, vi } from "vitest";

const { s3SendMock } = vi.hoisted(() => ({ s3SendMock: vi.fn() }));

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
    send = s3SendMock;
  },
}));

import { getGalleryThumbnailObject } from "@/features/gallery/server/thumbnail-storage";

describe("gallery thumbnail storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.S3_UPLOAD_BUCKET = "squid-assets";
    process.env.S3_UPLOAD_REGION = "us-east-1";
    process.env.S3_UPLOAD_KEY = "s3-key";
    process.env.S3_UPLOAD_SECRET = "s3-secret";
  });

  it("reads only gallery objects from the configured private bucket", async () => {
    s3SendMock.mockResolvedValue({ ContentType: "image/jpeg" });

    await getGalleryThumbnailObject(
      "https://squid-assets.s3.us-east-1.amazonaws.com/squid-gallery/publication%201/message.jpg",
    );

    expect(s3SendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Bucket: "squid-assets",
          Key: "squid-gallery/publication 1/message.jpg",
        },
      }),
    );
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
