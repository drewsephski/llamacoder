import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getSessionMock,
  prismaMock,
  revalidatePathMock,
  scheduleThumbnailMock,
} = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  scheduleThumbnailMock: vi.fn(),
  prismaMock: {
    galleryPublication: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    message: { findFirst: vi.fn() },
  },
}));

vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

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

import { GET, POST } from "@/app/api/gallery/route";

describe("/api/gallery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSessionMock.mockResolvedValue({ user: { id: "owner_1" } });
    prismaMock.galleryPublication.count.mockResolvedValue(0);
    prismaMock.galleryPublication.findMany.mockResolvedValue([]);
    prismaMock.galleryPublication.findUnique.mockResolvedValue(null);
  });

  it("only lists durable published gallery records", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(prismaMock.galleryPublication.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isPublished: true }),
      }),
    );
    await expect(response.json()).resolves.toEqual({ apps: [] });
  });

  it("publishes an owned assistant version with a stable project slug", async () => {
    prismaMock.message.findFirst.mockResolvedValue({
      id: "message_1",
      role: "assistant",
      chatId: "chat_1234567",
      content: "",
      files: [
        {
          path: "App.tsx",
          code: "export default function App() { return <main />; }",
        },
      ],
      chat: { id: "chat_1234567", userId: "owner_1" },
    });
    prismaMock.galleryPublication.upsert.mockResolvedValue({
      id: "publication_1",
      slug: "focus-day-chat123",
      title: "Focus Day",
      description: "A calmer way to plan focused work.",
      allowRemixes: true,
      isPublished: true,
      thumbnailStatus: "pending",
    });

    const response = await POST(
      new Request("http://localhost/api/gallery", {
        method: "POST",
        body: JSON.stringify({
          messageId: "message_1",
          title: "Focus Day",
          description: "A calmer way to plan focused work.",
          allowRemixes: true,
        }),
      }) as never,
    );

    expect(response.status).toBe(200);
    expect(prismaMock.message.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "message_1",
          chat: { userId: "owner_1" },
        }),
      }),
    );
    expect(prismaMock.galleryPublication.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { chatId: "chat_1234567" },
        create: expect.objectContaining({
          userId: "owner_1",
          messageId: "message_1",
          allowRemixes: true,
          thumbnailStatus: "pending",
        }),
        update: expect.objectContaining({
          thumbnailUrl: null,
          thumbnailStatus: "pending",
          thumbnailCapturedMessageId: null,
        }),
      }),
    );
    expect(scheduleThumbnailMock).toHaveBeenCalledWith({
      publicationId: "publication_1",
      messageId: "message_1",
      slug: "focus-day-chat123",
    });
    await expect(response.json()).resolves.toEqual({
      publication: expect.objectContaining({
        thumbnailStatus: "pending",
      }),
    });
  });

  it("does not publish a version the current user does not own", async () => {
    prismaMock.message.findFirst.mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/gallery", {
        method: "POST",
        body: JSON.stringify({
          messageId: "someone_elses_message",
          title: "Private app",
          description: "This should not be published.",
          allowRemixes: false,
        }),
      }) as never,
    );

    expect(response.status).toBe(404);
    expect(prismaMock.galleryPublication.upsert).not.toHaveBeenCalled();
  });
});
