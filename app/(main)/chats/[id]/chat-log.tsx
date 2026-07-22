"use client";

import type { Chat, Message } from "./page";
import {
  parseReplySegments,
  extractFirstCodeBlock,
  extractAllCodeBlocks,
  toTitleCase,
} from "@/lib/utils";
import { Fragment, useMemo } from "react";
import { StickToBottom } from "use-stick-to-bottom";
import { AppVersionButton } from "@/components/app-version-button";
import { Button } from "@/components/ui/button";
import { AlertTriangle, LoaderCircle, RefreshCw } from "lucide-react";
import { normalizeGeneratedFiles } from "@/lib/generated-files";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import type {
  GenerationStatus,
  ResearchActivity,
} from "@/features/generation/contracts";
import { MessageResponse } from "@/components/ai-elements/message";
import {
  parseAgentMessageMetadata,
  type AgentMessageMetadata,
  type BackendSetupDecision,
  type BackendSetupRequest,
  type ClarificationAnswers,
  type ClarificationRequest,
  type SearchRequest,
  type SourceUrl,
} from "@/features/generation/agent-contracts";
import {
  BackendSetupCard,
  ClarificationRequestCard,
  InterviewRequestCard,
  MessageSources,
  PlanRequestCard,
  ResearchActivityCard,
  SearchApprovalCard,
} from "./agent-interactions";
import type { Plan } from "@/features/generation/agent-contracts";
import { getMessageGeneratedFiles } from "@/features/generation/message-files";
import { GenerationReceipt } from "@/components/generation-receipt";

export default function ChatLog({
  chat,
  activeMessage,
  streamText,
  reasoningText,
  generationStatus,
  researchActivity,
  streamSources,
  isStreaming,
  onMessageClickAction,
  streamError,
  onRetryAction,
  onClarificationCompleteAction,
  onInterviewCompleteAction,
  onSearchApprovalAction,
  onBackendSetupAction,
  onPlanApproveAction,
  onPlanRevisionAction,
  previewRecovery,
  onPreviewRecoveryAction,
}: {
  chat: Chat;
  activeMessage?: Message;
  streamText: string;
  reasoningText: string;
  generationStatus: GenerationStatus;
  researchActivity: ResearchActivity | null;
  streamSources: SourceUrl[];
  isStreaming: boolean;
  onMessageClickAction: (v: Message) => void;
  streamError?: {
    message: string;
    partialText: string;
    canRetry: boolean;
    failedMessageId?: string;
  } | null;
  onRetryAction?: () => void;
  onClarificationCompleteAction: (
    request: ClarificationRequest,
    answers: ClarificationAnswers,
  ) => void | Promise<void>;
  onInterviewCompleteAction?: (
    request: ClarificationRequest,
    answers: ClarificationAnswers,
  ) => void | Promise<void>;
  onSearchApprovalAction: (
    request: SearchRequest,
    approved: boolean,
  ) => void | Promise<void>;
  onBackendSetupAction: (
    request: BackendSetupRequest,
    decision: BackendSetupDecision,
  ) => void | Promise<void>;
  onPlanApproveAction?: (plan: Plan) => void | Promise<void>;
  onPlanRevisionAction?: (plan: Plan) => void | Promise<void>;
  previewRecovery?: { error: string; attempts: number } | null;
  onPreviewRecoveryAction?: () => void;
}) {
  const assistantMessages = chat.messages.filter(
    (m) =>
      m.role === "assistant" &&
      (getMessageGeneratedFiles(m).length > 0 ||
        extractFirstCodeBlock(m.content) ||
        extractAllCodeBlocks(m.content).length > 0),
  );
  const assistantMessageIndex = useMemo(
    () =>
      new Map(assistantMessages.map((message, index) => [message.id, index])),
    [assistantMessages],
  );
  const interactionResponses = new Map<string, AgentMessageMetadata>();
  for (const message of chat.messages) {
    const metadata = parseAgentMessageMetadata(message.files);
    if (
      metadata?.kind === "agent_clarification_response" ||
      metadata?.kind === "agent_interview_response" ||
      metadata?.kind === "agent_backend_setup_response" ||
      metadata?.kind === "agent_search_approval_response" ||
      metadata?.kind === "agent_plan_approval"
    ) {
      interactionResponses.set(metadata.requestId, metadata);
    }
  }

  return (
    <StickToBottom
      className="relative min-h-0 min-w-0 flex-1 overflow-hidden overscroll-contain"
      resize="smooth"
      initial="smooth"
    >
      <StickToBottom.Content className="mx-auto flex w-full min-w-0 max-w-[42rem] flex-col gap-6 overflow-x-hidden px-4 pb-6 pt-4 sm:px-5 sm:pb-8 sm:pt-6">
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
              <UserMessage content={message.content} message={message} />
            ) : (
              <AssistantMessage
                projectId={chat.id}
                content={message.content}
                version={
                  (chat.assistantMessagesCountBefore || 0) +
                  (assistantMessageIndex.get(message.id) ?? -1) +
                  1
                }
                message={message}
                previousMessage={(() => {
                  const idx = assistantMessageIndex.get(message.id) ?? -1;
                  return idx > 0 ? assistantMessages[idx - 1] : undefined;
                })()}
                isActive={!isStreaming && activeMessage?.id === message.id}
                onMessageClickAction={onMessageClickAction}
                isStreaming={isStreaming}
                interactionResponse={(() => {
                  const metadata = parseAgentMessageMetadata(message.files);
                  return metadata?.kind === "agent_clarification_request" ||
                    metadata?.kind === "agent_interview_request" ||
                    metadata?.kind === "agent_backend_setup_request" ||
                    metadata?.kind === "agent_search_approval_request" ||
                    metadata?.kind === "agent_plan_request"
                    ? interactionResponses.get(metadata.request.id)
                    : undefined;
                })()}
                onClarificationCompleteAction={onClarificationCompleteAction}
                onInterviewCompleteAction={onInterviewCompleteAction}
                onSearchApprovalAction={onSearchApprovalAction}
                onBackendSetupAction={onBackendSetupAction}
                onPlanApproveAction={onPlanApproveAction}
                onPlanRevisionAction={onPlanRevisionAction}
              />
            )}
          </Fragment>
        ))}

        {isStreaming && (
          <div className="flex flex-col gap-4">
            {researchActivity && (
              <ResearchActivityCard
                activity={researchActivity}
                sources={streamSources}
              />
            )}

            {reasoningText ? (
              <Reasoning
                className="w-full"
                isStreaming={generationStatus.phase === "reasoning"}
              >
                <ReasoningTrigger />
                <ReasoningContent>{reasoningText}</ReasoningContent>
              </Reasoning>
            ) : researchActivity &&
              generationStatus.phase === "searching" ? null : (
              <div
                className="flex items-center gap-2 text-sm text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span>{generationStatus.label}</span>
              </div>
            )}

            {streamText && (
              <AssistantMessage
                projectId={chat.id}
                content={streamText}
                version={
                  (chat.assistantMessagesCountBefore || 0) +
                  assistantMessages.length +
                  1
                }
                isActive={true}
                previousMessage={assistantMessages.at(-1)}
                isStreaming={true}
                sources={streamSources}
                onClarificationCompleteAction={onClarificationCompleteAction}
                onInterviewCompleteAction={onInterviewCompleteAction}
                onSearchApprovalAction={onSearchApprovalAction}
                onBackendSetupAction={onBackendSetupAction}
                onPlanApproveAction={onPlanApproveAction}
                onPlanRevisionAction={onPlanRevisionAction}
              />
            )}
          </div>
        )}

        {previewRecovery && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-50/60 p-4 dark:bg-amber-950/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">
                  Preview still needs attention
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Squid tried {previewRecovery.attempts} automatic repairs. You
                  can request another targeted repair or inspect the error in
                  the preview.
                </p>
                {onPreviewRecoveryAction && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={onPreviewRecoveryAction}
                  >
                    Try another repair
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {streamError && (
          <div className="rounded-xl border border-red-500/20 bg-red-50/50 p-4 dark:bg-red-950/20">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-red-700 dark:text-red-400">
                  {streamError.message}
                </p>
                {streamError.partialText && (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Partial response received ({streamError.partialText.length}{" "}
                    characters)
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

function UserMessage({
  content,
  message,
}: {
  content: string;
  message?: Message;
}) {
  const metadata = parseAgentMessageMetadata(message?.files);
  if (
    metadata?.kind === "agent_clarification_response" ||
    metadata?.kind === "agent_search_approval_response" ||
    metadata?.kind === "agent_interview_response" ||
    metadata?.kind === "agent_backend_setup_response" ||
    metadata?.kind === "agent_plan_approval"
  ) {
    return null;
  }

  return (
    <div className="relative inline-flex min-w-0 max-w-[92%] items-end gap-3 self-end sm:max-w-[75%] md:max-w-[65%]">
      <div className="min-w-0 whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-primary px-5 py-3 text-[15px] leading-relaxed text-primary-foreground shadow-sm [overflow-wrap:anywhere]">
        {content}
      </div>
    </div>
  );
}

function AssistantMessage({
  projectId,
  content,
  version,
  message,
  isActive,
  onMessageClickAction = () => {},
  previousMessage,
  isStreaming = false,
  interactionResponse,
  sources,
  onClarificationCompleteAction,
  onInterviewCompleteAction,
  onSearchApprovalAction,
  onBackendSetupAction,
  onPlanApproveAction,
  onPlanRevisionAction,
}: {
  projectId: string;
  content: string;
  version: number;
  message?: Message;
  isActive?: boolean;
  onMessageClickAction?: (v: Message) => void;
  previousMessage?: Message;
  isStreaming?: boolean;
  interactionResponse?: AgentMessageMetadata;
  sources?: SourceUrl[];
  onClarificationCompleteAction: (
    request: ClarificationRequest,
    answers: ClarificationAnswers,
  ) => void | Promise<void>;
  onInterviewCompleteAction?: (
    request: ClarificationRequest,
    answers: ClarificationAnswers,
  ) => void | Promise<void>;
  onSearchApprovalAction: (
    request: SearchRequest,
    approved: boolean,
  ) => void | Promise<void>;
  onBackendSetupAction: (
    request: BackendSetupRequest,
    decision: BackendSetupDecision,
  ) => void | Promise<void>;
  onPlanApproveAction?: (plan: Plan) => void | Promise<void>;
  onPlanRevisionAction?: (plan: Plan) => void | Promise<void>;
}) {
  const metadata = parseAgentMessageMetadata(message?.files);

  if (metadata?.kind === "agent_clarification_request") {
    return (
      <ClarificationRequestCard
        content={content}
        request={metadata.request}
        response={
          interactionResponse?.kind === "agent_clarification_response"
            ? interactionResponse
            : undefined
        }
        onComplete={onClarificationCompleteAction}
      />
    );
  }

  if (metadata?.kind === "agent_interview_request") {
    return (
      <InterviewRequestCard
        content={content}
        request={metadata.request}
        response={
          interactionResponse?.kind === "agent_interview_response"
            ? interactionResponse
            : undefined
        }
        onComplete={onInterviewCompleteAction ?? onClarificationCompleteAction}
      />
    );
  }

  if (metadata?.kind === "agent_backend_setup_request") {
    return (
      <BackendSetupCard
        projectId={projectId}
        request={metadata.request}
        response={
          interactionResponse?.kind === "agent_backend_setup_response"
            ? interactionResponse
            : undefined
        }
        onRespond={onBackendSetupAction}
      />
    );
  }

  if (metadata?.kind === "agent_plan_request") {
    const approvalMetadata =
      interactionResponse?.kind === "agent_plan_approval"
        ? interactionResponse.approved
          ? { approved: true as const }
          : { approved: false as const }
        : undefined;
    return (
      <PlanRequestCard
        request={metadata.request}
        response={approvalMetadata}
        onApprove={() => onPlanApproveAction?.(metadata.request)}
        onRevision={() => onPlanRevisionAction?.(metadata.request)}
      />
    );
  }

  if (metadata?.kind === "agent_search_approval_request") {
    const searchResponse =
      interactionResponse?.kind === "agent_search_approval_response"
        ? interactionResponse
        : undefined;
    return (
      <SearchApprovalCard
        request={metadata.request}
        response={searchResponse}
        onRespond={onSearchApprovalAction}
      />
    );
  }

  const allFiles = (
    message
      ? getMessageGeneratedFiles(message)
      : normalizeGeneratedFiles(extractAllCodeBlocks(content))
  ).map((file) => ({ ...file, fullMatch: file.fullMatch || "" }));
  const segments = parseReplySegments(content);
  const fileSegments = segments.filter((s) => s.type === "file");

  // Generate app title for multiple files
  const generateAppTitle = (
    files: ReadonlyArray<{ path: string; code: string }>,
  ) => {
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
      : fileSegments.map((f) => ({
          code: f.code,
          path: f.path,
        })),
  );

  const displayFileCount = fileSegments.length;
  const messageSources =
    sources ?? (metadata?.kind === "agent_response" ? metadata.sources : []);

  if (displayFileCount > 0) {
    // Handle single-file replies with interleaved text and one file
    return (
      <div className="min-w-0 max-w-full overflow-x-hidden">
        {segments.map((seg, i) => {
          if (seg.type === "text") {
            return (
              <div
                key={i}
                className="prose min-w-0 max-w-none overflow-x-hidden dark:prose-invert prose-p:text-[15px] prose-p:leading-relaxed"
              >
                <MessageResponse className="min-w-0 max-w-full break-words text-foreground [overflow-wrap:anywhere] [&_pre]:max-w-full">
                  {seg.content}
                </MessageResponse>
              </div>
            );
          }

          return (
            <div
              key={i}
              className="inline-flex max-w-full items-center gap-2 overflow-hidden rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-sm transition-colors hover:border-blue-400/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20"
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
              <span className="truncate font-medium text-foreground">
                {seg.path}
              </span>
            </div>
          );
        })}
        <AppVersionButton
          version={version}
          fileCount={displayFileCount}
          appTitle={appTitle}
          changeSummary={message?.changeSummary}
          generating={false}
          disabled={!message || isStreaming}
          onClick={message ? () => onMessageClickAction(message) : undefined}
          isActive={isActive}
        />
        {message && (
          <GenerationReceipt
            message={message}
            previousMessage={previousMessage}
          />
        )}
      </div>
    );
  } else {
    // No code blocks, just show text
    return (
      <div className="flex min-w-0 max-w-full flex-col gap-3 overflow-x-hidden">
        <MessageResponse className="prose min-w-0 max-w-full break-words text-foreground [overflow-wrap:anywhere] dark:prose-invert [&_pre]:max-w-full">
          {content}
        </MessageResponse>
        <MessageSources sources={messageSources} />
      </div>
    );
  }
}
