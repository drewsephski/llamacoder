import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { getPrisma } from "@/lib/prisma";
import { recordOperationalEvent } from "@/lib/observability";

const installationEventSchema = z.object({
  action: z.string(),
  installation: z.object({ id: z.number() }),
});

function signatureIsValid(payload: string, supplied: string | null) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET?.trim();
  if (!secret || !supplied?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(payload).digest();
  const actual = Buffer.from(supplied.slice(7), "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function POST(request: Request) {
  const payload = await request.text();
  if (!signatureIsValid(payload, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json(
      {
        error: "INVALID_SIGNATURE",
        message: "Invalid GitHub webhook signature.",
      },
      { status: 401 },
    );
  }
  const deliveryId = request.headers.get("x-github-delivery");
  const event = request.headers.get("x-github-event") ?? "unknown";
  if (!deliveryId) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Delivery ID is required." },
      { status: 400 },
    );
  }
  let decoded: unknown;
  try {
    decoded = JSON.parse(payload);
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid webhook payload." },
      { status: 400 },
    );
  }
  const parsed = installationEventSchema.safeParse(decoded);
  const prisma = getPrisma();
  try {
    await prisma.integrationWebhookDelivery.create({
      data: {
        providerId: "github",
        deliveryId,
        event,
        payloadHash: createHash("sha256").update(payload).digest("hex"),
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    await recordOperationalEvent({
      name: "github_webhook_failed",
      level: "error",
      operation: event,
      status: "error",
      error,
      metadata: { deliveryId },
    });
    return NextResponse.json(
      { error: "WEBHOOK_PROCESSING_FAILED" },
      { status: 500 },
    );
  }
  if (!parsed.success || event !== "installation") {
    return NextResponse.json({ ok: true, ignored: true });
  }
  const installationId = String(parsed.data.installation.id);
  const disabled =
    parsed.data.action === "deleted" || parsed.data.action === "suspend";
  const restored = parsed.data.action === "unsuspend";
  if (!disabled && !restored)
    return NextResponse.json({ ok: true, ignored: true });

  try {
    const connections = await prisma.integrationConnection.findMany({
      where: {
        providerId: "github",
        metadata: { path: ["installationId"], equals: installationId },
      },
      include: { projectBindings: true },
    });
    await prisma.$transaction(async (tx) => {
      for (const connection of connections) {
        const status = disabled ? "needs_attention" : "ready";
        await tx.integrationConnection.update({
          where: { id: connection.id },
          data: {
            status,
            lastHealthStatus: disabled ? "failed" : "healthy",
            lastHealthMessage: disabled
              ? "The GitHub App installation was removed or suspended."
              : "The GitHub App installation is active.",
            lastHealthCheckAt: new Date(),
          },
        });
        await tx.projectIntegration.updateMany({
          where: { connectionId: connection.id },
          data: { status },
        });
        await tx.integrationAuditEvent.create({
          data: {
            userId: connection.userId,
            providerId: "github",
            action: disabled
              ? "installation_disabled"
              : "installation_restored",
            connectionId: connection.id,
            metadata: { installationId, deliveryId },
          },
        });
      }
    });
  } catch (error) {
    await recordOperationalEvent({
      name: "github_webhook_failed",
      level: "error",
      operation: event,
      status: "error",
      error,
      metadata: { deliveryId },
    });
    return NextResponse.json(
      { error: "WEBHOOK_PROCESSING_FAILED" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
