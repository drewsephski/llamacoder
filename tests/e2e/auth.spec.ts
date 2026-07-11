import { expect, test } from "@playwright/test";

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
