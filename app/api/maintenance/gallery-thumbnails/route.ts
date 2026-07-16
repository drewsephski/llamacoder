import { processGalleryThumbnailBatch } from "@/features/gallery/server/thumbnail";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(
    secret && request.headers.get("authorization") === `Bearer ${secret}`,
  );
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await processGalleryThumbnailBatch();
  return Response.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
