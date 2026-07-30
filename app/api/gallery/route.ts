import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getCurrentSession } from "@/features/auth/server/session";
import { publishProjectSchema } from "@/features/gallery/contracts";
import {
  createGallerySlug,
  getGalleryProjectFeed,
} from "@/features/gallery/server/queries";
import { getMessageGeneratedFiles } from "@/features/generation/message-files";
import { getPrisma } from "@/lib/prisma";
import { recordOperationalEvent } from "@/lib/observability";
import { getErrorMessage } from "@/features/shared/errors";
import { publishGalleryArtifact } from "@/features/public-artifacts/server/publish";

export const maxDuration = 120;

export async function GET(request: NextRequest) {
  try {
    const thumbnailScope = new URL(request.url).searchParams.get(
      "withThumbnails",
    );
    const withThumbnails =
      thumbnailScope === "true" || thumbnailScope === "all";

    const projects = await getGalleryProjectFeed(
      withThumbnails ? {} : { take: 6 },
    );

    if (withThumbnails) {
      return NextResponse.json(
        {
          images: projects
            .filter(
              (project) =>
                project.thumbnailUrl !== null &&
                project.generationPrompt.trim().length > 0,
            )
            .map((project) => ({
              src: project.thumbnailUrl,
              alt: `Preview of ${project.title}`,
              title: project.title,
              prompt: project.generationPrompt.slice(0, 6000),
              href: `/gallery/${project.slug}`,
            })),
        },
        {
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    return NextResponse.json({
      apps: projects.map((project) => ({
        name: project.title,
        href: `/gallery/${project.slug}`,
        remixHref: project.allowRemixes
          ? `/gallery/${project.slug}`
          : undefined,
        description: project.description,
        category: project.allowRemixes ? "Remixable" : "View only",
        creatorName: project.creator.name,
      })),
    });
  } catch (error: unknown) {
    await recordOperationalEvent({
      name: "gallery_list_failed",
      level: "error",
      operation: "gallery_list",
      status: "error",
      error,
    });

    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to load gallery apps") },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const now = new Date();
    const { artifact, publication, stableSlug } = await publishGalleryArtifact(
      prisma,
      {
        slug: createGallerySlug(parsed.data.title, message.chatId),
        chatId: message.chatId,
        messageId: message.id,
        userId: session.user.id,
        title: parsed.data.title,
        description: parsed.data.description,
        allowRemixes: parsed.data.allowRemixes,
        allowStarterDownloads: parsed.data.allowStarterDownloads,
        now,
      },
    );

    revalidatePath("/gallery");

    return NextResponse.json({
      publication: {
        id: publication.id,
        slug: stableSlug,
        title: publication.title,
        description: publication.description,
        allowRemixes: publication.allowRemixes,
        allowStarterDownloads: artifact.allowStarterDownloads,
        isPublished: publication.isPublished,
        thumbnailStatus: "pending",
        url: `/gallery/${publication.slug}`,
      },
    });
  } catch (error: unknown) {
    await recordOperationalEvent({
      name: "gallery_publish_failed",
      level: "error",
      operation: "gallery_publish",
      status: "error",
      error,
    });

    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to publish project") },
      { status: 500 },
    );
  }
}
