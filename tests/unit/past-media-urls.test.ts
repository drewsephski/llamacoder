import { describe, expect, test } from "vitest";
import {
  buildPastMediaCatalogPromptSection,
  buildPastMediaPromptSection,
  extractMediaUrls,
  isDesignBriefUnderspecified,
  mergePastMediaLibraries,
  scorePastMediaCatalogEntry,
  selectPastMediaCatalogForPrompt,
} from "@/features/generation/past-media-urls";
import {
  catalogToPastMediaLibrary,
  HARDCODED_PAST_MEDIA_CATALOG,
} from "@/features/generation/past-media-catalog";

describe("past-media-urls", () => {
  test("extractMediaUrls finds image and video links in text", () => {
    const result = extractMediaUrls(`
      Hero video: https://cdn.example.com/loops/hero.mp4
      Poster: https://images.example.com/poster.webp
      Ignore localhost: http://localhost:3000/demo.mp4
    `);

    expect(result.videos).toEqual(["https://cdn.example.com/loops/hero.mp4"]);
    expect(result.images).toEqual(["https://images.example.com/poster.webp"]);
  });

  test("extractMediaUrls finds media links inside generated code", () => {
    const result = extractMediaUrls(`
      export function Hero() {
        return (
          <video src="https://assets.example.com/bg.webm" />
          <img src="https://assets.example.com/photo.jpg" alt="Hero" />
        );
      }
    `);

    expect(result.videos).toEqual(["https://assets.example.com/bg.webm"]);
    expect(result.images).toEqual(["https://assets.example.com/photo.jpg"]);
  });

  test("mergePastMediaLibraries deduplicates and caps list size", () => {
    const merged = mergePastMediaLibraries([
      {
        videos: ["https://a.example/video.mp4"],
        images: ["https://a.example/one.png"],
      },
      {
        videos: ["https://a.example/video.mp4", "https://b.example/two.mp4"],
        images: ["https://a.example/one.png", "https://b.example/two.jpg"],
      },
    ]);

    expect(merged.videos).toEqual([
      "https://a.example/video.mp4",
      "https://b.example/two.mp4",
    ]);
    expect(merged.images).toEqual([
      "https://a.example/one.png",
      "https://b.example/two.jpg",
    ]);
  });

  test("isDesignBriefUnderspecified detects missing visual direction", () => {
    expect(isDesignBriefUnderspecified("Build a travel planning app")).toBe(
      true,
    );
    expect(
      isDesignBriefUnderspecified(
        "Build a travel app with a dark cinematic video background",
      ),
    ).toBe(false);
    expect(
      isDesignBriefUnderspecified(
        "Use this hero asset https://cdn.example.com/hero.mp4 for the landing page",
      ),
    ).toBe(false);
  });

  test("buildPastMediaPromptSection lists collected media for the model", () => {
    const section = buildPastMediaPromptSection({
      videos: ["https://cdn.example.com/bg.mp4"],
      images: ["https://cdn.example.com/cover.png"],
    });

    expect(section).toContain("Past media library");
    expect(section).toContain("https://cdn.example.com/bg.mp4");
    expect(section).toContain("https://cdn.example.com/cover.png");
  });

  test("buildPastMediaCatalogPromptSection includes structured metadata", () => {
    const section = buildPastMediaCatalogPromptSection([
      {
        id: "demo-video",
        kind: "video",
        url: "https://cdn.example.com/bg.mp4",
        description: "Demo loop",
        mood: "calm",
        tags: ["demo", "hero"],
        useWhen: "Underspecified calm app briefs",
        howToUse: "Muted looping hero background",
      },
    ]);

    expect(section).toContain("Past media catalog");
    expect(section).toContain("demo-video");
    expect(section).toContain("Use when:");
    expect(section).toContain("How to use:");
    expect(section).toContain("https://cdn.example.com/bg.mp4");
    expect(section).toContain("REQUIRED PRIMARY VIDEO");
    expect(section).toContain("MUST embed");
  });

  test("selectPastMediaCatalogForPrompt ranks jet membership brief to skyleite video", () => {
    const selected = selectPastMediaCatalogForPrompt(
      "Build an app for booking private jet memberships and managing flight requests.",
      HARDCODED_PAST_MEDIA_CATALOG,
    );

    expect(selected.length).toBeGreaterThan(0);
    expect(selected[0]?.id).toBe("skyleite-hero-video");
    expect(
      scorePastMediaCatalogEntry(
        "Build an app for booking private jet memberships and managing flight requests.",
        selected[0]!,
      ),
    ).toBeGreaterThan(0);
  });

  test("hardcoded media catalog includes curated showcase assets", () => {
    expect(HARDCODED_PAST_MEDIA_CATALOG.length).toBe(70);
    expect(
      HARDCODED_PAST_MEDIA_CATALOG.filter((entry) => entry.kind === "video"),
    ).toHaveLength(16);
    expect(
      HARDCODED_PAST_MEDIA_CATALOG.filter((entry) => entry.kind === "image"),
    ).toHaveLength(54);
    expect(catalogToPastMediaLibrary(HARDCODED_PAST_MEDIA_CATALOG)).toEqual(
      catalogToPastMediaLibrary(HARDCODED_PAST_MEDIA_CATALOG),
    );
  });

  test("catalog entries have unique ids and valid media URLs", () => {
    const ids = HARDCODED_PAST_MEDIA_CATALOG.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const entry of HARDCODED_PAST_MEDIA_CATALOG) {
      expect(entry.url).toMatch(/^https:\/\//);
    }
  });
});
