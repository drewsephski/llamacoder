"use client";

import ChatBox from "../chats/[id]/chat-box";
import ChatLog from "../chats/[id]/chat-log";
import type { Chat } from "../chats/[id]/page";
import { DEFAULT_GENERATION_STATUS } from "@/features/generation/contracts";

const now = new Date();
const files = [
  { path: "types.ts", code: "export type Project = {};" },
  { path: "components/Navbar.tsx", code: "export function Navbar() {}" },
  { path: "components/Hero.tsx", code: "export function Hero() {}" },
  { path: "App.tsx", code: "export default function App() {}" },
  { path: "utils/cn.ts", code: "export const cn = () => '';" },
];

const chat = {
  id: "chat-panel-qa",
  model: "deepseek/deepseek-v4-flash",
  quality: "high",
  prompt:
    "Recreate this design studio landing page with a dark editorial layout and responsive motion.",
  title: "App Builder Blueprint",
  llamaCoderVersion: "v2",
  shadcn: true,
  plan: null,
  appSpec: null,
  hasCode: true,
  generationStatus: "completed",
  generationStartedAt: null,
  sourceMessageId: null,
  sourceChatId: null,
  referrerUserId: null,
  createdAt: now,
  userId: null,
  totalMessages: 4,
  assistantMessagesCountBefore: 0,
  activeGenerationRun: null,
  messages: [
    {
      id: "initial-user",
      role: "user",
      content: "Build the reference.",
      files: null,
      followUpPrompts: null,
      chatId: "chat-panel-qa",
      position: 0,
      changeSummary: null,
      versionKind: null,
      versionLabel: null,
      isBookmarked: false,
      createdAt: now,
    },
    {
      id: "initial-assistant",
      role: "assistant",
      content: "Initial build complete.",
      files: null,
      followUpPrompts: null,
      chatId: "chat-panel-qa",
      position: 1,
      changeSummary: null,
      versionKind: null,
      versionLabel: null,
      isBookmarked: false,
      createdAt: now,
    },
    {
      id: "follow-up-user",
      role: "user",
      content:
        "Give the background a deeper smoky texture and refine the hero spacing.",
      files: null,
      followUpPrompts: null,
      chatId: "chat-panel-qa",
      position: 2,
      changeSummary: null,
      versionKind: null,
      versionLabel: null,
      isBookmarked: false,
      createdAt: now,
    },
    {
      id: "follow-up-assistant",
      role: "assistant",
      content:
        "I tightened the composition and layered subtle radial gradients to simulate the smoky texture described.\n\n```tsx{path=App.tsx}\nexport default function App() { return <main />; }\n```\n```tsx{path=components/Hero.tsx}\nexport function Hero() { return <section />; }\n```\n```tsx{path=components/Navbar.tsx}\nexport function Navbar() { return <nav />; }\n```\n```ts{path=types.ts}\nexport type Project = {};\n```\n```ts{path=utils/cn.ts}\nexport const cn = () => '';\n```",
      files,
      followUpPrompts: [
        "Add subtle grain texture overlay to background",
        "Replace placeholder hands with actual red-tinted images",
        "Make CTA button pulse with a slow glow animation",
      ],
      chatId: "chat-panel-qa",
      position: 3,
      changeSummary:
        "Refined the smoky hero composition and responsive spacing",
      versionKind: "generation",
      versionLabel: "v1",
      isBookmarked: false,
      createdAt: now,
    },
  ],
} as Chat;

export default function ChatPanelQaPage() {
  return (
    <main className="flex h-dvh min-w-0 overflow-hidden bg-background">
      <section className="flex h-full w-full min-w-0 shrink-0 flex-col overflow-x-hidden border-r border-border lg:w-[clamp(22rem,32vw,36rem)]">
        <header className="shrink-0 px-4 py-3 sm:px-5 sm:py-4">
          <div className="mx-auto flex w-full max-w-[42rem] items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="size-7 shrink-0 rounded-full bg-blue-500" />
              <p className="truncate italic text-muted-foreground">
                App Builder Blueprint
              </p>
            </div>
            <div className="size-8 rounded-full border border-border" />
          </div>
        </header>

        <ChatLog
          chat={chat}
          streamText=""
          reasoningText=""
          generationStatus={DEFAULT_GENERATION_STATUS}
          researchActivity={null}
          streamSources={[]}
          isStreaming={false}
          onMessageClickAction={() => {}}
          onClarificationCompleteAction={() => {}}
          onSearchApprovalAction={() => {}}
          onBackendSetupAction={() => {}}
        />

        <ChatBox
          chat={chat}
          onNewStreamPromiseAction={() => {}}
          isStreaming={false}
          onStopAction={() => {}}
        />
      </section>

      <section className="hidden min-w-0 flex-1 items-center justify-center bg-muted/30 p-8 lg:flex">
        <div className="flex h-full w-full items-center justify-center rounded-2xl border border-border bg-card text-sm text-muted-foreground">
          Preview workspace
        </div>
      </section>
    </main>
  );
}
