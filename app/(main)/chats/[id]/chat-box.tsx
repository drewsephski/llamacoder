"use client";

import ArrowRightIcon from "@/components/icons/arrow-right";
import Spinner from "@/components/spinner";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { createMessage } from "../../actions";
import { type Chat } from "./page";
import { MODELS } from "@/lib/constants";
import { PricingModal } from "@/components/pricing-modal";
import { UpgradeBanner } from "@/components/upgrade-banner";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ChatBox({
  chat,
  onNewStreamPromiseAction,
  isStreaming,
}: {
  chat: Chat;
  onNewStreamPromiseAction: (v: Promise<ReadableStream>) => void;
  isStreaming: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const disabled = isPending || isStreaming;
  const didFocusOnce = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState("");
  const [credits, setCredits] = useState<number | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isCheckingCredits, setIsCheckingCredits] = useState(false);

  const modelLabel =
    MODELS.find((m) => m.value === chat.model)?.label || chat.model;

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data) {
          const response = await fetch("/api/user/credits");
          if (response.ok) {
            const data = await response.json();
            setCredits(data.credits);
            setHasActiveSubscription(data.hasActiveSubscription);
          }
        }
      } catch (error) {
        console.error("Failed to fetch credits:", error);
      }
    };
    fetchCredits();
  }, []);

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
    const isFollowUp = chat.messages.length > 2;

    if (isFollowUp) {
      setIsCheckingCredits(true);
      try {
        const session = await authClient.getSession();
        if (session.data) {
          const response = await fetch("/api/user/credits");
          if (response.ok) {
            const data = await response.json();
            setHasActiveSubscription(data.hasActiveSubscription);
            setCredits(data.credits);
            if (data.credits <= 0 && !data.hasActiveSubscription) {
              setShowPricingModal(true);
              setIsCheckingCredits(false);
              return;
            }
          }
        } else {
          setShowPricingModal(true);
          setIsCheckingCredits(false);
          return;
        }
      } catch (error) {
        console.error("Failed to check credits:", error);
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
