import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    galleryPublication: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({ getPrisma: () => prismaMock }));

import { getGalleryProjects } from "@/features/gallery/server/queries";

const publication = {
  id: "publication_1",
  chatId: "chat_1",
  userId: "owner_1",
  slug: "focus-day-chat1",
  title: "Focus Day",
  description: "A focused workspace.",
  allowRemixes: true,
  publishedAt: new Date("2026-07-16T12:00:00.000Z"),
  messageId: "message_new",
  thumbnailUrl: "https://assets.test/old.jpg",
  thumbnailStatus: "ready",
  thumbnailCapturedMessageId: "message_old",
  user: { name: "Squid creator", image: null },
};

describe("gallery project thumbnail versions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.galleryPublication.count.mockResolvedValue(1);
  });

  it("falls back to the live preview when the stored image is for an older version", async () => {
    prismaMock.galleryPublication.findMany.mockResolvedValue([publication]);

    const result = await getGalleryProjects({
      query: "",
      remixable: false,
      sort: "newest",
      viewerId: "owner_1",
    });

    expect(result.projects[0]).toMatchObject({
      ownerChatId: "chat_1",
      thumbnailUrl: null,
      thumbnailStatus: "pending",
    });
  });

  it("returns the persisted image only when it matches the published message", async () => {
    prismaMock.galleryPublication.findMany.mockResolvedValue([
      {
        ...publication,
        thumbnailCapturedMessageId: "message_new",
      },
    ]);

    const result = await getGalleryProjects({
      query: "",
      remixable: false,
      sort: "newest",
    });

    expect(result.projects[0]).toMatchObject({
      thumbnailUrl: "/api/gallery/publication_1/thumbnail?v=message_new",
      thumbnailStatus: "ready",
    });
  });
});
