"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const NEXT_CAPTURE_DELAY_MS = 1_000;

export function GalleryThumbnailRefresh({
  canBackfill,
  pending,
}: {
  canBackfill: boolean;
  pending: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!canBackfill || !pending) return;
    let cancelled = false;
    let timeout: number | undefined;

    const captureNext = async () => {
      const response = await fetch("/api/gallery/thumbnails/backfill", {
        method: "POST",
      }).catch(() => null);
      if (cancelled || !response?.ok) return;

      const result = (await response.json()) as { processed?: number };
      router.refresh();
      if ((result.processed ?? 0) > 0) {
        timeout = window.setTimeout(captureNext, NEXT_CAPTURE_DELAY_MS);
      }
    };

    void captureNext();

    return () => {
      cancelled = true;
      if (timeout) window.clearTimeout(timeout);
    };
  }, [canBackfill, pending, router]);

  return null;
}
