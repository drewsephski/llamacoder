"use client";

import { ImageOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function GalleryProjectThumbnail({
  thumbnailUrl,
  thumbnailStatus,
  slug,
  title,
  priority = false,
}: {
  thumbnailUrl: string | null;
  thumbnailStatus: "pending" | "ready" | "failed";
  slug: string;
  title: string;
  priority?: boolean;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (thumbnailUrl && failedUrl !== thumbnailUrl) {
    return (
      <Image
        src={thumbnailUrl}
        alt={`Preview of ${title}`}
        fill
        unoptimized
        priority={priority}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="origin-top-left scale-[1.01] object-cover object-top"
        onError={() => setFailedUrl(thumbnailUrl)}
      />
    );
  }

  const failed =
    thumbnailStatus === "failed" ||
    (failedUrl !== null && failedUrl === thumbnailUrl);

  return (
    <div
      data-gallery-thumbnail-status={failed ? "failed" : "pending"}
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden bg-muted/30 text-muted-foreground"
      role="img"
      aria-label={
        failed
          ? `Preview unavailable for ${title}`
          : `Preview is being prepared for ${title}`
      }
    >
      <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-primary/10" />
      <div className="relative flex flex-col items-center gap-2">
        {failed ? (
          <ImageOff className="size-5" aria-hidden="true" />
        ) : (
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        )}
        <span className="text-xs font-medium">
          {failed ? "Preview unavailable" : "Preparing preview"}
        </span>
      </div>
      <span className="sr-only">Open {slug} to view the live project.</span>
    </div>
  );
}
