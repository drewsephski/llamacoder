import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getCurrentSession } from "@/features/auth/server/session";
import { getPrisma } from "@/lib/prisma";
import { revokeGalleryArtifact } from "@/features/public-artifacts/server/publish";

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
    select: { id: true, publicArtifactId: true },
  });
  if (!publication) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Publication not found" },
      { status: 404 },
    );
  }

  await prisma.$transaction(async (tx) => {
    await revokeGalleryArtifact(tx, publication, new Date());
  });
  revalidatePath("/gallery");
  revalidatePath("/api/gallery");

  return NextResponse.json({ ok: true });
}
