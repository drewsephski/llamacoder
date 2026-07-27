import type { Metadata } from "next";

export const SITE_NAME = "Squid Agent";
export const SITE_URL = "https://www.squidagent.app";
export const DEFAULT_OG_IMAGE = "/api/og?card=site&v=4";
export const DEFAULT_OG_IMAGE_ALT = "Squid Agent AI React app builder workflow";
export const MAX_META_TITLE_LENGTH = 60;
export const MAX_META_DESCRIPTION_LENGTH = 160;

const TITLE_SUFFIX = ` | ${SITE_NAME}`;
const TRAILING_CONNECTORS = new Set([
  "a",
  "an",
  "and",
  "for",
  "from",
  "in",
  "of",
  "or",
  "the",
  "to",
  "with",
]);

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
  includeCanonical?: boolean;
};

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

function collapseWhitespace(value: string) {
  return value.replaceAll(/\s+/g, " ").trim();
}

function truncateAtWordBoundary(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;

  const candidate = value.slice(0, maxLength + 1);
  const lastSpace = candidate.lastIndexOf(" ");
  let truncated = (
    lastSpace >= Math.floor(maxLength * 0.65)
      ? candidate.slice(0, lastSpace)
      : value.slice(0, maxLength)
  ).replace(/[\s:;,—–-]+$/u, "");

  const words = truncated.split(" ");
  while (
    words.length > 1 &&
    TRAILING_CONNECTORS.has(words.at(-1)?.toLowerCase() ?? "")
  ) {
    words.pop();
  }
  truncated = words.join(" ");

  return truncated || value.slice(0, maxLength).trimEnd();
}

export function createBrandedTitle(title: string) {
  const normalized = collapseWhitespace(title);
  const hasBrand = normalized.toLowerCase().includes(SITE_NAME.toLowerCase());
  if (hasBrand && normalized.length <= MAX_META_TITLE_LENGTH) return normalized;
  if (hasBrand) {
    return truncateAtWordBoundary(normalized, MAX_META_TITLE_LENGTH);
  }

  const unbranded = normalized
    .replace(new RegExp(`\\s*[|—–-]\\s*${SITE_NAME}$`, "i"), "")
    .trim();
  const availableLength = MAX_META_TITLE_LENGTH - TITLE_SUFFIX.length;
  const conciseTitle = truncateAtWordBoundary(unbranded, availableLength);
  return `${conciseTitle}${TITLE_SUFFIX}`;
}

export function createMetaDescription(description: string) {
  const normalized = collapseWhitespace(description);
  if (normalized.length <= MAX_META_DESCRIPTION_LENGTH) return normalized;

  const contentLength = MAX_META_DESCRIPTION_LENGTH - 1;
  return `${truncateAtWordBoundary(normalized, contentLength)}…`;
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  image,
  type = "website",
  index = true,
  includeCanonical = true,
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const pageTitle = createBrandedTitle(title);
  const pageDescription = createMetaDescription(description);
  const socialImage = {
    url: image?.url ?? DEFAULT_OG_IMAGE,
    width: image?.width ?? 1200,
    height: image?.height ?? 630,
    alt: image?.alt ?? DEFAULT_OG_IMAGE_ALT,
    type: image?.type ?? "image/png",
  };

  return {
    title: { absolute: pageTitle },
    description: pageDescription,
    ...(keywords.length > 0 ? { keywords: [...keywords] } : {}),
    ...(includeCanonical
      ? {
          alternates: {
            canonical,
            languages: {
              en: canonical,
              "x-default": canonical,
            },
          },
        }
      : {}),
    robots: index
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
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
      title: pageTitle,
      description: pageDescription,
      siteName: SITE_NAME,
      locale: "en_US",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [socialImage],
    },
  };
}

export function createNoIndexMetadata(
  input: Omit<PageMetadataInput, "index">,
): Metadata {
  return createPageMetadata({ ...input, index: false });
}
