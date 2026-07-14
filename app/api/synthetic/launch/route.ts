import { generateText } from "ai";

import { SECONDARY_STARTER_MODEL } from "@/lib/constants";
import { recordOperationalEvent } from "@/lib/observability";
import { createAppOpenRouter, createOpenRouterModel } from "@/lib/openrouter";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: Request) {
  const supplied = request.headers.get("authorization");
  const secrets = [
    process.env.CRON_SECRET,
    process.env.SYNTHETIC_MONITOR_SECRET,
  ].filter(Boolean);
  return secrets.some((secret) => supplied === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const model = process.env.SYNTHETIC_MONITOR_MODEL || SECONDARY_STARTER_MODEL;

  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;

    const openrouter = createAppOpenRouter({
      sessionId: `synthetic-${startedAt}`,
      sessionName: "Production synthetic",
    });
    const result = await generateText({
      model: createOpenRouterModel(openrouter, model, {
        maxTokens: 16,
        usage: { include: true },
      }),
      prompt: "Reply with exactly: SQUID_SYNTHETIC_OK",
    });
    if (!result.text.includes("SQUID_SYNTHETIC_OK")) {
      throw new Error("Synthetic model response did not match the contract");
    }

    const durationMs = Date.now() - startedAt;
    await recordOperationalEvent({
      name: "production_synthetic_passed",
      level: "info",
      operation: "provider_and_database",
      status: "passed",
      metadata: { model, durationMs },
    });
    return Response.json(
      { status: "passed", model, durationMs },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    await recordOperationalEvent({
      name: "production_synthetic_failed",
      level: "error",
      operation: "provider_and_database",
      status: "failed",
      error,
      metadata: { model, durationMs },
    });
    return Response.json(
      { status: "failed", model, durationMs },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
