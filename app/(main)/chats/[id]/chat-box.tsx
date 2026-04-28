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

export default function ChatBox({
  chat,
  onNewStreamPromise,
  isStreaming,
}: {
  chat: Chat;
  onNewStreamPromise: (v: Promise<ReadableStream>) => void;
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

        onNewStreamPromise(streamPromise);
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
      <div className="mx-auto mb-4 flex w-full max-w-4xl shrink-0 flex-col px-3 sm:px-6">
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
          <div className="relative flex flex-col rounded-lg border border-border bg-background">
            <div className="relative w-full">
              <div className="w-full px-4 py-5">
                <p className="invisible min-h-[48px] w-full whitespace-pre-wrap">
                  {textareaResizePrompt}
                </p>
              </div>
              <textarea
                ref={textareaRef}
                placeholder="Ask a follow up..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
                name="prompt"
                className="peer absolute inset-0 w-full resize-none bg-transparent px-4 py-5 placeholder-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    const target = event.target;
                    if (!(target instanceof HTMLTextAreaElement)) return;
                    target.closest("form")?.requestSubmit();
                  }
                }}
              />
            </div>

            <div className="flex w-full flex-wrap items-center justify-between gap-2 p-3 pl-4 has-[:disabled]:opacity-50">
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className="max-w-[180px] items-center truncate font-mono text-xs text-muted-foreground sm:max-w-[220px]"
                  title={chat.model}
                >
                  {modelLabel}
                </div>
                {credits !== null && credits >= 0 && (
                  <div className="text-xs text-muted-foreground">
                    · {hasActiveSubscription ? "Unlimited" : `${credits} credits`}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isCheckingCredits}
                className="size-8"
              >
                <Spinner loading={disabled || isCheckingCredits}>
                  <ArrowRightIcon />
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
