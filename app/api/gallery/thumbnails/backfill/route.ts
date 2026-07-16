import { NextResponse } from "next/server";

import { getCurrentSession } from "@/features/auth/server/session";
import { processGalleryThumbnailBatch } from "@/features/gallery/server/thumbnail";

export const maxDuration = 120;

export async function POST() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { error: "AUTHENTICATION_REQUIRED" },
      { status: 401 },
    );
  }

  const result = await processGalleryThumbnailBatch({
    limit: 1,
    userId: session.user.id,
  });
  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
