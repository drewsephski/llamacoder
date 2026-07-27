import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const projectFile = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("Ahrefs analytics installation", () => {
  it("renders the vendor snippet directly in the root head", () => {
    const layout = projectFile("app/layout.tsx");
    const head = layout.slice(
      layout.indexOf("<head>"),
      layout.indexOf("</head>"),
    );

    expect(head).toContain('src="https://analytics.ahrefs.com/analytics.js"');
    expect(head).toContain('data-key="O4gKckTzoHrR2FUZoZUz8w"');
    expect(head).toMatch(/data-key="O4gKckTzoHrR2FUZoZUz8w"\s+async/u);
  });

  it("allows the Ahrefs script through the production CSP", () => {
    const nextConfig = projectFile("next.config.mjs");

    expect(nextConfig).toContain(
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://analytics.ahrefs.com",
    );
  });
});
