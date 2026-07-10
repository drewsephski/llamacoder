import {
  parseJsonEventStream,
  uiMessageChunkSchema,
  type UIMessageChunk,
} from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildMessage } from "../fixtures/builders";

const {
  createRequestTelemetryMock,
  generateTextMock,
  getModelCreditHoldCostMock,
  getSessionMock,
  prismaMock,
  releaseCreditHoldMock,
  reserveCreditHoldMock,
  streamTextMock,
  telemetryMock,
} = vi.hoisted(() => ({
  createRequestTelemetryMock: vi.fn(),
  generateTextMock: vi.fn(),
  getModelCreditHoldCostMock: vi.fn((model: string) =>
    model === "google/gemini-3-flash-preview" ? 6 : 10,
  ),
  getSessionMock: vi.fn(),
  releaseCreditHoldMock: vi.fn(),
  reserveCreditHoldMock: vi.fn(),
  streamTextMock: vi.fn(),
  telemetryMock: {
    markFirstByte: vi.fn(),
    markChunk: vi.fn(),
    record: vi.fn(),
  },
  prismaMock: {
    message: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: getSessionMock } },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();
  return {
    ...actual,
    generateText: generateTextMock,
    streamText: streamTextMock,
  };
});

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => prismaMock,
}));

vi.mock("@/features/generation/server/request-telemetry", () => ({
  createRequestTelemetry: createRequestTelemetryMock,
}));

vi.mock("@/lib/billing", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/billing")>();
  return {
    ...actual,
    getModelCreditHoldCost: getModelCreditHoldCostMock,
    releaseCreditHold: releaseCreditHoldMock,
    reserveCreditHold: reserveCreditHoldMock,
  };
});

vi.mock("@/lib/openrouter", () => ({
  GENERATED_CODE_MAX_TOKENS: 16000,
  VISION_ANALYSIS_MODEL: "google/gemini-3-flash-preview",
  createAppOpenRouter: vi.fn(() => vi.fn()),
  createOpenRouterModel: vi.fn(() => "openrouter-model"),
  getAIErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : String(error),
  getAIErrorStatus: () => 502,
  getOpenRouterProviderOptions: vi.fn(() => ({
    openrouter: { reasoning: { enabled: false } },
  })),
  getOpenRouterReasoningSelection: vi.fn(() => ({
    enabled: false,
    visible: false,
    mandatory: false,
    effort: "none",
    providerOptions: {
      openrouter: { reasoning: { enabled: false } },
    },
  })),
}));

import { POST } from "@/app/api/get-next-completion-stream-promise/route";

function request(body: unknown) {
  return new Request(
    "http://localhost/api/get-next-completion-stream-promise",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

function uiStream(events: UIMessageChunk[]) {
  return new ReadableStream<UIMessageChunk>({
    start(controller) {
      events.forEach((event) => controller.enqueue(event));
      controller.close();
    },
  });
}

function mockGeneration({
  text,
  reasoning,
}: {
  text: string;
  reasoning?: string;
}) {
  const events: UIMessageChunk[] = [
    ...(reasoning
      ? ([
          { type: "reasoning-start", id: "reasoning_1" },
          {
            type: "reasoning-delta",
            id: "reasoning_1",
            delta: reasoning,
          },
          { type: "reasoning-end", id: "reasoning_1" },
        ] satisfies UIMessageChunk[])
      : []),
    { type: "text-start", id: "text_1" },
    { type: "text-delta", id: "text_1", delta: text },
    { type: "text-end", id: "text_1" },
  ];
  const toUIMessageStream = vi.fn(() => uiStream(events));
  streamTextMock.mockReturnValueOnce({ toUIMessageStream });
  return toUIMessageStream;
}

async function collectUIChunks(response: Response) {
  if (!response.body) throw new Error("Missing response body");

  const parsedStream = parseJsonEventStream({
    stream: response.body,
    schema: uiMessageChunkSchema,
  });
  const chunks: UIMessageChunk[] = [];
  const reader = parsedStream.getReader();

  while (true) {
    const { done, value: result } = await reader.read();
    if (done) break;
    if (!result.success) throw result.error;
    chunks.push(result.value);
  }

  return chunks;
}

describe("/api/get-next-completion-stream-promise", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSessionMock.mockResolvedValue({ user: { id: "user_1" } });
    reserveCreditHoldMock.mockResolvedValue({
      success: true,
      holdId: "hold_1",
      creditsUsed: 1,
      remainingCredits: 4,
    });
    releaseCreditHoldMock.mockResolvedValue({ success: true });
    createRequestTelemetryMock.mockReturnValue(telemetryMock);
    telemetryMock.record.mockResolvedValue(undefined);
    prismaMock.message.update.mockResolvedValue({});
  });

  it("rejects invalid requests and missing messages", async () => {
    let response = await POST(request({ messageId: "", model: "" }));
    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe("Invalid request");

    prismaMock.message.findUnique.mockResolvedValueOnce(null);
    response = await POST(request({ messageId: "msg_1", model: "model_1" }));
    expect(response.status).toBe(404);
    await expect(response.text()).resolves.toBe("Message not found");
  });

  it("requires authentication", async () => {
    getSessionMock.mockResolvedValueOnce(null);
    const response = await POST(
      request({ messageId: "msg_1", model: "model_1" }),
    );

    expect(response.status).toBe(401);
    await expect(response.text()).resolves.toBe("Unauthorized");
  });

  it("rejects requests for chats the session does not own", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "user_2" } });
    prismaMock.message.findUnique.mockResolvedValueOnce(
      buildMessage({
        id: "msg_12",
        chatId: "chat_1",
        position: 12,
        chat: {
          id: "chat_1",
          userId: "user_1",
          model: "model_1",
          quality: "low",
        },
      }),
    );

    const response = await POST(
      request({ messageId: "msg_12", model: "model_1" }),
    );

    expect(response.status).toBe(403);
    await expect(response.text()).resolves.toBe("Forbidden");
  });

  it("fails when the client model does not match the chat model", async () => {
    prismaMock.message.findUnique.mockResolvedValueOnce(
      buildMessage({
        id: "msg_12",
        chatId: "chat_1",
        position: 12,
        chat: {
          id: "chat_1",
          userId: "user_1",
          model: "stored-model",
          quality: "low",
        },
      }),
    );

    const response = await POST(
      request({ messageId: "msg_12", model: "wrong-model" }),
    );

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe("Model mismatch");
  });

  it("streams structured reasoning and text while preserving message guards", async () => {
    prismaMock.message.findUnique.mockResolvedValueOnce(
      buildMessage({
        id: "msg_12",
        chatId: "chat_1",
        position: 12,
        chat: {
          id: "chat_1",
          userId: "user_1",
          model: "model_1",
          quality: "high",
        },
      }),
    );
    prismaMock.message.findMany.mockResolvedValueOnce([
      { role: "system", content: "system" },
      { role: "user", content: "first user" },
      { role: "assistant", content: "```tsx\nold code\n```" },
      { role: "user", content: "second user" },
      { role: "assistant", content: "assistant 2" },
      { role: "user", content: "third user" },
      { role: "assistant", content: "assistant 3" },
      { role: "user", content: "fourth user" },
      { role: "assistant", content: "assistant 4" },
      { role: "user", content: "fifth user" },
      { role: "assistant", content: "assistant 5" },
      { role: "user", content: "final user" },
    ]);
    const toUIMessageStream = mockGeneration({
      reasoning: "I will plan the component structure.",
      text: "hello world",
    });

    const response = await POST(
      request({ messageId: "msg_12", model: "model_1" }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(response.headers.get("x-credit-hold-id")).toBe("hold_1");
    const chunks = await collectUIChunks(response);

    expect(reserveCreditHoldMock).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 10 }),
    );
    expect(chunks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "data-generation-status" }),
        expect.objectContaining({
          type: "reasoning-delta",
          delta: "I will plan the component structure.",
        }),
        expect.objectContaining({ type: "text-delta", delta: "hello world" }),
      ]),
    );
    expect(toUIMessageStream).toHaveBeenCalledWith(
      expect.objectContaining({ sendReasoning: true }),
    );

    const call = streamTextMock.mock.calls[0][0];
    expect(call.messages).toHaveLength(10);
    expect(call.messages.at(-1)).toMatchObject({
      role: "user",
      content: expect.stringContaining("Generation completeness requirements:"),
    });
    expect(call.messages.at(-1).content).toContain("final user");
    expect(call.onChunk).toEqual(expect.any(Function));
    expect(call.onFinish).toEqual(expect.any(Function));
    expect(telemetryMock.markFirstByte).toHaveBeenCalled();
  });

  it("analyzes screenshots inside the visible stream and passes the context to code generation", async () => {
    prismaMock.message.findUnique.mockResolvedValueOnce(
      buildMessage({
        id: "msg_1",
        content: "Build this",
        chat: {
          id: "chat_1",
          userId: "user_1",
          model: "model_1",
          quality: "low",
        },
      }),
    );
    prismaMock.message.findMany.mockResolvedValueOnce([
      { role: "system", content: "system" },
      { role: "user", content: "Build this" },
    ]);
    generateTextMock.mockResolvedValueOnce({
      text: "A kanban board with three columns.",
    });
    mockGeneration({ text: "```tsx{path=App.tsx}\nexport default 1\n```" });

    const screenshotData = `data:image/png;base64,${Buffer.from("png").toString("base64")}`;
    const response = await POST(
      request({
        messageId: "msg_1",
        model: "model_1",
        screenshotData,
      }),
    );
    const chunks = await collectUIChunks(response);

    expect(reserveCreditHoldMock).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 16 }),
    );

    expect(chunks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "data-generation-status",
          data: expect.objectContaining({ phase: "analyzing-reference" }),
        }),
      ]),
    );
    expect(prismaMock.message.update).toHaveBeenCalledWith({
      where: { id: "msg_1" },
      data: {
        content: expect.stringContaining("A kanban board with three columns."),
      },
    });
    expect(streamTextMock.mock.calls[0][0].messages.at(-1).content).toContain(
      "A kanban board with three columns.",
    );
  });

  it("uses current files for free preview repairs without a hold or full-generation guard", async () => {
    prismaMock.message.findUnique.mockResolvedValueOnce(
      buildMessage({
        id: "repair_msg_1",
        chatId: "chat_1",
        position: 4,
        content: "ReferenceError: total is not defined",
        files: {
          kind: "preview_repair_request",
          chargeCredits: false,
          sourceMessageId: "assistant_1",
        },
        chat: {
          id: "chat_1",
          userId: "user_1",
          model: "model_1",
          quality: "low",
        },
      }),
    );
    prismaMock.message.findMany.mockResolvedValueOnce([
      { id: "system_1", role: "system", content: "system prompt" },
      { id: "user_1", role: "user", content: "build calculator" },
      {
        id: "assistant_1",
        role: "assistant",
        content: "created app",
        files: [
          {
            path: "App.tsx",
            language: "tsx",
            code: "export default function App() { return <main>{total}</main>; }",
          },
        ],
      },
      {
        id: "repair_msg_1",
        role: "user",
        content: "ReferenceError: total is not defined",
        files: {
          kind: "preview_repair_request",
          chargeCredits: false,
          sourceMessageId: "assistant_1",
        },
      },
    ]);
    mockGeneration({
      text: "```tsx{path=App.tsx}\nexport default function App() { return <main>0</main>; }\n```",
    });

    const response = await POST(
      request({
        messageId: "repair_msg_1",
        model: "model_1",
        screenshotData: `data:image/png;base64,${Buffer.from("png").toString("base64")}`,
      }),
    );
    const chunks = await collectUIChunks(response);

    expect(response.headers.get("x-credit-hold-id")).toBeNull();
    expect(chunks.some((chunk) => chunk.type === "text-delta")).toBe(true);
    expect(reserveCreditHoldMock).not.toHaveBeenCalled();
    expect(generateTextMock).not.toHaveBeenCalled();
    const call = streamTextMock.mock.calls[0][0];
    expect(call.messages).toHaveLength(2);
    expect(call.messages[1].content).toContain(
      "Return only complete files that changed",
    );
    expect(call.messages[1].content).not.toContain(
      "Generation completeness requirements:",
    );
  });
});
