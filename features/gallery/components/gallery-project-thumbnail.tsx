"use client";

import Image from "next/image";
import { useState } from "react";

import { GalleryProjectPreview } from "@/features/gallery/components/gallery-project-preview";

export function GalleryProjectThumbnail({
  thumbnailUrl,
  slug,
  title,
}: {
  thumbnailUrl: string | null;
  slug: string;
  title: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (thumbnailUrl && failedUrl !== thumbnailUrl) {
    return (
      <Image
        src={thumbnailUrl}
        alt={`Preview of ${title}`}
        fill
        unoptimized
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover object-top"
        onError={() => setFailedUrl(thumbnailUrl)}
      />
    );
  }

  return <GalleryProjectPreview slug={slug} title={title} />;
}
