import { describe, expect, it } from "vitest";

import {
  getPublicShowcasePage,
  publicShowcaseMetadata,
  publicShowcasePages,
} from "@/lib/public-pages";
import {
  DEFAULT_OG_IMAGE,
  SITE_URL,
  absoluteUrl,
  createNoIndexMetadata,
  createPageMetadata,
} from "@/lib/seo";

describe("SEO metadata", () => {
  it("uses one HTTPS www canonical host without trailing slashes", () => {
    expect(SITE_URL).toBe("https://www.squidagent.app");
    expect(absoluteUrl("/compare")).toBe("https://www.squidagent.app/compare");
  });

  it("creates complete canonical and social metadata", () => {
    const metadata = createPageMetadata({
      title: "AI App Builder Guide",
      description: "A focused guide to choosing an AI app builder.",
      path: "/guide",
    });

    expect(metadata.alternates).toMatchObject({
      canonical: "https://www.squidagent.app/guide",
    });
    expect(metadata.openGraph).toMatchObject({
      url: "https://www.squidagent.app/guide",
      images: [expect.objectContaining({ url: DEFAULT_OG_IMAGE })],
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      images: [expect.objectContaining({ url: DEFAULT_OG_IMAGE })],
    });
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
  });

  it("keeps private or duplicate routes out of the index", () => {
    const metadata = createNoIndexMetadata({
      title: "Private project",
      description: "A private Squid Agent project.",
      path: "/chats/private",
    });

    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it("keeps every public showcase title, description, and canonical unique", () => {
    const titles = publicShowcasePages.map((page) => page.title);
    const descriptions = publicShowcasePages.map((page) => page.description);
    const paths = publicShowcasePages.map((page) => page.path);

    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    expect(new Set(paths).size).toBe(paths.length);

    for (const path of paths) {
      expect(getPublicShowcasePage(path).path).toBe(path);
      expect(publicShowcaseMetadata(path).alternates).toMatchObject({
        canonical: `${SITE_URL}${path}`,
      });
    }
  });
});
