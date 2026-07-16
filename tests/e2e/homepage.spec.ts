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

test("feature comparison is shared across marketing surfaces", async ({
  page,
}) => {
  for (const path of ["/", "/compare", "/compare/squid-vs-v0"]) {
    await page.goto(path);

    await expect(
      page.getByRole("heading", {
        name: "Compare the workflow after the first prompt.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("table", {
        name: "Feature comparison of Lovable, Bolt.new, Base44, v0, and Squid Agent",
      }),
    ).toBeVisible();
  }
});
