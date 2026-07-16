"use server";

import { revalidatePath } from "next/cache";

import { getCurrentSession } from "@/features/auth/server/session";
import { getPrisma } from "@/lib/prisma";

export async function saveProject(chatId: string) {
  const session = await getCurrentSession();
  if (!session) throw new Error("You must be signed in to save");

  const prisma = getPrisma();
  const existing = await prisma.chat.findUnique({
    where: { id: chatId },
  });
  if (!existing) throw new Error("Project not found");
  if (existing.userId) throw new Error("This project is already saved");

  const project = await prisma.chat.update({
    where: { id: chatId },
    data: { userId: session.user.id },
  });

  revalidatePath("/dashboard");
  return project;
}

export async function deleteProject(chatId: string) {
  const session = await getCurrentSession();
  if (!session) throw new Error("You must be signed in to delete projects");

  const project = await getPrisma().chat.findUnique({ where: { id: chatId } });
  if (!project) throw new Error("Project not found");
  if (project.userId !== session.user.id) {
    throw new Error("You do not have access to this project");
  }

  await getPrisma().chat.delete({ where: { id: chatId } });

  revalidatePath("/dashboard");
  revalidatePath("/gallery");
}

export async function renameProject(chatId: string, newTitle: string) {
  const session = await getCurrentSession();
  if (!session) throw new Error("You must be signed in to rename projects");

  const title = newTitle.trim().slice(0, 80);
  if (!title) throw new Error("Project title is required");

  const project = await getPrisma().chat.findUnique({ where: { id: chatId } });
  if (!project) throw new Error("Project not found");
  if (project.userId !== session.user.id) {
    throw new Error("You do not have access to this project");
  }

  const updatedProject = await getPrisma().chat.update({
    where: { id: chatId },
    data: { title },
  });
  revalidatePath("/dashboard");
  return updatedProject;
}

export async function duplicateProject(chatId: string) {
  const session = await getCurrentSession();
  if (!session) throw new Error("You must be signed in to duplicate projects");

  const prisma = getPrisma();
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { messages: true },
  });
  if (!chat) throw new Error("Project not found");
  if (chat.userId !== session.user.id) {
    throw new Error("You do not have access to this project");
  }

  const newChat = await prisma.chat.create({
    data: {
      model: chat.model,
      quality: chat.quality,
      prompt: chat.prompt,
      title: `${chat.title} (copy)`,
      llamaCoderVersion: chat.llamaCoderVersion,
      shadcn: chat.shadcn,
      plan: chat.plan,
      hasCode: chat.hasCode,
      userId: session.user.id,
      messages: {
        create: chat.messages.map((message) => ({
          role: message.role,
          content: message.content,
          files: message.files ?? undefined,
          followUpPrompts: message.followUpPrompts ?? undefined,
          position: message.position,
        })),
      },
    },
  });

  revalidatePath("/dashboard");
  return newChat;
}
