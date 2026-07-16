import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSessionMock, prismaMock, scheduleThumbnailMock } = vi.hoisted(
  () => ({
    getSessionMock: vi.fn(),
    scheduleThumbnailMock: vi.fn(),
    prismaMock: {
      galleryPublication: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
    },
  }),
);

vi.mock("@/features/gallery/server/thumbnail-jobs", () => ({
  scheduleGalleryThumbnailCapture: scheduleThumbnailMock,
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: getSessionMock } },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => prismaMock,
}));

import { DELETE } from "@/app/api/gallery/[publicationId]/route";
import { POST as retryThumbnail } from "@/app/api/gallery/[publicationId]/thumbnail/route";
import { GET } from "@/app/api/gallery/publication/route";

describe("gallery publication management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSessionMock.mockResolvedValue({ user: { id: "owner_1" } });
  });

  it("only returns settings for a publication owned by the current user", async () => {
    prismaMock.galleryPublication.findFirst.mockResolvedValue({
      id: "publication_1",
      slug: "focus-day-chat123",
      title: "Focus Day",
      description: "A calmer way to plan focused work.",
      allowRemixes: false,
      isPublished: true,
    });

    const response = await GET(
      new NextRequest(
        "http://localhost/api/gallery/publication?chatId=chat_123",
      ),
    );

    expect(response.status).toBe(200);
    expect(prismaMock.galleryPublication.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { chatId: "chat_123", userId: "owner_1" },
      }),
    );
  });

  it("soft-unpublishes an owned project so its stable record can be reused", async () => {
    prismaMock.galleryPublication.findFirst.mockResolvedValue({
      id: "publication_1",
    });
    prismaMock.galleryPublication.update.mockResolvedValue({});

    const response = await DELETE(
      new NextRequest("http://localhost/api/gallery/publication_1", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ publicationId: "publication_1" }) },
    );

    expect(response.status).toBe(200);
    expect(prismaMock.galleryPublication.findFirst).toHaveBeenCalledWith({
      where: { id: "publication_1", userId: "owner_1" },
      select: { id: true },
    });
    expect(prismaMock.galleryPublication.update).toHaveBeenCalledWith({
      where: { id: "publication_1" },
      data: {
        isPublished: false,
        unpublishedAt: expect.any(Date),
      },
    });
  });

  it("lets the owner retry a failed thumbnail for a published project", async () => {
    prismaMock.galleryPublication.findFirst.mockResolvedValue({
      id: "publication_1",
      slug: "focus-day-chat123",
      messageId: "message_1",
      isPublished: true,
    });
    prismaMock.galleryPublication.update.mockResolvedValue({});

    const response = await retryThumbnail(
      new NextRequest("http://localhost/api/gallery/publication_1/thumbnail", {
        method: "POST",
      }),
      { params: Promise.resolve({ publicationId: "publication_1" }) },
    );

    expect(response.status).toBe(200);
    expect(prismaMock.galleryPublication.update).toHaveBeenCalledWith({
      where: { id: "publication_1" },
      data: {
        thumbnailStatus: "pending",
        thumbnailError: null,
        thumbnailUpdatedAt: expect.any(Date),
      },
    });
    expect(scheduleThumbnailMock).toHaveBeenCalledWith({
      publicationId: "publication_1",
      messageId: "message_1",
      slug: "focus-day-chat123",
    });
  });
});
