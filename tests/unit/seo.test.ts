import { describe, expect, it, vi } from "vitest";

import robots from "@/app/robots";
import {
  getPublicShowcasePage,
  publicShowcaseMetadata,
  publicShowcasePages,
} from "@/lib/public-pages";
import {
  DEFAULT_OG_IMAGE,
  MAX_META_DESCRIPTION_LENGTH,
  MAX_META_TITLE_LENGTH,
  SITE_URL,
  absoluteUrl,
  createBrandedTitle,
  createMetaDescription,
  createNoIndexMetadata,
  createPageMetadata,
} from "@/lib/seo";
import { sitewideStructuredData } from "@/lib/site-structured-data";

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
    expect(metadata.title).toEqual({
      absolute: "AI App Builder Guide | Squid Agent",
    });
    expect(metadata.robots).toMatchObject({
      index: true,
      follow: true,
      googleBot: {
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    });
  });

  it("keeps page titles and descriptions within search-result limits", () => {
    const title = createBrandedTitle(
      "An intentionally long AI app builder page title with several extra words that should not reach the rendered metadata",
    );
    const description = createMetaDescription(
      "A long metadata description ".repeat(12),
    );

    expect(title.length).toBeLessThanOrEqual(MAX_META_TITLE_LENGTH);
    expect(title).toMatch(/\| Squid Agent$/);
    expect(description.length).toBeLessThanOrEqual(MAX_META_DESCRIPTION_LENGTH);
    expect(description).toMatch(/…$/);
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
    const metadata = publicShowcasePages.map((page) =>
      publicShowcaseMetadata(page.path),
    );
    const titles = metadata.map((item) => {
      expect(item.title).toHaveProperty("absolute");
      return (item.title as { absolute: string }).absolute;
    });
    const descriptions = metadata.map((item) => item.description as string);
    const paths = publicShowcasePages.map((page) => page.path);

    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    expect(new Set(paths).size).toBe(paths.length);
    expect(titles.every((title) => title.length <= MAX_META_TITLE_LENGTH)).toBe(
      true,
    );
    expect(
      descriptions.every(
        (description) => description.length <= MAX_META_DESCRIPTION_LENGTH,
      ),
    ).toBe(true);

    for (const path of paths) {
      expect(getPublicShowcasePage(path).path).toBe(path);
      expect(publicShowcaseMetadata(path).alternates).toMatchObject({
        canonical: `${SITE_URL}${path}`,
      });
    }
  });

  it("defines one consistent Organization and WebSite entity sitewide", () => {
    expect(
      sitewideStructuredData["@graph"].map((item) => item["@type"]),
    ).toEqual(["Organization", "WebSite"]);
    expect(sitewideStructuredData["@graph"][0]).toMatchObject({
      "@id": `${SITE_URL}/#organization`,
      name: "Squid Agent",
      url: `${SITE_URL}/`,
    });
    expect(sitewideStructuredData["@graph"][1]).toMatchObject({
      "@id": `${SITE_URL}/#website`,
      name: "Squid Agent",
      alternateName: ["SquidAgent"],
      publisher: { "@id": `${SITE_URL}/#organization` },
    });
  });

  it("publishes a unique canonical sitemap without private or duplicate routes", async () => {
    vi.doMock("@/lib/docs/source", () => ({
      docsSource: {
        getPages: () => [
          { url: "/docs" },
          { url: "/docs/product/code-ownership" },
        ],
      },
    }));
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain(`${SITE_URL}/`);
    expect(urls).toContain(`${SITE_URL}/docs/product/code-ownership`);
    expect(
      urls.every(
        (url) =>
          url === `${SITE_URL}/` ||
          (url.startsWith(`${SITE_URL}/`) && !url.endsWith("/")),
      ),
    ).toBe(true);
    expect(
      urls.some((url) =>
        /\/(?:api|chats|dashboard|sign-in|sign-up|share|purchase)(?:\/|$)/.test(
          new URL(url).pathname,
        ),
      ),
    ).toBe(false);
  });

  it("lets crawlers see noindex HTML while blocking API crawl space", () => {
    const policy = robots();

    expect(policy.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    expect(policy.rules).toEqual([
      {
        userAgent: "*",
        allow: ["/", "/api/og"],
        disallow: ["/api/"],
      },
    ]);
  });
});
