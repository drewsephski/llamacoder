import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type {
  ProjectMessage,
  ProjectWorkspace,
} from "@/features/projects/contracts";
import { getAuthorizedProjectWorkspace } from "@/features/projects/server/queries";
import { createNoIndexMetadata } from "@/lib/seo";

import PageClient from "./page.client";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const chat = await getAuthorizedProjectWorkspace(id);

  if (!chat) {
    return createNoIndexMetadata({
      title: "Project not found",
      description: "The requested project could not be found.",
      path: `/chats/${encodeURIComponent(id)}`,
    });
  }

  return createNoIndexMetadata({
    title: `App: ${chat.title}`,
    description: `Building an app for ${chat.title} with ${chat.model}`,
    path: `/chats/${encodeURIComponent(id)}`,
  });
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const chat = await getAuthorizedProjectWorkspace(id);

  if (!chat) notFound();

  return <PageClient chat={chat} />;
}

export type Chat = ProjectWorkspace;
export type Message = ProjectMessage;

export const runtime = "nodejs";
export const maxDuration = 45;
