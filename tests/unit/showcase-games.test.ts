import ts from "typescript";
import { describe, expect, it } from "vitest";

import {
  getShowcaseGame,
  getShowcaseGameSummaries,
  showcaseGames,
} from "@/features/gallery/showcase-games";

describe("showcase games", () => {
  it("registers unique, route-safe showcase games", () => {
    expect(showcaseGames).toHaveLength(3);
    expect(new Set(showcaseGames.map((game) => game.slug)).size).toBe(
      showcaseGames.length,
    );

    for (const game of showcaseGames) {
      expect(game.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(game.prompt.length).toBeGreaterThan(200);
      expect(game.controls.length).toBeGreaterThanOrEqual(3);
      expect(getShowcaseGame(game.slug)?.id).toBe(game.id);
    }
  });

  it("ships syntactically valid React entry points and styles", () => {
    for (const game of showcaseGames) {
      const app = game.files.find((file) => file.path === "App.tsx");
      const styles = game.files.find((file) => file.path === "styles.css");
      expect(app, `${game.slug} needs an App.tsx entry point`).toBeDefined();
      expect(styles?.content.length).toBeGreaterThan(1_000);

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
      expect(errors, `${game.slug} contains invalid TSX`).toEqual([]);
    }
  });

  it("filters showcase metadata without exposing source payloads", () => {
    expect(getShowcaseGameSummaries("audio")).toHaveLength(1);
    expect(getShowcaseGameSummaries("canvas")[0]?.slug).toBe("orbital-salvage");
    expect(getShowcaseGameSummaries("does-not-exist")).toEqual([]);
    expect(getShowcaseGameSummaries()[0]).not.toHaveProperty("files");
  });
});
