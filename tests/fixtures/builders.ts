import { FREE_MODEL } from "@/lib/constants";

export function buildUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user_1",
    email: "user@example.com",
    name: "Test User",
    credits: 5,
    subscription: null,
    ...overrides,
  };
}

export function buildSubscription(overrides: Record<string, unknown> = {}) {
  return {
    id: "sub_db_1",
    userId: "user_1",
    stripeCustomerId: "cus_1",
    stripePriceId: "price_pro",
    stripeSubscriptionId: "sub_1",
    status: "active",
    tier: "pro",
    currentPeriodStart: new Date("2026-07-01T00:00:00.000Z"),
    currentPeriodEnd: new Date("2026-08-01T00:00:00.000Z"),
    ...overrides,
  };
}

export function buildChat(overrides: Record<string, unknown> = {}) {
  return {
    id: "chat_1",
    model: FREE_MODEL,
    quality: "low",
    prompt: "Build a calculator",
    title: "Calculator",
    llamaCoderVersion: "v2",
    shadcn: true,
    plan: "Build the app with App.tsx and components.",
    hasCode: false,
    generationStatus: "idle",
    generationStartedAt: null,
    userId: "user_1",
    createdAt: new Date("2026-07-01T00:00:00.000Z"),
    messages: [],
    ...overrides,
  };
}

export function buildMessage(overrides: Record<string, unknown> = {}) {
  return {
    id: "msg_1",
    role: "user",
    content: "Build a calculator",
    files: null,
    chatId: "chat_1",
    position: 1,
    createdAt: new Date("2026-07-01T00:00:00.000Z"),
    ...overrides,
  };
}

export function buildGeneratedFile(overrides: Record<string, unknown> = {}) {
  return {
    path: "App.tsx",
    language: "tsx",
    code: "export default function App() { return <main />; }",
    ...overrides,
  };
}

export function buildStripeEvent(
  type: string,
  object: Record<string, unknown>,
  overrides: Record<string, unknown> = {},
) {
  return {
    id: "evt_1",
    type,
    data: { object },
    created: 1_782_864_000,
    livemode: false,
    object: "event",
    pending_webhooks: 1,
    request: null,
    api_version: "2026-04-22.dahlia",
    ...overrides,
  };
}

export async function readJson(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

export async function collectStream(response: Response) {
  return await response.text();
}
