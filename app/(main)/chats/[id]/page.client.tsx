"use client";

import {
  createFreeRepairAssistantMessage,
  createMessage,
  createPreviewRepairMessage,
  releaseReservedCreditHold,
  restoreVersionAsCheckpoint,
  saveProject,
} from "@/app/(main)/actions";
import LogoSmall from "@/components/icons/logo-small";
import {
  parseReplySegments,
  extractFirstCodeBlock,
  extractAllCodeBlocks,
} from "@/lib/utils";
import {
  normalizeGeneratedFiles,
  validateGeneratedFiles,
} from "@/lib/generated-files";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  fetchCompletionStream,
  type CompletionStream,
} from "@/lib/completion-stream";

const HeaderChat = memo(({ chat }: { chat: Chat }) => {
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
});

HeaderChat.displayName = "HeaderChat";

export default function PageClient({ chat }: { chat: Chat }) {
  const {
    streamPromise: initialStreamPromise,
    setStreamPromise: setContextStreamPromise,
  } = use(Context);
  const [streamPromise, setStreamPromise] = useState<
    Promise<CompletionStream> | undefined
  >(initialStreamPromise);
  const [streamText, setStreamText] = useState("");
  const [isShowingCodeViewer, setIsShowingCodeViewer] = useState(
    chat.messages.some((m: Message) => m.role === "assistant"),
  );
  const [activeTab, setActiveTab] = useState<"code" | "preview">("preview");
  const router = useRouter();
  const isHandlingStreamRef = useRef(false);
  const handledStreamPromiseRef = useRef<Promise<CompletionStream> | null>(
    null,
  );
  const freeRepairRequestIdRef = useRef<string | null>(null);
  const freeRepairSourceMessageIdRef = useRef<string | null>(null);
  const [activeMessage, setActiveMessage] = useState(
    chat.messages
      .filter(
        (m: Message) =>
          m.role === "assistant" &&
          (((m.files as any[]) || []).length > 0 ||
            extractFirstCodeBlock(m.content)),
      )
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
    authClient
      .getSession()
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
      if (
        !streamPromise ||
        isHandlingStreamRef.current ||
        handledStreamPromiseRef.current === streamPromise
      ) {
        return;
      }

      handledStreamPromiseRef.current = streamPromise;
      isHandlingStreamRef.current = true;
      setContextStreamPromise(undefined);

      let didPushToCode = false;
      let didPushToPreview = false;
      let fullText = "";
      let creditHoldId: string | undefined;

      try {
        const stream = await streamPromise;
        creditHoldId = stream.creditHoldId;

        if (stream.locked) {
          console.warn("Skipping duplicate stream reader for locked stream");
          return;
        }

        reader = stream.getReader();
        const decoder = new TextDecoder();

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

        if (!fullText.trim()) {
          throw new Error(
            "The model returned an empty response. Please retry.",
          );
        }

        const getFilesFromMessage = (msg: Message) =>
          normalizeGeneratedFiles(
            ((msg.files as any[]) || []).length > 0
              ? (msg.files as any[])
              : extractAllCodeBlocks(msg.content),
          );

        // Get all previous assistant messages with files
        const previousAssistantMessages = chat.messages.filter(
          (m: Message) =>
            m.role === "assistant" && getFilesFromMessage(m).length > 0,
        );

        const repairSourceMessageId = freeRepairSourceMessageIdRef.current;
        const repairSourceMessage = repairSourceMessageId
          ? previousAssistantMessages.find(
              (msg: Message) => msg.id === repairSourceMessageId,
            )
          : undefined;

        // Repairs are intentionally partial. Merge them onto the version that
        // produced the preview error, not onto an unrelated newer checkpoint.
        const previousFiles = repairSourceMessage
          ? getFilesFromMessage(repairSourceMessage)
          : previousAssistantMessages.flatMap((msg: Message) =>
              getFilesFromMessage(msg),
            );

        // Extract files from current AI response
        const currentFiles = normalizeGeneratedFiles(
          extractAllCodeBlocks(fullText),
        );

        // Merge files (current overrides previous for same paths)
        const fileMap = new Map();
        previousFiles.forEach((file: any) => fileMap.set(file.path, file));
        currentFiles.forEach((file: any) => fileMap.set(file.path, file));
        const allFiles = normalizeGeneratedFiles(Array.from(fileMap.values()));
        const diagnostics = validateGeneratedFiles(allFiles);

        if (diagnostics.length > 0) {
          console.warn(
            "Generated stream completed with diagnostics:",
            diagnostics,
          );
        }

        const repairMessageId = freeRepairRequestIdRef.current;
        const message = repairMessageId
          ? await createFreeRepairAssistantMessage(
              chat.id,
              repairMessageId,
              fullText,
              allFiles,
            )
          : await createMessage(
              chat.id,
              fullText, // Store original AI response content (only changed files)
              "assistant",
              allFiles, // Store cumulative files
              { creditHoldId },
            );

        startTransition(() => {
          freeRepairRequestIdRef.current = null;
          freeRepairSourceMessageIdRef.current = null;
          setStreamText("");
          setStreamPromise(undefined);
          setActiveMessage(message);
          // When streaming finishes, switch to preview mode and keep the viewer open
          setIsShowingCodeViewer(true);
          setActiveTab("preview");
          router.refresh();
        });
      } catch (error: any) {
        console.error("Stream reading error:", error);
        if (creditHoldId) {
          await releaseReservedCreditHold(creditHoldId);
        }
        setStreamPromise(undefined);
        freeRepairRequestIdRef.current = null;
        freeRepairSourceMessageIdRef.current = null;

        // Set error state for UI
        setStreamError({
          message: error.message || "Connection lost",
          partialText: fullText,
          canRetry: true,
        });

        if (!fullText) {
          setStreamError({
            message: error.message || "Connection lost",
            partialText: "",
            canRetry: true,
          });
        }
      } finally {
        try {
          reader?.releaseLock();
        } catch {
          // Ignore release errors from already-closed readers.
        }
        isHandlingStreamRef.current = false;
      }
    }

    f();

    return () => {
      // Do not cancel here. React dev effect replay can run cleanup while the
      // stream should continue, and canceling makes the next reader race the
      // still-locked stream.
    };
  }, [
    chat.id,
    chat.messages,
    router,
    streamPromise,
    setContextStreamPromise,
  ]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <div className="flex h-full min-h-0 overflow-hidden">
        <div
          className={`flex h-full w-full shrink-0 flex-col overflow-hidden ${isShowingCodeViewer ? "lg:w-[30%]" : "lg:w-full"}`}
        >
          <HeaderChat chat={chat} />

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
          onCloseAction={() => {
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
                  const message = await createPreviewRepairMessage(
                    chat.id,
                    error,
                    { sourceMessageId: activeMessage?.id },
                  );
                  freeRepairRequestIdRef.current = message.id;
                  freeRepairSourceMessageIdRef.current =
                    activeMessage?.id || null;

                  const streamPromise = fetchCompletionStream({
                    messageId: message.id,
                    model: chat.model,
                  });
                  setStreamPromise(streamPromise);
                  router.refresh();
                });
              }}
              onRequestTargetedEdit={(prompt: string) => {
                startTransition(async () => {
                  try {
                    const message = await createMessage(chat.id, prompt, "user");
                    const streamPromise = fetchCompletionStream({
                      messageId: message.id,
                      model: chat.model,
                    });
                    setStreamPromise(streamPromise);
                    router.refresh();
                  } catch (error: any) {
                    toast.error(
                      error.message === "INSUFFICIENT_CREDITS"
                        ? "You need more credits to edit this project."
                        : error.message || "Failed to start selected edit",
                    );
                  }
                });
              }}
              onRestore={async (
                message: Message | undefined,
                oldVersion: number,
                newVersion: number,
              ) => {
                startTransition(async () => {
                  if (!message) return;
                  const newMessage = await restoreVersionAsCheckpoint({
                    chatId: chat.id,
                    sourceMessageId: message.id,
                    oldVersion,
                    newVersion,
                  });
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
