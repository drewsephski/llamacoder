import { SITE_URL } from "@/lib/seo";

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const sitewideStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: "Squid Agent",
      url: `${SITE_URL}/`,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/squidagent-logo-512.png`,
        width: 512,
        height: 512,
      },
      description:
        "Squid Agent builds exportable React applications from prompts, screenshots, and website references with research, checkpoints, verification, and developer handoff.",
      email: "support@squidagent.app",
      sameAs: ["https://github.com/drewsephski/llamacoder"],
      founder: {
        "@type": "Person",
        name: "Drew Sepeczi",
        url: `${SITE_URL}/what-is-squid-agent`,
        sameAs: [
          "https://github.com/drewsephski",
          "https://www.instagram.com/drew.sepeczi",
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: "Squid Agent",
      alternateName: ["SquidAgent"],
      url: `${SITE_URL}/`,
      inLanguage: "en-US",
      publisher: { "@id": ORGANIZATION_ID },
    },
  ],
} as const;
