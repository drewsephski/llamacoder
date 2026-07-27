import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  publishGalleryArtifact,
  revokeGalleryArtifact,
} from "@/features/public-artifacts/server/publish";

const tx = {
  galleryPublication: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
  },
  publicArtifact: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  publicArtifactRevision: {
    upsert: vi.fn(),
  },
};

const prisma = {
  $transaction: vi.fn(async (callback) => callback(tx)),
};

describe("public artifact publishing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tx.galleryPublication.findUnique.mockResolvedValue({
      id: "publication_1",
      slug: "stable-gallery-slug",
      publicArtifactId: "artifact_1",
    });
    tx.publicArtifact.findUnique.mockResolvedValue({ id: "artifact_1" });
    tx.publicArtifactRevision.upsert.mockResolvedValue({
      id: "revision_2",
    });
    tx.publicArtifact.update.mockResolvedValue({
      id: "artifact_1",
      token: "opaque_token",
      allowRemixes: true,
      allowStarterDownloads: true,
      status: "ACTIVE",
    });
    tx.galleryPublication.upsert.mockResolvedValue({
      id: "publication_1",
      slug: "stable-gallery-slug",
    });
  });

  it("pins a new immutable revision without changing the public token or slug", async () => {
    const result = await publishGalleryArtifact(prisma as never, {
      chatId: "chat_1",
      messageId: "message_2",
      userId: "owner_1",
      title: "Focus Day",
      description: "A focused workspace.",
      allowRemixes: true,
      allowStarterDownloads: true,
      slug: "replacement-slug",
      now: new Date("2026-07-27T00:00:00.000Z"),
    });

    expect(tx.publicArtifactRevision.upsert).toHaveBeenCalledWith({
      where: {
        artifactId_messageId: {
          artifactId: "artifact_1",
          messageId: "message_2",
        },
      },
      create: {
        artifactId: "artifact_1",
        messageId: "message_2",
      },
      update: {},
      select: { id: true },
    });
    expect(tx.publicArtifact.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "artifact_1" },
        data: expect.objectContaining({
          currentRevisionId: "revision_2",
          status: "ACTIVE",
          revokedAt: null,
        }),
      }),
    );
    expect(result.stableSlug).toBe("stable-gallery-slug");
    expect(result.artifact.token).toBe("opaque_token");
  });

  it("revokes the artifact when its gallery publication is unpublished", async () => {
    const now = new Date("2026-07-27T00:00:00.000Z");

    await revokeGalleryArtifact(
      tx as never,
      { id: "publication_1", publicArtifactId: "artifact_1" },
      now,
    );

    expect(tx.galleryPublication.update).toHaveBeenCalledWith({
      where: { id: "publication_1" },
      data: { isPublished: false, unpublishedAt: now },
    });
    expect(tx.publicArtifact.update).toHaveBeenCalledWith({
      where: { id: "artifact_1" },
      data: { status: "REVOKED", revokedAt: now },
    });
  });
});
