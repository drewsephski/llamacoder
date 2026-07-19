import { createMDX } from "fumadocs-mdx/next";

// @monaco-editor/loader 1.7.0 resolves the pinned editor from this directory.
const monacoAssetDirectory =
  "https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs/";

function createContentSecurityPolicy(frameAncestors) {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${frameAncestors}`,
    "object-src 'none'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://plausible.io ${monacoAssetDirectory}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com ${monacoAssetDirectory}`,
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https://d8j0ntlcm91z4.cloudfront.net",
    `font-src 'self' data: https://fonts.gstatic.com ${monacoAssetDirectory}`,
    "connect-src 'self' https: wss:",
    "frame-src 'self' https://challenges.cloudflare.com https://*.codesandbox.io https://codesandbox.io https://*.csb.app",
    "worker-src 'self' blob:",
    "upgrade-insecure-requests",
  ].join("; ");
}

/** @type {import("next").NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingIncludes: {
    "/api/page-purchases/[sessionId]/download": [
      "./app/globals.css",
      "./app/axion-studio/**/*",
      "./app/axon/**/*",
      "./app/cozypaws/**/*",
      "./app/design-rocket-certificates/**/*",
      "./app/forma/**/*",
      "./app/jack/**/*",
      "./app/mentality/**/*",
      "./app/questly/**/*",
      "./app/rivr/**/*",
      "./app/skyelite/**/*",
      "./app/terraelix/**/*",
      "./app/velorah/**/*",
      "./components/design-rocket-certificates-page.tsx",
      "./components/forma-page.tsx",
      "./components/jack/**/*",
      "./components/mentality/**/*",
      "./components/questly-page.tsx",
      "./components/rivr/**/*",
      "./components/skyelite-page.tsx",
      "./components/terraelix-page.tsx",
      "./features/gallery/showcase-landings/**/*",
      "./public/Aeonik/**/*",
      "./public/showcase/**/*",
      "./public/squidagent-logo.svg",
      "./package.json",
      "./tailwind.config.ts",
    ],
  },
  async headers() {
    const contentSecurityPolicy = createContentSecurityPolicy("'none'");
    const galleryPreviewContentSecurityPolicy =
      createContentSecurityPolicy("'self'");
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
      {
        source: "/gallery/:slug/preview",
        headers: [
          {
            key: "Content-Security-Policy",
            value: galleryPreviewContentSecurityPolicy,
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "svgl.app" }],
  },
  turbopack: {
    root: process.cwd(),
  },
  webpack: (config, options) => {
    if (options.nextRuntime === "edge") {
      if (!config.resolve.conditionNames) {
        config.resolve.conditionNames = ["require", "node"];
      }
      if (!config.resolve.conditionNames.includes("worker")) {
        config.resolve.conditionNames.push("worker");
      }
    }
    return config;
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
