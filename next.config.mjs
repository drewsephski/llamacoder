import { createMDX } from "fumadocs-mdx/next";

/** @type {import("next").NextConfig} */
const nextConfig = {
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
