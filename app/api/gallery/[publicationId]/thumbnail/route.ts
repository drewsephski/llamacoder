import { NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/features/auth/server/session";
import { scheduleGalleryThumbnailCapture } from "@/features/gallery/server/thumbnail-jobs";
import { getPrisma } from "@/lib/prisma";

export const maxDuration = 120;

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
