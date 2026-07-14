import { expect, test } from "@playwright/test";

test("public example exposes the full no-risk product proof", async ({
  page,
}) => {
  await page.goto("/example");

  await expect(
    page.getByRole("heading", { name: /Focus Day · public example/i }),
  ).toBeVisible();
  await expect(page.getByText(/No account or credits required/i)).toBeVisible();

  await page.getByRole("button", { name: "Prompt" }).click();
  await expect(
    page.getByText(/Build a polished focus dashboard/i),
  ).toBeVisible();

  await page.getByRole("button", { name: "Plan" }).click();
  await expect(page.getByText(/Approved build plan/i)).toBeVisible();

  await page.getByRole("button", { name: "Files" }).click();
  await page.getByRole("button", { name: "components/TaskList.tsx" }).click();
  await expect(page.getByText(/export function TaskList/)).toBeVisible();

  await page.getByRole("button", { name: "Quality" }).click();
  await expect(
    page.getByText("Static checks passed", { exact: true }),
  ).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download source/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/squidagent\.zip$/);
});
