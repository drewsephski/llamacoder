import { NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/features/auth/server/session";
import { getGalleryThumbnailObject } from "@/features/gallery/server/thumbnail-storage";
import { scheduleGalleryThumbnailCapture } from "@/features/gallery/server/thumbnail-jobs";
import { getPrisma } from "@/lib/prisma";

export const maxDuration = 120;

const THUMBNAIL_CACHE_CONTROL =
  "public, max-age=86400, s-maxage=31536000, immutable";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ publicationId: string }> },
) {
  const { publicationId } = await params;
  const prisma = getPrisma();
  const publication = await prisma.galleryPublication.findFirst({
    where: {
      id: publicationId,
      isPublished: true,
      thumbnailStatus: "ready",
    },
    select: {
      messageId: true,
      thumbnailUrl: true,
      thumbnailCapturedMessageId: true,
    },
  });

  if (
    !publication?.thumbnailUrl ||
    publication.thumbnailCapturedMessageId !== publication.messageId
  ) {
    return new NextResponse(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  try {
    const object = await getGalleryThumbnailObject(publication.thumbnailUrl);
    if (!object.Body) {
      return new NextResponse(null, {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const headers = new Headers({
      "Cache-Control": THUMBNAIL_CACHE_CONTROL,
      "Content-Type": object.ContentType ?? "image/jpeg",
    });
    if (object.ContentLength !== undefined) {
      headers.set("Content-Length", String(object.ContentLength));
    }
    if (object.ETag) headers.set("ETag", object.ETag);
    if (object.LastModified) {
      headers.set("Last-Modified", object.LastModified.toUTCString());
    }

    return new Response(object.Body.transformToWebStream(), { headers });
  } catch (error: unknown) {
    console.error("Failed to serve gallery thumbnail:", {
      publicationId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return new NextResponse(null, {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ publicationId: string }> },
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { error: "AUTHENTICATION_REQUIRED" },
      { status: 401 },
    );
  }

  const { publicationId } = await params;
  const prisma = getPrisma();
  const publication = await prisma.galleryPublication.findFirst({
    where: { id: publicationId, userId: session.user.id },
    select: {
      id: true,
      slug: true,
      messageId: true,
      isPublished: true,
    },
  });
  if (!publication) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Publication not found" },
      { status: 404 },
    );
  }
  if (!publication.isPublished) {
    return NextResponse.json(
      { error: "NOT_PUBLISHED", message: "Publish the project first" },
      { status: 409 },
    );
  }

  const now = new Date();
  await prisma.galleryPublication.update({
    where: { id: publication.id },
    data: {
      thumbnailStatus: "pending",
      thumbnailError: null,
      thumbnailUpdatedAt: now,
    },
  });
  scheduleGalleryThumbnailCapture({
    publicationId: publication.id,
    messageId: publication.messageId,
    slug: publication.slug,
  });

  return NextResponse.json({ thumbnailStatus: "pending" });
}
