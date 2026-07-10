import type { MetadataRoute } from "next";
import {
  CONTENT_REVIEW_DATE,
  SITE_URL,
  marketingPaths,
} from "@/lib/marketing-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const contentReviewDate = new Date(`${CONTENT_REVIEW_DATE}T00:00:00Z`);
  const staticPaths = [
    "/",
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
      path === "/" || path === "/blog" || path === "/compare"
        ? "weekly"
        : "monthly",
    priority:
      path === "/"
        ? 1
        : path === "/compare" || path.startsWith("/compare/")
          ? 0.85
          : path === "/blog" || path === "/benchmarks"
            ? 0.8
            : path.startsWith("/blog/") || path.startsWith("/benchmarks/")
              ? 0.75
              : 0.5,
  }));
}
