import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

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
          "/docs/",
          "/gallery/",
          "/search",
          "/what-is-squid-agent",
          "/llms.txt",
          "/ai.txt",
          "/contact",
          "/privacy",
          "/terms",
          "/cookies",
          "/sitemap.xml",
          "/api/og",
        ],
        disallow: [
          "/api/",
          "/__chat-panel-qa",
          "/dashboard",
          "/chats/",
          "/sign-in",
          "/sign-up",
          "/reset-password",
          "/forgot-password",
          "/verify-email",
          "/purchase/",
          "/share/",
          "/gallery/*/preview",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
