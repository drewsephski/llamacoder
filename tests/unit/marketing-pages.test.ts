import { describe, expect, it } from "vitest";
import {
  benchmarkPage,
  blogPages,
  comparisonPages,
  getMarketingOgImagePath,
  getMarketingPath,
  guideTopicClusters,
  marketingPaths,
  marketingStructuredData,
} from "@/lib/marketing-pages";

const pages = [...comparisonPages, ...blogPages, benchmarkPage];

describe("marketing page content", () => {
  it("keeps every route and slug unique", () => {
    const slugs = pages.map((page) => page.slug);
    const paths = pages.map(getMarketingPath);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(paths).size).toBe(paths.length);
    expect(marketingPaths).toEqual(expect.arrayContaining(paths));
  });

  it("provides substantive indexable content for every page", () => {
    for (const page of pages) {
      expect(page.title.length).toBeGreaterThan(25);
      expect(page.description.length).toBeGreaterThan(80);
      expect(page.description.length).toBeLessThanOrEqual(180);
      expect(page.summary.length).toBeGreaterThan(120);
      expect(page.sections.length).toBeGreaterThanOrEqual(5);
      expect(page.faqs.length).toBeGreaterThanOrEqual(4);
      expect(page.internalLinks.length).toBeGreaterThanOrEqual(2);
      expect(page.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("organizes every guide into exactly one topical cluster", () => {
    const clusteredSlugs = guideTopicClusters.flatMap((cluster) =>
      Array.from(cluster.slugs),
    );
    const guideSlugs = blogPages.map((page) => page.slug);

    expect(new Set(clusteredSlugs).size).toBe(clusteredSlugs.length);
    expect(clusteredSlugs.sort()).toEqual(guideSlugs.sort());
    expect(
      guideTopicClusters.every((cluster) => cluster.slugs.length >= 4),
    ).toBe(true);
  });

  it("creates page-specific social cards for every article", () => {
    for (const page of pages) {
      const path = getMarketingOgImagePath(page);
      const params = new URL(path, "https://www.squidagent.app").searchParams;

      expect(params.get("card")).toBe("article");
      expect(params.get("kind")).toBe(page.kind);
      expect(params.get("title")).toBe(page.h1);
    }
  });

  it("keeps overlapping export and screenshot guides self-canonical and explicitly related", () => {
    const relationships = blogPages.filter((page) => page.topicRelationship);

    expect(relationships.length).toBeGreaterThanOrEqual(6);
    for (const page of relationships) {
      expect(page.topicRelationship?.primaryPath).toMatch(/^\/blog\//);
      expect(
        blogPages.some(
          (candidate) =>
            getMarketingPath(candidate) === page.topicRelationship?.primaryPath,
        ),
      ).toBe(true);
    }

    const exportTutorial = blogPages.find(
      (page) => page.slug === "how-to-export-ai-generated-react-app",
    );
    const exportPillar = blogPages.find(
      (page) => page.slug === "export-react-app-from-ai",
    );

    expect(exportTutorial?.topicRelationship).toMatchObject({
      role: "supporting",
      primaryPath: "/blog/export-react-app-from-ai",
    });
    expect(exportPillar?.topicRelationship).toMatchObject({
      role: "primary",
      primaryPath: "/blog/export-react-app-from-ai",
    });
    expect(exportTutorial?.title).not.toBe(exportPillar?.title);
    expect(exportTutorial?.description).not.toBe(exportPillar?.description);
  });

  it("adds first-party evidence to the highest-intent guides", () => {
    const highIntentSlugs = [
      "how-to-evaluate-ai-generated-react-code",
      "how-to-export-ai-generated-react-app",
      "export-react-app-from-ai",
      "how-we-verify-code",
      "screenshot-to-responsive-react",
      "ai-saas-mvp-builder",
    ];

    for (const slug of highIntentSlugs) {
      const page = blogPages.find((candidate) => candidate.slug === slug);
      expect(page?.firstPartyEvidence?.summary.length).toBeGreaterThan(100);
      expect(page?.firstPartyEvidence?.items.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("uses dated primary sources on every competitor comparison", () => {
    for (const page of comparisonPages) {
      expect(page.sources?.length).toBeGreaterThanOrEqual(2);
      expect(page.sources?.every((source) => source.external)).toBe(true);
      expect(page.table?.rows.length).toBeGreaterThanOrEqual(5);
      expect(page.workflow?.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("emits Article, BreadcrumbList, and FAQPage structured data", () => {
    for (const page of pages) {
      const data = marketingStructuredData(page);

      expect(data.map((item) => item["@type"])).toEqual([
        "Article",
        "BreadcrumbList",
        "FAQPage",
      ]);
      expect(data[0]).toMatchObject({
        url: `https://www.squidagent.app${getMarketingPath(page)}`,
        inLanguage: "en-US",
        image: {
          "@type": "ImageObject",
          width: 1200,
          height: 630,
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://www.squidagent.app${getMarketingPath(page)}`,
        },
        author: {
          "@type": "Person",
          name: "Drew Sepeczi",
        },
        reviewedBy: {
          "@type": "Organization",
          name: "Squid Agent product and engineering",
        },
      });
      expect(data[2].mainEntity).toHaveLength(page.faqs.length);
    }
  });
});
