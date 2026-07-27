import "server-only";

import type { Prisma } from "@prisma/client";

import { getPrisma } from "@/lib/prisma";

const publicArtifactInclude = {
  currentRevision: {
    include: {
      message: {
        include: {
          chat: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      },
    },
  },
  galleryPublication: true,
} satisfies Prisma.PublicArtifactInclude;

const legacyMessageInclude = {
  chat: {
    include: {
      user: { select: { name: true } },
    },
  },
  galleryPublication: true,
} satisfies Prisma.MessageInclude;

type ArtifactRow = Prisma.PublicArtifactGetPayload<{
  include: typeof publicArtifactInclude;
}>;

export type PublicArtifactAction = "view" | "remix" | "starter_download";

export type ResolvedPublicArtifact = {
  artifactId: string | null;
  token: string | null;
  message: ArtifactRow["currentRevision"] extends infer T
    ? NonNullable<T> extends { message: infer M }
      ? M
      : never
    : never;
  visibility: "UNLISTED" | "GALLERY";
  allowRemixes: boolean;
  allowStarterDownloads: boolean;
  galleryPublication: ArtifactRow["galleryPublication"];
  isLegacyReference: boolean;
};

/**
 * Resolves opaque artifact tokens first. Raw message IDs are accepted only as a
 * compatibility path for links created before PublicArtifact existed.
 */
export async function resolvePublicArtifact(
  reference: string,
): Promise<ResolvedPublicArtifact | null> {
  const prisma = getPrisma();
  const artifact = await prisma.publicArtifact.findUnique({
    where: { token: reference },
    include: publicArtifactInclude,
  });

  if (artifact) {
    if (
      artifact.status !== "ACTIVE" ||
      artifact.revokedAt ||
      !artifact.currentRevision ||
      artifact.currentRevision.message.chatId !== artifact.chatId ||
      (artifact.visibility === "GALLERY" &&
        !artifact.galleryPublication?.isPublished)
    ) {
      return null;
    }

    return {
      artifactId: artifact.id,
      token: artifact.token,
      message: artifact.currentRevision.message,
      visibility: artifact.visibility,
      allowRemixes: artifact.allowRemixes,
      allowStarterDownloads: artifact.allowStarterDownloads,
      galleryPublication: artifact.galleryPublication,
      isLegacyReference: false,
    };
  }

  return resolveLegacyMessageReference(reference);
}

async function resolveLegacyMessageReference(
  messageId: string,
): Promise<ResolvedPublicArtifact | null> {
  const prisma = getPrisma();
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: legacyMessageInclude,
  });

  if (!message) return null;

  const publication = message.galleryPublication;
  // A raw database identifier is not a publication capability. Keep the
  // compatibility path only for messages that were explicitly published to
  // the gallery before opaque artifact tokens existed.
  if (!publication?.isPublished) return null;

  return {
    artifactId: null,
    token: null,
    message: message as ResolvedPublicArtifact["message"],
    visibility: "GALLERY",
    allowRemixes: publication.allowRemixes,
    allowStarterDownloads: false,
    galleryPublication: publication,
    isLegacyReference: true,
  };
}

export function canAccessPublicArtifact(
  artifact: ResolvedPublicArtifact,
  action: PublicArtifactAction,
) {
  if (action === "remix") return artifact.allowRemixes;
  if (action === "starter_download") {
    return artifact.allowStarterDownloads;
  }
  return true;
}

export async function resolveAuthorizedPublicArtifact(
  reference: string,
  action: PublicArtifactAction,
) {
  const artifact = await resolvePublicArtifact(reference);
  if (!artifact || !canAccessPublicArtifact(artifact, action)) return null;
  return artifact;
}
