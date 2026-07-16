"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const NEXT_CAPTURE_DELAY_MS = 1_000;
const REFRESH_INTERVAL_MS = 5_000;
const MAX_REFRESH_ATTEMPTS = 12;

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
    let captureTimeout: number | undefined;
    let refreshTimeout: number | undefined;
    let refreshAttempts = 0;

    const captureNext = async () => {
      const response = await fetch("/api/gallery/thumbnails/backfill", {
        method: "POST",
      }).catch(() => null);
      if (cancelled || !response?.ok) return;

      const result = (await response.json()) as { processed?: number };
      router.refresh();
      if ((result.processed ?? 0) > 0) {
        captureTimeout = window.setTimeout(
          captureNext,
          NEXT_CAPTURE_DELAY_MS,
        );
      }
    };

    const refreshPendingThumbnail = () => {
      refreshTimeout = window.setTimeout(() => {
        if (cancelled) return;
        refreshAttempts += 1;
        router.refresh();
        if (refreshAttempts < MAX_REFRESH_ATTEMPTS) {
          refreshPendingThumbnail();
        }
      }, REFRESH_INTERVAL_MS);
    };

    void captureNext();
    refreshPendingThumbnail();

    return () => {
      cancelled = true;
      if (captureTimeout) window.clearTimeout(captureTimeout);
      if (refreshTimeout) window.clearTimeout(refreshTimeout);
    };
  }, [canBackfill, pending, router]);

  return null;
}
