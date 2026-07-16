import { createMDX } from "fumadocs-mdx/next";

// @monaco-editor/loader 1.7.0 resolves the pinned editor from this directory.
const monacoAssetDirectory =
  "https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs/";

/** @type {import("next").NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async headers() {
    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://plausible.io ${monacoAssetDirectory}`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com ${monacoAssetDirectory}`,
      "img-src 'self' data: blob: https:",
      `font-src 'self' data: https://fonts.gstatic.com ${monacoAssetDirectory}`,
      "connect-src 'self' https: wss:",
      "frame-src 'self' https://challenges.cloudflare.com https://*.codesandbox.io https://codesandbox.io https://*.csb.app",
      "worker-src 'self' blob:",
      "upgrade-insecure-requests",
    ].join("; ");

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
