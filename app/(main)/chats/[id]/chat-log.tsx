"use client";

import type { Chat, Message } from "./page";
import {
  parseReplySegments,
  extractFirstCodeBlock,
  extractAllCodeBlocks,
  toTitleCase,
} from "@/lib/utils";
import { Fragment } from "react";
import { Streamdown } from "streamdown";
import { StickToBottom } from "use-stick-to-bottom";
import { AppVersionButton } from "@/components/app-version-button";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ChatLog({
  chat,
  activeMessage,
  streamText,
  onMessageClickAction,
  streamError,
  onRetryAction,
}: {
  chat: Chat;
  activeMessage?: Message;
  streamText: string;
  onMessageClickAction: (v: Message) => void;
  streamError?: {
    message: string;
    partialText: string;
    canRetry: boolean;
    failedMessageId?: string;
  } | null;
  onRetryAction?: () => void;
}) {
  const assistantMessages = chat.messages.filter(
    (m) =>
      m.role === "assistant" &&
      (extractFirstCodeBlock(m.content) ||
        extractAllCodeBlocks(m.content).length > 0),
  );

  return (
    <StickToBottom
      className="relative grow overflow-hidden"
      resize="smooth"
      initial="smooth"
    >
      <StickToBottom.Content className="mx-auto flex w-full max-w-prose flex-col gap-8 py-8 pl-4 pr-2">
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to bottom, hsl(var(--muted)) 0%, hsl(var(--muted) / 0) 20px, hsl(var(--muted) / 0) calc(100% - 20px), hsl(var(--muted)) 100%)",
            transform: "translateY(-1px)",
          }}
        />
        <UserMessage content={chat.prompt} />

        {chat.totalMessages > chat.messages.length && (
          <div className="py-2 text-center text-sm text-muted-foreground">
            Only last messages loaded. Full history not available.
          </div>
        )}

        {chat.messages.slice(2).map((message) => (
          <Fragment key={message.id}>
            {message.role === "user" ? (
              <UserMessage content={message.content} />
            ) : (
              <AssistantMessage
                content={message.content}
                version={
                  (chat.assistantMessagesCountBefore || 0) +
                  assistantMessages.map((m) => m.id).indexOf(message.id) +
                  1
                }
                message={message}
                previousMessage={(() => {
                  const idx = assistantMessages
                    .map((m) => m.id)
                    .indexOf(message.id);
                  return idx > 0 ? assistantMessages[idx - 1] : undefined;
                })()}
                isActive={!streamText && activeMessage?.id === message.id}
                onMessageClickAction={onMessageClickAction}
                isStreaming={!!streamText}
              />
            )}
          </Fragment>
        ))}

        {streamText && (
          <AssistantMessage
            content={streamText}
            version={
              (chat.assistantMessagesCountBefore || 0) +
              assistantMessages.length +
              1
            }
            isActive={true}
            previousMessage={assistantMessages.at(-1)}
          />
        )}

        {streamError && (
          <div className="rounded-xl border border-red-500/20 bg-red-50/50 p-4 dark:bg-red-950/20">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-red-700 dark:text-red-400">
                  {streamError.message}
                </p>
                {streamError.partialText && (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Partial response received ({streamError.partialText.length} characters)
                  </p>
                )}
                {streamError.canRetry && onRetryAction && (
                  <Button
                    onClick={onRetryAction}
                    variant="outline"
                    size="sm"
                    className="mt-3 gap-2 border-red-200 bg-white hover:bg-red-50 dark:border-red-800 dark:bg-red-950/30 dark:hover:bg-red-900/40"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </StickToBottom.Content>
    </StickToBottom>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="relative inline-flex max-w-[92%] items-end gap-3 self-end sm:max-w-[75%] md:max-w-[65%]">
      <div className="whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-primary px-5 py-3 text-[15px] leading-relaxed text-primary-foreground shadow-sm">
        {content}
      </div>
    </div>
  );
}

function AssistantMessage({
  content,
  version,
  message,
  isActive,
  onMessageClickAction = () => {},
  previousMessage,
  isStreaming = false,
}: {
  content: string;
  version: number;
  message?: Message;
  isActive?: boolean;
  onMessageClickAction?: (v: Message) => void;
  previousMessage?: Message;
  isStreaming?: boolean;
}) {
  const allFiles = extractAllCodeBlocks(content);
  const segments = parseReplySegments(content);
  const fileSegments = segments.filter((s) => s.type === "file");

  // Generate app title for multiple files
  const generateAppTitle = (files: typeof allFiles) => {
    // Look for App.tsx or main component
    const mainFile = files.find(
      (f) => f.path === "App.tsx" || f.path.endsWith("App.tsx"),
    );
    if (mainFile) {
      // Try to extract app name from content
      const appMatch = mainFile.code.match(
        /function\s+(\w+App|\w+Component|\w+)/,
      );
      if (appMatch) {
        return toTitleCase(appMatch[1].replace(/(App|Component)$/, ""));
      }
    }

    // Fallback: use the first file's name
    const firstFile = files[0];
    if (firstFile) {
      const name =
        firstFile.path
          .split("/")
          .pop()
          ?.replace(/\.\w+$/, "") || "App";
      return toTitleCase(name.replace(/(App|Component)$/, ""));
    }

    return "App";
  };

  const appTitle = generateAppTitle(
    allFiles.length > 0
      ? allFiles
      : (fileSegments.map((f) => ({
          code: f.code,
          language: f.language,
          path: f.path,
          fullMatch: "",
        })) as any),
  );

  const displayFileCount = fileSegments.length;

  if (displayFileCount > 0) {
    // Handle single-file replies with interleaved text and one file
    return (
      <div className="">
        {segments.map((seg, i) => {
          if (seg.type === "text") {
            return (
              <div key={i} className="prose dark:prose-invert prose-p:leading-relaxed prose-p:text-[15px] max-w-none">
                <Streamdown className="text-foreground break-words">
                  {seg.content}
                </Streamdown>
              </div>
            );
          }

          return (
            <div
              key={i}
              className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-sm transition-colors hover:border-blue-400/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-blue-500/70"
              >
                <path
                  d="M7.5 2.5H3.5C2.67157 2.5 2 3.17157 2 4V11C2 11.8284 2.67157 12.5 3.5 12.5H10.5C11.3284 12.5 12 11.8284 12 11V6.5L7.5 2.5Z"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.5 2.5V6.5H12"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-medium text-foreground">{seg.path}</span>
            </div>
          );
        })}
        <AppVersionButton
          version={version}
          fileCount={displayFileCount}
          appTitle={appTitle}
          generating={false}
          disabled={!message || isStreaming}
          onClick={message ? () => onMessageClickAction(message) : undefined}
          isActive={isActive}
        />
      </div>
    );
  } else {
    // No code blocks, just show text
    return <Streamdown className="prose dark:prose-invert text-foreground break-words">{content}</Streamdown>;
  }
}
