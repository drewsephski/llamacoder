import { getCurrentSession } from "@/features/auth/server/session";
import { runtimeVerificationReportSchema } from "@/features/generation/runtime-verification";
import { getPrisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await getCurrentSession();
  if (!session)
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  const parsed = runtimeVerificationReportSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return Response.json(
      { message: "Invalid verification report" },
      { status: 400 },
    );
  const { projectId } = await params;
  const prisma = getPrisma();
  const message = await prisma.message.findFirst({
    where: {
      id: parsed.data.messageId,
      chatId: projectId,
      chat: { userId: session.user.id },
    },
    select: { id: true },
  });
  if (!message)
    return Response.json({ message: "Version not found" }, { status: 404 });

  const verification = await prisma.runtimeVerification.create({
    data: {
      userId: session.user.id,
      chatId: projectId,
      messageId: message.id,
      status: parsed.data.status,
      report: parsed.data,
    },
  });
  return Response.json(
    { id: verification.id, ...parsed.data },
    { status: 201 },
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await getCurrentSession();
  if (!session)
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  const { projectId } = await params;
  const messageId = new URL(request.url).searchParams.get("messageId");
  const rows = await getPrisma().runtimeVerification.findMany({
    where: {
      chatId: projectId,
      userId: session.user.id,
      ...(messageId ? { messageId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: messageId ? 1 : 50,
  });
  return Response.json({ verifications: rows });
}
