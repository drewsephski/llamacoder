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
  const textareaResizePrompt = prompt
    .split("\n")
    .map((text) => (text === "" ? "a" : text))
    .join("\n");

  const modelLabel =
    MODELS.find((m) => m.value === chat.model)?.label || chat.model;

  // Fetch user credits on mount
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

  // Check if user has credits before submitting
  const handleSubmit = async () => {
    // Don't check credits for initial chat creation (first message pair)
    // Only check for follow-up messages
    const isFollowUp = chat.messages.length > 2;

    if (isFollowUp) {
      setIsCheckingCredits(true);
      try {
        const session = await authClient.getSession();
        if (session.data) {
          // Check credits
          const response = await fetch("/api/user/credits");
          if (response.ok) {
            const data = await response.json();
            setHasActiveSubscription(data.hasActiveSubscription);
            setCredits(data.credits);
            // Only block if no credits AND no active subscription
            // Unlimited subscribers bypass; Pro subscribers still need credits
            if (data.credits <= 0 && !data.hasActiveSubscription) {
              setShowPricingModal(true);
              setIsCheckingCredits(false);
              return;
            }
          }
        } else {
          // Not signed in, show pricing modal
          setShowPricingModal(true);
          setIsCheckingCredits(false);
          return;
        }
      } catch (error) {
        console.error("Failed to check credits:", error);
      }
      setIsCheckingCredits(false);
    }

    // Proceed with message creation
    startTransition(async () => {
      try {
        const message = await createMessage(chat.id, prompt, "user");
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

  const selectedModel = MODELS.find(m => m.value === chat.model);
  const isPaidModel = selectedModel?.paid ?? false;

  return (
    <>
      <div className="mx-auto mb-4 flex w-full max-w-4xl shrink-0 flex-col px-4 sm:px-6">
        {/* Show upgrade banner for free users on free models, or model-locked banner when viewing a paid model without subscription */}
        {!hasActiveSubscription && (
          <UpgradeBanner
            variant={isPaidModel ? "model-locked" : "chat"}
            messageCount={chat.messages.length / 2}
          />
        )}
        <form
          className="relative flex w-full"
          action={handleSubmit}
        >
        <fieldset className="w-full" disabled={disabled}>
          <div className="group relative flex flex-col rounded-2xl border border-border/60 bg-background/90 shadow-sm transition-all duration-200 focus-within:border-blue-400/50 focus-within:shadow-md focus-within:shadow-blue-500/5 dark:bg-card/90">
            <Textarea
              ref={textareaRef}
              placeholder="Ask a follow up..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              name="prompt"
              className="min-h-[100px] resize-none border-0 bg-transparent px-4 py-4 text-[15px] leading-relaxed placeholder:text-muted-foreground/50 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  const target = event.target;
                  if (!(target instanceof HTMLTextAreaElement)) return;
                  target.closest("form")?.requestSubmit();
                }
              }}
            />
            <div className="flex w-full flex-wrap items-center justify-between gap-2 px-3 pb-3 pt-1 has-[:disabled]:opacity-50">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  title={chat.model}
                >
                  <span className="truncate max-w-[140px] sm:max-w-[180px]">{modelLabel}</span>
                </div>
                {credits !== null && credits >= 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-1 w-1 rounded-full bg-green-500"></span>
                    {hasActiveSubscription ? "Unlimited" : `${credits} credits`}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isCheckingCredits || prompt.length === 0}
                className="h-9 w-9 rounded-xl p-0 transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100"
              >
                <Spinner loading={disabled || isCheckingCredits}>
                  <ArrowRightIcon className="size-4" />
                </Spinner>
              </Button>
            </div>
          </div>
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
