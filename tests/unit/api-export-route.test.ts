import JSZip from "jszip";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildChat, buildMessage } from "../fixtures/builders";

const { getSessionMock, prismaMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  prismaMock: {
    message: { findUnique: vi.fn() },
    exportArtifact: { create: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: getSessionMock } },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => prismaMock,
}));

import { GET } from "@/app/api/export/[messageId]/route";

function sourceMessage() {
  return buildMessage({
    id: "assistant_1",
    role: "assistant",
    chatId: "chat_1",
    files: [
      {
        path: "App.tsx",
        code: "export default function App() { return <main />; }",
      },
      {
        path: "components/Card.tsx",
        code: "export function Card() { return <section />; }",
      },
      {
        path: "components/Header.tsx",
        code: "export function Header() { return <header />; }",
      },
    ],
    chat: buildChat({
      id: "chat_1",
      title: "Shared App",
      userId: "owner_1",
    }),
  });
}

describe("/api/export/[messageId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.message.findUnique.mockResolvedValue(sourceMessage());
  });

  it("serves public starter downloads without full generated source", async () => {
    const response = await GET(
      new Request("http://localhost/api/export/assistant_1?starter=1") as never,
      { params: Promise.resolve({ messageId: "assistant_1" }) },
    );
    const zip = await JSZip.loadAsync(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(Object.keys(zip.files)).toEqual(
      expect.arrayContaining(["README.md", "squid-starter.json"]),
    );
    expect(zip.files["App.tsx"]).toBeUndefined();
    expect(zip.files["components/Card.tsx"]).toBeUndefined();
  });

  it("rejects full exports for non-owners", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "other_user" } });

    const response = await GET(
      new Request("http://localhost/api/export/assistant_1") as never,
      { params: Promise.resolve({ messageId: "assistant_1" }) },
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "FORBIDDEN",
      message: "You can only export your own project",
    });
  });
});
