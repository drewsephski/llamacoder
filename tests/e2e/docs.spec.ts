import { expect, test } from "@playwright/test";

test("documentation renders generated navigation and MDX content", async ({
  page,
}) => {
  await page.goto("/docs");

  await expect(page).toHaveTitle(/Build better apps with Squid/);
  await expect(
    page.getByRole("heading", { name: "Build better apps with Squid" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Documentation", exact: true }),
  ).toContainText("Example apps");
  await expect(
    page.getByText("Customer feedback workspace", { exact: true }),
  ).toBeVisible();
});

test("documentation search returns a matching guide", async ({ page }) => {
  await page.goto("/docs");

  await page.getByRole("button", { name: "Search documentation" }).click();
  await page
    .getByPlaceholder("Search guides, examples, and prompt collections…")
    .fill("booking portal");

  const result = page.getByRole("link", {
    name: /Appointment booking portal/i,
  });
  await expect(result).toBeVisible({ timeout: 20_000 });
  await result.click();
  await expect(page).toHaveURL(/\/docs\/examples\/booking-portal$/);
});
