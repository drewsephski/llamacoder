import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildChat, buildMessage } from "../fixtures/builders";

const {
  checkCreditAvailabilityMock,
  consumeCreditsForGenerationMock,
  getSessionMock,
  notFoundMock,
  prismaMock,
  txMock,
} = vi.hoisted(() => ({
  checkCreditAvailabilityMock: vi.fn(),
  consumeCreditsForGenerationMock: vi.fn(),
  getSessionMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  txMock: {
    message: { create: vi.fn() },
    chat: { update: vi.fn() },
  },
  prismaMock: {
    $transaction: vi.fn(),
    chat: {
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    message: { create: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: getSessionMock } },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => prismaMock,
}));

vi.mock("@/lib/billing", () => ({
  checkCreditAvailability: checkCreditAvailabilityMock,
  consumeCreditsForGeneration: consumeCreditsForGenerationMock,
}));

import {
  createMessage,
  deleteProject,
  duplicateProject,
  renameProject,
  saveProject,
} from "@/app/(main)/actions";

describe("server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSessionMock.mockResolvedValue({ user: { id: "user_1" } });
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback(txMock),
    );
    checkCreditAvailabilityMock.mockResolvedValue({
      success: true,
      creditsUsed: 1,
      remainingCredits: 5,
    });
    consumeCreditsForGenerationMock.mockResolvedValue({
      success: true,
      creditsUsed: 1,
      remainingCredits: 4,
    });
    txMock.message.create.mockResolvedValue({ id: "assistant_1" });
    prismaMock.message.create.mockResolvedValue({ id: "user_msg_2" });
  });

  it("requires auth before creating messages", async () => {
    getSessionMock.mockResolvedValueOnce(null);

    await expect(createMessage("chat_1", "hello", "user")).rejects.toThrow(
      "You must be signed in to send messages",
    );
    expect(prismaMock.chat.findUnique).not.toHaveBeenCalled();
  });

  it("enforces chat ownership", async () => {
    prismaMock.chat.findUnique.mockResolvedValueOnce(
      buildChat({ userId: "other_user", messages: [] }),
    );

    await expect(createMessage("chat_1", "hello", "user")).rejects.toThrow(
      "You can only add messages to your own projects",
    );
  });

  it("checks follow-up user credit availability without consuming credits", async () => {
    prismaMock.chat.findUnique.mockResolvedValueOnce(
      buildChat({
        messages: [
          buildMessage({ position: 0, role: "system" }),
          buildMessage({ position: 1, role: "user" }),
        ],
      }),
    );

    await createMessage("chat_1", "change the colors", "user");

    expect(checkCreditAvailabilityMock).toHaveBeenCalledWith({
      userId: "user_1",
      modelId: "tencent/hy3-preview:free",
    });
    expect(consumeCreditsForGenerationMock).not.toHaveBeenCalled();
    expect(prismaMock.message.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        role: "user",
        position: 2,
      }),
    });
  });

  it("normalizes assistant files, marks the chat as code-bearing, then consumes credits", async () => {
    prismaMock.chat.findUnique.mockResolvedValueOnce(
      buildChat({
        messages: [
          buildMessage({ position: 0, role: "system" }),
          buildMessage({ position: 1, role: "user" }),
        ],
      }),
    );

    await createMessage("chat_1", "done", "assistant", [
      {
        path: "App.tsx",
        code: "export default function App() { return <main />; }",
      },
      { path: "components/One.tsx", code: "export function One() { return null; }" },
    ]);

    expect(txMock.message.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        role: "assistant",
        files: expect.arrayContaining([expect.objectContaining({ path: "App.tsx" })]),
        position: 2,
      }),
    });
    expect(txMock.chat.update).toHaveBeenCalledWith({
      where: { id: "chat_1" },
      data: { hasCode: true },
    });
    expect(consumeCreditsForGenerationMock).toHaveBeenCalledWith({
      client: txMock,
      userId: "user_1",
      modelId: "tencent/hy3-preview:free",
      chatId: "chat_1",
      description: "AI generation - tencent/hy3-preview:free",
      status: "completed",
    });
  });

  it("enforces save, rename, delete, and duplicate project constraints", async () => {
    prismaMock.chat.findUnique.mockResolvedValueOnce(buildChat({ userId: null }));
    prismaMock.chat.update.mockResolvedValueOnce(buildChat({ userId: "user_1" }));
    await expect(saveProject("chat_1")).resolves.toMatchObject({ userId: "user_1" });

    prismaMock.chat.findUnique.mockResolvedValueOnce(buildChat({ userId: "user_1" }));
    prismaMock.chat.update.mockResolvedValueOnce(buildChat({ title: "Renamed" }));
    await expect(renameProject("chat_1", "Renamed")).resolves.toMatchObject({
      title: "Renamed",
    });

    prismaMock.chat.findUnique.mockResolvedValueOnce(buildChat({ userId: "user_1" }));
    await expect(deleteProject("chat_1")).resolves.toBeUndefined();
    expect(prismaMock.chat.delete).toHaveBeenCalledWith({ where: { id: "chat_1" } });

    prismaMock.chat.findUnique.mockResolvedValueOnce(
      buildChat({
        userId: "user_1",
        messages: [buildMessage({ id: "msg_1", files: [{ path: "App.tsx" }] })],
      }),
    );
    prismaMock.chat.create.mockResolvedValueOnce(buildChat({ id: "chat_copy" }));

    await expect(duplicateProject("chat_1")).resolves.toMatchObject({
      id: "chat_copy",
    });
    expect(prismaMock.chat.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: "Calculator (copy)",
        userId: "user_1",
        messages: {
          create: [
            expect.objectContaining({
              role: "user",
              files: [{ path: "App.tsx" }],
            }),
          ],
        },
      }),
    });
  });
});
