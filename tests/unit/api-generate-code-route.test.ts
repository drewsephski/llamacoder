import { beforeEach, describe, expect, it, vi } from "vitest";
import { FREE_MODEL } from "@/lib/constants";
import { buildChat, readJson } from "../fixtures/builders";

const {
  consumeCreditsForGenerationMock,
  checkCreditAvailabilityMock,
  releaseCreditHoldMock,
  reserveCreditHoldMock,
  generateFollowUpPromptsMock,
  generateTextMock,
  getSessionMock,
  prismaMock,
  saveMessageFollowUpPromptsMock,
  txMock,
} = vi.hoisted(() => ({
  consumeCreditsForGenerationMock: vi.fn(),
  checkCreditAvailabilityMock: vi.fn(),
  releaseCreditHoldMock: vi.fn(),
  reserveCreditHoldMock: vi.fn(),
  generateFollowUpPromptsMock: vi.fn(),
  generateTextMock: vi.fn(),
  getSessionMock: vi.fn(),
  saveMessageFollowUpPromptsMock: vi.fn(),
  txMock: {
    message: { create: vi.fn() },
    chat: { update: vi.fn() },
  },
  prismaMock: {
    chat: { findUnique: vi.fn(), updateMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("ai", () => ({
  generateText: generateTextMock,
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

vi.mock("@/lib/billing", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/billing")>();
  return {
    ...actual,
    checkCreditAvailability: checkCreditAvailabilityMock,
    consumeCreditsForGeneration: consumeCreditsForGenerationMock,
    releaseCreditHold: releaseCreditHoldMock,
    reserveCreditHold: reserveCreditHoldMock,
  };
});

vi.mock("@/lib/openrouter", () => ({
  GENERATED_CODE_MAX_TOKENS: 16000,
  createAppOpenRouter: vi.fn(() => vi.fn()),
  createOpenRouterModel: vi.fn(() => "openrouter-model"),
  getAIErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : String(error),
  getOpenRouterProviderOptions: vi.fn(() => ({
    openrouter: { reasoning: { enabled: false } },
  })),
  getOpenRouterUsageMetadata: vi.fn(() => null),
}));

vi.mock("@/lib/follow-up-prompts", () => ({
  generateFollowUpPrompts: generateFollowUpPromptsMock,
  saveMessageFollowUpPrompts: saveMessageFollowUpPromptsMock,
}));

import { POST } from "@/app/api/generate-code/route";

function request(body: Record<string, unknown>) {
  return new Request("http://localhost/api/generate-code", {
    method: "POST",
    body: JSON.stringify(body),
  }) as never;
}

const completeGeneratedApp = [
  "```tsx{path=App.tsx}",
  'import { Header } from "./components/Header";',
  'import { Footer } from "./components/Footer";',
  "export default function App() { return <><Header /><Footer /></>; }",
  "```",
  "```tsx{path=components/Header.tsx}",
  "export function Header() { return <header />; }",
  "```",
  "```tsx{path=components/Footer.tsx}",
  "export function Footer() { return <footer />; }",
  "```",
].join("\n");

const invalidImportGeneratedApp = [
  "```tsx{path=App.tsx}",
  'import { Footer } from "./components/Footer";',
  'import Header from "./components/Header";',
  "export default function App() { return <><Header /><Footer /></>; }",
  "```",
  "```tsx{path=components/Header.tsx}",
  "export function Header() { return <header />; }",
  "```",
  "```tsx{path=components/Footer.tsx}",
  "export default function Footer() { return <footer />; }",
  "```",
].join("\n");

describe("/api/generate-code", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback(txMock),
    );
    checkCreditAvailabilityMock.mockResolvedValue({
      success: true,
      creditsUsed: 1,
      remainingCredits: 5,
    });
    reserveCreditHoldMock.mockResolvedValue({
      success: true,
      holdId: "hold_1",
      creditsUsed: 1,
      remainingCredits: 4,
    });
    releaseCreditHoldMock.mockResolvedValue({ success: true });
    consumeCreditsForGenerationMock.mockResolvedValue({
      success: true,
      creditsUsed: 1,
      remainingCredits: 4,
    });
    prismaMock.chat.updateMany.mockResolvedValue({ count: 1 });
    generateFollowUpPromptsMock.mockResolvedValue([
      "Add keyboard shortcuts",
      "Polish the mobile layout",
      "Add realistic sample data",
    ]);
    txMock.message.create.mockResolvedValue({ id: "assistant_1" });
  });

  it("requires authentication", async () => {
    getSessionMock.mockResolvedValueOnce(null);

    const response = await POST(request({ chatId: "chat_1" }));

    expect(response.status).toBe(401);
    await expect(readJson(response)).resolves.toEqual({
      error: "Unauthorized",
    });
  });

  it("requires an approved plan before generating code", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "user_1" } });
    prismaMock.chat.findUnique.mockResolvedValueOnce(buildChat({ plan: null }));

    const response = await POST(request({ chatId: "chat_1" }));

    expect(response.status).toBe(400);
    await expect(readJson(response)).resolves.toEqual({
      error: "No plan found for this chat",
    });
  });

  it("persists generated assistant files and consumes credits in one transaction", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "user_1" } });
    prismaMock.chat.findUnique.mockResolvedValueOnce(buildChat());
    generateTextMock.mockResolvedValueOnce({ text: completeGeneratedApp });

    const response = await POST(request({ chatId: "chat_1" }));

    expect(response.status).toBe(200);
    await expect(readJson(response)).resolves.toEqual({
      success: true,
      messageId: "assistant_1",
    });
    expect(txMock.message.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        role: "assistant",
        chatId: "chat_1",
        position: 2,
        files: expect.arrayContaining([
          expect.objectContaining({ path: "App.tsx" }),
        ]),
      }),
    });
    expect(saveMessageFollowUpPromptsMock).toHaveBeenCalledWith(
      prismaMock,
      "assistant_1",
      [
        "Add keyboard shortcuts",
        "Polish the mobile layout",
        "Add realistic sample data",
      ],
    );
    expect(txMock.chat.update).toHaveBeenCalledWith({
      where: { id: "chat_1" },
      data: expect.objectContaining({ hasCode: true }),
    });
    expect(consumeCreditsForGenerationMock).toHaveBeenCalledWith({
      client: txMock,
      userId: "user_1",
      modelId: FREE_MODEL,
      chatId: "chat_1",
      description: "Code generation - Calculator",
      phase: "initial_generation",
      status: "completed",
      creditHoldId: "hold_1",
      tokensUsed: undefined,
      inputTokens: undefined,
      outputTokens: undefined,
      generatedText: expect.stringContaining("```tsx{path=App.tsx}"),
      providerCostUsd: undefined,
      upstreamInferenceCostUsd: undefined,
      reasoningTokens: undefined,
      provider: undefined,
    });
  });

  it("rejects before model execution when a credit hold cannot be reserved", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "user_1" } });
    prismaMock.chat.findUnique.mockResolvedValueOnce(buildChat());
    reserveCreditHoldMock.mockResolvedValueOnce({
      success: false,
      error: "INSUFFICIENT_CREDITS",
    });

    const response = await POST(request({ chatId: "chat_1" }));

    expect(response.status).toBe(402);
    expect(generateTextMock).not.toHaveBeenCalled();
    expect(prismaMock.chat.updateMany).toHaveBeenCalledWith({
      where: { id: "chat_1", generationStatus: "in_progress" },
      data: { generationStatus: "idle", generationStartedAt: null },
    });
  });

  it("repairs import/export mismatches before persisting generated files", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "user_1" } });
    prismaMock.chat.findUnique.mockResolvedValueOnce(buildChat());
    generateTextMock
      .mockResolvedValueOnce({ text: invalidImportGeneratedApp })
      .mockResolvedValueOnce({ text: completeGeneratedApp });

    const response = await POST(request({ chatId: "chat_1" }));

    expect(response.status).toBe(200);
    expect(generateTextMock).toHaveBeenCalledTimes(2);
    expect(generateTextMock.mock.calls[1][0].messages[1].content).toContain(
      'Named import "Footer" from "./components/Footer" is invalid',
    );
    expect(txMock.message.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        role: "assistant",
        files: expect.arrayContaining([
          expect.objectContaining({
            path: "App.tsx",
            code: expect.stringContaining(
              'import { Footer } from "./components/Footer";',
            ),
          }),
        ]),
      }),
    });
  });

  it("rejects unrepairable generated files before charging credits", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "user_1" } });
    prismaMock.chat.findUnique.mockResolvedValueOnce(buildChat());
    generateTextMock
      .mockResolvedValueOnce({ text: invalidImportGeneratedApp })
      .mockResolvedValueOnce({ text: invalidImportGeneratedApp });

    const response = await POST(request({ chatId: "chat_1" }));

    expect(response.status).toBe(502);
    await expect(readJson(response)).resolves.toMatchObject({
      error: "UNRUNNABLE_GENERATED_CODE",
      diagnostics: expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining('Named import "Footer"'),
        }),
      ]),
    });
    expect(txMock.message.create).not.toHaveBeenCalled();
    expect(consumeCreditsForGenerationMock).not.toHaveBeenCalled();
  });

  it("returns a payment error if credits disappear before transaction commit", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "user_1" } });
    prismaMock.chat.findUnique.mockResolvedValueOnce(buildChat());
    generateTextMock.mockResolvedValueOnce({ text: completeGeneratedApp });
    consumeCreditsForGenerationMock.mockResolvedValueOnce({
      success: false,
      error: "INSUFFICIENT_CREDITS",
    });

    const response = await POST(request({ chatId: "chat_1" }));

    expect(response.status).toBe(402);
    await expect(readJson(response)).resolves.toMatchObject({
      error: "INSUFFICIENT_CREDITS",
    });
  });
});
