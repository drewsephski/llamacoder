import type { MetadataRoute } from "next";
import { SITE_URL, marketingPaths } from "@/lib/marketing-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = ["/", ...marketingPaths];

  return staticPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/compare") ? 0.8 : 0.7,
  }));
}
