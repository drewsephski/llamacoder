import { beforeEach, describe, expect, it, vi } from "vitest";
import { FREE_MODEL } from "@/lib/constants";
import { buildChat, buildMessage } from "../fixtures/builders";

const {
  checkCreditAvailabilityMock,
  consumeCreditsForGenerationMock,
  getModelCreditHoldCostMock,
  generateFollowUpPromptsMock,
  getModelCreditCostMock,
  getSessionMock,
  notFoundMock,
  prismaMock,
  releaseCreditHoldMock,
  saveMessageFollowUpPromptsMock,
  txMock,
} = vi.hoisted(() => ({
  checkCreditAvailabilityMock: vi.fn(),
  consumeCreditsForGenerationMock: vi.fn(),
  getModelCreditHoldCostMock: vi.fn(() => 1),
  generateFollowUpPromptsMock: vi.fn(),
  getModelCreditCostMock: vi.fn(() => 1),
  getSessionMock: vi.fn(),
  releaseCreditHoldMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  saveMessageFollowUpPromptsMock: vi.fn(),
  txMock: {
    message: { create: vi.fn(), update: vi.fn() },
    chat: { update: vi.fn() },
    generationLog: { create: vi.fn() },
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
    creditHold: { findUnique: vi.fn() },
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
  getModelCreditCost: getModelCreditCostMock,
  getModelCreditHoldCost: getModelCreditHoldCostMock,
  releaseCreditHold: releaseCreditHoldMock,
}));

vi.mock("@/lib/follow-up-prompts", () => ({
  generateFollowUpPrompts: generateFollowUpPromptsMock,
  saveMessageFollowUpPrompts: saveMessageFollowUpPromptsMock,
}));

import {
  createFreeRepairAssistantMessage,
  createMessage,
  createPreviewRepairMessage,
  deleteProject,
  duplicateProject,
  renameProject,
  restoreVersionAsCheckpoint,
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
    generateFollowUpPromptsMock.mockResolvedValue([
      "Polish the calculator UI",
      "Add realistic calculator data",
      "Make the calculator mobile-ready",
    ]);
    txMock.message.create.mockResolvedValue({ id: "assistant_1" });
    txMock.message.update.mockResolvedValue({});
    txMock.generationLog.create.mockResolvedValue({});
    prismaMock.message.create.mockResolvedValue({ id: "user_msg_2" });
    releaseCreditHoldMock.mockResolvedValue({ success: true });
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
      modelId: FREE_MODEL,
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
      {
        path: "components/One.tsx",
        code: "export function One() { return null; }",
      },
    ]);

    expect(txMock.message.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        role: "assistant",
        files: expect.arrayContaining([
          expect.objectContaining({ path: "App.tsx" }),
        ]),
        position: 2,
      }),
    });
    expect(saveMessageFollowUpPromptsMock).toHaveBeenCalledWith(
      prismaMock,
      "assistant_1",
      [
        "Polish the calculator UI",
        "Add realistic calculator data",
        "Make the calculator mobile-ready",
      ],
    );
    expect(txMock.chat.update).toHaveBeenCalledWith({
      where: { id: "chat_1" },
      data: { hasCode: true },
    });
    expect(consumeCreditsForGenerationMock).toHaveBeenCalledWith({
      client: txMock,
      userId: "user_1",
      modelId: FREE_MODEL,
      chatId: "chat_1",
      description: `AI generation - ${FREE_MODEL}`,
      phase: "follow_up",
      status: "completed",
      generatedText: "done",
    });
  });

  it("creates preview repair messages and saves the matching repair response without charging credits", async () => {
    prismaMock.chat.findUnique
      .mockResolvedValueOnce(
        buildChat({
          messages: [
            buildMessage({ position: 0, role: "system" }),
            buildMessage({ position: 1, role: "user" }),
            buildMessage({
              id: "assistant_1",
              position: 2,
              role: "assistant",
              files: [
                {
                  path: "App.tsx",
                  code: "export default function App() { return null; }",
                },
              ],
            }),
          ],
        }),
      )
      .mockResolvedValueOnce(
        buildChat({
          messages: [
            buildMessage({ position: 0, role: "system" }),
            buildMessage({ position: 1, role: "user" }),
            buildMessage({
              id: "repair_user_1",
              position: 3,
              role: "user",
              files: {
                kind: "preview_repair_request",
                chargeCredits: false,
                sourceMessageId: "assistant_1",
                usedAt: null,
              },
            }),
          ],
        }),
      );
    prismaMock.message.create.mockResolvedValueOnce({ id: "repair_user_1" });

    await expect(
      createPreviewRepairMessage("chat_1", "ReferenceError: x is not defined"),
    ).resolves.toEqual({ id: "repair_user_1" });

    await createFreeRepairAssistantMessage("chat_1", "repair_user_1", "fixed", [
      {
        path: "App.tsx",
        code: "export default function App() { return <main />; }",
      },
    ]);

    expect(consumeCreditsForGenerationMock).not.toHaveBeenCalled();
    expect(txMock.message.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        role: "assistant",
        files: expect.arrayContaining([
          expect.objectContaining({ path: "App.tsx" }),
        ]),
      }),
    });
    expect(saveMessageFollowUpPromptsMock).toHaveBeenCalledWith(
      prismaMock,
      "assistant_1",
      [
        "Polish the calculator UI",
        "Add realistic calculator data",
        "Make the calculator mobile-ready",
      ],
    );
    expect(txMock.message.update).toHaveBeenCalledWith({
      where: { id: "repair_user_1" },
      data: {
        files: expect.objectContaining({
          kind: "preview_repair_request",
          chargeCredits: false,
          sourceMessageId: "assistant_1",
          usedAt: expect.any(String),
        }),
      },
    });
    expect(txMock.generationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        creditsUsed: 0,
        actualCredits: 0,
        phase: "preview_repair",
        status: "free_repair",
      }),
    });
  });

  it("restores an old assistant version as a new checkpoint without charging credits", async () => {
    prismaMock.chat.findUnique.mockResolvedValueOnce(
      buildChat({
        messages: [
          buildMessage({ position: 0, role: "system" }),
          buildMessage({ position: 1, role: "user" }),
          buildMessage({
            id: "assistant_old",
            position: 2,
            role: "assistant",
            files: [
              {
                path: "App.tsx",
                code: "export default function App() { return <main />; }",
              },
            ],
          }),
        ],
      }),
    );
    prismaMock.message.create.mockResolvedValueOnce({ id: "restored_1" });

    await expect(
      restoreVersionAsCheckpoint({
        chatId: "chat_1",
        sourceMessageId: "assistant_old",
        oldVersion: 1,
        newVersion: 3,
      }),
    ).resolves.toEqual({ id: "restored_1" });

    expect(consumeCreditsForGenerationMock).not.toHaveBeenCalled();
    expect(prismaMock.message.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        role: "assistant",
        content: expect.stringContaining("restoring version 1"),
        files: expect.arrayContaining([
          expect.objectContaining({ path: "App.tsx" }),
        ]),
      }),
    });
    expect(prismaMock.chat.update).toHaveBeenCalledWith({
      where: { id: "chat_1" },
      data: { hasCode: true },
    });
  });

  it("enforces save, rename, delete, and duplicate project constraints", async () => {
    prismaMock.chat.findUnique.mockResolvedValueOnce(
      buildChat({ userId: null }),
    );
    prismaMock.chat.update.mockResolvedValueOnce(
      buildChat({ userId: "user_1" }),
    );
    await expect(saveProject("chat_1")).resolves.toMatchObject({
      userId: "user_1",
    });

    prismaMock.chat.findUnique.mockResolvedValueOnce(
      buildChat({ userId: "user_1" }),
    );
    prismaMock.chat.update.mockResolvedValueOnce(
      buildChat({ title: "Renamed" }),
    );
    await expect(renameProject("chat_1", "Renamed")).resolves.toMatchObject({
      title: "Renamed",
    });

    prismaMock.chat.findUnique.mockResolvedValueOnce(
      buildChat({ userId: "user_1" }),
    );
    await expect(deleteProject("chat_1")).resolves.toBeUndefined();
    expect(prismaMock.chat.delete).toHaveBeenCalledWith({
      where: { id: "chat_1" },
    });

    prismaMock.chat.findUnique.mockResolvedValueOnce(
      buildChat({
        userId: "user_1",
        messages: [buildMessage({ id: "msg_1", files: [{ path: "App.tsx" }] })],
      }),
    );
    prismaMock.chat.create.mockResolvedValueOnce(
      buildChat({ id: "chat_copy" }),
    );

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
