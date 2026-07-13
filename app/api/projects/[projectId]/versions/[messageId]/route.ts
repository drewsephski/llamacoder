import { z } from "zod";

import { getCurrentSession } from "@/features/auth/server/session";
import { getPrisma } from "@/lib/prisma";

const updateSchema = z.object({
  label: z.string().trim().max(80).nullable().optional(),
  bookmarked: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string; messageId: string }> },
) {
  const session = await getCurrentSession();
  if (!session) return Response.json({ message: "Unauthorized" }, { status: 401 });
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ message: "Invalid request" }, { status: 400 });
  const { projectId, messageId } = await params;
  const prisma = getPrisma();
  const message = await prisma.message.findFirst({
    where: { id: messageId, chatId: projectId, chat: { userId: session.user.id } },
    select: { id: true },
  });
  if (!message) return Response.json({ message: "Version not found" }, { status: 404 });
  const updated = await prisma.message.update({
    where: { id: message.id },
    data: {
      ...(parsed.data.label !== undefined ? { versionLabel: parsed.data.label || null } : {}),
      ...(parsed.data.bookmarked !== undefined ? { isBookmarked: parsed.data.bookmarked } : {}),
    },
  });
  return Response.json({ label: updated.versionLabel, bookmarked: updated.isBookmarked });
}
