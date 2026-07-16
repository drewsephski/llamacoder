import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getCurrentSession } from "@/features/auth/server/session";
import { publishProjectSchema } from "@/features/gallery/contracts";
import {
  createGallerySlug,
  getGalleryProjects,
} from "@/features/gallery/server/queries";
import { scheduleGalleryThumbnailCapture } from "@/features/gallery/server/thumbnail-jobs";
import { getMessageGeneratedFiles } from "@/features/generation/message-files";
import { getPrisma } from "@/lib/prisma";

export const maxDuration = 120;

export async function GET() {
  const { projects } = await getGalleryProjects({
    page: 1,
    query: "",
    remixable: false,
    sort: "newest",
  });

  return NextResponse.json({
    apps: projects.slice(0, 6).map((project) => ({
      name: project.title,
      href: `/gallery/${project.slug}`,
      remixHref: project.allowRemixes ? `/gallery/${project.slug}` : undefined,
      description: project.description,
      category: project.allowRemixes ? "Remixable" : "View only",
      creatorName: project.creator.name,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      {
        error: "AUTHENTICATION_REQUIRED",
        message: "Please sign in to publish",
      },
      { status: 401 },
    );
  }

  const parsed = publishProjectSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Check the publication details" },
      { status: 400 },
    );
  }

  const prisma = getPrisma();
  const message = await prisma.message.findFirst({
    where: {
      id: parsed.data.messageId,
      role: "assistant",
      chat: { userId: session.user.id },
    },
    include: { chat: true },
  });

  if (!message) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Project version not found" },
      { status: 404 },
    );
  }
  if (getMessageGeneratedFiles(message).length === 0) {
    return NextResponse.json(
      { error: "NO_FILES", message: "Generate an app before publishing" },
      { status: 400 },
    );
  }

  const existing = await prisma.galleryPublication.findUnique({
    where: { chatId: message.chatId },
    select: { slug: true },
  });
  const now = new Date();
  const publication = await prisma.galleryPublication.upsert({
    where: { chatId: message.chatId },
    create: {
      slug: createGallerySlug(parsed.data.title, message.chatId),
      chatId: message.chatId,
      messageId: message.id,
      userId: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      allowRemixes: parsed.data.allowRemixes,
      isPublished: true,
      publishedAt: now,
      thumbnailStatus: "pending",
      thumbnailUpdatedAt: now,
    },
    update: {
      messageId: message.id,
      title: parsed.data.title,
      description: parsed.data.description,
      allowRemixes: parsed.data.allowRemixes,
      isPublished: true,
      publishedAt: now,
      unpublishedAt: null,
      thumbnailUrl: null,
      thumbnailStatus: "pending",
      thumbnailCapturedMessageId: null,
      thumbnailError: null,
      thumbnailUpdatedAt: now,
    },
  });

  scheduleGalleryThumbnailCapture({
    publicationId: publication.id,
    messageId: message.id,
    slug: publication.slug,
  });
  revalidatePath("/gallery");

  return NextResponse.json({
    publication: {
      id: publication.id,
      slug: existing?.slug ?? publication.slug,
      title: publication.title,
      description: publication.description,
      allowRemixes: publication.allowRemixes,
      isPublished: publication.isPublished,
      thumbnailStatus: "pending",
      url: `/gallery/${publication.slug}`,
    },
  });
}
