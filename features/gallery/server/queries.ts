import "server-only";

import { cache } from "react";

import type { GalleryProjectSummary } from "@/features/gallery/contracts";
import { getMessageGeneratedFiles } from "@/features/generation/message-files";
import { getPrisma } from "@/lib/prisma";

export const GALLERY_PAGE_SIZE = 9;

export async function getGalleryProjects({
  page,
  query,
  remixable,
  sort,
  viewerId,
}: {
  page: number;
  query: string;
  remixable: boolean;
  sort: "newest" | "oldest";
  viewerId?: string;
}) {
  const prisma = getPrisma();
  const where = {
    isPublished: true,
    ...(remixable ? { allowRemixes: true } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            {
              description: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              user: {
                name: { contains: query, mode: "insensitive" as const },
              },
            },
          ],
        }
      : {}),
  };

  const [totalProjects, rows] = await Promise.all([
    prisma.galleryPublication.count({ where }),
    prisma.galleryPublication.findMany({
      where,
      orderBy: { publishedAt: sort === "oldest" ? "asc" : "desc" },
      skip: (page - 1) * GALLERY_PAGE_SIZE,
      take: GALLERY_PAGE_SIZE,
      select: {
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
        user: { select: { name: true, image: true } },
      },
    }),
  ]);

  const projects: GalleryProjectSummary[] = rows.map((row) => {
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
  });

  return {
    projects,
    totalProjects,
    totalPages: Math.ceil(totalProjects / GALLERY_PAGE_SIZE),
  };
}

export const getPublicGalleryProject = cache(async (slug: string) => {
  const prisma = getPrisma();
  const publication = await prisma.galleryPublication.findFirst({
    where: { slug, isPublished: true },
    include: {
      chat: true,
      message: true,
      user: { select: { name: true, image: true } },
    },
  });

  if (!publication) return null;
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
