import { getPrisma } from "@/lib/prisma";
import { getMessageGeneratedFiles } from "@/features/generation/message-files";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  buildGallerySocialMetadata,
  getPublishedGallerySocialImage,
} from "@/features/gallery/social-metadata";
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

  const title = message.chat.title;
  const description = `An app generated on Squid Agent.app: ${title}`;

  return buildGallerySocialMetadata({
    title,
    description,
    canonicalPath: `/share/v2/${encodeURIComponent(messageId)}`,
    image: getPublishedGallerySocialImage({
      publication: message.galleryPublication,
      title,
    }),
    index: false,
  });
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ messageId: string }>;
}) {
  const { messageId } = await params;

  const message = await getMessage(messageId);
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
      galleryPublication: {
        select: {
          id: true,
          slug: true,
          messageId: true,
          allowRemixes: true,
          isPublished: true,
          thumbnailUrl: true,
          thumbnailStatus: true,
          thumbnailCapturedMessageId: true,
        },
      },
      chat: {
        include: {
          user: {
            select: { name: true },
          },
        },
      },
    },
  });
});
