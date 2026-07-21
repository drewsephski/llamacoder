import type { MetadataRoute } from "next";
import {
  CONTENT_REVIEW_DATE,
  SITE_URL,
  marketingLandingPaths,
  marketingPaths,
} from "@/lib/marketing-pages";
import { docsSource } from "@/lib/docs/source";

export default function sitemap(): MetadataRoute.Sitemap {
  const contentReviewDate = new Date(`${CONTENT_REVIEW_DATE}T00:00:00Z`);
  const highIntentComparePaths = new Set([
    "/compare/squid-vs-bolt-for-agencies",
    "/compare/squid-vs-lovable-for-startups",
    "/compare/squid-vs-v0-for-design-led-teams",
    "/blog/ai-coding-tool-comparison-with-credits",
    "/blog/export-react-app-from-ai",
    "/blog/how-we-verify-code",
    "/blog/what-to-check-after-ai-generation",
  ]);
  const highIntentGuidePaths = new Set([
    "/blog/ai-coding-tool-comparison-with-credits",
    "/blog/export-react-app-from-ai",
    "/blog/how-to-evaluate-ai-generated-react-code",
    "/blog/how-we-verify-code",
    "/blog/what-to-check-after-ai-generation",
  ]);
  const highIntentBenchmarkPaths = new Set(["/benchmarks/screenshot-to-react"]);
  const staticPaths = [
    "/",
    ...marketingLandingPaths,
    ...docsSource.getPages().map((page) => page.url),
    ...marketingPaths,
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
  ];

  return staticPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: contentReviewDate,
    changeFrequency:
      path === "/" ||
      path === "/docs" ||
      path === "/blog" ||
      path === "/compare" ||
      path.startsWith("/compare/squid-vs-") ||
      highIntentGuidePaths.has(path) ||
      highIntentBenchmarkPaths.has(path)
        ? "weekly"
        : "monthly",
    priority:
      path === "/"
        ? 1
        : path === "/docs"
          ? 0.9
          : path.startsWith("/docs/")
            ? 0.75
            : path === "/compare" || path.startsWith("/compare/")
              ? highIntentComparePaths.has(path)
                ? 0.9
                : 0.82
              : path === "/blog" || path === "/benchmarks"
                ? 0.8
                : path.startsWith("/blog/")
                  ? highIntentGuidePaths.has(path)
                    ? 0.88
                    : 0.76
                  : path.startsWith("/benchmarks/")
                    ? highIntentBenchmarkPaths.has(path)
                      ? 0.84
                      : 0.75
                  : 0.5,
  }));
}
