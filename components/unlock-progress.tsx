"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PricingModal } from "./pricing-modal";
import { MODELS } from "@/lib/constants";
import { Lock, Check, Sparkles, Zap, Crown } from "lucide-react";
import { useUserCredits } from "@/lib/queries";

interface UnlockProgressProps {
  projectCount?: number;
}

const FREE_PROJECT_LIMIT = 3;

const MILESTONES = [
  {
    icon: Zap,
    label: "First Project",
    description: "Create your first app",
    unlocked: true,
  },
  {
    icon: Lock,
    label: "3 Projects",
    description: `${FREE_PROJECT_LIMIT} free projects total`,
    requires: "subscription",
  },
  {
    icon: Lock,
    label: "Premium Models",
    description: "GPT-5.4, Claude Sonnet 4.5, Claude Opus 4.6",
    requires: "subscription",
  },
  {
    icon: Crown,
    label: "Unlimited",
    description: "Unlimited projects & models",
    requires: "subscription",
  },
];

export function UnlockProgress({ projectCount = 0 }: UnlockProgressProps) {
  const [showPricingModal, setShowPricingModal] = useState(false);

  const { data: creditsData } = useUserCredits();
  const hasSubscription = creditsData?.hasActiveSubscription ?? false;
  const credits = creditsData?.credits ?? 0;

  const paidModels = MODELS.filter((m) => m.paid);
  const unlockedCount = hasSubscription
    ? MILESTONES.length
    : projectCount >= FREE_PROJECT_LIMIT
      ? 2
      : 1;
  const progress = (unlockedCount / MILESTONES.length) * 100;

  return (
    <>
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Unlock Progress
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {hasSubscription
                ? "All features unlocked! You're a premium member."
                : `${unlockedCount} of ${MILESTONES.length} milestones unlocked`}
            </p>
          </div>
          {!hasSubscription && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPricingModal(true)}
            >
              Unlock All
            </Button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {MILESTONES.map((milestone, index) => {
            const Icon = milestone.icon;
            const isUnlocked =
              hasSubscription ||
              milestone.unlocked ||
              (index === 1 && projectCount >= FREE_PROJECT_LIMIT) ||
              index === 0;

            return (
              <div
                key={milestone.label}
                className={`relative rounded-lg border p-3 transition-all hover:scale-[1.02] ${
                  isUnlocked
                    ? "border-green-200 bg-green-50/50 shadow-sm dark:border-green-900/30 dark:bg-green-950/20"
                    : "border-border bg-muted/30 opacity-60"
                }`}
              >
                <div
                  className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full ${
                    isUnlocked
                      ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isUnlocked ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <p
                  className={`text-xs font-medium ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {milestone.label}
                </p>
                <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                  {milestone.description}
                </p>
                {milestone.requires === "subscription" && !isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Model preview */}
        {!hasSubscription && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Subscribe to unlock {paidModels.length} premium models:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {paidModels.map((model) => (
                <span
                  key={model.value}
                  className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                >
                  <Lock className="h-3 w-3" />
                  {model.label}
                </span>
              ))}
            </div>
          </div>
        )}
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
