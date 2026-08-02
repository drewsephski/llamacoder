import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const workflowAssets = [
  "plan-mode-poster.png",
  "plan-mode.mp4",
  "screenshot-to-app-poster.png",
  "screenshot-to-app.mp4",
  "verify-and-export-poster.png",
  "verify-and-export.mp4",
] as const;

describe("homepage workflow media deployment", () => {
  it.each(workflowAssets)("ships %s as a non-empty public asset", (asset) => {
    const assetPath = join(process.cwd(), "public", "launch", "gifs", asset);

    expect(statSync(assetPath).size).toBeGreaterThan(0);
  });

  it("keeps nested launch routes out of the Vercel ignore set", () => {
    const rules = readFileSync(join(process.cwd(), ".vercelignore"), "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));

    expect(rules).toContain("/launch");
    expect(rules).not.toContain("launch");
  });
});
