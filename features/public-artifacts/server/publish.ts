import "server-only";

import type { PrismaClient } from "@prisma/client";

type PublishGalleryArtifactInput = {
  chatId: string;
  messageId: string;
  userId: string;
  title: string;
  description: string;
  allowRemixes: boolean;
  allowStarterDownloads: boolean;
  slug: string;
  now: Date;
};

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Publishes a new immutable revision while retaining one stable artifact token
 * and one stable gallery slug for the project.
 */
export async function publishGalleryArtifact(
  prisma: PrismaClient,
  input: PublishGalleryArtifactInput,
) {
  return prisma.$transaction(async (tx) => {
    const existingPublication = await tx.galleryPublication.findUnique({
      where: { chatId: input.chatId },
      select: {
        id: true,
        slug: true,
        publicArtifactId: true,
      },
    });

    const artifact = await upsertArtifact(tx, {
      ...input,
      artifactId: existingPublication?.publicArtifactId ?? null,
    });

    const publication = await tx.galleryPublication.upsert({
      where: { chatId: input.chatId },
      create: {
        slug: input.slug,
        chatId: input.chatId,
        messageId: input.messageId,
        userId: input.userId,
        title: input.title,
        description: input.description,
        allowRemixes: input.allowRemixes,
        isPublished: true,
        publishedAt: input.now,
        thumbnailStatus: "pending",
        thumbnailUpdatedAt: input.now,
        publicArtifactId: artifact.id,
      },
      update: {
        messageId: input.messageId,
        title: input.title,
        description: input.description,
        allowRemixes: input.allowRemixes,
        isPublished: true,
        publishedAt: input.now,
        unpublishedAt: null,
        thumbnailUrl: null,
        thumbnailStatus: "pending",
        thumbnailCapturedMessageId: null,
        thumbnailError: null,
        thumbnailUpdatedAt: input.now,
        publicArtifactId: artifact.id,
      },
    });

    return {
      publication,
      artifact,
      stableSlug: existingPublication?.slug ?? publication.slug,
    };
  });
}

async function upsertArtifact(
  tx: TransactionClient,
  input: PublishGalleryArtifactInput & { artifactId: string | null },
) {
  const existingArtifact = input.artifactId
    ? await tx.publicArtifact.findUnique({
        where: { id: input.artifactId },
        select: { id: true },
      })
    : await tx.publicArtifact.findUnique({
        where: {
          chatId_visibility: {
            chatId: input.chatId,
            visibility: "GALLERY",
          },
        },
        select: { id: true },
      });

  const artifact =
    existingArtifact ??
    (await tx.publicArtifact.create({
      data: {
        chatId: input.chatId,
        userId: input.userId,
        visibility: "GALLERY",
        status: "ACTIVE",
        allowRemixes: input.allowRemixes,
        allowStarterDownloads: input.allowStarterDownloads,
      },
      select: { id: true },
    }));

  const revision = await tx.publicArtifactRevision.upsert({
    where: {
      artifactId_messageId: {
        artifactId: artifact.id,
        messageId: input.messageId,
      },
    },
    create: {
      artifactId: artifact.id,
      messageId: input.messageId,
    },
    update: {},
    select: { id: true },
  });

  return tx.publicArtifact.update({
    where: { id: artifact.id },
    data: {
      currentRevisionId: revision.id,
      status: "ACTIVE",
      revokedAt: null,
      allowRemixes: input.allowRemixes,
      allowStarterDownloads: input.allowStarterDownloads,
    },
    select: {
      id: true,
      token: true,
      allowRemixes: true,
      allowStarterDownloads: true,
      status: true,
    },
  });
}

export async function revokeGalleryArtifact(
  tx: TransactionClient,
  publication: { id: string; publicArtifactId: string | null },
  now: Date,
) {
  await tx.galleryPublication.update({
    where: { id: publication.id },
    data: { isPublished: false, unpublishedAt: now },
  });

  if (publication.publicArtifactId) {
    await tx.publicArtifact.update({
      where: { id: publication.publicArtifactId },
      data: { status: "REVOKED", revokedAt: now },
    });
  }
}

export type { PublishGalleryArtifactInput, TransactionClient };
