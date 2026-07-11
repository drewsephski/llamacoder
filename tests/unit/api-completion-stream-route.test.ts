import {
  parseJsonEventStream,
  uiMessageChunkSchema,
  type UIMessageChunk,
} from "ai";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildMessage } from "../fixtures/builders";

const {
  createOpenRouterModelMock,
  createRequestTelemetryMock,
  consumeRateLimitMock,
  gatewayModelMock,
  generateTextMock,
  getModelCreditHoldCostMock,
  getSessionMock,
  prismaMock,
  releaseCreditHoldMock,
  reserveCreditHoldMock,
  streamTextMock,
  telemetryMock,
  exaSearchMock,
} = vi.hoisted(() => ({
  createOpenRouterModelMock: vi.fn(() => "openrouter-model"),
  createRequestTelemetryMock: vi.fn(),
  consumeRateLimitMock: vi.fn(),
  gatewayModelMock: vi.fn(() => "gateway-model"),
  generateTextMock: vi.fn(),
  getModelCreditHoldCostMock: vi.fn((model: string) =>
    model === "google/gemini-3-flash-preview" ? 6 : 10,
  ),
  getSessionMock: vi.fn(),
  releaseCreditHoldMock: vi.fn(),
  reserveCreditHoldMock: vi.fn(),
  streamTextMock: vi.fn(),
  exaSearchMock: vi.fn(() => ({ type: "provider-tool" })),
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
    gateway: Object.assign(gatewayModelMock, {
      tools: { exaSearch: exaSearchMock },
    }),
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

vi.mock("@/features/security/server/rate-limit", () => ({
  consumeRateLimit: consumeRateLimitMock,
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
  createOpenRouterModel: createOpenRouterModelMock,
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
    consumeRateLimitMock.mockResolvedValue({ allowed: true, remaining: 11 });
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

  afterEach(() => {
    vi.useRealTimers();
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

  it("rate limits completion requests before loading messages", async () => {
    consumeRateLimitMock.mockResolvedValueOnce({
      allowed: false,
      retryAfterSeconds: 12,
    });

    const response = await POST(
      request({ messageId: "msg_1", model: "model_1" }),
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("12");
    expect(prismaMock.message.findUnique).not.toHaveBeenCalled();
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
    expect(call.system).toBe("system");
    expect(call.messages).toHaveLength(9);
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

  it("runs a bounded web research preflight before code generation", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-11T12:00:00.000Z"));
    const content =
      "Build a UFC rankings app and use web search to get the actual rankings";
    prismaMock.message.findUnique.mockResolvedValueOnce(
      buildMessage({
        id: "msg_search",
        content,
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
      { role: "user", content },
    ]);
    generateTextMock.mockResolvedValueOnce({
      text: "Verified current UFC rankings",
      sources: [],
      toolResults: [
        {
          toolName: "web_search",
          output: {
            id: "search_1",
            results: [
              {
                url: "https://www.ufc.com/rankings",
                title: "UFC Rankings",
                publishedDate: "2026-06-30T10:00:00.000Z",
                highlights: ["Official current rankings"],
              },
            ],
          },
        },
      ],
      usage: undefined,
      finishReason: "stop",
      providerMetadata: undefined,
      response: { id: "research_response_1" },
    });
    mockGeneration({ text: "```tsx{path=App.tsx}\nexport default 1\n```" });

    const response = await POST(
      request({ messageId: "msg_search", model: "model_1" }),
    );
    const chunks = await collectUIChunks(response);

    expect(chunks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "data-generation-status",
          data: expect.objectContaining({ phase: "searching" }),
        }),
        expect.objectContaining({
          type: "source-url",
          sourceId: "research-msg_search-1",
          url: "https://www.ufc.com/rankings",
          title: "UFC Rankings (2026-06-30)",
        }),
      ]),
    );
    const call = streamTextMock.mock.calls[0][0];
    const researchCall = generateTextMock.mock.calls[0][0];
    expect(researchCall.tools).toEqual({
      web_search: { type: "provider-tool" },
    });
    expect(exaSearchMock).toHaveBeenCalledWith({
      type: "auto",
      numResults: 8,
      userLocation: "US",
      startPublishedDate: "2026-01-11T12:00:00.000Z",
      endPublishedDate: "2026-07-11T12:00:00.000Z",
      contents: {
        text: {
          maxCharacters: 8_000,
          includeHtmlTags: false,
          verbosity: "standard",
        },
        highlights: {
          query: content,
          maxCharacters: 3_000,
        },
        maxAgeHours: 1,
        livecrawlTimeout: 10_000,
      },
    });
    expect(researchCall.toolChoice).toBe("required");
    expect(researchCall.maxOutputTokens).toBe(4_000);
    expect(researchCall.providerOptions).toEqual({
      gateway: {
        user: "user_1",
        tags: ["feature:web-search", "request:research"],
      },
    });
    expect(call.tools).toBeUndefined();
    expect(call.toolChoice).toBeUndefined();
    expect(call.system).toBe("system");
    expect(
      call.messages.every(
        (candidate: { role: string }) => candidate.role !== "system",
      ),
    ).toBe(true);
    expect(gatewayModelMock).toHaveBeenCalledWith("openai/gpt-5-nano");
    expect(call.messages.at(-1).content).toContain(
      "Web research is required before generating code",
    );
    expect(call.messages.at(-1).content).toContain(
      "Do not invent or substitute placeholder data",
    );
    expect(call.messages.at(-1).content).toContain("Official current rankings");
    expect(call.messages.at(-1).content).toContain(
      "Strict publication window: 2026-01-11 through 2026-07-11",
    );
    expect(call.messages.at(-1).content).toContain("Published: 2026-06-30");
    expect(call.messages.at(-1).content).toContain(
      "https://www.ufc.com/rankings",
    );
  });

  it("uses undated authoritative sources for evergreen technical research", async () => {
    const content =
      "Build an app using Vercel AI SDK tool-calling best practices";
    prismaMock.message.findUnique.mockResolvedValueOnce(
      buildMessage({
        id: "msg_evergreen_search",
        content,
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
      { role: "user", content },
    ]);
    generateTextMock.mockResolvedValueOnce({
      text: "Verified AI SDK guidance",
      sources: [],
      toolResults: [
        {
          toolName: "web_search",
          output: {
            id: "search_evergreen",
            results: [
              {
                url: "https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling",
                title: "AI SDK Tool Calling",
                highlights: ["Use provider tools through the tools option."],
              },
            ],
          },
        },
      ],
      usage: undefined,
      finishReason: "stop",
      providerMetadata: undefined,
      response: { id: "research_response_evergreen" },
    });
    mockGeneration({ text: "```tsx{path=App.tsx}\nexport default 1\n```" });

    const response = await POST(
      request({ messageId: "msg_evergreen_search", model: "model_1" }),
    );
    const chunks = await collectUIChunks(response);

    expect(chunks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "source-url",
          url: "https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling",
          title: "AI SDK Tool Calling",
        }),
      ]),
    );
    expect(exaSearchMock).toHaveBeenCalledWith(
      expect.not.objectContaining({
        startPublishedDate: expect.anything(),
        endPublishedDate: expect.anything(),
      }),
    );
    expect(streamTextMock.mock.calls[0][0].messages.at(-1).content).toContain(
      "authoritative sources without an artificial publication-date cutoff",
    );
    expect(streamTextMock.mock.calls[0][0].messages.at(-1).content).toContain(
      "Use provider tools through the tools option.",
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
    expect(call.system).toContain("system prompt");
    expect(call.messages).toHaveLength(1);
    expect(call.messages[0].content).toContain(
      "Return only complete files that changed",
    );
    expect(call.messages[0].content).not.toContain(
      "Generation completeness requirements:",
    );
  });
});
