import { expect, test } from "@playwright/test";

test("an invalid session cookie redirects dashboard access to sign-in", async ({
  context,
  page,
}) => {
  await context.addCookies([
    {
      name: "better-auth.session_token",
      value: "expired-session",
      domain: "localhost",
      path: "/",
    },
  ]);

  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/sign-in\?callbackUrl=(?:%2F|\/)dashboard$/);
  await expect(
    page.getByRole("heading", { name: "Sign in", exact: true }),
  ).toBeVisible();
});

test("sign-in normalizes an external callback before submitting", async ({
  page,
}) => {
  await page.goto("/sign-in?callbackUrl=https://evil.example/phish");
  await page.getByLabel("Email address").fill("nobody@example.com");
  await page.getByLabel("Password").fill("not-a-real-password");

  const signInRequestPromise = page.waitForRequest(
    (request) =>
      request.method() === "POST" &&
      request.url().includes("/api/auth/sign-in/email"),
  );
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  const request = await signInRequestPromise;
  expect(request.postDataJSON()).toMatchObject({ callbackURL: "/dashboard" });
});
