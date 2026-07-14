import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

import { FREE_MODEL } from "@/lib/constants";

test.describe("billable generation API contract", () => {
  test.skip(
    process.env.RUN_LAUNCH_E2E !== "1",
    "Set RUN_LAUNCH_E2E=1 with DATABASE_URL and OPENROUTER_API_KEY to run the billable API contract.",
  );

  test("seed verified account → generate → persist → charge → share → export", async ({
    page,
  }) => {
    test.setTimeout(180_000);
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
      await expect(page).toHaveURL(/\/verify-email/);

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

      await page.goto("/sign-in?callbackUrl=/dashboard");
      await page.getByLabel("Email address").fill(email);
      await page.getByLabel("Password").fill(password);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page).toHaveURL(/\/dashboard$/);

      const createResponse = await page.request.post("/api/create-chat", {
        data: {
          prompt: "Build a launch-check task list with accessible controls.",
          model: FREE_MODEL,
          quality: "low",
        },
      });
      expect(createResponse.ok()).toBeTruthy();
      const created = (await createResponse.json()) as { chatId: string };
      chatId = created.chatId;
      await prisma.chat.update({
        where: { id: chatId },
        data: {
          plan: [
            "Build a complete React TypeScript task list.",
            "Return App.tsx, components/TaskList.tsx, and data/tasks.ts.",
            "Use only local state and accessible native buttons.",
          ].join("\n"),
        },
      });

      const generateResponse = await page.request.post("/api/generate-code", {
        data: { chatId },
        timeout: 150_000,
      });
      const generationError = generateResponse.ok()
        ? undefined
        : await generateResponse.text();
      expect(generateResponse.ok(), generationError).toBeTruthy();
      const generated = (await generateResponse.json()) as {
        messageId: string;
      };

      const persisted = await prisma.message.findUniqueOrThrow({
        where: { id: generated.messageId },
      });
      expect(persisted.files).toBeTruthy();
      const charge = await prisma.generationLog.findFirst({
        where: { chatId, userId: user.id, status: "completed" },
        orderBy: { createdAt: "desc" },
      });
      expect(charge?.creditsUsed).toBeGreaterThan(0);

      await page.goto(`/share/v2/${generated.messageId}`);
      await expect(page.getByText("Built with Squid")).toBeVisible();

      const exportVerification = await page.request.post(
        `/api/export/${generated.messageId}`,
      );
      expect(exportVerification.ok()).toBeTruthy();
      const exportBody = (await exportVerification.json()) as {
        status: string;
      };
      expect(["verified", "warning"]).toContain(exportBody.status);

      const exportDownload = await page.request.get(
        `/api/export/${generated.messageId}`,
      );
      expect(exportDownload.ok()).toBeTruthy();
      expect(exportDownload.headers()["content-type"]).toContain(
        "application/zip",
      );

      await page.goto(`/chats/${chatId}`);
      await page.reload();
      await expect(
        page.getByText(/credits? used|actual/i).first(),
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
