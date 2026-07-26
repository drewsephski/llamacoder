import { expect, test } from "@playwright/test";

test("homepage renders the project prompt surface", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Squid|Agent|Llama/i);
  await expect(
    page
      .getByRole("textbox")
      .or(page.getByPlaceholder(/what|build|create/i))
      .first(),
  ).toBeVisible();
});

test("long homepage prompts grow without overlapping the controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const textarea = page.getByPlaceholder("Build me a budgeting app...");
  const toolbar = page.locator(".compose-toolbar");
  const initialHeight = await textarea.evaluate(
    (element) => element.getBoundingClientRect().height,
  );

  await textarea.fill(
    Array.from(
      { length: 8 },
      (_, index) =>
        `Describe workflow ${index + 1} with responsive states, validation, and accessible feedback.`,
    ).join("\n"),
  );

  await expect
    .poll(() =>
      textarea.evaluate((element) => element.getBoundingClientRect().height),
    )
    .toBeGreaterThan(initialHeight + 40);

  const textareaBounds = await textarea.boundingBox();
  const toolbarBounds = await toolbar.boundingBox();

  expect(textareaBounds).not.toBeNull();
  expect(toolbarBounds).not.toBeNull();
  expect(textareaBounds!.y + textareaBounds!.height).toBeLessThanOrEqual(
    toolbarBounds!.y + 1,
  );
});

test("feature comparison is shared across marketing surfaces", async ({
  page,
}) => {
  for (const path of ["/", "/compare", "/compare/squid-vs-v0"]) {
    await page.goto(path);

    await expect(
      page.getByRole("heading", {
        name: "The first prompt is the easy part.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("table", {
        name: "Feature comparison of Lovable, Bolt.new, Base44, v0, and Squid Agent",
      }),
    ).toBeVisible();
  }
});
