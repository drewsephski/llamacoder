import ts from "typescript";
import { describe, expect, it } from "vitest";

import {
  getShowcaseLanding,
  getShowcaseLandingSummaries,
  showcaseLandings,
} from "@/features/gallery/showcase-landings";

describe("showcase landing pages", () => {
  it("registers three unique route-safe concepts", () => {
    expect(showcaseLandings).toHaveLength(3);
    expect(new Set(showcaseLandings.map((landing) => landing.slug)).size).toBe(
      showcaseLandings.length,
    );

    for (const landing of showcaseLandings) {
      expect(landing.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(landing.prompt.length).toBeGreaterThan(300);
      expect(landing.highlights.length).toBeGreaterThanOrEqual(3);
      expect(landing.thumbnailUrl).toMatch(/^\/showcase\/[a-z0-9-]+\.webp$/);
      expect(getShowcaseLanding(landing.slug)?.id).toBe(landing.id);
    }
  });

  it("ships valid React entry points and isolated design tokens", () => {
    for (const landing of showcaseLandings) {
      const app = landing.files.find((file) => file.path === "App.tsx");
      const tokens = landing.files.find((file) => file.path === "tokens.css");
      const styles = landing.files.find((file) => file.path === "styles.css");

      expect(app, `${landing.slug} needs an App.tsx entry point`).toBeDefined();
      expect(tokens?.content).toContain("--color-paper:");
      expect(tokens?.content).toContain("--font-display:");
      expect(styles?.content).toContain("overflow-x: clip");
      expect(styles?.content).toContain("prefers-reduced-motion");
      expect(styles?.content.length).toBeGreaterThan(5_000);
      expect(app?.content).not.toMatch(/href=["'](?:https?:|mailto:)/);
      expect(tokens?.content).not.toContain("@import url(");

      const result = ts.transpileModule(app?.content ?? "", {
        compilerOptions: {
          jsx: ts.JsxEmit.ReactJSX,
          target: ts.ScriptTarget.ES2020,
        },
        reportDiagnostics: true,
      });
      const errors = (result.diagnostics ?? []).filter(
        (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
      );
      expect(errors, `${landing.slug} contains invalid TSX`).toEqual([]);
    }
  });

  it("filters metadata without exposing source payloads", () => {
    expect(getShowcaseLandingSummaries("lighting")[0]?.slug).toBe(
      "cinder-studio",
    );
    expect(getShowcaseLandingSummaries("developer")[0]?.slug).toBe(
      "relay-release-evidence",
    );
    expect(getShowcaseLandingSummaries("hospitality")[0]?.slug).toBe(
      "small-hours-table",
    );
    expect(getShowcaseLandingSummaries("does-not-exist")).toEqual([]);
    expect(getShowcaseLandingSummaries()[0]).not.toHaveProperty("files");
  });

  it("keeps Hallmark structures, navs, and footers distinct", () => {
    const styles = showcaseLandings.map(
      (landing) =>
        landing.files.find((file) => file.path === "styles.css")?.content ?? "",
    );

    expect(styles[0]).toContain("macrostructure: Marquee Hero");
    expect(styles[1]).toContain("macrostructure: Workbench");
    expect(styles[2]).toContain("macrostructure: Letter");
    expect(styles[0]).toContain("nav: N5");
    expect(styles[1]).toContain("nav: N1b");
    expect(styles[2]).toContain("nav: N12");
    expect(styles[0]).toContain("footer: Ft5");
    expect(styles[1]).toContain("footer: Ft2");
    expect(styles[2]).toContain("footer: Ft6");
  });
});
