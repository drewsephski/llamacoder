import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authGetSessionMock,
  canAccessPublicArtifactMock,
  prismaMock,
  resolvePublicArtifactMock,
} = vi.hoisted(() => ({
  authGetSessionMock: vi.fn(),
  canAccessPublicArtifactMock: vi.fn(),
  resolvePublicArtifactMock: vi.fn(),
  prismaMock: {
    message: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: authGetSessionMock } },
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => prismaMock,
}));

vi.mock("@/features/generation/message-files", () => ({
  getMessageGeneratedFiles: () => [{ path: "App.tsx", content: "export {}" }],
}));

vi.mock("@/features/security/server/rate-limit", () => ({
  consumeRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 19 }),
}));

vi.mock("@/features/public-artifacts/server/access", () => ({
  canAccessPublicArtifact: canAccessPublicArtifactMock,
  resolvePublicArtifact: resolvePublicArtifactMock,
}));

vi.mock("@/lib/observability", () => ({
  recordOperationalEvent: vi.fn(),
}));

import { GET } from "@/app/api/export/[messageId]/route";

describe("export route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authGetSessionMock.mockResolvedValue({ user: { id: "owner_1" } });
    resolvePublicArtifactMock.mockResolvedValue(null);
    canAccessPublicArtifactMock.mockReturnValue(false);
    prismaMock.message.findUnique.mockResolvedValue({
      id: "msg_1",
      chatId: "chat_1",
      chat: {
        id: "chat_1",
        title: "Demo App",
        prompt: "Build a demo",
        userId: "owner_1",
      },
    });
  });

  it("requires ownership for starter downloads", async () => {
    authGetSessionMock.mockResolvedValue({ user: { id: "other_user" } });

    const response = await GET(
      new NextRequest("https://example.com/api/export/msg_1?starter=1"),
      { params: Promise.resolve({ messageId: "msg_1" }) },
    );

    expect(response.status).toBe(403);
  });

  it("allows an explicitly authorized public starter without exposing source", async () => {
    authGetSessionMock.mockResolvedValue(null);
    resolvePublicArtifactMock.mockResolvedValue({
      token: "opaque_artifact_token",
      message: {
        id: "msg_1",
        chat: {
          title: "Demo App",
          prompt: "Build a demo",
        },
      },
    });
    canAccessPublicArtifactMock.mockReturnValue(true);

    const response = await GET(
      new NextRequest(
        "https://example.com/api/export/opaque_artifact_token?starter=1",
      ),
      { params: Promise.resolve({ messageId: "opaque_artifact_token" }) },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/zip");
    expect(prismaMock.message.findUnique).not.toHaveBeenCalled();
  });
});
