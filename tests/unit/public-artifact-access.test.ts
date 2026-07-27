import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    publicArtifact: { findUnique: vi.fn() },
    message: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => prismaMock,
}));

import {
  canAccessPublicArtifact,
  resolvePublicArtifact,
} from "@/features/public-artifacts/server/access";

function artifactRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "artifact_1",
    token: "opaque_token",
    status: "ACTIVE",
    revokedAt: null,
    visibility: "GALLERY",
    allowRemixes: false,
    allowStarterDownloads: true,
    currentRevision: {
      message: {
        id: "message_1",
        chat: { id: "chat_1", user: { name: "Drew" } },
      },
    },
    galleryPublication: { id: "publication_1", isPublished: true },
    ...overrides,
  };
}

describe("public artifact access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.publicArtifact.findUnique.mockResolvedValue(null);
    prismaMock.message.findUnique.mockResolvedValue(null);
  });

  it("resolves an active opaque token to its pinned immutable revision", async () => {
    prismaMock.publicArtifact.findUnique.mockResolvedValue(artifactRow());

    const result = await resolvePublicArtifact("opaque_token");

    expect(result).toEqual(
      expect.objectContaining({
        artifactId: "artifact_1",
        token: "opaque_token",
        isLegacyReference: false,
        allowRemixes: false,
        allowStarterDownloads: true,
        message: expect.objectContaining({ id: "message_1" }),
      }),
    );
    expect(canAccessPublicArtifact(result!, "remix")).toBe(false);
    expect(canAccessPublicArtifact(result!, "starter_download")).toBe(true);
    expect(prismaMock.message.findUnique).not.toHaveBeenCalled();
  });

  it("does not fall back to a raw message when a token was revoked", async () => {
    prismaMock.publicArtifact.findUnique.mockResolvedValue(
      artifactRow({ status: "REVOKED", revokedAt: new Date() }),
    );

    await expect(resolvePublicArtifact("opaque_token")).resolves.toBeNull();
    expect(prismaMock.message.findUnique).not.toHaveBeenCalled();
  });

  it("does not treat an arbitrary raw message ID as a public capability", async () => {
    prismaMock.message.findUnique.mockResolvedValue({
      id: "legacy_message",
      chat: { id: "chat_1", user: { name: "Drew" } },
      galleryPublication: null,
    });

    await expect(resolvePublicArtifact("legacy_message")).resolves.toBeNull();
  });

  it("keeps published legacy gallery links viewable under publication permissions", async () => {
    prismaMock.message.findUnique.mockResolvedValue({
      id: "legacy_message",
      chat: { id: "chat_1", user: { name: "Drew" } },
      galleryPublication: { isPublished: true, allowRemixes: false },
    });

    await expect(resolvePublicArtifact("legacy_message")).resolves.toEqual(
      expect.objectContaining({
        artifactId: null,
        token: null,
        isLegacyReference: true,
        visibility: "GALLERY",
        allowRemixes: false,
        allowStarterDownloads: false,
      }),
    );
  });
});
