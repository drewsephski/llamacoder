"use client";

import { createMessage, saveProject } from "@/app/(main)/actions";
import LogoSmall from "@/components/icons/logo-small";
import {
  parseReplySegments,
  extractFirstCodeBlock,
  extractAllCodeBlocks,
} from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { memo, startTransition, use, useEffect, useRef, useState } from "react";
import ChatBox from "./chat-box";
import ChatLog from "./chat-log";
import CodeViewer from "./code-viewer";
import CodeViewerLayout from "./code-viewer-layout";
import type { Chat, Message } from "./page";
import { Context } from "../../providers";
import { AnimatedThemeToggleButton } from "@/components/ui/animated-theme-toggle-button";
import { authClient } from "@/lib/auth-client";
import { SignInModal } from "@/components/sign-in-modal";
import { toast } from "sonner";

const HeaderChat = memo(
  ({
    chat,
  }: {
    chat: Chat;
  }) => {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/">
            <LogoSmall />
          </Link>
          <p className="truncate italic text-muted-foreground">{chat.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <AnimatedThemeToggleButton variant="horizontal" />
        </div>
      </div>
    );
  },
);

HeaderChat.displayName = "HeaderChat";

export default function PageClient({ chat }: { chat: Chat }) {
  const context = use(Context);
  const searchParams = useSearchParams();
  const [streamPromise, setStreamPromise] = useState<
    Promise<ReadableStream> | undefined
  >(context.streamPromise);
  const [streamText, setStreamText] = useState("");
  const [isShowingCodeViewer, setIsShowingCodeViewer] = useState(
    chat.messages.some((m: Message) => m.role === "assistant"),
  );
  const [activeTab, setActiveTab] = useState<"code" | "preview">("preview");
  const router = useRouter();
  const isHandlingStreamRef = useRef(false);
  const [activeMessage, setActiveMessage] = useState(
    chat.messages
      .filter((m: Message) => m.role === "assistant" && extractFirstCodeBlock(m.content))
      .at(-1),
  );
  const [streamError, setStreamError] = useState<{
    message: string;
    partialText: string;
    canRetry: boolean;
    failedMessageId?: string;
  } | null>(null);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(!!chat.userId);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [showSignInModal, setShowSignInModal] = useState(false);

  useEffect(() => {
    setIsCheckingSession(true);
    authClient.getSession()
      .then((result) => {
        if (result.data) {
          setIsSaved(chat.userId === result.data.user.id);
        }
        setIsCheckingSession(false);
      })
      .catch(() => setIsCheckingSession(false));
  }, [chat.userId]);

  const handleSave = async () => {
    if (isSaved) return;

    setIsSaving(true);
    try {
      await saveProject(chat.id);
      setIsSaved(true);
    } catch (error: any) {
      console.error("Save error:", error);
      if (error.message && error.message.includes("signed in")) {
        setShowSignInModal(true);
      } else {
        toast.error(error.message || "Failed to save project");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignInSuccess = async () => {
    const result = await authClient.getSession();
    if (result.data) {
      // Auto-save after sign in
      await handleSave();
    }
  };

  const handleRetry = () => {
    setStreamError(null);
    // Note: ChatBox handles prompt state and retry via its own form submission
    // We just clear the error state here
  };

  useEffect(() => {
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    async function f() {
      if (!streamPromise || isHandlingStreamRef.current) return;

      isHandlingStreamRef.current = true;
      context.setStreamPromise(undefined);

      const stream = await streamPromise;
      let didPushToCode = false;
      let didPushToPreview = false;
      let fullText = "";

      reader = stream.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setStreamText(fullText);

          if (
            !didPushToCode &&
            parseReplySegments(fullText).some((seg) => seg.type === "file")
          ) {
            didPushToCode = true;
            setIsShowingCodeViewer(true);
            setActiveTab("code");
          }

          if (
            !didPushToPreview &&
            parseReplySegments(fullText).some(
              (seg) => seg.type === "file" && !seg.isPartial,
            )
          ) {
            didPushToPreview = true;
            setIsShowingCodeViewer(true);
          }
        }

        // Streaming complete
        startTransition(async () => {
          // Get all previous assistant messages with files
          const previousAssistantMessages = chat.messages.filter(
            (m: Message) =>
              m.role === "assistant" &&
              extractAllCodeBlocks(m.content).length > 0,
          );

          // Extract all files from previous messages
          const previousFiles = previousAssistantMessages.flatMap((msg: Message) =>
            extractAllCodeBlocks(msg.content),
          );

          // Extract files from current AI response
          const currentFiles = extractAllCodeBlocks(fullText);

          // Merge files (current overrides previous for same paths)
          const fileMap = new Map();
          previousFiles.forEach((file: any) => fileMap.set(file.path, file));
          currentFiles.forEach((file: any) => fileMap.set(file.path, file));
          const allFiles = Array.from(fileMap.values());

          const message = await createMessage(
            chat.id,
            fullText, // Store original AI response content (only changed files)
            "assistant",
            allFiles, // Store cumulative files
          );

          startTransition(() => {
            isHandlingStreamRef.current = false;
            setStreamText("");
            setStreamPromise(undefined);
            setActiveMessage(message);
            // When streaming finishes, switch to preview mode and keep the viewer open
            setIsShowingCodeViewer(true);
            setActiveTab("preview");
            router.refresh();
          });
        });
      } catch (error: any) {
        console.error("Stream reading error:", error);
        
        // Set error state for UI
        setStreamError({
          message: error.message || "Connection lost",
          partialText: fullText,
          canRetry: true,
        });
        
        // Persist partial assistant message so user sees what failed
        if (fullText) {
          try {
            const partialMessage = await createMessage(
              chat.id,
              fullText + "\n\n[Error: Response truncated - please retry]",
              "assistant",
              extractAllCodeBlocks(fullText),
            );
            setStreamError({
              message: error.message || "Connection lost",
              partialText: fullText,
              canRetry: true,
              failedMessageId: partialMessage.id,
            });
          } catch (saveError) {
            console.error("Failed to save partial message:", saveError);
            setStreamError({
              message: error.message || "Connection lost",
              partialText: fullText,
              canRetry: true,
            });
          }
        } else {
          setStreamError({
            message: error.message || "Connection lost",
            partialText: "",
            canRetry: true,
          });
        }
        
        isHandlingStreamRef.current = false;
      }
    }

    f();

    return () => {
      if (reader) {
        reader.cancel();
      }
      isHandlingStreamRef.current = false;
    };
  }, [chat.id, router, streamPromise, context]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <div className="flex h-full min-h-0 overflow-hidden">
        <div
          className={`flex w-full shrink-0 flex-col overflow-hidden h-full ${isShowingCodeViewer ? "lg:w-[30%]" : "lg:w-full"}`}
        >
          <HeaderChat
            chat={chat}
          />

          <ChatLog
            chat={chat}
            streamText={streamText}
            activeMessage={activeMessage}
            streamError={streamError}
            onRetryAction={handleRetry}
            onMessageClickAction={(message) => {
              if (message !== activeMessage) {
                setActiveMessage(message);
                setIsShowingCodeViewer(true);
              } else {
                setActiveMessage(undefined);
                setIsShowingCodeViewer(false);
              }
            }}
          />

          <ChatBox
            chat={chat}
            onNewStreamPromiseAction={setStreamPromise}
            isStreaming={!!streamPromise}
          />
        </div>

        <CodeViewerLayout
          isShowing={isShowingCodeViewer}
          onClose={() => {
            setActiveMessage(undefined);
            setIsShowingCodeViewer(false);
          }}
        >
          {isShowingCodeViewer && (
            <CodeViewer
              streamText={streamText}
              chat={chat}
              message={activeMessage}
              onMessageChange={setActiveMessage}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onClose={() => {
                setActiveMessage(undefined);
                setIsShowingCodeViewer(false);
              }}
              isSaved={isSaved}
              isSaving={isSaving}
              isCheckingSession={isCheckingSession}
              onSave={handleSave}
              onRequestFix={(error: string) => {
                startTransition(async () => {
                  let newMessageText = `The code is not working. Can you fix it? Here's the error:\n\n`;
                  newMessageText += error.trimStart();
                  const message = await createMessage(
                    chat.id,
                    newMessageText,
                    "user",
                  );

                  const streamPromise = fetch(
                    "/api/get-next-completion-stream-promise",
                    {
                      method: "POST",
                      body: JSON.stringify({
                        messageId: message.id,
                        model: chat.model,
                      }),
                    },
                  ).then((res) => {
                    if (!res.body) {
                      throw new Error("No body on response");
                    }
                    return res.body;
                  });
                  setStreamPromise(streamPromise);
                  router.refresh();
                });
              }}
              onRestore={async (
                message: Message | undefined,
                oldVersion: number,
                newVersion: number,
              ) => {
                startTransition(async () => {
                  if (!message) return;

                  // Helper to get files from a message (JSON field or extract from content)
                  const getFilesFromMessage = (msg: Message) => {
                    return (
                      (msg.files as any[]) || extractAllCodeBlocks(msg.content)
                    );
                  };

                  const restoredFiles = getFilesFromMessage(message);
                  if (restoredFiles.length === 0) return;

                  const explanation = `Version ${newVersion} was created by restoring version ${oldVersion}.`;
                  const newContent =
                    explanation +
                    "\n\n" +
                    restoredFiles
                      .map(
                        (file) =>
                          `\`\`\`${file.language}{path=${file.path}}\n${file.code}\n\`\`\``,
                      )
                      .join("\n\n");

                  const newMessage = await createMessage(
                    chat.id,
                    newContent,
                    "assistant",
                    restoredFiles,
                  );
                  setActiveMessage(newMessage);
                  router.refresh();
                });
              }}
            />
          )}
        </CodeViewerLayout>
      </div>
      <SignInModal
        open={showSignInModal}
        onOpenChange={setShowSignInModal}
        onSuccess={handleSignInSuccess}
      />
    </div>
  );
}
