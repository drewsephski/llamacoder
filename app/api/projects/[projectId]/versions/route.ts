import { z } from "zod";

import { getCurrentSession } from "@/features/auth/server/session";
import { getMessageGeneratedFiles } from "@/features/generation/message-files";
import { getPrisma } from "@/lib/prisma";

const querySchema = z.object({ cursor: z.coerce.number().int().nonnegative().default(0) });

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await getCurrentSession();
  if (!session) return Response.json({ message: "Unauthorized" }, { status: 401 });
  const { projectId } = await params;
  const query = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
  const prisma = getPrisma();
  const project = await prisma.chat.findFirst({ where: { id: projectId, userId: session.user.id }, select: { id: true } });
  if (!project) return Response.json({ message: "Project not found" }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { chatId: projectId, role: "assistant", position: { lt: query.cursor || undefined } },
    orderBy: { position: "desc" },
    take: 31,
  });
  const versions = messages
    .filter((message) => getMessageGeneratedFiles(message).length > 0)
    .slice(0, 30)
    .map((message) => ({
      id: message.id,
      position: message.position,
      label: message.versionLabel,
      bookmarked: message.isBookmarked,
      changeSummary: message.changeSummary,
      versionKind: message.versionKind,
      createdAt: message.createdAt,
      files: getMessageGeneratedFiles(message),
    }));
  return Response.json({
    versions,
    nextCursor: messages.length > 30 ? messages[29]?.position ?? null : null,
  });
}
