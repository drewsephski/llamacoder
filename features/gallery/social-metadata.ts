import type { Metadata } from "next";

import {
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH,
} from "@/features/gallery/server/thumbnail";

export const DEFAULT_SOCIAL_IMAGE_URL = "/api/og?card=site&v=3";
export const DEFAULT_SOCIAL_IMAGE_WIDTH = 1200;
export const DEFAULT_SOCIAL_IMAGE_HEIGHT = 630;

type SocialImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
  type: string;
};

type GalleryThumbnailState = {
  id: string;
  isPublished: boolean;
  messageId: string;
  thumbnailUrl: string | null;
  thumbnailStatus: string;
  thumbnailCapturedMessageId: string | null;
};

export function getPublishedGallerySocialImage({
  publication,
  title,
}: {
  publication: GalleryThumbnailState | null | undefined;
  title: string;
}): SocialImage | null {
  if (
    !publication?.isPublished ||
    publication.thumbnailStatus !== "ready" ||
    !publication.thumbnailUrl ||
    publication.thumbnailCapturedMessageId !== publication.messageId
  ) {
    return null;
  }

  return {
    url: `/api/gallery/${encodeURIComponent(publication.id)}/thumbnail?v=${encodeURIComponent(publication.messageId)}`,
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_HEIGHT,
    alt: `Screenshot of ${title}`,
    type: "image/jpeg",
  };
}

export function getShowcaseGallerySocialImage({
  id,
  title,
  thumbnailUrl,
  thumbnailWidth,
  thumbnailHeight,
}: {
  id: string;
  title: string;
  thumbnailUrl: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
}): SocialImage {
  const separator = thumbnailUrl.includes("?") ? "&" : "?";

  return {
    url: `${thumbnailUrl}${separator}v=${encodeURIComponent(id)}`,
    width: thumbnailWidth,
    height: thumbnailHeight,
    alt: `Screenshot of ${title}`,
    type: "image/webp",
  };
}

export function buildGallerySocialMetadata({
  canonicalPath,
  description,
  image,
  title,
}: {
  canonicalPath: string;
  description: string;
  image?: SocialImage | null;
  title: string;
}): Metadata {
  const socialImage: SocialImage = image ?? {
    url: DEFAULT_SOCIAL_IMAGE_URL,
    width: DEFAULT_SOCIAL_IMAGE_WIDTH,
    height: DEFAULT_SOCIAL_IMAGE_HEIGHT,
    alt: "Squid Agent AI React app builder workflow",
    type: "image/png",
  };

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "website",
      url: canonicalPath,
      title,
      description,
      siteName: "Squid Agent",
      locale: "en_US",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}
