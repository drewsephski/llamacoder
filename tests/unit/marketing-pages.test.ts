import { describe, expect, it } from "vitest";
import {
  benchmarkPage,
  blogPages,
  comparisonPages,
  getMarketingPath,
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
      expect(data[2].mainEntity).toHaveLength(page.faqs.length);
    }
  });
});
