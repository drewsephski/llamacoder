import { beforeEach, describe, expect, it, vi } from "vitest";
import { FREE_MODEL } from "@/lib/constants";
import { buildChat, buildMessage } from "../fixtures/builders";
import { getAuthenticatedTasksBackendPlan } from "@/features/integrations/supabase-backend";

const {
  checkCreditAvailabilityMock,
  consumeCreditsForGenerationMock,
  getModelCreditHoldCostMock,
  generateFollowUpPromptsMock,
  getModelCreditCostMock,
  getSessionMock,
  notFoundMock,
  prismaMock,
  revalidatePathMock,
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
  revalidatePathMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  saveMessageFollowUpPromptsMock: vi.fn(),
  txMock: {
    $executeRaw: vi.fn(),
    message: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    chat: { update: vi.fn() },
    generationLog: { create: vi.fn() },
    generationRun: { findFirst: vi.fn(), updateMany: vi.fn() },
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
    projectIntegration: { findMany: vi.fn() },
    creditHold: { findUnique: vi.fn() },
    generationRun: { updateMany: vi.fn() },
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

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
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
  createValidationRepairMessage,
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
    txMock.message.findMany.mockResolvedValue([]);
    txMock.message.findFirst.mockResolvedValue(null);
    txMock.message.update.mockResolvedValue({});
    txMock.generationRun.findFirst.mockResolvedValue(null);
    txMock.generationRun.updateMany.mockResolvedValue({ count: 1 });
    txMock.generationLog.create.mockResolvedValue({});
    prismaMock.message.create.mockResolvedValue({ id: "user_msg_2" });
    prismaMock.projectIntegration.findMany.mockResolvedValue([]);
    prismaMock.generationRun.updateMany.mockResolvedValue({ count: 1 });
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
      "You do not have access to this project",
    );
  });

  it("checks follow-up user credit availability without consuming credits", async () => {
    const messages = [
      buildMessage({ position: 0, role: "system" }),
      buildMessage({ position: 1, role: "user" }),
    ];
    prismaMock.chat.findUnique.mockResolvedValueOnce(
      buildChat({
        messages,
      }),
    );
    txMock.message.findMany.mockResolvedValueOnce(messages);

    await createMessage("chat_1", "change the colors", "user");

    expect(checkCreditAvailabilityMock).toHaveBeenCalledWith({
      userId: "user_1",
      modelId: FREE_MODEL,
    });
    expect(consumeCreditsForGenerationMock).not.toHaveBeenCalled();
    expect(txMock.message.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        role: "user",
        position: 2,
      }),
    });
  });

  it("supersedes a pending backend continuation when a newer build replaces it", async () => {
    const setupMessage = buildMessage({
      id: "setup_message",
      position: 2,
      role: "assistant",
      files: {
        kind: "agent_backend_setup_request",
        request: {
          id: "setup_1",
          title: "Connect a backend before Squid builds",
          description: "This app needs Supabase.",
          capabilities: ["Persistent data"],
          requirements: {
            database: true,
            authentication: true,
            storage: false,
            realtime: false,
            privilegedServerLogic: false,
            backendTemplate: "authenticated_tasks",
          },
          continuation: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            originalMessageId: "user_1",
            originalUserRequest: "Build a task manager",
            mode: "direct",
            status: "pending",
          },
        },
      },
    });
    const messages = [
      buildMessage({ position: 0, role: "system" }),
      buildMessage({ position: 1, role: "user" }),
      setupMessage,
    ];
    prismaMock.chat.findUnique.mockResolvedValueOnce(buildChat({ messages }));
    txMock.message.findMany.mockResolvedValueOnce(messages);

    await createMessage("chat_1", "Make it a shared CRM instead", "user");

    expect(txMock.message.update).toHaveBeenCalledWith({
      where: { id: "setup_message" },
      data: {
        files: expect.objectContaining({
          request: expect.objectContaining({
            continuation: expect.objectContaining({ status: "superseded" }),
          }),
        }),
      },
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
      messageId: "assistant_1",
      description: `AI generation - ${FREE_MODEL}`,
      phase: "follow_up",
      status: "completed",
      generatedText: "done",
      creditHoldId: undefined,
    });
  });

  it("rejects generated apps that omit a selected browser API contract", async () => {
    prismaMock.chat.findUnique.mockResolvedValueOnce(
      buildChat({
        messages: [
          buildMessage({ position: 0, role: "system" }),
          buildMessage({ position: 1, role: "user" }),
        ],
      }),
    );
    prismaMock.projectIntegration.findMany.mockResolvedValueOnce([
      { providerId: "frankfurter" },
    ]);

    await expect(
      createMessage(
        "chat_1",
        "done",
        "assistant",
        [
          {
            path: "App.tsx",
            code: "export default function App() { return <main />; }",
          },
          {
            path: "components/One.tsx",
            code: "export function One() { return null; }",
          },
        ],
        { creditHoldId: "hold_1", generationRunId: "run_1" },
      ),
    ).rejects.toThrow("SELECTED_API_CONTRACT_VIOLATION");

    expect(releaseCreditHoldMock).not.toHaveBeenCalled();
    expect(prismaMock.generationRun.updateMany).toHaveBeenCalledWith({
      where: { id: "run_1", chatId: "chat_1", userId: "user_1" },
      data: expect.objectContaining({
        status: "recoverable",
        phase: "validation_repair",
      }),
    });
    expect(txMock.message.create).not.toHaveBeenCalled();
  });

  it("rejects incomplete generated apps once authenticated_tasks is verified", async () => {
    prismaMock.chat.findUnique.mockResolvedValueOnce(
      buildChat({
        messages: [
          buildMessage({ position: 0, role: "system" }),
          buildMessage({ position: 1, role: "user" }),
        ],
      }),
    );
    prismaMock.projectIntegration.findMany.mockResolvedValueOnce([
      {
        providerId: "supabase",
        config: {
          supabaseBackend: {
            status: "ready",
            plan: getAuthenticatedTasksBackendPlan(),
            verifiedAt: "2026-07-21T00:00:00.000Z",
            verification: {
              table: true,
              columns: true,
              rowLevelSecurity: true,
              authenticatedGrants: true,
              ownershipPolicies: true,
              anonAccessRevoked: true,
            },
          },
        },
      },
    ]);

    await expect(
      createMessage(
        "chat_1",
        "done",
        "assistant",
        [
          {
            path: "App.tsx",
            code: 'import { supabase } from "@/lib/supabase"; export default function App() { return <main>{String(Boolean(supabase))}</main>; }',
          },
          {
            path: "integrations.ts",
            code: 'export const integrations = [{ providerId: "supabase" }];',
          },
        ],
        { creditHoldId: "hold_1", generationRunId: "run_1" },
      ),
    ).rejects.toThrow(
      "Verified Supabase authenticated_tasks app is incomplete",
    );
    expect(releaseCreditHoldMock).not.toHaveBeenCalled();
    expect(txMock.message.create).not.toHaveBeenCalled();
  });

  it("creates one hidden bounded contract repair request without releasing the original hold", async () => {
    prismaMock.chat.findUnique.mockResolvedValueOnce(
      buildChat({
        messages: [
          buildMessage({ id: "system_1", position: 0, role: "system" }),
          buildMessage({ id: "user_1", position: 1, role: "user" }),
        ],
      }),
    );
    prismaMock.projectIntegration.findMany.mockResolvedValueOnce([
      { providerId: "frankfurter", config: {} },
    ]);
    txMock.generationRun.findFirst.mockResolvedValueOnce({
      id: "run_1",
      messageId: "user_1",
      creditHoldId: "hold_1",
      status: "recoverable",
    });
    txMock.message.findFirst.mockResolvedValueOnce({ files: null });
    txMock.message.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ position: 0 }, { position: 1 }]);
    txMock.message.create.mockResolvedValueOnce({ id: "contract_repair_1" });

    await expect(
      createValidationRepairMessage("chat_1", "run_1", [
        {
          path: "App.tsx",
          code: "export default function App() { return <main />; }",
        },
      ]),
    ).resolves.toEqual({
      kind: "created",
      id: "contract_repair_1",
      attempt: 1,
    });

    expect(txMock.message.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        role: "user",
        content: expect.stringContaining("Attempt 1 of 2"),
        files: expect.objectContaining({
          kind: "contract_repair",
          chargeCredits: false,
          rootGenerationRunId: "run_1",
          sourceRunId: "run_1",
          attempt: 1,
          maxAttempts: 2,
          draftFiles: expect.arrayContaining([
            expect.objectContaining({ path: "App.tsx" }),
          ]),
          diagnostics: expect.arrayContaining([expect.any(String)]),
          usedAt: null,
        }),
        position: 2,
        chatId: "chat_1",
      }),
      select: { id: true },
    });
    expect(releaseCreditHoldMock).not.toHaveBeenCalled();
  });

  it("deduplicates a repair source and releases the root hold only after the bounded attempts are exhausted", async () => {
    const baseChat = buildChat({
      messages: [buildMessage({ id: "user_1", position: 1, role: "user" })],
    });
    prismaMock.chat.findUnique
      .mockResolvedValueOnce(baseChat)
      .mockResolvedValueOnce(baseChat);
    prismaMock.projectIntegration.findMany.mockResolvedValue([
      { providerId: "frankfurter", config: {} },
    ]);
    const existingRepair = {
      kind: "contract_repair",
      chargeCredits: false,
      rootGenerationRunId: "run_source",
      sourceRunId: "run_source",
      attempt: 1,
      maxAttempts: 2,
      draftFiles: [{ path: "App.tsx", code: "export default 1" }],
      diagnostics: ["Missing selected API usage"],
      usedAt: null,
    };

    txMock.generationRun.findFirst.mockResolvedValueOnce({
      id: "run_source",
      messageId: "user_1",
      creditHoldId: "hold_1",
      status: "recoverable",
    });
    txMock.message.findFirst.mockResolvedValueOnce({ files: null });
    txMock.message.findMany.mockResolvedValueOnce([
      { id: "repair_1", position: 2, files: existingRepair },
    ]);

    await expect(
      createValidationRepairMessage("chat_1", "run_source", [
        { path: "App.tsx", code: "export default 1" },
      ]),
    ).resolves.toEqual({ kind: "created", id: "repair_1", attempt: 1 });
    expect(txMock.message.create).not.toHaveBeenCalled();

    const exhaustedRepairOne = {
      ...existingRepair,
      rootGenerationRunId: "run_root",
      sourceRunId: "run_first",
    };
    const exhaustedRepairTwo = {
      ...existingRepair,
      rootGenerationRunId: "run_root",
      sourceRunId: "run_second",
      attempt: 2,
    };
    txMock.generationRun.findFirst
      .mockResolvedValueOnce({
        id: "run_third",
        messageId: "repair_2",
        creditHoldId: null,
        status: "recoverable",
      })
      .mockResolvedValueOnce({
        id: "run_root",
        messageId: "user_1",
        creditHoldId: "hold_1",
        status: "recoverable",
      });
    txMock.message.findFirst.mockResolvedValueOnce({
      files: exhaustedRepairTwo,
    });
    txMock.message.findMany.mockResolvedValueOnce([
      { id: "repair_1", position: 2, files: exhaustedRepairOne },
      { id: "repair_2", position: 3, files: exhaustedRepairTwo },
    ]);

    await expect(
      createValidationRepairMessage("chat_1", "run_third", [
        { path: "App.tsx", code: "export default 1" },
      ]),
    ).rejects.toThrow("after two attempts");
    expect(releaseCreditHoldMock).toHaveBeenCalledTimes(1);
    expect(releaseCreditHoldMock).toHaveBeenCalledWith({ holdId: "hold_1" });
    expect(txMock.generationRun.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["run_root", "run_third"] } },
      data: expect.objectContaining({
        status: "failed",
        phase: "validation_failed",
      }),
    });
  });

  it("persists a validated contract repair and consumes the original hold exactly once", async () => {
    const contractMetadata = {
      kind: "contract_repair",
      chargeCredits: false,
      rootGenerationRunId: "run_root",
      sourceRunId: "run_1",
      attempt: 1,
      maxAttempts: 2,
      draftFiles: [
        {
          path: "App.tsx",
          code: "export default function App() { return null; }",
        },
      ],
      diagnostics: ["Missing required generated behavior"],
      usedAt: null,
    };
    prismaMock.chat.findUnique.mockResolvedValueOnce(
      buildChat({
        messages: [
          buildMessage({ position: 0, role: "system" }),
          buildMessage({
            id: "contract_repair_1",
            position: 2,
            role: "user",
            files: contractMetadata,
          }),
        ],
      }),
    );
    txMock.generationRun.findFirst.mockResolvedValueOnce({
      id: "run_root",
      messageId: "user_original",
      creditHoldId: "hold_1",
    });
    txMock.message.findFirst.mockResolvedValueOnce({ files: null });
    txMock.message.create.mockResolvedValueOnce({ id: "assistant_repaired" });

    await createFreeRepairAssistantMessage(
      "chat_1",
      "contract_repair_1",
      "fixed",
      [
        {
          path: "App.tsx",
          code: "export default function App() { return <main />; }",
        },
      ],
      { generationRunId: "run_repair" },
    );

    expect(consumeCreditsForGenerationMock).toHaveBeenCalledTimes(1);
    expect(consumeCreditsForGenerationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        client: txMock,
        chatId: "chat_1",
        messageId: "assistant_repaired",
        creditHoldId: "hold_1",
        phase: "validation_repair",
      }),
    );
    expect(txMock.generationLog.create).not.toHaveBeenCalled();
    expect(txMock.generationRun.updateMany).toHaveBeenCalledWith({
      where: { id: "run_root", chatId: "chat_1", userId: "user_1" },
      data: expect.objectContaining({
        status: "completed",
        assistantMessageId: "assistant_repaired",
      }),
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

  it("allows another free preview repair for the same source version", async () => {
    prismaMock.chat.findUnique.mockResolvedValueOnce(
      buildChat({
        messages: [
          buildMessage({ position: 0, role: "system" }),
          buildMessage({
            id: "assistant_1",
            position: 1,
            role: "assistant",
            files: [{ path: "App.tsx", code: "export default 1" }],
          }),
          buildMessage({
            id: "repair_user_1",
            position: 2,
            role: "user",
            files: {
              kind: "preview_repair_request",
              chargeCredits: false,
              sourceMessageId: "assistant_1",
              usedAt: "2026-07-10T18:00:00.000Z",
            },
          }),
        ],
      }),
    );

    prismaMock.message.create.mockResolvedValueOnce({ id: "repair_user_2" });

    await expect(
      createPreviewRepairMessage("chat_1", "ReferenceError: x is not defined"),
    ).resolves.toEqual({ id: "repair_user_2" });
    expect(prismaMock.message.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        role: "user",
        files: expect.objectContaining({
          kind: "preview_repair",
          chargeCredits: false,
          sourceMessageId: "assistant_1",
          usedAt: null,
        }),
        position: 3,
        chatId: "chat_1",
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
    expect(revalidatePathMock).toHaveBeenCalledWith("/gallery");

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
