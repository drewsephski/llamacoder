"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PricingModal } from "@/features/billing/components/pricing-modal";
import { Crown, Lock, X, Sparkles } from "lucide-react";
import { useUserCredits } from "@/features/user/client/queries";

interface UpgradeBannerProps {
  variant?: "dashboard" | "model-locked" | "chat" | "limit-reached";
  messageCount?: number;
}

export function UpgradeBanner({
  variant = "dashboard",
  messageCount = 0,
}: UpgradeBannerProps) {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const { data: creditsData } = useUserCredits();
  const hasSubscription = creditsData?.hasActiveSubscription ?? false;
  const credits = creditsData?.credits ?? 0;

  // Don't show if user has subscription
  if (hasSubscription === true) return null;
  if (!isVisible) return null;

  const variants = {
    chat: {
      icon: Sparkles,
      title: "Use smarter models",
      description:
        "Upgrade for access to more capable models that can reason more deeply and build with better context.",
      cta: "View plans",
      surface: "border-border/70 bg-card/70",
      iconClass: "bg-muted/70 text-muted-foreground",
      buttonVariant: "outline" as const,
    },
    "model-locked": {
      icon: Lock,
      title: "Smarter model locked",
      description:
        "Upgrade to use more capable models for harder prompts and more polished apps.",
      cta: "View plans",
      surface: "border-border/70 bg-card/70",
      iconClass: "bg-muted/70 text-muted-foreground",
      buttonVariant: "outline" as const,
    },
    dashboard: {
      icon: Crown,
      title: "Build with smarter models",
      description:
        messageCount > 0
          ? `You've created ${messageCount} project${messageCount === 1 ? "" : "s"}. Upgrade when you need more capable models and more generation room.`
          : "Upgrade when you need more capable models for planning, reasoning, and code generation.",
      cta: "View plans",
      surface: "border-border/70 bg-card/70",
      iconClass: "bg-muted/70 text-muted-foreground",
      buttonVariant: "outline" as const,
    },
    "limit-reached": {
      icon: Lock,
      title: "Free project limit reached",
      description: `You've created ${messageCount} of 3 free projects. Upgrade to keep building with more capable models.`,
      cta: "View plans",
      surface:
        "border-destructive/20 bg-destructive/5 dark:border-destructive/25 dark:bg-destructive/10",
      iconClass:
        "bg-destructive/10 text-destructive dark:bg-destructive/15 dark:text-red-300",
      buttonVariant: "default" as const,
    },
  };

  const v = variants[variant];
  const Icon = v.icon;

  return (
    <>
      <div
        className={`relative mb-6 overflow-hidden rounded-xl border ${v.surface} p-3.5 shadow-sm shadow-black/[0.02] backdrop-blur-sm`}
      >
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-start gap-3 pr-5">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${v.iconClass}`}
          >
            <Icon className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="mb-1 text-sm font-medium">{v.title}</h3>
            <p className="mb-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {v.description}
            </p>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant={v.buttonVariant}
                onClick={() => setShowPricingModal(true)}
                className="h-8 px-3"
              >
                {v.cta}
              </Button>
              <span className="text-xs text-muted-foreground">
                From $9/month
              </span>
            </div>
          </div>
        </div>
      </div>

      <PricingModal
        open={showPricingModal}
        onOpenChange={setShowPricingModal}
        remainingCredits={credits}
        isAuthenticated={hasSubscription !== null}
      />
    </>
  );
}
