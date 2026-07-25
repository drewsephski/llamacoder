"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const REFRESH_INTERVAL_MS = 5_000;
const MAX_REFRESH_ATTEMPTS = 12;

export function GalleryThumbnailRefresh({ pending }: { pending: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!pending) return;

    let cancelled = false;
    let refreshTimeout: number | undefined;
    let refreshAttempts = 0;

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

    refreshPendingThumbnail();

    return () => {
      cancelled = true;
      if (refreshTimeout) window.clearTimeout(refreshTimeout);
    };
  }, [pending, router]);

  return null;
}
