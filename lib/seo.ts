import type { Metadata } from "next";

export const SITE_NAME = "Squid Agent";
export const SITE_URL = "https://www.squidagent.app";
export const DEFAULT_OG_IMAGE = "/api/og?card=site&v=4";
export const DEFAULT_OG_IMAGE_ALT = "Squid Agent AI React app builder workflow";

type SocialImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
};

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: readonly string[];
  image?: SocialImage;
  type?: "website" | "article";
  index?: boolean;
};

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  image,
  type = "website",
  index = true,
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const socialTitle = title.includes(SITE_NAME)
    ? title
    : `${title} | ${SITE_NAME}`;
  const socialImage = {
    url: image?.url ?? DEFAULT_OG_IMAGE,
    width: image?.width ?? 1200,
    height: image?.height ?? 630,
    alt: image?.alt ?? DEFAULT_OG_IMAGE_ALT,
    type: image?.type ?? "image/png",
  };

  return {
    title,
    description,
    ...(keywords.length > 0 ? { keywords: [...keywords] } : {}),
    alternates: {
      canonical,
      languages: {
        en: canonical,
        "x-default": canonical,
      },
    },
    robots: index
      ? {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true },
        }
      : {
          index: false,
          follow: false,
          noarchive: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        },
    openGraph: {
      type,
      url: canonical,
      title: socialTitle,
      description,
      siteName: SITE_NAME,
      locale: "en_US",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [socialImage],
    },
  };
}

export function createNoIndexMetadata(
  input: Omit<PageMetadataInput, "index">,
): Metadata {
  return createPageMetadata({ ...input, index: false });
}
