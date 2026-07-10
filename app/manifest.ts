import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Squid Agent",
    short_name: "Squid",
    description:
      "Generate exportable React apps from prompts and screenshots with transparent credits and quality checks.",
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
