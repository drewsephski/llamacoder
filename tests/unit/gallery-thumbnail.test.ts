import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, revalidatePathMock, s3SendMock } = vi.hoisted(() => ({
  prismaMock: {
    galleryPublication: {
      updateMany: vi.fn(),
    },
  },
  revalidatePathMock: vi.fn(),
  s3SendMock: vi.fn(),
}));

vi.mock("@aws-sdk/client-s3", () => ({
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

vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));
vi.mock("@/lib/prisma", () => ({ getPrisma: () => prismaMock }));

import {
  persistGalleryThumbnail,
  resetStaleGalleryThumbnails,
  validateGalleryThumbnailUpload,
} from "@/features/gallery/server/thumbnail";

const job = {
  publicationId: "publication_1",
  messageId: "message_1",
  slug: "focus-day-chat123",
};

describe("gallery thumbnail persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.S3_UPLOAD_BUCKET = "squid-assets";
    process.env.S3_UPLOAD_REGION = "us-east-1";
    process.env.S3_UPLOAD_KEY = "s3-key";
    process.env.S3_UPLOAD_SECRET = "s3-secret";
    prismaMock.galleryPublication.updateMany.mockResolvedValue({ count: 1 });
  });

  it("uploads an immutable image and marks the matching version ready", async () => {
    const screenshot = Buffer.from([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x00]);

    const result = await persistGalleryThumbnail(job, screenshot);

    expect(s3SendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          CacheControl: "public, max-age=31536000, immutable",
          ContentType: "image/jpeg",
        }),
      }),
    );
    expect(prismaMock.galleryPublication.updateMany).toHaveBeenCalledWith({
      where: {
        id: "publication_1",
        messageId: "message_1",
        isPublished: true,
      },
      data: expect.objectContaining({
        thumbnailStatus: "ready",
        thumbnailCapturedMessageId: "message_1",
        thumbnailError: null,
      }),
    });
    expect(result).toEqual({
      status: "ready",
      url: expect.stringMatching(
        /^https:\/\/squid-assets\.s3\.us-east-1\.amazonaws\.com\/squid-gallery\//,
      ),
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/gallery");
  });

  it("records a retryable failure when upload validation fails", async () => {
    const result = await persistGalleryThumbnail(
      job,
      Buffer.from("not-a-jpeg"),
    );

    expect(result).toEqual({
      status: "failed",
      error: "Gallery preview image must be a JPEG.",
    });
    expect(s3SendMock).not.toHaveBeenCalled();
    expect(prismaMock.galleryPublication.updateMany).toHaveBeenCalledWith({
      where: {
        id: "publication_1",
        messageId: "message_1",
        isPublished: true,
      },
      data: expect.objectContaining({
        thumbnailStatus: "failed",
        thumbnailError: "Gallery preview image must be a JPEG.",
      }),
    });
  });

  it("rejects invalid uploads before persistence", () => {
    expect(() => validateGalleryThumbnailUpload(Buffer.alloc(0))).toThrow(
      "Gallery preview image is empty.",
    );
    expect(() =>
      validateGalleryThumbnailUpload(Buffer.alloc(900_000, 0xff)),
    ).toThrow("Gallery preview image is too large.");
  });

  it("marks stale pending publications as failed during maintenance", async () => {
    prismaMock.galleryPublication.updateMany.mockResolvedValueOnce({
      count: 2,
    });

    const result = await resetStaleGalleryThumbnails();

    expect(result).toEqual({ markedFailed: 2 });
    expect(prismaMock.galleryPublication.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          thumbnailStatus: "pending",
        }),
        data: expect.objectContaining({
          thumbnailStatus: "failed",
        }),
      }),
    );
  });
});
