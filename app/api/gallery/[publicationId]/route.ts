import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getCurrentSession } from "@/features/auth/server/session";
import { getPrisma } from "@/lib/prisma";

export async function DELETE(
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
    select: { id: true },
  });
  if (!publication) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Publication not found" },
      { status: 404 },
    );
  }

  await prisma.galleryPublication.update({
    where: { id: publication.id },
    data: { isPublished: false, unpublishedAt: new Date() },
  });
  revalidatePath("/gallery");

  return NextResponse.json({ ok: true });
}
