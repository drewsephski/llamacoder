import { beforeEach, describe, expect, it, vi } from "vitest";
import { FREE_MODEL } from "@/lib/constants";
import { buildChat, readJson } from "../fixtures/builders";

const {
  consumeCreditsForGenerationMock,
  checkCreditAvailabilityMock,
  generateTextMock,
  getSessionMock,
  prismaMock,
  txMock,
} = vi.hoisted(() => ({
  consumeCreditsForGenerationMock: vi.fn(),
  checkCreditAvailabilityMock: vi.fn(),
  generateTextMock: vi.fn(),
  getSessionMock: vi.fn(),
  txMock: {
    message: { create: vi.fn() },
    chat: { update: vi.fn() },
  },
  prismaMock: {
    chat: { findUnique: vi.fn() },
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
  };
});

vi.mock("@/lib/openrouter", () => ({
  GENERATED_CODE_MAX_TOKENS: 16000,
  createAppOpenRouter: vi.fn(() => vi.fn()),
  createOpenRouterModel: vi.fn(() => "openrouter-model"),
  getAIErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : String(error),
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
    consumeCreditsForGenerationMock.mockResolvedValue({
      success: true,
      creditsUsed: 1,
      remainingCredits: 4,
    });
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
    expect(txMock.chat.update).toHaveBeenCalledWith({
      where: { id: "chat_1" },
      data: { hasCode: true },
    });
    expect(consumeCreditsForGenerationMock).toHaveBeenCalledWith({
      client: txMock,
      userId: "user_1",
      modelId: FREE_MODEL,
      chatId: "chat_1",
      description: "Code generation - Calculator",
      status: "plan_approved",
    });
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
