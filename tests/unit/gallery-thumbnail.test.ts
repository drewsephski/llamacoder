import { beforeEach, describe, expect, it, vi } from "vitest";

const { closeMock, pageMock, prismaMock, revalidatePathMock, s3SendMock } =
  vi.hoisted(() => ({
    closeMock: vi.fn(),
    pageMock: {
      goto: vi.fn(),
      screenshot: vi.fn(),
      setViewportSize: vi.fn(),
      waitForSelector: vi.fn(),
      waitForTimeout: vi.fn(),
    },
    prismaMock: {
      galleryPublication: {
        findMany: vi.fn(),
        updateMany: vi.fn(),
      },
    },
    revalidatePathMock: vi.fn(),
    s3SendMock: vi.fn(),
  }));

vi.mock("@browserbasehq/stagehand", () => ({
  Stagehand: class {
    context = {
      pages: () => [pageMock],
      newPage: vi.fn(),
    };
    init = vi.fn();
    close = closeMock;
  },
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
vi.mock("@/lib/app-origin", () => ({
  getAppOrigin: () => "https://squid.test",
}));
vi.mock("@/lib/prisma", () => ({ getPrisma: () => prismaMock }));

import {
  captureAndPersistGalleryThumbnail,
  processGalleryThumbnailBatch,
} from "@/features/gallery/server/thumbnail";

const job = {
  publicationId: "publication_1",
  messageId: "message_1",
  slug: "focus-day-chat123",
};

describe("gallery thumbnail capture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "production");
    process.env.BROWSERBASE_API_KEY = "browserbase-key";
    process.env.BROWSERBASE_PROJECT_ID = "browserbase-project";
    process.env.S3_UPLOAD_BUCKET = "squid-assets";
    process.env.S3_UPLOAD_REGION = "us-east-1";
    process.env.S3_UPLOAD_KEY = "s3-key";
    process.env.S3_UPLOAD_SECRET = "s3-secret";
    pageMock.waitForSelector.mockResolvedValue(true);
    pageMock.screenshot.mockResolvedValue(Buffer.from("thumbnail"));
    prismaMock.galleryPublication.updateMany.mockResolvedValue({ count: 1 });
  });

  it("uploads an immutable image and marks only the matching version ready", async () => {
    const result = await captureAndPersistGalleryThumbnail(job);

    expect(pageMock.goto).toHaveBeenCalledWith(
      "https://squid.test/gallery/focus-day-chat123/preview",
      expect.objectContaining({ waitUntil: "domcontentloaded" }),
    );
    expect(pageMock.setViewportSize).toHaveBeenCalledWith(1280, 720, {
      deviceScaleFactor: 1,
    });
    expect(pageMock.waitForSelector).toHaveBeenCalledWith(
      ".sp-preview-iframe",
      expect.objectContaining({ timeout: 45_000 }),
    );
    expect(pageMock.waitForSelector).toHaveBeenCalledWith(
      '[data-gallery-preview-status="ready"]',
      expect.objectContaining({ timeout: 45_000 }),
    );
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
        thumbnailStatus: "pending",
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
    expect(closeMock).toHaveBeenCalled();
    expect(revalidatePathMock).toHaveBeenCalledWith("/gallery");
  });

  it("records a retryable failure and always closes the browser session", async () => {
    pageMock.waitForSelector.mockRejectedValueOnce(
      new Error("Preview timed out"),
    );

    const result = await captureAndPersistGalleryThumbnail(job);

    expect(result).toEqual({ status: "failed", error: "Preview timed out" });
    expect(prismaMock.galleryPublication.updateMany).toHaveBeenCalledWith({
      where: {
        id: "publication_1",
        messageId: "message_1",
        isPublished: true,
        thumbnailStatus: "pending",
      },
      data: expect.objectContaining({
        thumbnailStatus: "failed",
        thumbnailError: "Preview timed out",
      }),
    });
    expect(closeMock).toHaveBeenCalled();
  });

  it("does not persist an image until the generated preview reports ready", async () => {
    pageMock.waitForSelector
      .mockResolvedValueOnce(true)
      .mockRejectedValueOnce(new Error("Preview did not compile"));

    const result = await captureAndPersistGalleryThumbnail(job);

    expect(result).toEqual({
      status: "failed",
      error: "Preview did not compile",
    });
    expect(pageMock.screenshot).not.toHaveBeenCalled();
    expect(s3SendMock).not.toHaveBeenCalled();
    expect(prismaMock.galleryPublication.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          thumbnailStatus: "failed",
          thumbnailError: "Preview did not compile",
        }),
      }),
    );
  });

  it("prioritizes the newest pending publications during recovery", async () => {
    prismaMock.galleryPublication.findMany.mockResolvedValueOnce([]);

    await processGalleryThumbnailBatch();

    expect(prismaMock.galleryPublication.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ thumbnailStatus: "desc" }, { publishedAt: "desc" }],
      }),
    );
  });

  it("captures claimed publications concurrently", async () => {
    const secondJob = {
      publicationId: "publication_2",
      messageId: "message_2",
      slug: "second-project-chat456",
    };
    prismaMock.galleryPublication.findMany.mockResolvedValueOnce([
      { id: job.publicationId, messageId: job.messageId, slug: job.slug },
      {
        id: secondJob.publicationId,
        messageId: secondJob.messageId,
        slug: secondJob.slug,
      },
    ]);
    prismaMock.galleryPublication.updateMany.mockResolvedValue({ count: 1 });

    const result = await processGalleryThumbnailBatch({ limit: 2 });

    expect(result).toEqual({ processed: 2, ready: 2, failed: 0 });
    expect(pageMock.screenshot).toHaveBeenCalledTimes(2);
  });
});
