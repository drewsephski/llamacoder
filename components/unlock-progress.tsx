"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PricingModal } from "./pricing-modal";
import { MODELS } from "@/lib/constants";
import { authClient } from "@/lib/auth-client";
import { Lock, Check, Sparkles, Zap, Crown } from "lucide-react";

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
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const checkStatus = async () => {
      const session = await authClient.getSession();
      if (session.data) {
        const response = await fetch("/api/user/credits");
        if (response.ok) {
          const data = await response.json();
          setHasSubscription(data.hasActiveSubscription);
          setCredits(data.credits);
        }
      } else {
        setHasSubscription(false);
      }
    };
    checkStatus();
  }, []);

  const paidModels = MODELS.filter(m => m.paid);
  const unlockedCount = hasSubscription ? MILESTONES.length : (projectCount >= FREE_PROJECT_LIMIT ? 2 : 1);
  const progress = (unlockedCount / MILESTONES.length) * 100;

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Unlock Progress
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {hasSubscription 
                ? "All features unlocked! You're a premium member."
                : `${unlockedCount} of ${MILESTONES.length} milestones unlocked`
              }
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
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MILESTONES.map((milestone, index) => {
            const Icon = milestone.icon;
            const isUnlocked = hasSubscription || milestone.unlocked || (index === 1 && projectCount >= FREE_PROJECT_LIMIT) || index === 0;

            return (
              <div
                key={milestone.label}
                className={`relative p-3 rounded-lg border transition-all hover:scale-[1.02] ${
                  isUnlocked
                    ? "border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-950/20 shadow-sm"
                    : "border-border bg-muted/30 opacity-60"
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full mb-2 ${
                  isUnlocked
                    ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {isUnlocked ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <p className={`text-xs font-medium ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                  {milestone.label}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                  {milestone.description}
                </p>
                {milestone.requires === "subscription" && !isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Model preview */}
        {!hasSubscription && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Subscribe to unlock {paidModels.length} premium models:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {paidModels.map(model => (
                <span 
                  key={model.value}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground"
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
