import { resetStaleGalleryThumbnails } from "@/features/gallery/server/thumbnail";
import { isCronAuthorized } from "@/features/security/server/cron-auth";
import { recordOperationalEvent } from "@/lib/observability";
import { getErrorMessage } from "@/features/shared/errors";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await resetStaleGalleryThumbnails();
    return Response.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    await recordOperationalEvent({
      name: "maintenance_gallery_thumbnails_failed",
      level: "error",
      operation: "gallery_thumbnail_maintenance",
      status: "error",
      error,
    });

    return Response.json(
      { error: getErrorMessage(error, "Gallery thumbnail maintenance failed") },
      { status: 500 },
    );
  }
}
