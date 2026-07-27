import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getSessionMock,
  prismaMock,
  publishGalleryArtifactMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  publishGalleryArtifactMock: vi.fn(),
  revalidatePathMock: vi.fn(),
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

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: getSessionMock } },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => prismaMock,
}));

vi.mock("@/features/public-artifacts/server/publish", () => ({
  publishGalleryArtifact: publishGalleryArtifactMock,
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
    const response = await GET(
      new Request("http://localhost/api/gallery") as never,
    );

    expect(response.status).toBe(200);
    expect(prismaMock.galleryPublication.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isPublished: true }),
      }),
    );
    await expect(response.json()).resolves.toEqual({ apps: [] });
  });

  it("returns all published gallery thumbnails for hero popouts", async () => {
    prismaMock.galleryPublication.count.mockResolvedValue(2);
    prismaMock.galleryPublication.findMany.mockResolvedValue([
      {
        id: "publication_1",
        chatId: "chat_1",
        userId: "owner_1",
        slug: "focus-day",
        title: "Focus Day",
        description: "A calmer way to plan focused work.",
        allowRemixes: true,
        publishedAt: new Date("2026-01-01T00:00:00.000Z"),
        messageId: "message_1",
        thumbnailUrl: "https://cdn.example/focus-day.png",
        thumbnailStatus: "ready",
        thumbnailCapturedMessageId: "message_1",
        chat: { prompt: "Build me a focused daily planning app" },
        user: { name: "Drew", image: null },
      },
      {
        id: "publication_2",
        chatId: "chat_2",
        userId: "owner_2",
        slug: "pending-app",
        title: "Pending App",
        description: "Still generating a preview.",
        allowRemixes: false,
        publishedAt: new Date("2026-01-02T00:00:00.000Z"),
        messageId: "message_2",
        thumbnailUrl: null,
        thumbnailStatus: "pending",
        thumbnailCapturedMessageId: null,
        chat: { prompt: "Build me a pending app" },
        user: { name: "Alex", image: null },
      },
    ]);

    const response = await GET(
      new Request("http://localhost/api/gallery?withThumbnails=all") as never,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      images: [
        {
          src: "/api/gallery/publication_1/thumbnail?v=message_1",
          alt: "Preview of Focus Day",
          title: "Focus Day",
          prompt: "Build me a focused daily planning app",
          href: "/gallery/focus-day",
        },
      ],
    });
  });

  it("does not truncate older gallery thumbnails from hero popouts", async () => {
    const rows = Array.from({ length: 8 }, (_, index) => ({
      id: `publication_${index + 1}`,
      chatId: `chat_${index + 1}`,
      userId: `owner_${index + 1}`,
      slug: `project-${index + 1}`,
      title: `Project ${index + 1}`,
      description: `Gallery project ${index + 1}`,
      allowRemixes: true,
      publishedAt: new Date(
        `2026-01-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`,
      ),
      messageId: `message_${index + 1}`,
      thumbnailUrl: `https://cdn.example/project-${index + 1}.png`,
      thumbnailStatus: "ready",
      thumbnailCapturedMessageId: `message_${index + 1}`,
      chat: { prompt: `Build gallery project ${index + 1}` },
      user: { name: `Creator ${index + 1}`, image: null },
    }));
    prismaMock.galleryPublication.count.mockResolvedValue(rows.length);
    prismaMock.galleryPublication.findMany.mockResolvedValue(rows);

    const response = await GET(
      new Request("http://localhost/api/gallery?withThumbnails=all") as never,
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.images).toHaveLength(8);
    expect(body.images.at(-1)).toEqual(
      expect.objectContaining({
        title: "Project 8",
        href: "/gallery/project-8",
      }),
    );
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
    publishGalleryArtifactMock.mockResolvedValue({
      stableSlug: "focus-day-chat123",
      artifact: {
        token: "opaque_token",
        allowStarterDownloads: true,
      },
      publication: {
        id: "publication_1",
        slug: "focus-day-chat123",
        title: "Focus Day",
        description: "A calmer way to plan focused work.",
        allowRemixes: true,
        isPublished: true,
        thumbnailStatus: "pending",
      },
    });

    const response = await POST(
      new Request("http://localhost/api/gallery", {
        method: "POST",
        body: JSON.stringify({
          messageId: "message_1",
          title: "Focus Day",
          description: "A calmer way to plan focused work.",
          allowRemixes: true,
          allowStarterDownloads: true,
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
    expect(publishGalleryArtifactMock).toHaveBeenCalledWith(
      prismaMock,
      expect.objectContaining({
        chatId: "chat_1234567",
        userId: "owner_1",
        messageId: "message_1",
        allowRemixes: true,
        allowStarterDownloads: true,
      }),
    );
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
          allowStarterDownloads: false,
        }),
      }) as never,
    );

    expect(response.status).toBe(404);
    expect(publishGalleryArtifactMock).not.toHaveBeenCalled();
  });
});
