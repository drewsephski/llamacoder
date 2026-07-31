import "server-only";

import type { Prisma } from "@prisma/client";
import { cache } from "react";
import { z } from "zod";

import type { GalleryProjectSummary } from "@/features/gallery/contracts";
import { getMessageGeneratedFiles } from "@/features/generation/message-files";
import { getPrisma } from "@/lib/prisma";

export const GALLERY_PAGE_SIZE = 12;

const galleryCursorSchema = z.object({
  v: z.literal(1),
  snapshotAt: z.string().datetime(),
  publishedAt: z.string().datetime(),
  id: z.string().min(1).max(128),
  direction: z.enum(["after", "before"]),
  query: z.string().max(80),
  remixable: z.boolean(),
  sort: z.enum(["newest", "oldest"]),
});

type GallerySort = "newest" | "oldest";
type GalleryCursor = z.infer<typeof galleryCursorSchema>;

const galleryProjectSelect = {
  id: true,
  chatId: true,
  userId: true,
  slug: true,
  title: true,
  description: true,
  allowRemixes: true,
  publishedAt: true,
  messageId: true,
  thumbnailUrl: true,
  thumbnailStatus: true,
  thumbnailCapturedMessageId: true,
  chat: { select: { prompt: true } },
  user: { select: { name: true, image: true } },
} satisfies Prisma.GalleryPublicationSelect;

type GalleryProjectRow = Prisma.GalleryPublicationGetPayload<{
  select: typeof galleryProjectSelect;
}>;

function encodeGalleryCursor(cursor: GalleryCursor) {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

function decodeGalleryCursor(value: string): GalleryCursor | null {
  if (!value) return null;

  try {
    const decoded: unknown = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    );
    const parsed = galleryCursorSchema.safeParse(decoded);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function mapGalleryProject(
  row: GalleryProjectRow,
  viewerId?: string,
): GalleryProjectSummary {
  const hasCurrentThumbnail =
    row.thumbnailStatus === "ready" &&
    row.thumbnailCapturedMessageId === row.messageId &&
    Boolean(row.thumbnailUrl);

  return {
    id: row.id,
    ownerChatId: row.userId === viewerId ? row.chatId : null,
    slug: row.slug,
    title: row.title,
    description: row.description,
    generationPrompt: row.chat.prompt,
    allowRemixes: row.allowRemixes,
    publishedAt: row.publishedAt,
    thumbnailUrl: hasCurrentThumbnail
      ? `/api/gallery/${encodeURIComponent(row.id)}/thumbnail?v=${encodeURIComponent(row.messageId)}`
      : null,
    thumbnailStatus: hasCurrentThumbnail
      ? "ready"
      : row.thumbnailStatus === "failed"
        ? "failed"
        : "pending",
    creator: {
      name: row.user.name ?? "Squid creator",
      image: row.user.image,
    },
  };
}

function createCursor({
  row,
  snapshotAt,
  direction,
  query,
  remixable,
  sort,
}: {
  row: GalleryProjectRow;
  snapshotAt: Date;
  direction: GalleryCursor["direction"];
  query: string;
  remixable: boolean;
  sort: GallerySort;
}) {
  return encodeGalleryCursor({
    v: 1,
    snapshotAt: snapshotAt.toISOString(),
    publishedAt: row.publishedAt.toISOString(),
    id: row.id,
    direction,
    query,
    remixable,
    sort,
  });
}

export async function getGalleryProjects({
  query,
  remixable,
  sort,
  cursor = "",
  viewerId,
}: {
  query: string;
  remixable: boolean;
  sort: GallerySort;
  cursor?: string;
  viewerId?: string;
}) {
  const prisma = getPrisma();
  const decodedCursor = decodeGalleryCursor(cursor);
  const activeCursor =
    decodedCursor?.query === query &&
    decodedCursor.remixable === remixable &&
    decodedCursor.sort === sort
      ? decodedCursor
      : null;
  const snapshotAt = activeCursor
    ? new Date(activeCursor.snapshotAt)
    : new Date();
  const direction = activeCursor?.direction ?? "after";
  const mainOrder = sort === "oldest" ? "asc" : "desc";
  const queryOrder =
    direction === "before" ? (mainOrder === "asc" ? "desc" : "asc") : mainOrder;
  const filters: Prisma.GalleryPublicationWhereInput[] = [];

  if (query) {
    filters.push({
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { user: { name: { contains: query, mode: "insensitive" } } },
      ],
    });
  }

  if (activeCursor) {
    const publishedAt = new Date(activeCursor.publishedAt);
    const followsBoundary = direction === "after";
    const useGreaterThan =
      (mainOrder === "asc" && followsBoundary) ||
      (mainOrder === "desc" && !followsBoundary);
    filters.push({
      OR: [
        {
          publishedAt: useGreaterThan
            ? { gt: publishedAt }
            : { lt: publishedAt },
        },
        {
          publishedAt,
          id: useGreaterThan
            ? { gt: activeCursor.id }
            : { lt: activeCursor.id },
        },
      ],
    });
  }

  const where: Prisma.GalleryPublicationWhereInput = {
    isPublished: true,
    publishedAt: { lte: snapshotAt },
    ...(remixable ? { allowRemixes: true } : {}),
    ...(filters.length > 0 ? { AND: filters } : {}),
  };
  const fetchedRows = await prisma.galleryPublication.findMany({
    where,
    orderBy: [{ publishedAt: queryOrder }, { id: queryOrder }],
    select: galleryProjectSelect,
    take: GALLERY_PAGE_SIZE + 1,
  });
  const hasSentinel = fetchedRows.length > GALLERY_PAGE_SIZE;
  const pageRows = fetchedRows.slice(0, GALLERY_PAGE_SIZE);
  if (direction === "before") pageRows.reverse();

  const firstRow = pageRows[0];
  const lastRow = pageRows.at(-1);
  const previousCursor = firstRow
    ? activeCursor && (direction === "after" || hasSentinel)
      ? createCursor({
          row: firstRow,
          snapshotAt,
          direction: "before",
          query,
          remixable,
          sort,
        })
      : null
    : activeCursor?.direction === "after"
      ? encodeGalleryCursor({ ...activeCursor, direction: "before" })
      : null;
  const nextCursor = lastRow
    ? (direction === "before" && activeCursor) || hasSentinel
      ? createCursor({
          row: lastRow,
          snapshotAt,
          direction: "after",
          query,
          remixable,
          sort,
        })
      : null
    : activeCursor?.direction === "before"
      ? encodeGalleryCursor({ ...activeCursor, direction: "after" })
      : null;

  return {
    projects: pageRows.map((row) => mapGalleryProject(row, viewerId)),
    previousCursor,
    nextCursor,
  };
}

export async function getGalleryProjectFeed({ take }: { take?: number } = {}) {
  const prisma = getPrisma();
  const rows = await prisma.galleryPublication.findMany({
    where: { isPublished: true },
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    select: galleryProjectSelect,
    ...(take === undefined ? {} : { take }),
  });

  return rows.map((row) => mapGalleryProject(row));
}

export const getPublicGalleryProject = cache(async (slug: string) => {
  const prisma = getPrisma();
  const publication = await prisma.galleryPublication.findFirst({
    where: { slug, isPublished: true },
    include: {
      chat: true,
      message: true,
      user: { select: { name: true, image: true } },
      publicArtifact: true,
    },
  });

  if (
    !publication ||
    (publication.publicArtifact &&
      publication.publicArtifact.status !== "ACTIVE")
  ) {
    return null;
  }
  const files = getMessageGeneratedFiles(publication.message);
  if (files.length === 0) return null;

  return { publication, files };
});

export function createGallerySlug(title: string, chatId: string) {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const suffix = chatId
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 10)
    .toLowerCase();
  return `${base || "project"}-${suffix}`;
}
