import { describe, expect, it } from "vitest";

import {
  buildGallerySocialMetadata,
  DEFAULT_SOCIAL_IMAGE_URL,
  getPublishedGallerySocialImage,
  getShowcaseGallerySocialImage,
} from "@/features/gallery/social-metadata";

const readyPublication = {
  id: "publication_1",
  isPublished: true,
  messageId: "message_current",
  thumbnailUrl: "https://assets.example/current.jpg",
  thumbnailStatus: "ready",
  thumbnailCapturedMessageId: "message_current",
};

describe("gallery social metadata", () => {
  it("uses the current published app screenshot with a versioned URL", () => {
    const image = getPublishedGallerySocialImage({
      publication: readyPublication,
      title: "Focus Day",
    });

    expect(image).toEqual({
      url: "/api/gallery/publication_1/thumbnail?v=message_current",
      width: 1280,
      height: 720,
      alt: "Screenshot of Focus Day",
      type: "image/jpeg",
    });

    const metadata = buildGallerySocialMetadata({
      title: "Focus Day",
      description: "A focused workspace.",
      canonicalPath: "/gallery/focus-day",
      image,
    });

    expect(metadata.openGraph).toMatchObject({
      url: "https://www.squidagent.app/gallery/focus-day",
      images: [image],
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      images: [image],
    });
  });

  it("marks legacy or duplicate share pages as noindex", () => {
    const metadata = buildGallerySocialMetadata({
      title: "Focus Day",
      description: "A focused workspace.",
      canonicalPath: "/share/v2/message_current",
      index: false,
    });

    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it.each([
    ["pending", { thumbnailStatus: "pending" }],
    ["failed", { thumbnailStatus: "failed" }],
    ["stale", { thumbnailCapturedMessageId: "message_old" }],
    ["missing", { thumbnailUrl: null }],
    ["private", { isPublished: false }],
  ])("falls back when the screenshot is %s", (_label, overrides) => {
    const image = getPublishedGallerySocialImage({
      publication: { ...readyPublication, ...overrides },
      title: "Focus Day",
    });
    const metadata = buildGallerySocialMetadata({
      title: "Focus Day",
      description: "A focused workspace.",
      canonicalPath: "/gallery/focus-day",
      image,
    });

    expect(image).toBeNull();
    expect(metadata.openGraph).toMatchObject({
      images: [
        expect.objectContaining({
          url: DEFAULT_SOCIAL_IMAGE_URL,
          width: 1200,
          height: 630,
        }),
      ],
    });
  });

  it("falls back when a deleted publication no longer exists", () => {
    const image = getPublishedGallerySocialImage({
      publication: null,
      title: "Deleted project",
    });

    expect(image).toBeNull();
  });

  it("uses checked-in screenshots for curated gallery projects", () => {
    expect(
      getShowcaseGallerySocialImage({
        id: "showcase_orbital_salvage",
        title: "Orbital Salvage",
        thumbnailUrl: "/showcase/orbital-salvage.webp",
        thumbnailWidth: 960,
        thumbnailHeight: 600,
      }),
    ).toEqual({
      url: "/showcase/orbital-salvage.webp?v=showcase_orbital_salvage",
      width: 960,
      height: 600,
      alt: "Screenshot of Orbital Salvage",
      type: "image/webp",
    });
  });
});
