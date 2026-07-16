import Image from "next/image";

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
  if (thumbnailUrl) {
    return (
      <Image
        src={thumbnailUrl}
        alt={`Preview of ${title}`}
        fill
        unoptimized
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover object-top"
      />
    );
  }

  return <GalleryProjectPreview slug={slug} title={title} />;
}
