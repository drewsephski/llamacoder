import { getPrisma } from "@/lib/prisma";
import { normalizeGeneratedFiles } from "@/lib/generated-files";
import { extractAllCodeBlocks } from "@/lib/utils";
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

  const files = normalizeGeneratedFiles(
    ((message.files as any[]) || []).length > 0
      ? (message.files as any[])
      : extractAllCodeBlocks(message.content),
  );
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
