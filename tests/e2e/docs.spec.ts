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

test("documentation menu is usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/docs/examples");

  await page.getByRole("button", { name: "Open documentation menu" }).click();
  const navigation = page.getByRole("navigation", {
    name: "Documentation",
    exact: true,
  });

  await expect(navigation).toBeVisible();
  await expect(
    navigation.getByRole("link", { name: "Example apps", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(
    page.getByRole("heading", { name: "Example apps", exact: true }),
  ).toBeVisible();
});
