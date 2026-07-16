import { expect, test } from "@playwright/test";

const games = [
  {
    slug: "orbital-salvage",
    startLabel: "BEGIN SALVAGE",
    readyText: "RECOVERED",
  },
  {
    slug: "rune-circuit",
    startLabel: "Rune row 1, column 1",
    readyText: "MOVES",
  },
  {
    slug: "echo-chamber",
    startLabel: "ENTER THE CHAMBER",
    readyText: "SCORE",
  },
] as const;

for (const game of games) {
  test(`${game.slug} compiles and accepts its first interaction`, async ({
    page,
  }) => {
    await page.goto(`/gallery/${game.slug}/preview`);
    await expect(
      page.locator('[data-gallery-preview-status="ready"]'),
    ).toBeVisible({ timeout: 30_000 });

    const preview = page.locator(".sp-preview-iframe").contentFrame();
    await expect(
      preview.getByText(game.readyText, { exact: true }),
    ).toBeVisible({ timeout: 10_000 });
    await preview.getByRole("button", { name: game.startLabel }).click();

    if (game.slug === "orbital-salvage") {
      await expect(preview.getByText("MISSION WINDOW")).toBeVisible();
    } else if (game.slug === "rune-circuit") {
      await expect(
        preview.getByText("01", { exact: true }).first(),
      ).toBeVisible();
    } else {
      await expect(preview.getByText("Listen", { exact: true })).toBeVisible();
    }
  });
}
