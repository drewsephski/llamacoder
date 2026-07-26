import { createPageMetadata } from "@/lib/seo";

export type PublicShowcasePage = {
  path: string;
  title: string;
  description: string;
  keywords: readonly string[];
  image?: string;
};

export const publicShowcasePages: readonly PublicShowcasePage[] = [
  {
    path: "/axon",
    title: "Axon AI Automation Landing Page Example",
    description:
      "Explore a responsive AI automation landing page built in React with Squid Agent, featuring editorial layouts, clear workflows, and polished interaction design.",
    keywords: ["AI automation landing page", "React landing page example"],
    image: "/showcase/axon-hero.png",
  },
  {
    path: "/axion-studio",
    title: "Creative Agency React Landing Page Example",
    description:
      "Explore Axion Studio, a responsive creative agency landing page example built with Squid Agent as exportable React code.",
    keywords: ["creative agency landing page", "AI React app builder example"],
    image: "/showcase/axion-studio-hero.png",
  },
  {
    path: "/cozypaws",
    title: "Ecommerce React Landing Page Example",
    description:
      "Explore CozyPaws, a responsive ecommerce landing page example generated as editable React code with product discovery and conversion-focused sections.",
    keywords: ["AI ecommerce app builder", "React ecommerce landing page"],
    image: "/showcase/cozypaws-hero.jpg",
  },
  {
    path: "/design-rocket-certificates",
    title: "AI Training Course Landing Page Example",
    description:
      "Explore a responsive AI training course landing page built with Squid Agent, with clear curriculum, credibility, and conversion sections in React.",
    keywords: ["AI course landing page", "React landing page generator"],
    image: "/showcase/design-rocket-certificates-hero.png",
  },
  {
    path: "/forma",
    title: "Digital Product Studio React Landing Page Example",
    description:
      "Explore Forma, a motion-led digital product studio landing page generated with Squid Agent as responsive, exportable React code.",
    keywords: ["product studio landing page", "AI React website builder"],
    image: "/showcase/forma-hero.png",
  },
  {
    path: "/jack",
    title: "AI Engineer Portfolio React Example",
    description:
      "Explore a responsive AI engineer and product-builder portfolio generated with Squid Agent as editable React code with motion-led project storytelling.",
    keywords: ["AI portfolio builder", "React developer portfolio example"],
    image: "/showcase/drew-hero.png",
  },
  {
    path: "/mindloop",
    title: "Editorial Content Platform React Example",
    description:
      "Explore Mindloop, a responsive editorial content-platform example generated with Squid Agent as polished, exportable React code.",
    keywords: [
      "AI content platform builder",
      "React editorial website example",
    ],
    image: "/showcase/mindloop-hero.jpg",
  },
  {
    path: "/mentality",
    title: "Mental Wellness React Landing Page Example",
    description:
      "Explore a calm mental-wellness landing page example generated with Squid Agent using responsive React components and accessible content structure.",
    keywords: ["wellness landing page", "AI React landing page builder"],
    image: "/showcase/mentality-hero.png",
  },
  {
    path: "/prisma",
    title: "Creative Portfolio React Landing Page Example",
    description:
      "Explore Prisma, an expressive creative portfolio landing page generated with Squid Agent as responsive React code for visual artists and studios.",
    keywords: ["creative portfolio builder", "React portfolio landing page"],
  },
  {
    path: "/questly",
    title: "AI SEO Product Landing Page React Example",
    description:
      "Explore Questly, an AI SEO product landing page generated with Squid Agent as responsive React code with clear positioning and conversion paths.",
    keywords: ["AI SEO landing page", "SaaS landing page React example"],
    image: "/showcase/questly-hero.png",
  },
  {
    path: "/rivr",
    title: "Fintech React Landing Page Example",
    description:
      "Explore RIVR, a cinematic fintech landing page generated with Squid Agent as responsive React code for digital assets and financial products.",
    keywords: ["fintech landing page", "AI fintech app builder"],
    image: "/showcase/rivr-hero.png",
  },
  {
    path: "/sentinel",
    title: "Cybersecurity React Landing Page Example",
    description:
      "Explore Sentinel AI, a high-contrast cybersecurity landing page generated with Squid Agent as responsive React code with technical product storytelling.",
    keywords: ["cybersecurity landing page", "AI React app builder example"],
    image: "/showcase/sentinel-hero.jpg",
  },
  {
    path: "/skyelite",
    title: "Luxury Travel React Landing Page Example",
    description:
      "Explore SkyElite, a premium private-aviation landing page generated with Squid Agent as responsive React code with a conversion-focused experience.",
    keywords: ["luxury travel landing page", "React landing page example"],
    image: "/showcase/skyelite-hero.png",
  },
  {
    path: "/terraelix",
    title: "Wellness Ecommerce React Landing Page Example",
    description:
      "Explore TerraElix, a wellness ecommerce landing page generated with Squid Agent as responsive React code with product and membership sections.",
    keywords: ["wellness ecommerce landing page", "AI ecommerce app builder"],
    image: "/showcase/terraelix-hero.png",
  },
  {
    path: "/velorah",
    title: "Creative Studio React Landing Page Example",
    description:
      "Explore Velorah, an atmospheric creative-studio landing page generated with Squid Agent as responsive, editable React code.",
    keywords: ["creative studio landing page", "AI React website builder"],
    image: "/showcase/velorah-hero.png",
  },
] as const;

export const publicShowcasePaths = publicShowcasePages.map((page) => page.path);

export function getPublicShowcasePage(path: string): PublicShowcasePage {
  const page = publicShowcasePages.find((candidate) => candidate.path === path);
  if (!page) throw new Error(`Unknown public showcase path: ${path}`);
  return page;
}

export function publicShowcaseMetadata(path: string) {
  const page = getPublicShowcasePage(path);
  return createPageMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
    keywords: ["AI app builder", ...page.keywords],
    image: page.image
      ? {
          url: page.image,
          width: 1200,
          height: 630,
          alt: `${page.title} built with Squid Agent`,
        }
      : undefined,
  });
}
