import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

test.describe("authenticated generation launch contract", () => {
  test.skip(
    process.env.RUN_LAUNCH_E2E !== "1",
    "Set RUN_LAUNCH_E2E=1 with DATABASE_URL and OPENROUTER_API_KEY to run the billable API contract.",
  );

  test("seed verified account → generate → persist → charge → share → export", async ({
    page,
  }) => {
    test.setTimeout(300_000);
    const prisma = new PrismaClient();
    const nonce = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const email = `launch-e2e-${nonce}@example.com`;
    const password = `Launch-${nonce}!Aa9`;
    let userId: string | undefined;
    let chatId: string | undefined;

    try {
      await page.goto("/sign-up");
      await page.getByLabel("Name").fill("Launch Test");
      await page.getByLabel("Email address").fill(email);
      await page.getByLabel("Password").fill(password);
      await page.getByRole("button", { name: "Sign up" }).click();
      await expect(page).toHaveURL(/\/verify-email/, { timeout: 20_000 });

      const user = await prisma.user.findUniqueOrThrow({ where: { email } });
      userId = user.id;
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { emailVerified: true, credits: { increment: 5 } },
        });
        await tx.creditGrant.create({
          data: {
            userId: user.id,
            amount: 5,
            remainingAmount: 5,
            type: "bonus",
            dedupeKey: `welcome:${user.id}`,
            description: "Launch E2E verified account credits",
          },
        });
        await tx.creditHistory.create({
          data: {
            userId: user.id,
            amount: 5,
            type: "subscription",
            description: "Launch E2E verified account credits",
          },
        });
      });

      await page.context().clearCookies();
      await page.goto("/sign-in?callbackUrl=/dashboard");
      await page.getByLabel("Email address").fill(email);
      await page.getByLabel("Password").fill(password);
      await page.getByRole("button", { name: "Sign in" }).click();
      await page.waitForURL((url) => url.pathname === "/dashboard", {
        timeout: 20_000,
      });

      const sessionResponse = await page.request.get("/api/auth/get-session");
      expect(sessionResponse.ok()).toBeTruthy();
      await expect(sessionResponse.json()).resolves.toMatchObject({
        user: { id: user.id },
      });

      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await expect(
        page.getByRole("button", { name: "Sign Out" }),
      ).toBeVisible();

      const prompt =
        "Build a complete React TypeScript launch-check dashboard now using a fixed in-memory array of checklist items. This is a visual prototype only: no persistence, database, authentication, forms, or backend. Include accessible filter and toggle buttons. Do not ask questions or present a plan.";
      const promptInput = page.getByPlaceholder(
        "Describe the prototype you want...",
      );
      await promptInput.fill(prompt);
      await expect(promptInput).toHaveValue(prompt);

      const buildButton = page.getByRole("button", {
        name: "Build prototype",
      });
      await expect(buildButton).toBeEnabled();
      await buildButton.click();
      await page.waitForURL(/\/chats\/[^/]+$/, { timeout: 30_000 });

      const createdChatId = new URL(page.url())
        .pathname.split("/")
        .filter(Boolean)
        .at(-1);
      if (!createdChatId) throw new Error("Chat route did not include an id");
      chatId = createdChatId;

      const previewRoot = page.locator("[data-preview-runner-root]");
      const buildPrototypeNow = page.getByRole("button", {
        name: "Build prototype now",
      });
      await expect
        .poll(
          async () =>
            (await previewRoot.isVisible()) ||
            (await buildPrototypeNow.isVisible()),
          { timeout: 180_000 },
        )
        .toBe(true);

      if (await buildPrototypeNow.isVisible()) {
        await buildPrototypeNow.click();
      }
      await expect(previewRoot).toBeVisible({ timeout: 180_000 });

      const previewFrame = previewRoot.locator("iframe.sp-preview-iframe");
      await expect(previewFrame).toBeVisible({ timeout: 90_000 });
      await expect
        .poll(
          async () =>
            previewFrame.evaluate((frame) => {
              const bounds = frame.getBoundingClientRect();
              return bounds.width > 1 && bounds.height > 1;
            }),
          { timeout: 90_000 },
        )
        .toBe(true);

      await expect
        .poll(
          () =>
            prisma.message.findFirst({
              where: { chatId, role: "assistant", files: { not: null } },
              orderBy: { createdAt: "desc" },
            }),
          { timeout: 30_000 },
        )
        .not.toBeNull();
      const persisted = await prisma.message.findFirstOrThrow({
        where: { chatId, role: "assistant", files: { not: null } },
        orderBy: { createdAt: "desc" },
      });
      expect(persisted.files).toBeTruthy();

      await expect
        .poll(
          () =>
            prisma.runtimeVerification.findFirst({
              where: { chatId, messageId: persisted.id },
              orderBy: { createdAt: "desc" },
            }),
          { timeout: 90_000 },
        )
        .not.toBeNull();
      const savedRuntimeVerification =
        await prisma.runtimeVerification.findFirstOrThrow({
          where: { chatId, messageId: persisted.id },
          orderBy: { createdAt: "desc" },
        });
      expect(savedRuntimeVerification.report).not.toMatchObject({
        runtimeError: "Preview did not respond to the runtime test",
      });

      const charge = await prisma.generationLog.findFirst({
        where: { chatId, userId: user.id, status: "completed" },
        orderBy: { createdAt: "desc" },
      });
      expect(charge?.creditsUsed).toBeGreaterThan(0);

      const publishResponse = await page.request.post("/api/gallery", {
        data: {
          messageId: persisted.id,
          title: "Launch-check dashboard",
          description: "Authenticated launch-flow verification fixture.",
          allowRemixes: false,
          allowStarterDownloads: false,
        },
      });
      const publishError = publishResponse.ok()
        ? undefined
        : await publishResponse.text();
      expect(publishResponse.ok(), publishError).toBeTruthy();

      await page.goto(`/share/v2/${persisted.id}`);
      await expect(page.getByText("Built with Squid")).toBeVisible();

      const exportVerification = await page.request.post(
        `/api/export/${persisted.id}`,
      );
      expect(exportVerification.ok()).toBeTruthy();
      const exportBody = (await exportVerification.json()) as {
        status: string;
      };
      expect(["verified", "warning"]).toContain(exportBody.status);

      const exportDownload = await page.request.get(
        `/api/export/${persisted.id}`,
      );
      expect(exportDownload.ok()).toBeTruthy();
      expect(exportDownload.headers()["content-type"]).toContain(
        "application/zip",
      );

      await page.goto(`/chats/${chatId}`);
      await page.reload();
      await expect(
        page.getByRole("button", { name: /credits? charged/i }),
      ).toBeVisible();
    } finally {
      if (chatId) {
        await prisma.exportArtifact.deleteMany({ where: { chatId } });
        await prisma.shareEvent.deleteMany({ where: { chatId } });
        await prisma.creditHold.deleteMany({ where: { chatId } });
        await prisma.generationLog.deleteMany({ where: { chatId } });
        await prisma.aiRequestLog.deleteMany({ where: { chatId } });
      }
      if (userId) await prisma.user.deleteMany({ where: { id: userId } });
      await prisma.$disconnect();
    }
  });
});
