import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Squid Agent",
    short_name: "Squid",
    description:
      "Research, plan, build, verify, and ship portable React apps with visible sources, versions, quality checks, and credit use.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0062ff",
    categories: ["developer", "productivity", "utilities"],
    icons: [
      {
        src: "/squidagent-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
