import { describe, expect, it } from "vitest";

import {
  buildGalleryHeroImageDeck,
  type GalleryHeroImage,
} from "@/features/gallery/client/hero-image-rotation";

function createImage(src: string): GalleryHeroImage {
  return {
    src,
    alt: `Preview of ${src}`,
    title: src,
    prompt: `Build ${src}`,
  };
}

describe("gallery hero image rotation", () => {
  it("shuffles every unique gallery image into the next deck", () => {
    const images = ["newest", "newer", "older", "oldest"].map(createImage);

    const deck = buildGalleryHeroImageDeck(images, null, () => 0);

    expect(deck.map((image) => image.src)).toEqual([
      "newer",
      "older",
      "oldest",
      "newest",
    ]);
    expect(new Set(deck.map((image) => image.src))).toEqual(
      new Set(images.map((image) => image.src)),
    );
  });

  it("does not repeat the last image at a shuffled deck boundary", () => {
    const images = ["one", "two", "three"].map(createImage);

    const deck = buildGalleryHeroImageDeck(images, "two", () => 0.99);

    expect(deck[0]?.src).not.toBe("two");
  });

  it("deduplicates identical image sources", () => {
    const deck = buildGalleryHeroImageDeck(
      [createImage("one"), createImage("one"), createImage("two")],
      null,
      () => 0.99,
    );

    expect(deck.map((image) => image.src)).toEqual(["one", "two"]);
  });

  it("does not repeat a lone gallery image", () => {
    expect(buildGalleryHeroImageDeck([createImage("only")], "only")).toEqual(
      [],
    );
  });
});
