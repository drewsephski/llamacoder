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
  chat: { prompt: "Build me a focused workspace app" },
  user: { name: "Squid creator", image: null },
};

function createPublication(index: number, publishedAt?: Date) {
  return {
    ...publication,
    id: `publication_${String(index).padStart(2, "0")}`,
    chatId: `chat_${index}`,
    userId: `owner_${index}`,
    slug: `project-${index}`,
    title: `Project ${index}`,
    publishedAt:
      publishedAt ??
      new Date(`2026-07-${String(index).padStart(2, "0")}T12:00:00.000Z`),
    messageId: `message_${index}`,
    thumbnailCapturedMessageId: `message_${index}`,
  };
}

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
      generationPrompt: "Build me a focused workspace app",
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

describe("gallery cursor pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bounds the first page and returns an opaque next cursor", async () => {
    prismaMock.galleryPublication.findMany.mockResolvedValue(
      Array.from({ length: 13 }, (_, index) => createPublication(index + 1)),
    );

    const result = await getGalleryProjects({
      query: "",
      remixable: false,
      sort: "newest",
    });

    expect(result.projects).toHaveLength(12);
    expect(result.previousCursor).toBeNull();
    expect(result.nextCursor).toEqual(expect.any(String));
    expect(prismaMock.galleryPublication.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 13,
        orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      }),
    );
  });

  it("uses publishedAt and id as a stable next-page boundary", async () => {
    const tiedDate = new Date("2026-07-20T12:00:00.000Z");
    prismaMock.galleryPublication.findMany.mockResolvedValueOnce(
      Array.from({ length: 13 }, (_, index) =>
        createPublication(index + 1, tiedDate),
      ),
    );
    const firstPage = await getGalleryProjects({
      query: "",
      remixable: false,
      sort: "newest",
    });
    prismaMock.galleryPublication.findMany.mockResolvedValueOnce([
      createPublication(13, tiedDate),
      createPublication(14, tiedDate),
    ]);

    const secondPage = await getGalleryProjects({
      query: "",
      remixable: false,
      sort: "newest",
      cursor: firstPage.nextCursor ?? "",
    });

    expect(secondPage.projects.map((project) => project.id)).toEqual([
      "publication_13",
      "publication_14",
    ]);
    expect(secondPage.previousCursor).toEqual(expect.any(String));
    expect(prismaMock.galleryPublication.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({ publishedAt: { lt: tiedDate } }),
                expect.objectContaining({
                  publishedAt: tiedDate,
                  id: { lt: "publication_12" },
                }),
              ]),
            }),
          ]),
        }),
      }),
    );
  });

  it("reverses keyset comparisons for oldest-first sorting", async () => {
    prismaMock.galleryPublication.findMany.mockResolvedValue(
      Array.from({ length: 13 }, (_, index) => createPublication(index + 1)),
    );

    const firstPage = await getGalleryProjects({
      query: "planner",
      remixable: true,
      sort: "oldest",
    });

    expect(firstPage.nextCursor).toEqual(expect.any(String));
    expect(prismaMock.galleryPublication.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ publishedAt: "asc" }, { id: "asc" }],
        where: expect.objectContaining({
          allowRemixes: true,
          AND: expect.arrayContaining([
            expect.objectContaining({ OR: expect.any(Array) }),
          ]),
        }),
      }),
    );
  });

  it("resets a cursor that does not match the active filters", async () => {
    prismaMock.galleryPublication.findMany.mockResolvedValueOnce(
      Array.from({ length: 13 }, (_, index) => createPublication(index + 1)),
    );
    const firstPage = await getGalleryProjects({
      query: "",
      remixable: false,
      sort: "newest",
    });
    prismaMock.galleryPublication.findMany.mockResolvedValueOnce([]);

    const result = await getGalleryProjects({
      query: "different",
      remixable: false,
      sort: "newest",
      cursor: firstPage.nextCursor ?? "",
    });

    expect(result.previousCursor).toBeNull();
    const call = prismaMock.galleryPublication.findMany.mock.calls.at(-1)?.[0];
    expect(call?.where.AND).toHaveLength(1);
  });
});
