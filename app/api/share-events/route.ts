import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { z } from "zod";

const SHARE_VISITOR_COOKIE = "squid_share_visitor";

const shareEventSchema = z.object({
  messageId: z.string().min(1),
  eventType: z.enum([
    "view",
    "copy_prompt",
    "download_starter",
    "gallery_featured",
    "remix_click",
    "remix_created",
    "referral_credit_granted",
  ]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = shareEventSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid share event" },
      { status: 400 },
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

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const visitorId =
    request.cookies.get(SHARE_VISITOR_COOKIE)?.value || crypto.randomUUID();

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
