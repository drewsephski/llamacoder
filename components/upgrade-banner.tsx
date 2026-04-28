"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PricingModal } from "./pricing-modal";
import { Sparkles, Lock, Crown, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface UpgradeBannerProps {
  variant?: "chat" | "dashboard" | "model-locked" | "limit-reached";
  messageCount?: number;
}

export function UpgradeBanner({ variant = "dashboard", messageCount = 0 }: UpgradeBannerProps) {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
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

  // Don't show if user has subscription
  if (hasSubscription === true) return null;
  if (!isVisible) return null;

  const variants = {
    chat: {
      icon: Sparkles,
      title: "Unlock smarter AI responses",
      description: "Upgrade to access GPT-5.4, Claude Sonnet 4.5, and Claude Opus 4.6.",
      cta: "Upgrade Now",
      color: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
      iconColor: "text-amber-500",
    },
    "model-locked": {
      icon: Lock,
      title: "Premium model locked",
      description: "Subscribe to unlock this model and 5+ other premium AI models.",
      cta: "Unlock Models",
      color: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
      iconColor: "text-amber-500",
    },
    dashboard: {
      icon: Crown,
      title: "Unlock your full potential",
      description: messageCount > 0
        ? `You've created ${messageCount} project${messageCount === 1 ? "" : "s"}. Subscribe for unlimited premium generations.`
        : "Subscribe to access GPT-5.4, Claude Sonnet 4.5, and Claude Opus 4.6.",
      cta: "Get Premium",
      color: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
      iconColor: "text-amber-500",
    },
    "limit-reached": {
      icon: Lock,
      title: "Free project limit reached",
      description: `You've created ${messageCount} of 3 free projects. Upgrade to create unlimited projects.`,
      cta: "Upgrade for Unlimited",
      color: "from-red-500/10 to-orange-500/10 border-red-500/20",
      iconColor: "text-red-500",
    },
  };

  const v = variants[variant];
  const Icon = v.icon;

  return (
    <>
      <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-r ${v.color} p-4 mb-6`}>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
        
        <div className="flex items-start gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background/80 ${v.iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">{v.title}</h3>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              {v.description}
            </p>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => setShowPricingModal(true)}
                className="h-8"
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
