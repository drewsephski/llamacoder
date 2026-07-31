"use client";

import {
  createAgentAssistantMessage,
  createAgentUserMessage,
} from "@/features/generation/server/agent-actions";
import {
  createPreviewRepairMessage,
  createValidationRepairMessage,
  releaseReservedCreditHold,
  restoreSelectedFilesAsCheckpoint,
  restoreVersionAsCheckpoint,
} from "@/features/generation/server/actions";
import { createUserMessage } from "@/features/generation/client/messages";
import { saveProject } from "@/features/projects/server/actions";
import LogoSmall from "@/components/icons/logo-small";
import {
  extractChatNarration,
  parseReplySegments,
  extractAllCodeBlocks,
} from "@/lib/utils";
import {
  formatGeneratedFileDiagnostics,
  normalizeGeneratedFiles,
  validateGeneratedFiles,
  type GeneratedFile,
} from "@/lib/generated-files";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  memo,
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ChatBox from "./chat-box";
import ChatLog from "./chat-log";
import CodeViewer from "./code-viewer";
import CodeViewerLayout from "./code-viewer-layout";
import type { Chat, Message } from "./page";
import { AnimatedThemeToggleButton } from "@/components/ui/animated-theme-toggle-button";
import { authClient } from "@/lib/auth-client";
import { SignInModal } from "@/components/sign-in-modal";
import { toast } from "sonner";
import {
  fetchCompletionStream,
  fetchGenerationRun,
  finalizeGenerationRun,
  getCompletionStreamMessageId,
  recoverCompletionStream,
  retryCompletionStream,
  updateGenerationRun,
  type CompletionStream,
} from "@/features/generation/client/completion-stream";
import {
  DEFAULT_GENERATION_STATUS,
  generationStatusSchema,
  researchActivitySchema,
  type GenerationStatus,
  type ResearchActivity,
} from "@/features/generation/contracts";
import type { UIMessageChunk } from "ai";
import {
  agentActionSchema,
  formatClarificationAnswers,
  sourceUrlSchema,
  type AgentAction,
  type BackendSetupDecision,
  type BackendSetupRequest,
  type ClarificationAnswers,
  type ClarificationRequest,
  type Plan,
  type SearchRequest,
  type SourceUrl,
} from "@/features/generation/agent-contracts";
import { getMessageGeneratedFiles } from "@/features/generation/message-files";
import { getGenerationRecoveryMode } from "@/features/generation/recovery";
import { getErrorMessage } from "@/features/shared/errors";
import { useGenerationHandoffStream } from "@/features/generation/client/generation-handoff-context";
import { Lightbulb, RotateCcw, X } from "lucide-react";
import { usePlausible } from "next-plausible";

const MAX_AUTOMATIC_PREVIEW_REPAIRS = 3;

const HeaderChat = memo(({ chat }: { chat: Chat }) => {
  return (
    <div className="shrink-0 px-4 py-3 sm:px-5 sm:py-4">
      <div className="mx-auto flex w-full max-w-[42rem] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/">
            <LogoSmall />
          </Link>
          <p className="truncate italic text-muted-foreground">{chat.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/gallery"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Gallery
          </Link>
          <AnimatedThemeToggleButton variant="horizontal" />
        </div>
      </div>
    </div>
  );
});

HeaderChat.displayName = "HeaderChat";

export default function PageClient({ chat }: { chat: Chat }) {
  const plausible = usePlausible();
  const { streamPromise, setStreamPromise } = useGenerationHandoffStream();
  const [streamText, setStreamText] = useState("");
  const [streamChatText, setStreamChatText] = useState("");
  const [streamResponseKind, setStreamResponseKind] = useState<
    "answer" | "app" | null
  >(null);
  const [reasoningText, setReasoningText] = useState("");
  const [streamSources, setStreamSources] = useState<SourceUrl[]>([]);
  const [researchActivity, setResearchActivity] =
    useState<ResearchActivity | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>(
    DEFAULT_GENERATION_STATUS,
  );
  const [isShowingCodeViewer, setIsShowingCodeViewer] = useState(
    chat.messages.some(
      (message: Message) =>
        message.role === "assistant" &&
        getMessageGeneratedFiles(message).length > 0,
    ),
  );
  const [activeTab, setActiveTab] = useState<"code" | "preview">("preview");
  const router = useRouter();
  const isHandlingStreamRef = useRef(false);
  const handledStreamPromiseRef = useRef<Promise<CompletionStream> | null>(
    null,
  );
  const streamReaderRef =
    useRef<ReadableStreamDefaultReader<UIMessageChunk> | null>(null);
  const [generationRunId, setGenerationRunId] = useState<string | null>(null);
  const [recoverableRun, setRecoverableRun] = useState(
    chat.activeGenerationRun,
  );
  const freeRepairRequestIdRef = useRef<string | null>(null);
  const freeRepairSourceMessageIdRef = useRef<string | null>(null);
  const freeRepairSourceFilesRef = useRef<GeneratedFile[] | null>(null);
  const repairRequestInFlightRef = useRef(false);
  const automaticRepairAttemptsRef = useRef(0);
  const handledPreviewErrorRef = useRef<string | null>(null);
  const [previewRecovery, setPreviewRecovery] = useState<{
    error: string;
    attempts: number;
  } | null>(null);
  const [activeMessage, setActiveMessage] = useState(
    chat.messages
      .filter(
        (m: Message) =>
          m.role === "assistant" && getMessageGeneratedFiles(m).length > 0,
      )
      .at(-1),
  );
  const [streamError, setStreamError] = useState<{
    message: string;
    partialText: string;
    canRetry: boolean;
    failedMessageId?: string;
    generationRunId?: string;
  } | null>(null);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(!!chat.userId);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showFirstBuildHelp, setShowFirstBuildHelp] = useState(false);
  const generationStartedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (streamPromise && generationStartedAtRef.current === null) {
      generationStartedAtRef.current = Date.now();
    }
  }, [streamPromise]);

  useEffect(() => {
    const hasSuccessfulBuild = chat.messages.some(
      (candidate) =>
        candidate.role === "assistant" &&
        getMessageGeneratedFiles(candidate).length > 0,
    );
    if (
      hasSuccessfulBuild &&
      localStorage.getItem("squid:first-build-help-dismissed") !== "true"
    ) {
      setShowFirstBuildHelp(true);
    }
  }, [chat.messages]);

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
    } catch (error: unknown) {
      console.error("Save error:", error);
      const message = getErrorMessage(error, "Failed to save project");
      if (message.includes("signed in")) {
        setShowSignInModal(true);
      } else {
        toast.error(message);
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

  const handleRetry = useCallback(() => {
    const failedStream = streamError;
    if (!failedStream?.failedMessageId) return;

    setStreamError(null);
    setRecoverableRun(null);
    setStreamPromise(
      retryCompletionStream({
        messageId: failedStream.failedMessageId,
        model: chat.model,
        generationRunId: failedStream.generationRunId,
      }),
    );
  }, [chat.model, setStreamPromise, streamError]);

  const handleNewStreamPromise = useCallback(
    (nextStream: Promise<CompletionStream>) => {
      setStreamError(null);
      setRecoverableRun(null);
      setPreviewRecovery(null);
      setStreamPromise(nextStream);
    },
    [setStreamPromise],
  );

  const handleStopGeneration = useCallback(async () => {
    const runId = generationRunId;
    await streamReaderRef.current
      ?.cancel("Cancelled by user")
      .catch(() => undefined);
    if (runId)
      await updateGenerationRun(runId, { action: "cancel" }).catch(
        () => undefined,
      );
    setStreamPromise(undefined);
    setGenerationRunId(null);
    setGenerationStatus(DEFAULT_GENERATION_STATUS);
    setStreamText("");
    setReasoningText("");
    setStreamSources([]);
    setResearchActivity(null);
    repairRequestInFlightRef.current = false;
    freeRepairRequestIdRef.current = null;
    freeRepairSourceMessageIdRef.current = null;
    freeRepairSourceFilesRef.current = null;
    toast.info("Generation stopped. Reserved credits were released.");
  }, [generationRunId, setStreamPromise]);

  const handleRecoverGeneration = useCallback(() => {
    if (!recoverableRun) return;
    setStreamError(null);
    setStreamPromise(
      recoverableRun.recoveryMode === "restore"
        ? recoverCompletionStream(recoverableRun.id)
        : retryCompletionStream({
            messageId: recoverableRun.messageId,
            model: chat.model,
            generationRunId: recoverableRun.id,
          }),
    );
    setRecoverableRun(null);
  }, [chat.model, recoverableRun, setStreamPromise]);

  useEffect(() => {
    let reader: ReadableStreamDefaultReader<UIMessageChunk> | null = null;
    let renderFrame: number | null = null;
    let pendingText = "";
    let pendingChatText = "";
    let pendingReasoning = "";
    let pendingSources: SourceUrl[] = [];

    const cancelRenderFrame = () => {
      if (renderFrame !== null) {
        window.cancelAnimationFrame(renderFrame);
        renderFrame = null;
      }
    };
    const scheduleStreamRender = () => {
      if (renderFrame !== null) return;
      renderFrame = window.requestAnimationFrame(() => {
        renderFrame = null;
        setStreamText(pendingText);
        setStreamChatText(pendingChatText);
        setReasoningText(pendingReasoning);
        setStreamSources(pendingSources);
      });
    };

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

      let didPushToCode = false;
      let didPushToPreview = false;
      let fullText = "";
      let fullReasoning = "";
      let completedAgentAction: AgentAction | null = null;
      let hasEnteredReasoningPhase = false;
      let hasEnteredWritingPhase = false;
      const sourceMap = new Map<string, SourceUrl>();
      let creditHoldId: string | undefined;
      let activeStream: CompletionStream | undefined;

      try {
        setReasoningText("");
        setStreamChatText("");
        setStreamResponseKind(null);
        setStreamSources([]);
        setResearchActivity(null);
        setGenerationStatus(DEFAULT_GENERATION_STATUS);
        const stream = await streamPromise;
        activeStream = stream;
        creditHoldId = stream.creditHoldId;
        setGenerationRunId(stream.generationRunId ?? null);
        setRecoverableRun(null);

        if (stream.events.locked) {
          throw new Error(
            "The response stream could not be resumed. Please retry.",
          );
        }

        reader = stream.events.getReader();
        streamReaderRef.current = reader;

        while (true) {
          const { done, value: event } = await reader.read();
          if (done) break;

          if (event.type === "data-generation-status") {
            const parsedStatus = generationStatusSchema.safeParse(event.data);
            if (parsedStatus.success) {
              setGenerationStatus(parsedStatus.data);
            }
            continue;
          }

          if (event.type === "data-agent-action") {
            const parsedAction = agentActionSchema.safeParse(event.data);
            if (parsedAction.success) {
              completedAgentAction = parsedAction.data;
              const responseKind =
                parsedAction.data.action === "answer" ? "answer" : "app";
              setStreamResponseKind(responseKind);
              pendingChatText =
                responseKind === "answer"
                  ? fullText
                  : extractChatNarration(fullText);
              scheduleStreamRender();
            }
            continue;
          }

          if (event.type === "data-research-activity") {
            const parsedActivity = researchActivitySchema.safeParse(event.data);
            if (parsedActivity.success) {
              setResearchActivity(parsedActivity.data);
            }
            continue;
          }

          if (event.type === "source-url") {
            const parsedSource = sourceUrlSchema.safeParse(event);
            if (parsedSource.success) {
              sourceMap.set(parsedSource.data.sourceId, parsedSource.data);
              pendingSources = Array.from(sourceMap.values());
              scheduleStreamRender();
            }
            continue;
          }

          if (
            event.type === "tool-input-start" ||
            event.type === "tool-input-available"
          ) {
            setGenerationStatus({
              phase: "searching",
              label: "Searching the web",
            });
            continue;
          }

          if (event.type === "reasoning-delta") {
            fullReasoning += event.delta;
            pendingReasoning = fullReasoning;
            scheduleStreamRender();
            if (!hasEnteredReasoningPhase) {
              hasEnteredReasoningPhase = true;
              setGenerationStatus({
                phase: "reasoning",
                label: "Working through the design",
              });
            }
            continue;
          }

          if (event.type === "error") {
            throw new Error(event.errorText);
          }

          if (event.type !== "text-delta") {
            continue;
          }

          fullText += event.delta;
          pendingText = fullText;
          pendingChatText =
            completedAgentAction?.action === "answer"
              ? fullText
              : extractChatNarration(fullText);
          scheduleStreamRender();
          if (!hasEnteredWritingPhase) {
            hasEnteredWritingPhase = true;
            setGenerationStatus(
              completedAgentAction?.action === "answer"
                ? { phase: "writing-code", label: "Writing an answer" }
                : { phase: "writing-code", label: "Writing your app" },
            );
          }

          if (
            !didPushToCode &&
            parseReplySegments(fullText).some((seg) => seg.type === "file")
          ) {
            didPushToCode = true;
            setIsShowingCodeViewer(true);
          }

          if (
            !didPushToPreview &&
            parseReplySegments(fullText).some(
              (seg) => seg.type === "file" && !seg.isPartial,
            )
          ) {
            didPushToPreview = true;
            setIsShowingCodeViewer(true);
            setActiveTab("preview");
          }
        }

        let serverRunPhase: string | null = null;
        if (activeStream?.generationRunId) {
          try {
            const run = await fetchGenerationRun(activeStream.generationRunId);
            if (run.partialText.trim()) {
              fullText = run.partialText;
              pendingText = fullText;
              pendingChatText =
                completedAgentAction?.action === "answer"
                  ? fullText
                  : extractChatNarration(fullText);
              scheduleStreamRender();
            }
            serverRunPhase = run.phase;
            const parsedRunStatus = generationStatusSchema.safeParse({
              phase: run.phase,
              label: run.label,
            });
            if (parsedRunStatus.success) {
              setGenerationStatus(parsedRunStatus.data);
            }
          } catch (runError) {
            console.warn(
              "Unable to sync generation run finalize state:",
              runError,
            );
          }
        }

        if (!fullText.trim() && !completedAgentAction) {
          throw new Error(
            "The model returned an empty response. Please retry.",
          );
        }

        const getFilesFromMessage = getMessageGeneratedFiles;

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
        const pendingRepairSourceFiles = freeRepairSourceFilesRef.current;

        // Repairs are intentionally partial. Merge them onto the version that
        // produced the preview error, not onto an unrelated newer checkpoint.
        const previousFiles = repairSourceMessage
          ? getFilesFromMessage(repairSourceMessage)
          : pendingRepairSourceFiles
            ? pendingRepairSourceFiles
            : previousAssistantMessages.flatMap((msg: Message) =>
                getFilesFromMessage(msg),
              );

        const isStructuredInteraction =
          completedAgentAction?.action === "clarify" ||
          completedAgentAction?.action === "interview" ||
          completedAgentAction?.action === "request_backend_setup" ||
          completedAgentAction?.action === "present_plan" ||
          completedAgentAction?.action === "search";
        if (completedAgentAction?.action === "answer" && !fullText.trim()) {
          throw new Error(
            "The assistant returned an empty answer. Please retry.",
          );
        }

        // Extract files from current AI response
        const currentFiles = normalizeGeneratedFiles(
          extractAllCodeBlocks(fullText),
        );

        // Merge files (current overrides previous for same paths)
        const fileMap = new Map();
        previousFiles.forEach((file: GeneratedFile) =>
          fileMap.set(file.path, file),
        );
        currentFiles.forEach((file: GeneratedFile) =>
          fileMap.set(file.path, file),
        );
        const allFiles = normalizeGeneratedFiles(Array.from(fileMap.values()));
        const diagnostics =
          completedAgentAction?.action === "answer" || isStructuredInteraction
            ? []
            : validateGeneratedFiles(allFiles);

        if (diagnostics.length > 0) {
          console.warn(
            "Generated stream completed with diagnostics:",
            diagnostics,
          );
        }

        const repairMessageId = freeRepairRequestIdRef.current;
        let message: Message | undefined;
        let shouldOpenPreview = false;
        let queuedRepairStream: Promise<CompletionStream> | undefined;
        const agentMessageOptions = {
          creditHoldId,
          generationRunId: activeStream?.generationRunId,
        };

        try {
          if (completedAgentAction?.action === "clarify") {
            message = (await createAgentAssistantMessage(
              chat.id,
              `Before I build, ${completedAgentAction.request.title.toLowerCase()}`,
              {
                kind: "agent_clarification_request",
                request: completedAgentAction.request,
              },
              { ...agentMessageOptions, chargeCredits: false },
            )) as Message;
          } else if (completedAgentAction?.action === "interview") {
            message = (await createAgentAssistantMessage(
              chat.id,
              completedAgentAction.request.title,
              {
                kind: "agent_interview_request",
                request: completedAgentAction.request,
              },
              { ...agentMessageOptions, chargeCredits: false },
            )) as Message;
          } else if (completedAgentAction?.action === "request_backend_setup") {
            message = (await createAgentAssistantMessage(
              chat.id,
              completedAgentAction.request.title,
              {
                kind: "agent_backend_setup_request",
                request: completedAgentAction.request,
              },
              { ...agentMessageOptions, chargeCredits: false },
            )) as Message;
          } else if (completedAgentAction?.action === "present_plan") {
            const plan = completedAgentAction.plan;
            message = (await createAgentAssistantMessage(
              chat.id,
              plan.title,
              {
                kind: "agent_plan_request",
                request: plan,
              },
              { ...agentMessageOptions, chargeCredits: false },
            )) as Message;
          } else if (completedAgentAction?.action === "search") {
            message = (await createAgentAssistantMessage(
              chat.id,
              `I can search the internet for “${completedAgentAction.request.query}”.`,
              {
                kind: "agent_search_approval_request",
                request: completedAgentAction.request,
              },
              { ...agentMessageOptions, chargeCredits: false },
            )) as Message;
          } else if (completedAgentAction?.action === "answer") {
            message = (await createAgentAssistantMessage(
              chat.id,
              fullText,
              {
                kind: "agent_response",
                sources: Array.from(sourceMap.values()),
              },
              { ...agentMessageOptions, chargeCredits: true },
            )) as Message;
          } else {
            if (!activeStream?.generationRunId) {
              throw new Error(
                "Generation run state is missing. Retry this request.",
              );
            }
            message = (await finalizeGenerationRun(
              activeStream.generationRunId,
            )) as Message;
            shouldOpenPreview = true;
          }
        } catch (saveError) {
          const saveErrorMessage = getErrorMessage(saveError, "");
          if (
            saveErrorMessage.startsWith("SELECTED_API_CONTRACT_VIOLATION:") &&
            activeStream?.generationRunId &&
            allFiles.length > 0
          ) {
            const repairRequest = await createValidationRepairMessage(
              chat.id,
              activeStream.generationRunId,
              allFiles,
            );
            freeRepairRequestIdRef.current = repairRequest.id;
            freeRepairSourceMessageIdRef.current = null;
            freeRepairSourceFilesRef.current = allFiles;
            repairRequestInFlightRef.current = true;
            automaticRepairAttemptsRef.current = repairRequest.attempt;
            toast.info(
              `Fixing generated app (${repairRequest.attempt}/${MAX_AUTOMATIC_PREVIEW_REPAIRS})`,
            );
            queuedRepairStream = fetchCompletionStream({
              messageId: repairRequest.id,
              model: chat.model,
            });
            shouldOpenPreview = false;
          } else {
            throw saveError;
          }
        }

        if (
          shouldOpenPreview &&
          message &&
          (diagnostics.length > 0 || serverRunPhase === "validation_repair")
        ) {
          const validationError =
            diagnostics.length > 0
              ? formatGeneratedFileDiagnostics(diagnostics)
              : "Generated code needs repair before preview can open.";

          if (
            automaticRepairAttemptsRef.current < MAX_AUTOMATIC_PREVIEW_REPAIRS
          ) {
            automaticRepairAttemptsRef.current += 1;
            repairRequestInFlightRef.current = true;
            toast.info(
              `Repairing generated app (${automaticRepairAttemptsRef.current}/${MAX_AUTOMATIC_PREVIEW_REPAIRS})`,
            );

            try {
              const repairRequest = await createPreviewRepairMessage(
                chat.id,
                validationError,
                { sourceMessageId: message.id },
              );
              freeRepairRequestIdRef.current = repairRequest.id;
              freeRepairSourceMessageIdRef.current = message.id;
              freeRepairSourceFilesRef.current = allFiles;
              queuedRepairStream = fetchCompletionStream({
                messageId: repairRequest.id,
                model: chat.model,
              });
              shouldOpenPreview = false;
            } catch (repairError) {
              repairRequestInFlightRef.current = false;
              setPreviewRecovery({
                error: getErrorMessage(
                  repairError,
                  "Unable to repair generated app validation failures",
                ),
                attempts: automaticRepairAttemptsRef.current,
              });
            }
          } else {
            setPreviewRecovery({
              error: validationError,
              attempts: automaticRepairAttemptsRef.current,
            });
          }
        }

        startTransition(() => {
          cancelRenderFrame();
          if (!queuedRepairStream) {
            freeRepairRequestIdRef.current = null;
            freeRepairSourceMessageIdRef.current = null;
            freeRepairSourceFilesRef.current = null;
            repairRequestInFlightRef.current = false;
          }
          setStreamText("");
          setStreamChatText("");
          setStreamResponseKind(null);
          setReasoningText("");
          setStreamSources([]);
          setResearchActivity(null);
          setGenerationStatus(DEFAULT_GENERATION_STATUS);
          if (!queuedRepairStream) {
            setStreamPromise(undefined);
          }
          setGenerationRunId(null);
          if (message) {
            setStreamError(null);
            setRecoverableRun(null);
            setPreviewRecovery(null);
          }
          if (shouldOpenPreview && message) {
            setActiveMessage(message);
            setIsShowingCodeViewer(true);
            setActiveTab("preview");
          }
          if (shouldOpenPreview && message) {
            plausible("First Build Completed", {
              props: {
                timeToFirstPreviewMs: generationStartedAtRef.current
                  ? Date.now() - generationStartedAtRef.current
                  : 0,
                automaticRepair: Boolean(repairMessageId),
              },
            });
            generationStartedAtRef.current = null;
          }
          router.refresh();
        });

        if (queuedRepairStream) {
          window.queueMicrotask(() => setStreamPromise(queuedRepairStream));
        }
      } catch (error: unknown) {
        console.warn(
          "Generation stream failed:",
          getErrorMessage(error, "Connection lost"),
        );
        plausible("Build Failed", {
          props: {
            elapsedMs: generationStartedAtRef.current
              ? Date.now() - generationStartedAtRef.current
              : 0,
          },
        });
        generationStartedAtRef.current = null;
        if (creditHoldId && !fullText) {
          await releaseReservedCreditHold(creditHoldId);
        }
        setStreamPromise(undefined);
        setStreamResponseKind(null);
        setReasoningText("");
        setStreamSources([]);
        setResearchActivity(null);
        setGenerationStatus(DEFAULT_GENERATION_STATUS);
        freeRepairRequestIdRef.current = null;
        freeRepairSourceMessageIdRef.current = null;
        freeRepairSourceFilesRef.current = null;
        repairRequestInFlightRef.current = false;

        const failedMessageId =
          activeStream?.messageId ?? getCompletionStreamMessageId(error);
        setStreamError({
          message: getErrorMessage(error, "Connection lost"),
          partialText: fullText,
          canRetry: Boolean(failedMessageId),
          failedMessageId,
          generationRunId: activeStream?.generationRunId,
        });
        if (activeStream?.generationRunId && fullText) {
          setRecoverableRun({
            id: activeStream.generationRunId,
            messageId: activeStream.messageId,
            status: "recoverable",
            phase: "finalizing",
            label: "Recover interrupted generation",
            partialTextLength: fullText.length,
            recoveryMode: getGenerationRecoveryMode(fullText),
            createdAt: new Date(),
          });
        }
      } finally {
        try {
          reader?.releaseLock();
        } catch {
          // Ignore release errors from already-closed readers.
        }
        streamReaderRef.current = null;
        isHandlingStreamRef.current = false;
      }
    }

    f();

    return () => {
      cancelRenderFrame();
      // Do not cancel here. React dev effect replay can run cleanup while the
      // stream should continue, and canceling makes the next reader race the
      // still-locked stream.
    };
  }, [
    chat.id,
    chat.messages,
    chat.model,
    plausible,
    router,
    setStreamPromise,
    streamPromise,
  ]);

  const continueAgentConversation = useCallback(
    async (
      content: string,
      metadata:
        | {
            kind: "agent_clarification_response";
            requestId: string;
            answers: ClarificationAnswers;
            summary: Array<{ label: string; value: string }>;
          }
        | {
            kind: "agent_interview_response";
            requestId: string;
            answers: ClarificationAnswers;
            summary: Array<{ label: string; value: string }>;
          }
        | {
            kind: "agent_backend_setup_response";
            requestId: string;
            decision: BackendSetupDecision;
          }
        | {
            kind: "agent_search_approval_response";
            requestId: string;
            query: string;
            approved: boolean;
          }
        | {
            kind: "agent_plan_approval";
            requestId: string;
            approved: boolean;
          },
    ) => {
      if (streamPromise) return;

      try {
        const message = await createAgentUserMessage(
          chat.id,
          content,
          metadata,
        );
        setStreamPromise(
          fetchCompletionStream({
            messageId: message.id,
            model: chat.model,
          }),
        );
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to continue the conversation";
        if (
          metadata.kind === "agent_backend_setup_response" &&
          message === "This setup interaction has already been completed"
        ) {
          router.refresh();
          return;
        }
        toast.error(message);
      }
    },
    [chat.id, chat.model, router, setStreamPromise, streamPromise],
  );

  const openSupabaseConnectFlow = useCallback(() => {
    const connectUrl = `/api/integrations/oauth/supabase/start?projectId=${encodeURIComponent(chat.id)}&environment=development`;
    const popup = window.open(connectUrl, "_blank", "noopener,noreferrer");
    if (!popup) {
      window.location.assign(connectUrl);
    }
  }, [chat.id]);

  const handlePersistenceConnectChoice = (answers: ClarificationAnswers) => {
    return answers["data-persistence-connect"]?.includes("connect-db-now");
  };

  const handleClarificationComplete = useCallback(
    async (request: ClarificationRequest, answers: ClarificationAnswers) => {
      const summary = formatClarificationAnswers(request, answers);
      const content = [
        "Here are my choices:",
        ...summary.map((item) => `- ${item.label}: ${item.value}`),
      ].join("\n");

      if (handlePersistenceConnectChoice(answers)) {
        openSupabaseConnectFlow();
      }

      await continueAgentConversation(content, {
        kind: "agent_clarification_response",
        requestId: request.id,
        answers,
        summary,
      });
    },
    [continueAgentConversation, openSupabaseConnectFlow],
  );

  const handleInterviewComplete = useCallback(
    async (request: ClarificationRequest, answers: ClarificationAnswers) => {
      const summary = formatClarificationAnswers(request, answers);
      const content = [
        "Here are my choices:",
        ...summary.map((item) => `- ${item.label}: ${item.value}`),
      ].join("\n");

      if (handlePersistenceConnectChoice(answers)) {
        openSupabaseConnectFlow();
      }

      await continueAgentConversation(content, {
        kind: "agent_interview_response",
        requestId: request.id,
        answers,
        summary,
      });
    },
    [continueAgentConversation, openSupabaseConnectFlow],
  );

  const handlePlanApprove = useCallback(
    async (plan: Plan) => {
      const content = `I approve the plan "${plan.title}". Please build it now.`;
      await continueAgentConversation(content, {
        kind: "agent_plan_approval",
        requestId: plan.id,
        approved: true,
      });
    },
    [continueAgentConversation],
  );

  const handleBackendSetup = useCallback(
    async (request: BackendSetupRequest, decision: BackendSetupDecision) => {
      await continueAgentConversation(
        decision === "connect_supabase"
          ? "Supabase is ready. Continuing your build with authentication and persistent data."
          : "Build the interface only for now. Keep data in the browser and do not require a backend.",
        {
          kind: "agent_backend_setup_response",
          requestId: request.id,
          decision,
        },
      );
    },
    [continueAgentConversation],
  );

  const handlePlanRevision = useCallback(async (plan: Plan) => {
    // For revisions, we route through the chatBox (user types a revision note).
    // Provide a hint to the chat input so the user can describe what to change.
    toast.info("Type the changes you'd like in the chat below.");
  }, []);

  const handleSearchApproval = useCallback(
    async (request: SearchRequest, approved: boolean) => {
      await continueAgentConversation(
        approved
          ? `Approved internet search: ${request.query}`
          : `Declined internet search: ${request.query}`,
        {
          kind: "agent_search_approval_response",
          requestId: request.id,
          query: request.query,
          approved,
        },
      );
    },
    [continueAgentConversation],
  );

  const requestPreviewRepair = useCallback(
    async (error: string, automatic: boolean) => {
      if (!activeMessage || streamPromise || repairRequestInFlightRef.current) {
        return;
      }

      const errorKey = `${activeMessage.id}:${error}`;
      if (automatic && handledPreviewErrorRef.current === errorKey) return;

      if (
        automatic &&
        automaticRepairAttemptsRef.current >= MAX_AUTOMATIC_PREVIEW_REPAIRS
      ) {
        setPreviewRecovery({
          error,
          attempts: automaticRepairAttemptsRef.current,
        });
        return;
      }

      if (automatic) {
        handledPreviewErrorRef.current = errorKey;
        automaticRepairAttemptsRef.current += 1;
        toast.info(
          `Repairing preview (${automaticRepairAttemptsRef.current}/${MAX_AUTOMATIC_PREVIEW_REPAIRS})`,
        );
      }
      setPreviewRecovery(null);
      repairRequestInFlightRef.current = true;

      try {
        const repairMessage = await createPreviewRepairMessage(chat.id, error, {
          sourceMessageId: activeMessage.id,
        });
        freeRepairRequestIdRef.current = repairMessage.id;
        freeRepairSourceMessageIdRef.current = activeMessage.id;
        freeRepairSourceFilesRef.current =
          getMessageGeneratedFiles(activeMessage);
        setStreamPromise(
          fetchCompletionStream({
            messageId: repairMessage.id,
            model: chat.model,
          }),
        );
        router.refresh();
      } catch (repairError) {
        repairRequestInFlightRef.current = false;
        if (automatic) {
          automaticRepairAttemptsRef.current = Math.max(
            0,
            automaticRepairAttemptsRef.current - 1,
          );
          handledPreviewErrorRef.current = null;
        }
        toast.error(
          repairError instanceof Error
            ? repairError.message
            : "Unable to repair the preview",
        );
      }
    },
    [
      activeMessage,
      chat.id,
      chat.model,
      router,
      setStreamPromise,
      streamPromise,
    ],
  );

  const handlePreviewHealth = useCallback(
    (health: { status: "working" | "error"; error?: string }) => {
      if (health.status === "working") {
        automaticRepairAttemptsRef.current = 0;
        handledPreviewErrorRef.current = null;
        setPreviewRecovery(null);
        return;
      }

      if (health.error) {
        void requestPreviewRepair(health.error, true);
      }
    },
    [requestPreviewRepair],
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <div className="flex h-full min-h-0 min-w-0 overflow-hidden">
        <div
          className={`flex h-full min-w-0 flex-col overflow-x-hidden ${
            isShowingCodeViewer
              ? "w-full lg:w-[clamp(22rem,32vw,36rem)] lg:shrink-0"
              : "w-full"
          }`}
        >
          <HeaderChat chat={chat} />

          <ChatLog
            chat={chat}
            streamText={streamChatText}
            streamResponseKind={streamResponseKind}
            reasoningText={reasoningText}
            generationStatus={generationStatus}
            researchActivity={researchActivity}
            streamSources={streamSources}
            isStreaming={!!streamPromise}
            activeMessage={activeMessage}
            streamError={recoverableRun ? null : streamError}
            onRetryAction={handleRetry}
            onClarificationCompleteAction={handleClarificationComplete}
            onInterviewCompleteAction={handleInterviewComplete}
            onSearchApprovalAction={handleSearchApproval}
            onBackendSetupAction={handleBackendSetup}
            onPlanApproveAction={handlePlanApprove}
            onPlanRevisionAction={handlePlanRevision}
            previewRecovery={previewRecovery}
            onPreviewRecoveryAction={() => {
              if (previewRecovery) {
                void requestPreviewRepair(previewRecovery.error, false);
              }
            }}
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

          {recoverableRun?.status === "recoverable" &&
            recoverableRun.partialTextLength > 0 &&
            !streamPromise && (
              <div className="mx-auto mb-3 w-full max-w-[42rem] px-4 sm:px-5">
                <section
                  aria-labelledby="generation-recovery-title"
                  className="relative overflow-hidden rounded-xl border border-amber-500/25 bg-card/80 p-4 text-sm shadow-[0_14px_40px_-28px_hsl(var(--foreground)/0.45)] backdrop-blur-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <RotateCcw className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1 pr-7">
                      <p
                        id="generation-recovery-title"
                        className="font-medium text-foreground"
                      >
                        {recoverableRun.recoveryMode === "restore"
                          ? "Continue interrupted build"
                          : "Restart interrupted build"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                        {recoverableRun.recoveryMode === "restore"
                          ? `${recoverableRun.partialTextLength.toLocaleString()} characters and completed application files were saved. Continue to validate and open the recovered preview.`
                          : `${recoverableRun.partialTextLength.toLocaleString()} characters were saved, but the response ended before an application file was completed. Restart from your original request.`}
                      </p>
                      <button
                        type="button"
                        className="mt-3 inline-flex min-h-8 items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition hover:bg-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-px"
                        onClick={handleRecoverGeneration}
                      >
                        <RotateCcw className="size-3.5" />
                        {recoverableRun.recoveryMode === "restore"
                          ? "Continue build"
                          : "Restart build"}
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label="Dismiss interrupted build"
                      className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => setRecoverableRun(null)}
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </section>
              </div>
            )}

          {showFirstBuildHelp && (
            <div className="mx-3 mb-2 flex items-start gap-3 rounded-xl border border-blue-500/25 bg-blue-500/5 p-3 text-sm">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-blue-500" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">
                  Your first build is ready
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Open the Quality report to inspect static checks, select an
                  element for a targeted edit, or export the source when you are
                  ready to ship.
                </p>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Dismiss first build help"
                onClick={() => {
                  localStorage.setItem(
                    "squid:first-build-help-dismissed",
                    "true",
                  );
                  setShowFirstBuildHelp(false);
                }}
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          <ChatBox
            chat={chat}
            onNewStreamPromiseAction={handleNewStreamPromise}
            isStreaming={!!streamPromise}
            onStopAction={handleStopGeneration}
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
                void requestPreviewRepair(error, false);
              }}
              onPreviewHealthChange={handlePreviewHealth}
              onRequestTargetedEdit={(prompt: string) => {
                startTransition(async () => {
                  try {
                    const { messageId } = await createUserMessage(
                      chat.id,
                      prompt,
                    );
                    const streamPromise = fetchCompletionStream({
                      messageId,
                      model: chat.model,
                    });
                    setStreamPromise(streamPromise);
                    router.refresh();
                  } catch (error: unknown) {
                    const message = getErrorMessage(
                      error,
                      "Failed to start selected edit",
                    );
                    toast.error(
                      message === "INSUFFICIENT_CREDITS"
                        ? "You need more credits to edit this project."
                        : message,
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
              onRestoreFiles={async (sourceMessageId, paths) => {
                const newMessage = await restoreSelectedFilesAsCheckpoint({
                  chatId: chat.id,
                  sourceMessageId,
                  paths,
                });
                setActiveMessage(newMessage);
                router.refresh();
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
