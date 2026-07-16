import { getPrisma } from "@/lib/prisma";
import { getMessageGeneratedFiles } from "@/features/generation/message-files";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { SharePageClient } from "./share-page-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ messageId: string }>;
}): Promise<Metadata> {
  let { messageId } = await params;
  const message = await getMessage(messageId);
  if (!message) {
    notFound();
  }

  let title = message.chat.title;
  let searchParams = new URLSearchParams();
  searchParams.set("prompt", title);

  return {
    title,
    description: `An app generated on Squid Agent.app: ${title}`,
    openGraph: {
      images: [`/api/og?${searchParams}`],
    },
    twitter: {
      card: "summary_large_image",
      images: [`/api/og?${searchParams}`],
      title,
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ messageId: string }>;
}) {
  const { messageId } = await params;

  const prisma = getPrisma();
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      galleryPublication: {
        select: { allowRemixes: true, isPublished: true },
      },
      chat: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
  if (!message) {
    notFound();
  }

  const files = getMessageGeneratedFiles(message);
  if (files.length === 0) {
    notFound();
  }

  return (
    <SharePageClient
      messageId={message.id}
      title={message.chat.title}
      prompt={message.chat.prompt}
      creatorName={message.chat.user?.name ?? "Squid creator"}
      files={files.map((file) => ({ path: file.path, content: file.code }))}
      allowRemixes={
        message.galleryPublication
          ? message.galleryPublication.isPublished &&
            message.galleryPublication.allowRemixes
          : true
      }
    />
  );
}

const getMessage = cache(async (messageId: string) => {
  const prisma = getPrisma();
  return prisma.message.findUnique({
    where: {
      id: messageId,
    },
    include: {
      chat: true,
    },
  });
});
