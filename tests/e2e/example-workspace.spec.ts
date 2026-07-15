import { expect, test } from "@playwright/test";

test("public example exposes the full no-risk product proof", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto("/example");

  await expect(
    page.getByRole("heading", {
      name: /A generated app you can interrogate/i,
    }),
  ).toBeVisible();
  await expect(page.getByText(/No account required/i)).toBeVisible();

  const preview = page.frameLocator(".sp-preview-iframe");
  await expect(
    preview.getByRole("heading", {
      name: "Three desks. One launch ledger.",
    }),
  ).toBeVisible({ timeout: 20_000 });
  await expect(
    preview.getByRole("heading", { name: "Currency reference" }),
  ).toBeVisible();
  await preview
    .getByRole("button", { name: "Move Lock the launch narrative right" })
    .click();
  await expect(
    preview
      .getByRole("region", { name: "Ready" })
      .getByText("1", { exact: true }),
  ).toBeVisible();
  await preview.getByRole("button", { name: "Start focus timer" }).click();
  await expect(
    preview.getByRole("button", { name: "Pause focus timer" }),
  ).toBeVisible();
  await preview.getByRole("button", { name: "Open command menu" }).click();
  await expect(
    preview.getByRole("dialog", { name: "Search Waypoint" }),
  ).toBeVisible();
  await preview.getByRole("button", { name: "Close command menu" }).click();

  await page.getByRole("button", { name: "Prompt" }).click();
  await expect(
    page.getByText(/Build a premium global delivery workspace/i),
  ).toBeVisible();

  await page.getByRole("button", { name: "Plan" }).click();
  await expect(page.getByText(/Approved build plan/i)).toBeVisible();

  await page.getByRole("button", { name: "Files" }).click();
  await expect(page.getByText("tokens.css", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "components/Board.tsx" }).click();
  await expect(page.getByText(/export function Board/)).toBeVisible();

  await page.getByRole("button", { name: "Quality" }).click();
  await expect(
    page.getByText("Static checks passed", { exact: true }),
  ).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download source/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/squidagent\.zip$/);
});
