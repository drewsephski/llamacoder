"use client";

import { useEffect } from "react";

import { PageErrorState } from "@/components/page-status/page-error-state";

export default function GalleryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Gallery error:", error);
  }, [error]);

  return (
    <PageErrorState
      description="We couldn't load the gallery. Please try again."
      primaryAction={{ label: "Try again", onClick: reset }}
      reference={error.digest}
      secondaryAction={{
        label: "Refresh page",
        onClick: () => window.location.reload(),
      }}
      title="Failed to load gallery"
    />
  );
}
