import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { z } from "zod";

import { consumeRateLimit } from "@/features/security/server/rate-limit";

const SHARE_VISITOR_COOKIE = "squid_share_visitor";

const shareEventSchema = z.object({
  messageId: z.string().min(1),
  eventType: z.enum([
    "view",
    "copy_prompt",
    "download_starter",
    "remix_click",
    "remix_created",
    "referral_credit_granted",
    "passport_open",
    "passport_download",
  ]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  const rawBody = await request.json().catch(() => null);
  if (
    rawBody &&
    typeof rawBody === "object" &&
    "eventType" in rawBody &&
    rawBody.eventType === "gallery_featured"
  ) {
    return NextResponse.json(
      {
        error: "FORBIDDEN",
        message: "Gallery promotion is an administrative action.",
      },
      { status: 403 },
    );
  }
  const parsed = shareEventSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid share event" },
      { status: 400 },
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const visitorId =
    request.cookies.get(SHARE_VISITOR_COOKIE)?.value || crypto.randomUUID();
  const rateLimitSubject =
    session?.user.id ??
    `visitor:${request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || visitorId}`;

  const rateLimit = await consumeRateLimit({
    userId: rateLimitSubject,
    operation: "share_event",
    limit: 60,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "RATE_LIMITED",
        message: "Too many share events. Please try again shortly.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const prisma = getPrisma();
  const message = await prisma.message.findUnique({
    where: { id: parsed.data.messageId },
    include: { chat: true },
  });

  if (!message) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Shared app not found" },
      { status: 404 },
    );
  }

  await prisma.shareEvent.create({
    data: {
      messageId: message.id,
      chatId: message.chatId,
      eventType: parsed.data.eventType,
      visitorId,
      userId: session?.user.id,
      referrerUserId: message.chat.userId,
      metadata: parsed.data.metadata as Prisma.InputJsonValue | undefined,
    },
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SHARE_VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 180,
    path: "/",
  });

  return response;
}
