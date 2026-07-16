import { NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/features/auth/server/session";
import { getPrisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { error: "AUTHENTICATION_REQUIRED" },
      { status: 401 },
    );
  }

  const chatId = request.nextUrl.searchParams.get("chatId");
  if (!chatId) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Project is required" },
      { status: 400 },
    );
  }

  const prisma = getPrisma();
  const publication = await prisma.galleryPublication.findFirst({
    where: { chatId, userId: session.user.id },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      allowRemixes: true,
      isPublished: true,
      thumbnailStatus: true,
      thumbnailError: true,
    },
  });

  return NextResponse.json({
    publication: publication
      ? { ...publication, url: `/gallery/${publication.slug}` }
      : null,
  });
}
