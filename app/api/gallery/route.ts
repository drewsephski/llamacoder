import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const prisma = getPrisma();
  const events = await prisma.shareEvent.findMany({
    where: {
      eventType: "gallery_featured",
    },
    orderBy: { createdAt: "desc" },
    distinct: ["messageId"],
    take: 6,
  });
  const messageIds = events.map((event) => event.messageId);

  if (messageIds.length === 0) {
    return NextResponse.json({ apps: [] });
  }

  const messages = await prisma.message.findMany({
    where: {
      id: { in: messageIds },
    },
    include: {
      chat: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });
  const messageById = new Map(messages.map((message) => [message.id, message]));

  return NextResponse.json({
    apps: messageIds
      .map((messageId) => messageById.get(messageId))
      .filter(Boolean)
      .map((message) => ({
        name: message!.chat.title,
        href: `/share/v2/${message!.id}`,
        description: message!.chat.prompt,
        category: message!.chat.quality === "high" ? "High quality" : "Fast build",
        creatorName: message!.chat.user?.name ?? "Squid creator",
      })),
  });
}
