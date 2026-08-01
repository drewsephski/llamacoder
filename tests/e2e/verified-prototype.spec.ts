import { expect, test } from "@playwright/test";

test("homepage leads with evidence and exposes the audit wedge", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /build the prototype\. prove what works/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: /a prototype you can defend, not just demo/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /audit an existing app/i }),
  ).toHaveAttribute("href", "/audit");
});

test("source audit accepts a ZIP and renders explicit static findings", async ({
  page,
}) => {
  await page.route("**/api/source-audit", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        report: {
          schema: "squid.source-audit.v1",
          auditedAt: "2026-08-01T16:00:00.000Z",
          source: { kind: "zip", label: "prototype.zip" },
          overallStatus: "review",
          framework: "React + Vite",
          inventory: { filesInspected: 4, sourceFiles: 2, totalBytes: 3200 },
          findings: [
            {
              id: "project_structure",
              label: "Project structure",
              status: "passed",
              summary:
                "A package manifest and recognizable application entry point are present.",
              details: ["package.json parsed successfully"],
            },
            {
              id: "environment_setup",
              label: "Environment setup",
              status: "review",
              summary:
                "Environment values are referenced without a checked-in .env.example.",
              details: ["1 unique environment reference"],
            },
          ],
          scope: [
            "Static archive inspection only; Squid did not execute the project.",
          ],
        },
      }),
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/audit");

  await page.locator('input[type="file"]').setInputFiles({
    name: "prototype.zip",
    mimeType: "application/zip",
    buffer: Buffer.from("zip fixture"),
  });
  await page.getByRole("button", { name: "Audit ZIP" }).click();

  await expect(
    page.getByRole("heading", { name: "Review needed" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Project structure" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Environment setup" }),
  ).toBeVisible();
  const layout = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth);
});
