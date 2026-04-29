"use client";

import ArrowRightIcon from "@/components/icons/arrow-right";
import Spinner from "@/components/spinner";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { createMessage } from "@/app/(main)/actions";
import { type Chat } from "./page";
import { MODELS, FREE_MODEL } from "@/lib/constants";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { PricingModal } from "@/components/pricing-modal";
import { UpgradeBanner } from "@/components/upgrade-banner";
import { useUserCredits, useUserSession } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatBoxProps {
  chat: {
    id: string;
    title: string;
    model: string;
    messages: any[];
  };
  onNewStreamPromiseAction: (streamPromise: Promise<ReadableStream>) => void;
  isStreaming: boolean;
}

export default function ChatBox({
  chat,
  onNewStreamPromiseAction,
  isStreaming,
}: ChatBoxProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [disabled, setDisabled] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isCheckingCredits, setIsCheckingCredits] = useState(false);
  const didFocusOnce = useRef(false);

  const { data: creditsData } = useUserCredits();
  const { data: session } = useUserSession();
  const credits = creditsData?.credits ?? 0;
  const hasActiveSubscription = creditsData?.hasActiveSubscription ?? false;
  const isAuthenticated = !!session;

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
        const message = await createMessage(chat.id, prompt, "user");
        const streamPromise = fetch("/api/get-next-completion-stream-promise", {
          method: "POST",
          body: JSON.stringify({ messageId: message.id, model: chat.model }),
        }).then((res) => {
          if (!res.body) throw new Error("No body on response");
          return res.body;
        });

        onNewStreamPromiseAction(streamPromise);
        startTransition(() => {
          router.refresh();
          setPrompt("");
        });
      } catch (error: any) {
        toast.error(error.message || "Failed to send message");
      }
    });
  };

  const selectedModel = MODELS.find((m) => m.value === chat.model);
  const isPaidModel = selectedModel?.paid ?? false;
  const modelLabel = selectedModel?.label || chat.model;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .chatbox-wrap { font-family: 'DM Sans', system-ui, sans-serif; }

        .chatbox-field {
          border-radius: 18px;
          border: 1px solid hsl(var(--border) / 0.55);
          background: hsl(var(--background) / 0.88);
          backdrop-filter: blur(16px) saturate(160%);
          transition: border-color 0.22s ease, box-shadow 0.22s ease;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }
        .chatbox-field:focus-within {
          border-color: rgba(59,130,246,0.4);
          box-shadow:
            0 0 0 3px rgba(59,130,246,0.06),
            0 4px 24px rgba(0,0,0,0.07),
            0 2px 6px rgba(59,130,246,0.05);
        }
        .dark .chatbox-field {
          background: hsl(var(--card) / 0.8);
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
          box-shadow: 0 4px 14px rgba(59,130,246,0.28);
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

        .credit-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          color: hsl(var(--muted-foreground) / 0.7);
          letter-spacing: -0.01em;
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

        .credit-live {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 7px;
          border-radius: 5px;
          background: rgba(34,197,94,0.07);
          border: 1px solid rgba(34,197,94,0.18);
          color: #16a34a;
          font-size: 11px;
          font-weight: 500;
        }
        .dark .credit-live { color: #4ade80; background: rgba(34,197,94,0.05); }

        .credit-live-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 4px rgba(34,197,94,0.6);
        }

        .animate-bounce-subtle {
          animation: bounceSubtle 2s ease-in-out infinite;
        }

        @keyframes bounceSubtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

      <div className="chatbox-wrap mx-auto mb-4 flex w-full max-w-4xl shrink-0 flex-col px-4 sm:px-6">
        {!hasActiveSubscription && (
          <UpgradeBanner
            variant={isPaidModel ? "model-locked" : "chat"}
            messageCount={chat.messages.length / 2}
          />
        )}

        <form className="relative flex w-full" action={handleSubmit}>
          <fieldset className="w-full" disabled={disabled}>
            <div className="chatbox-field relative flex flex-col">
              {/* Textarea */}
              <Textarea
                ref={textareaRef}
                placeholder={
                  isStreaming
                    ? "Generating response…"
                    : "Ask a follow-up question…"
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
                name="prompt"
                className="min-h-[88px] resize-none border-0 bg-transparent px-4 py-4 text-[14.5px] leading-relaxed placeholder:text-muted-foreground/40 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    const target = event.target;
                    if (!(target instanceof HTMLTextAreaElement)) return;
                    target.closest("form")?.requestSubmit();
                  }
                }}
              />

              {/* Footer bar */}
              <div className="flex w-full items-center justify-between gap-2 px-3 pb-3 pt-0.5">
                {/* Left: model + credits */}
                <div className="flex min-w-0 items-center gap-2">
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

                  {credits !== null && (
                    <div className="credit-live">
                      <div className="credit-live-dot" />
                      {hasActiveSubscription
                        ? "Unlimited"
                        : `${credits} credits`}
                    </div>
                  )}

                  {isStreaming && (
                    <div className="streaming-indicator ml-1">
                      <div className="streaming-dot" />
                      <div className="streaming-dot" />
                      <div className="streaming-dot" />
                    </div>
                  )}
                </div>

                {/* Right: submit */}
                <button
                  type="submit"
                  disabled={isCheckingCredits || prompt.length === 0}
                  className="send-btn bg-primary text-primary-foreground"
                >
                  <Spinner loading={disabled || isCheckingCredits}>
                    <ArrowRightIcon className="size-[15px]" />
                  </Spinner>
                </button>
              </div>

              {/* Loading overlay */}
              {disabled && (
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[18px] bg-background dark:bg-card">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative flex h-16 w-16 items-center justify-center">
                      <div className="absolute inset-0 animate-pulse rounded-2xl bg-blue-500/10 ring-1 ring-blue-500/20" />
                      <img
                        src="/squidcoder-logo.svg"
                        alt="Squid Coder"
                        className="animate-bounce-subtle h-10 w-auto"
                      />
                      <div className="absolute -bottom-1 -right-1">
                        <Spinner className="size-4 text-blue-500" />
                      </div>
                    </div>
                    <p className="text-center text-[15px] font-semibold text-foreground">
                      Generating response…
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Keyboard hint */}
            <p className="mt-2 text-center text-[11px] text-muted-foreground/40">
              Press{" "}
              <kbd className="rounded bg-muted/60 px-1 py-px font-sans text-[10px]">
                Enter
              </kbd>{" "}
              to send
              {" · "}
              <kbd className="rounded bg-muted/60 px-1 py-px font-sans text-[10px]">
                Shift + Enter
              </kbd>{" "}
              for new line
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
