"use client";

import {
  createAgentAssistantMessage,
  createAgentUserMessage,
} from "@/features/generation/server/agent-actions";
import {
  createFreeRepairAssistantMessage,
  createMessage,
  createPreviewRepairMessage,
  createValidationRepairMessage,
  releaseReservedCreditHold,
  restoreSelectedFilesAsCheckpoint,
  restoreVersionAsCheckpoint,
} from "@/features/generation/server/actions";
import { saveProject } from "@/features/projects/server/actions";
import LogoSmall from "@/components/icons/logo-small";
import {
  parseReplySegments,
  extractFirstCodeBlock,
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
import { getErrorMessage } from "@/features/shared/errors";
import { useGenerationHandoff } from "@/features/generation/client/generation-handoff-context";
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
  const {
    streamPromise: initialStreamPromise,
    setStreamPromise: setContextStreamPromise,
  } = useGenerationHandoff();
  const [streamPromise, setStreamPromise] = useState<
    Promise<CompletionStream> | undefined
  >(initialStreamPromise);
  const [streamText, setStreamText] = useState("");
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
        (Array.isArray(message.files)
          ? message.files.length > 0
          : Boolean(extractFirstCodeBlock(message.content))),
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
          m.role === "assistant" &&
          (getMessageGeneratedFiles(m).length > 0 ||
            extractFirstCodeBlock(m.content)),
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

  const handleRetry = useCallback(async () => {
    const failedStream = streamError;
    setStreamError(null);
    if (!failedStream?.failedMessageId) return;

    try {
      const retriedStream = await retryCompletionStream({
        messageId: failedStream.failedMessageId,
        model: chat.model,
        generationRunId: failedStream.generationRunId,
      });
      setRecoverableRun(null);
      setStreamPromise(Promise.resolve(retriedStream));
    } catch (error) {
      setStreamError({
        ...failedStream,
        message: getErrorMessage(error, "Unable to retry generation"),
      });
    }
  }, [chat.model, streamError]);

  const handleNewStreamPromise = useCallback(
    (nextStream: Promise<CompletionStream>) => {
      setStreamError(null);
      setRecoverableRun(null);
      setPreviewRecovery(null);
      setStreamPromise(nextStream);
    },
    [],
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
  }, [generationRunId]);

  const handleRecoverGeneration = useCallback(() => {
    if (!recoverableRun) return;
    setStreamError(null);
    setStreamPromise(recoverCompletionStream(recoverableRun.id));
    setRecoverableRun(null);
  }, [recoverableRun]);

  useEffect(() => {
    let reader: ReadableStreamDefaultReader<UIMessageChunk> | null = null;
    let renderFrame: number | null = null;
    let pendingText = "";
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
      setContextStreamPromise(undefined);

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
        setStreamSources([]);
        setResearchActivity(null);
        setGenerationStatus(DEFAULT_GENERATION_STATUS);
        const stream = await streamPromise;
        activeStream = stream;
        creditHoldId = stream.creditHoldId;
        setGenerationRunId(stream.generationRunId ?? null);
        setRecoverableRun(null);

        if (stream.events.locked) {
          console.warn("Skipping duplicate stream reader for locked stream");
          return;
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

        try {
          if (completedAgentAction?.action === "clarify") {
            message = (await createAgentAssistantMessage(
              chat.id,
              `Before I build, ${completedAgentAction.request.title.toLowerCase()}`,
              {
                kind: "agent_clarification_request",
                request: completedAgentAction.request,
              },
              { creditHoldId, chargeCredits: false },
            )) as Message;
          } else if (completedAgentAction?.action === "interview") {
            message = (await createAgentAssistantMessage(
              chat.id,
              completedAgentAction.request.title,
              {
                kind: "agent_interview_request",
                request: completedAgentAction.request,
              },
              { creditHoldId, chargeCredits: false },
            )) as Message;
          } else if (completedAgentAction?.action === "request_backend_setup") {
            message = (await createAgentAssistantMessage(
              chat.id,
              completedAgentAction.request.title,
              {
                kind: "agent_backend_setup_request",
                request: completedAgentAction.request,
              },
              { creditHoldId, chargeCredits: false },
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
              { creditHoldId, chargeCredits: false },
            )) as Message;
          } else if (completedAgentAction?.action === "search") {
            message = (await createAgentAssistantMessage(
              chat.id,
              `I can search the internet for “${completedAgentAction.request.query}”.`,
              {
                kind: "agent_search_approval_request",
                request: completedAgentAction.request,
              },
              { creditHoldId, chargeCredits: false },
            )) as Message;
          } else if (completedAgentAction?.action === "answer") {
            message = (await createAgentAssistantMessage(
              chat.id,
              fullText,
              {
                kind: "agent_response",
                sources: Array.from(sourceMap.values()),
              },
              { creditHoldId, chargeCredits: true },
            )) as Message;
          } else if (repairMessageId) {
            message = (await createFreeRepairAssistantMessage(
              chat.id,
              repairMessageId,
              fullText,
              allFiles,
              { generationRunId: activeStream?.generationRunId },
            )) as Message;
            shouldOpenPreview = true;
          } else {
            message = (await createMessage(
              chat.id,
              fullText, // Store original AI response content (only changed files)
              "assistant",
              allFiles, // Store cumulative files
              {
                creditHoldId,
                generationRunId: activeStream?.generationRunId,
              },
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

        if (shouldOpenPreview && message && diagnostics.length > 0) {
          const validationError = formatGeneratedFileDiagnostics(diagnostics);

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

        if (stream.generationRunId && message) {
          await updateGenerationRun(stream.generationRunId, {
            action: "complete",
            assistantMessageId: message.id,
          });
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
        setReasoningText("");
        setStreamSources([]);
        setResearchActivity(null);
        setGenerationStatus(DEFAULT_GENERATION_STATUS);
        freeRepairRequestIdRef.current = null;
        freeRepairSourceMessageIdRef.current = null;
        freeRepairSourceFilesRef.current = null;
        repairRequestInFlightRef.current = false;

        setStreamError({
          message: getErrorMessage(error, "Connection lost"),
          partialText: fullText,
          canRetry: true,
          failedMessageId: activeStream?.messageId,
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
    streamPromise,
    setContextStreamPromise,
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
    [chat.id, chat.model, router, streamPromise],
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
    [activeMessage, chat.id, chat.model, router, streamPromise],
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
            streamText={streamText}
            reasoningText={reasoningText}
            generationStatus={generationStatus}
            researchActivity={researchActivity}
            streamSources={streamSources}
            isStreaming={!!streamPromise}
            activeMessage={activeMessage}
            streamError={streamError}
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

          {recoverableRun &&
            recoverableRun.partialTextLength > 0 &&
            !streamPromise && (
              <div className="mx-3 mb-2 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
                <RotateCcw className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">Recover interrupted generation</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {`${recoverableRun.partialTextLength.toLocaleString()} characters are safely stored. Recover the draft now; Squid will validate it and repair the preview if needed.`}
                  </p>
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground"
                    onClick={handleRecoverGeneration}
                  >
                    <RotateCcw className="size-3" /> Recover draft
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Dismiss recovery"
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                  onClick={() => setRecoverableRun(null)}
                >
                  <X className="size-3.5" />
                </button>
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
                    const message = await createMessage(
                      chat.id,
                      prompt,
                      "user",
                    );
                    const streamPromise = fetchCompletionStream({
                      messageId: message.id,
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
