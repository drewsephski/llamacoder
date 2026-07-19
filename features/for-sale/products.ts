import type { ForSaleProduct } from "@/features/for-sale/types";

const products = [
  {
    route: "/axion-studio",
    name: "Axion Studio",
    description:
      "A polished agency landing page for strategy-led digital work.",
    assetHref: "/showcase/axion-studio-hero.png",
    assetLabel: "Axion Studio preview",
    priceLabel: "$129",
  },
  {
    route: "/axon",
    name: "Axon",
    description:
      "A cinematic product landing page for intelligent digital workers.",
    assetHref: "/showcase/axon-hero.png",
    assetLabel: "Axon preview",
    priceLabel: "$149",
  },
  {
    route: "/cozypaws",
    name: "CozyPaws",
    description:
      "A cheerful, commerce-ready landing page for a modern pet brand.",
    assetHref: "/showcase/cozypaws-hero.png",
    assetLabel: "CozyPaws preview",
    priceLabel: "$79",
  },
  {
    route: "/design-rocket-certificates",
    name: "Design Rocket Certificates",
    description:
      "An editorial course landing page for professional certification programs.",
    assetHref: "/showcase/design-rocket-certificates-hero.png",
    assetLabel: "Design Rocket Certificates preview",
    priceLabel: "$109",
  },
  {
    route: "/forma",
    name: "Forma",
    description:
      "A bold studio landing page designed around product craft and clarity.",
    assetHref: "/showcase/forma-hero.png",
    assetLabel: "Forma preview",
    priceLabel: "$99",
  },
  {
    route: "/jack",
    name: "Jack Portfolio",
    description:
      "A motion-led personal portfolio for an AI engineer and product builder.",
    assetHref: "/showcase/jack-hero.png",
    assetLabel: "Jack portfolio preview",
    priceLabel: "$69",
  },
  {
    route: "/mentality",
    name: "Mėntality",
    description:
      "A calm, accessible landing page for mental wellbeing resources.",
    assetHref: "/showcase/mentality-hero.png",
    assetLabel: "Mėntality preview",
    priceLabel: "$59",
  },
  {
    route: "/questly",
    name: "Questly",
    description: "A focused SaaS landing page for AI-search content workflows.",
    assetHref: "/showcase/questly-hero.png",
    assetLabel: "Questly preview",
    priceLabel: "$99",
  },
  {
    route: "/rivr",
    name: "RIVR",
    description: "A high-impact fintech landing page for fluid digital assets.",
    assetHref: "/showcase/rivr-hero.png",
    assetLabel: "RIVR preview",
    priceLabel: "$109",
  },
  {
    route: "/skyelite",
    name: "SkyElite",
    description:
      "A premium aviation landing page with a refined editorial feel.",
    assetHref: "/showcase/skyelite-hero.png",
    assetLabel: "SkyElite preview",
    priceLabel: "$99",
  },
  {
    route: "/terraelix",
    name: "TerraElix",
    description:
      "A grounded wellness-commerce landing page for plant-based supplements.",
    assetHref: "/showcase/terraelix-hero.png",
    assetLabel: "TerraElix preview",
    priceLabel: "$79",
  },
  {
    route: "/velorah",
    name: "Velorah",
    description:
      "An atmospheric creative-studio landing page with cinematic motion.",
    assetHref: "/showcase/velorah-hero.png",
    assetLabel: "Velorah preview",
    priceLabel: "$89",
  },
  {
    route: "/gallery/cinder-studio",
    name: "Cinder Studio",
    description:
      "An atmospheric landing page for a fictional architectural lighting studio.",
    assetHref: "/showcase/cinder-studio.webp",
    assetLabel: "Cinder Studio showcase asset",
    priceLabel: "$129",
  },
  {
    route: "/gallery/relay-release-evidence",
    name: "Relay",
    description:
      "A product-led developer-tool landing page built around release evidence.",
    assetHref: "/showcase/relay-release-evidence.webp",
    assetLabel: "Relay showcase asset",
    priceLabel: "$129",
  },
  {
    route: "/gallery/small-hours-table",
    name: "Small Hours",
    description:
      "A warm, editorial landing page for a fictional neighborhood supper club.",
    assetHref: "/showcase/small-hours-table.webp",
    assetLabel: "Small Hours showcase asset",
    priceLabel: "$119",
  },
] as const satisfies readonly ForSaleProduct[];

const productsByRoute = new Map<string, ForSaleProduct>(
  products.map((product) => [product.route, product]),
);

export function getForSaleProduct(pathname: string): ForSaleProduct | null {
  const normalizedPath = pathname.replace(/\/$/, "") || "/";
  const route = normalizedPath.endsWith("/preview")
    ? normalizedPath.slice(0, -"/preview".length)
    : normalizedPath;

  return productsByRoute.get(route) ?? null;
}
