import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/marketing-pages";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/compare/",
          "/blog/",
          "/benchmarks/",
          "/llms.txt",
          "/sitemap.xml",
          "/api/og/",
        ],
        disallow: [
          "/api/",
          "/dashboard",
          "/chats/",
          "/sign-in",
          "/sign-up",
          "/reset-password",
          "/forgot-password",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
