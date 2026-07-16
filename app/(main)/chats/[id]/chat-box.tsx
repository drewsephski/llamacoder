"use client";

import ArrowRightIcon from "@/components/icons/arrow-right";
import Spinner from "@/components/spinner";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { createMessage } from "@/features/generation/server/actions";
import { MODELS } from "@/lib/constants";
import { toast } from "sonner";
import { PricingModal } from "@/features/billing/components/pricing-modal";
import { UpgradeBanner } from "@/features/billing/components/upgrade-banner";
import { useUserCredits } from "@/features/user/client/queries";
import { useSession } from "@/lib/auth-client";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchCompletionStream,
  type CompletionStream,
} from "@/features/generation/client/completion-stream";
import { GenerationLoader } from "@/components/generation-loader";
import type { ProjectMessage } from "@/features/projects/contracts";
import { getErrorMessage } from "@/features/shared/errors";
import { Maximize2, Minimize2, Square } from "lucide-react";
import { ProjectIntegrationsPanel } from "@/features/integrations/components/project-integrations-panel";

interface ChatBoxProps {
  chat: {
    id: string;
    title: string;
    model: string;
    messages: ProjectMessage[];
  };
  onNewStreamPromiseAction: (streamPromise: Promise<CompletionStream>) => void;
  isStreaming: boolean;
  onStopAction: () => void | Promise<void>;
}

export default function ChatBox({
  chat,
  onNewStreamPromiseAction,
  isStreaming,
  onStopAction,
}: ChatBoxProps) {
  const [, startTransition] = useTransition();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isCheckingCredits, setIsCheckingCredits] = useState(false);
  const disabled = isStreaming || isCheckingCredits;
  const didFocusOnce = useRef(false);

  const { data: creditsData } = useUserCredits();
  const { data: session } = useSession();
  const credits = creditsData?.credits ?? 0;
  const hasActiveSubscription = creditsData?.hasActiveSubscription ?? false;
  const isAuthenticated = !!session;
  const latestFollowUpPrompts = getLatestFollowUpPrompts(chat.messages);

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const collapsedMinHeight = Math.max(
      72,
      Math.min(96, window.innerHeight * 0.12),
    );
    const collapsedMaxHeight = Math.max(
      160,
      Math.min(240, window.innerHeight * 0.3),
    );
    const expandedHeight = Math.min(window.innerHeight * 0.46, 440);
    const minHeight = isComposerExpanded
      ? Math.max(collapsedMaxHeight, expandedHeight)
      : collapsedMinHeight;
    const maxHeight = isComposerExpanded
      ? Math.max(collapsedMaxHeight, expandedHeight)
      : collapsedMaxHeight;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(
      Math.max(textarea.scrollHeight, minHeight),
      maxHeight,
    )}px`;
  }, [isComposerExpanded]);

  useLayoutEffect(() => {
    resizeTextarea();
  }, [prompt, resizeTextarea]);

  useEffect(() => {
    window.addEventListener("resize", resizeTextarea);
    return () => window.removeEventListener("resize", resizeTextarea);
  }, [resizeTextarea]);

  useEffect(() => {
    if (!textareaRef.current) return;
    if (!disabled && !didFocusOnce.current) {
      textareaRef.current.focus();
      didFocusOnce.current = true;
    } else {
      didFocusOnce.current = false;
    }
  }, [disabled]);

  const handleSubmit = async () => {
    const nextPrompt = prompt.trim();
    if (disabled || !nextPrompt) return;

    // Require authentication before sending messages
    if (!isAuthenticated) {
      toast.error("Please sign in to send messages");
      router.push("/sign-in");
      return;
    }

    const isFollowUp = chat.messages.length > 2;

    if (isFollowUp) {
      setIsCheckingCredits(true);
      // Check credits using cached data from TanStack Query
      if (credits <= 0 && !hasActiveSubscription) {
        setShowPricingModal(true);
        setIsCheckingCredits(false);
        return;
      }
      setIsCheckingCredits(false);
    }

    startTransition(async () => {
      try {
        const message = await createMessage(chat.id, nextPrompt, "user");
        const streamPromise = fetchCompletionStream({
          messageId: message.id,
          model: chat.model,
        });

        onNewStreamPromiseAction(streamPromise);
        startTransition(() => {
          router.refresh();
          setPrompt("");
          setIsComposerExpanded(false);
        });
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to send message"));
      }
    });
  };

  const selectedModel = MODELS.find((m) => m.value === chat.model);
  const isPaidModel = selectedModel?.paid ?? false;
  const modelLabel = selectedModel?.label || chat.model;

  const handleFollowUpPromptSelect = (followUpPrompt: string) => {
    if (disabled) return;
    setPrompt(followUpPrompt);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .chatbox-wrap {
          container-type: inline-size;
          font-family: 'DM Sans', system-ui, sans-serif;
        }

        .chatbox-field {
          border-radius: 18px;
          border: 1px solid hsl(var(--border) / 0.55);
          background: hsl(var(--background) / 0.88);
          backdrop-filter: blur(10px) saturate(140%);
          transition: border-color 0.22s ease;
          box-shadow: none;
        }
        .chatbox-field:focus-within {
          border-color: rgba(59,130,246,0.4);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.06);
        }
        .dark .chatbox-field {
          background: hsl(var(--card) / 0.8);
        }

        .chatbox-textarea {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--muted-foreground) / 0.28) transparent;
        }

        .send-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
        }
        .send-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events: none;
        }
        .send-btn:hover:not(:disabled) {
          transform: scale(1.08);
        }
        .send-btn:active:not(:disabled) {
          transform: scale(0.96);
        }
        .send-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .model-tag {
          display: inline-flex;
          min-width: 0;
          align-items: center;
          gap: 5px;
          padding: 3px 9px;
          border-radius: 6px;
          background: hsl(var(--muted) / 0.5);
          font-size: 11.5px;
          font-weight: 450;
          color: hsl(var(--muted-foreground));
          letter-spacing: -0.01em;
          max-width: 160px;
        }

        .composer-shortcut { display: none; }

        @container (min-width: 29rem) {
          .composer-shortcut { display: inline; }
        }

        @container (max-width: 24rem) {
          .model-tag { max-width: 116px; }
        }

        .streaming-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .streaming-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #3b82f6;
          animation: streamPulse 1.2s ease-in-out infinite;
        }
        .streaming-dot:nth-child(2) { animation-delay: 0.2s; }
        .streaming-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes streamPulse {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1.1); opacity: 1; }
        }

      `}</style>

      <div className="chatbox-wrap mx-auto mb-3 flex w-full min-w-0 max-w-[42rem] shrink-0 flex-col overflow-x-hidden px-4 sm:px-5">
        {!hasActiveSubscription && (
          <UpgradeBanner
            variant={isPaidModel ? "model-locked" : "chat"}
            messageCount={chat.messages.length / 2}
          />
        )}

        {!isStreaming && latestFollowUpPrompts.length > 0 && (
          <div
            className="mb-2.5 flex w-full snap-x snap-mandatory flex-nowrap gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:thin]"
            role="group"
            aria-label="Suggested follow-up prompts"
          >
            {latestFollowUpPrompts.map((followUpPrompt) => (
              <button
                key={followUpPrompt}
                type="button"
                disabled={disabled}
                onClick={() => handleFollowUpPromptSelect(followUpPrompt)}
                className="max-w-[min(22rem,85vw)] shrink-0 snap-start rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-left text-[12.5px] font-medium text-muted-foreground transition hover:border-blue-400/50 hover:bg-blue-50/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 dark:bg-card/70 dark:hover:bg-blue-950/30"
              >
                {followUpPrompt}
              </button>
            ))}
          </div>
        )}

        <form className="relative flex w-full min-w-0" action={handleSubmit}>
          <fieldset className="w-full min-w-0" disabled={disabled}>
            <div className="chatbox-field relative flex flex-col">
              {/* Textarea */}
              <Textarea
                ref={textareaRef}
                aria-label="Message Squid Agent"
                placeholder={
                  isStreaming
                    ? "Generating response…"
                    : "Describe what you'd like to change…"
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
                name="prompt"
                className="chatbox-textarea min-h-[4.5rem] resize-none overflow-y-auto border-0 bg-transparent px-4 py-4 text-[14.5px] leading-relaxed placeholder:text-muted-foreground/55 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    if (disabled || event.nativeEvent.isComposing) return;
                    event.preventDefault();
                    const target = event.target;
                    if (!(target instanceof HTMLTextAreaElement)) return;
                    target.closest("form")?.requestSubmit();
                  }
                }}
              />

              {/* Footer bar */}
              <div className="flex w-full min-w-0 items-center justify-between gap-2 border-t border-border/35 px-3 pb-3 pt-2.5">
                {/* Left: model */}
                <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
                  <div className="model-tag" title={chat.model}>
                    <svg
                      className="size-3 shrink-0 opacity-50"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                    </svg>
                    <span className="truncate">{modelLabel}</span>
                  </div>

                  {isAuthenticated && (
                    <ProjectIntegrationsPanel
                      projectId={chat.id}
                      triggerPlacement="composer"
                    />
                  )}

                  {isStreaming && (
                    <div className="streaming-indicator ml-1">
                      <div className="streaming-dot" />
                      <div className="streaming-dot" />
                      <div className="streaming-dot" />
                    </div>
                  )}
                </div>

                {/* Right: composer controls */}
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="composer-shortcut text-[10.5px] text-muted-foreground/65">
                    <kbd className="rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 font-sans">
                      Enter
                    </kbd>{" "}
                    to send
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setIsComposerExpanded((expanded) => !expanded)
                    }
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={
                      isComposerExpanded
                        ? "Collapse message box"
                        : "Expand message box"
                    }
                    title={
                      isComposerExpanded
                        ? "Collapse message box"
                        : "Expand message box"
                    }
                  >
                    {isComposerExpanded ? (
                      <Minimize2 className="size-3.5" />
                    ) : (
                      <Maximize2 className="size-3.5" />
                    )}
                  </button>
                  <button
                    type="submit"
                    aria-label="Send message"
                    disabled={disabled || prompt.trim().length === 0}
                    className="send-btn shrink-0 bg-primary text-primary-foreground"
                  >
                    <Spinner loading={disabled}>
                      <ArrowRightIcon className="size-[15px]" />
                    </Spinner>
                  </button>
                </div>
              </div>

              {/* Loading overlay */}
              {disabled && (
                <div className="absolute inset-0 z-20 flex items-stretch justify-stretch overflow-hidden rounded-[18px] bg-background/95 p-0 backdrop-blur-md dark:bg-card/95">
                  <GenerationLoader
                    variant="compact"
                    label={
                      isCheckingCredits
                        ? "Checking credits"
                        : "Generating response"
                    }
                  />
                  {isStreaming && (
                    <button
                      type="button"
                      onClick={() => void onStopAction()}
                      className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-muted"
                    >
                      <Square className="size-3 fill-current" /> Stop
                    </button>
                  )}
                </div>
              )}
            </div>

            <p className="sr-only">
              Press Enter to send. Press Shift and Enter for a new line.
            </p>
          </fieldset>
        </form>
      </div>

      <PricingModal
        open={showPricingModal}
        onOpenChange={setShowPricingModal}
        remainingCredits={credits || 0}
      />
    </>
  );
}

function getLatestFollowUpPrompts(messages: ProjectMessage[]) {
  const latestAssistantMessage = messages
    .filter((message) => message.role === "assistant")
    .at(-1);

  const prompts = latestAssistantMessage?.followUpPrompts;

  if (!Array.isArray(prompts)) {
    return [];
  }

  return prompts.filter(
    (prompt): prompt is string =>
      typeof prompt === "string" && prompt.trim().length > 0,
  );
}
