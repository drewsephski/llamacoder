"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Zap, Check, Sparkles, Crown, Lock } from "lucide-react";
import { toast } from "sonner";
import { MODELS } from "@/lib/constants";
import {
  CREDIT_PACKS,
  getModelTier,
  type CreditPackKey,
  type TierKey,
} from "@/lib/billing/config";
import { Button } from "@/components/ui/button";
import { useStripeCheckout } from "@/features/billing/client/use-stripe-checkout";
import type {
  PricingTab,
  SubscriptionTier,
} from "@/features/billing/contracts";
import { getErrorMessage } from "@/features/shared/errors";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remainingCredits?: number;
  isAuthenticated?: boolean;
  initialTab?: PricingTab;
  currentTier?: TierKey;
}

export function PricingModal({
  open,
  onOpenChange,
  remainingCredits = 0,
  isAuthenticated = false,
  initialTab = "plans",
  currentTier = "free",
}: PricingModalProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PricingTab>(initialTab);
  const checkoutMutation = useStripeCheckout();

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [initialTab, open]);

  const handleSubscribe = async (plan: Exclude<SubscriptionTier, "free">) => {
    if (!isAuthenticated) {
      window.location.href = "/sign-in";
      return;
    }

    setIsLoading(plan);
    try {
      const data = await checkoutMutation.mutateAsync({ plan });
      window.location.href = data.url;
    } catch (error: unknown) {
      console.error("Checkout error:", error);
      toast.error(
        getErrorMessage(error, "Something went wrong. Please try again."),
      );
    } finally {
      setIsLoading(null);
    }
  };

  const isCurrentTier = (tier: TierKey) =>
    isAuthenticated && currentTier === tier;

  const handleBuyCredits = async (pack: {
    key: CreditPackKey;
    credits: number;
    price: number;
  }) => {
    if (!isAuthenticated) {
      window.location.href = "/sign-in";
      return;
    }

    setIsLoading(`credits-${pack.credits}`);
    try {
      const data = await checkoutMutation.mutateAsync({ pack: pack.key });
      window.location.href = data.url;
    } catch (error: unknown) {
      console.error("Checkout error:", error);
      toast.error(
        getErrorMessage(error, "Something went wrong. Please try again."),
      );
    } finally {
      setIsLoading(null);
    }
  };

  const starterModels = MODELS.filter(
    (m) => getModelTier(m.value) === "starter",
  );
  const efficientModels = MODELS.filter(
    (m) => getModelTier(m.value) === "efficient",
  );
  const advancedModels = MODELS.filter(
    (m) => getModelTier(m.value) === "advanced",
  );
  const premiumModels = MODELS.filter(
    (m) => getModelTier(m.value) === "premium",
  );
  const proModelCount =
    starterModels.length + efficientModels.length + advancedModels.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pricing-modal-content w-[calc(100vw-1.5rem)] max-w-5xl gap-0 overflow-y-auto overscroll-contain p-4 sm:w-[calc(100vw-2rem)] sm:p-5">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-start gap-2 pr-7 text-xl font-bold leading-tight tracking-tight sm:items-center sm:gap-3 sm:pr-0 sm:text-3xl">
            <Crown className="mt-0.5 h-6 w-6 shrink-0 text-amber-500 sm:mt-0 sm:h-7 sm:w-7" />
            Unlock smarter AI models
          </DialogTitle>
          <DialogDescription className="mt-2 pr-5 text-sm leading-relaxed text-muted-foreground sm:pr-0 sm:text-base">
            {remainingCredits > 0
              ? `You have ${remainingCredits} credit${remainingCredits === 1 ? "" : "s"} remaining.`
              : "Upgrade to access more capable models and create more projects."}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="mt-4 flex gap-1 rounded-xl bg-muted/50 p-1 sm:mt-5 sm:gap-2">
          <Button
            onClick={() => setActiveTab("plans")}
            variant={activeTab === "plans" ? "default" : "ghost"}
            className="min-h-11 flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all sm:px-4"
          >
            Subscription Plans
          </Button>
          <Button
            onClick={() => setActiveTab("credits")}
            variant={activeTab === "credits" ? "default" : "ghost"}
            className="min-h-11 flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all sm:px-4"
          >
            Buy Credits
          </Button>
        </div>

        {activeTab === "plans" ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {/* Free Plan */}
            <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-muted/70 to-background p-4 shadow-sm transition-colors hover:border-slate-400/50 sm:p-5">
              <div className="absolute inset-y-0 left-0 w-1 bg-slate-500/70" />
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Starting point
                  </p>
                  <div className="mt-1 flex items-center gap-2.5">
                    <Zap className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold">Free</h3>
                  </div>
                </div>
                <span className="rounded-full border border-border/70 px-2 py-1 font-mono text-[10px] font-medium text-muted-foreground">
                  OPEN
                </span>
              </div>
              <div className="mb-4 flex items-end justify-between border-y border-border/60 py-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Monthly runway
                  </p>
                  <p className="mt-1 font-mono text-xl font-semibold tracking-tight">
                    5 CR
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold">$0</span>
                  <p className="text-xs text-muted-foreground">forever</p>
                </div>
              </div>

              <ul className="mb-5 flex-1 space-y-2 text-[13px] sm:mb-6">
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <span className="text-muted-foreground">
                    {starterModels.length} starter models
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <span className="text-muted-foreground">5 free credits</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <span className="text-muted-foreground">Basic support</span>
                </li>
                <li className="flex items-start gap-2.5 opacity-50">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Smarter models locked
                  </span>
                </li>
              </ul>

              <Button
                disabled
                className="min-h-10 w-full cursor-default rounded-xl bg-muted/60 px-4 py-2 text-sm font-medium text-muted-foreground"
              >
                {currentTier === "free" ? "Current Plan" : "Included"}
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="relative flex flex-col overflow-hidden rounded-2xl border border-blue-400/60 bg-gradient-to-b from-blue-500/15 via-blue-500/5 to-background p-4 shadow-[0_18px_45px_-28px_rgba(59,130,246,0.85)] transition-transform hover:-translate-y-0.5 sm:p-5">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500" />
              <div className="mb-3 flex items-start justify-between gap-3 pt-1">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
                    Builder&apos;s choice
                  </p>
                  <div className="mt-1 flex items-center gap-2.5">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Pro</h3>
                  </div>
                </div>
                <span className="rounded-full bg-blue-500 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                  Most chosen
                </span>
              </div>
              <div className="mb-4 flex items-end justify-between border-y border-blue-400/25 py-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Monthly runway
                  </p>
                  <p className="mt-1 font-mono text-xl font-semibold tracking-tight text-blue-700 dark:text-blue-200">
                    100 CR
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold">$9</span>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
              </div>

              <ul className="mb-5 flex-1 space-y-2 text-[13px] sm:mb-6">
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span className="text-muted-foreground">
                    {proModelCount} starter, efficient, and advanced models
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span className="text-muted-foreground">
                    100 credits monthly, rollover cap 200
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span className="text-muted-foreground">
                    Priority generation
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span className="text-muted-foreground">Export projects</span>
                </li>
              </ul>

              {isCurrentTier("pro") ? (
                <Button disabled className="min-h-10 w-full rounded-xl">
                  Current Plan
                </Button>
              ) : currentTier === "pro_plus" ? (
                <Button
                  disabled
                  variant="outline"
                  className="min-h-10 w-full rounded-xl"
                >
                  Included in Pro Plus
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubscribe("pro")}
                  disabled={isLoading === "pro"}
                  className="min-h-10 w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-blue-500"
                >
                  {isLoading === "pro" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Start Pro"
                  )}
                </Button>
              )}
            </div>

            {/* Pro Plus Plan */}
            <div className="relative flex flex-col overflow-hidden rounded-2xl border border-amber-400/45 bg-gradient-to-b from-amber-400/10 to-background p-4 shadow-sm transition-colors hover:border-amber-400/70 sm:p-5">
              <div className="absolute inset-y-0 left-0 w-1 bg-amber-400/80" />
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                    Frontier access
                  </p>
                  <div className="mt-1 flex items-center gap-2.5">
                    <Crown className="h-5 w-5 text-amber-500" />
                    <h3 className="text-lg font-semibold">Pro Plus</h3>
                  </div>
                </div>
                <span className="rounded-full border border-amber-400/40 px-2 py-1 font-mono text-[10px] font-medium text-amber-700 dark:text-amber-200">
                  FULL
                </span>
              </div>
              <div className="mb-4 flex items-end justify-between border-y border-amber-400/25 py-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Monthly runway
                  </p>
                  <p className="mt-1 font-mono text-xl font-semibold tracking-tight text-amber-700 dark:text-amber-200">
                    500 CR
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold">$29</span>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
              </div>

              <ul className="mb-5 flex-1 space-y-2 text-[13px] sm:mb-6">
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span className="text-muted-foreground">
                    Everything in Pro
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span className="text-muted-foreground">
                    500 credits monthly, rollover cap 1,000
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span className="text-muted-foreground">
                    {premiumModels.length} premium frontier models
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span className="text-muted-foreground">
                    Dedicated support
                  </span>
                </li>
              </ul>

              {isCurrentTier("pro_plus") ? (
                <Button disabled className="min-h-10 w-full rounded-xl">
                  Current Plan
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubscribe("pro_plus")}
                  disabled={isLoading === "pro_plus"}
                  className="min-h-10 w-full rounded-xl border-b-[3px] border-amber-700 bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:-translate-y-px hover:border-b-[4px] hover:bg-amber-400 active:translate-y-px active:border-b-2"
                >
                  {isLoading === "pro_plus" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : currentTier === "pro" ? (
                    "Upgrade to Pro Plus"
                  ) : (
                    "Start Pro Plus"
                  )}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Buy credits to use smarter models. Purchased credits never expire.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  {
                    key: "small",
                    credits: CREDIT_PACKS.small.credits,
                    price: CREDIT_PACKS.small.price,
                    label: "Quick top-up",
                    unitCost: "$0.50 / credit",
                    popular: false,
                    bestValue: false,
                  },
                  {
                    key: "medium",
                    credits: CREDIT_PACKS.medium.credits,
                    price: CREDIT_PACKS.medium.price,
                    label: "Everyday runway",
                    unitCost: "$0.40 / credit",
                    popular:
                      "popular" in CREDIT_PACKS.medium &&
                      Boolean(CREDIT_PACKS.medium.popular),
                    bestValue:
                      "bestValue" in CREDIT_PACKS.medium &&
                      Boolean(CREDIT_PACKS.medium.bestValue),
                  },
                  {
                    key: "large",
                    credits: CREDIT_PACKS.large.credits,
                    price: CREDIT_PACKS.large.price,
                    label: "Longest runway",
                    unitCost: "$0.33 / credit",
                    popular:
                      "popular" in CREDIT_PACKS.large &&
                      Boolean(CREDIT_PACKS.large.popular),
                    bestValue:
                      "bestValue" in CREDIT_PACKS.large &&
                      Boolean(CREDIT_PACKS.large.bestValue),
                  },
                ] satisfies Array<{
                  key: CreditPackKey;
                  credits: number;
                  price: number;
                  label: string;
                  unitCost: string;
                  popular: boolean;
                  bestValue: boolean;
                }>
              ).map((pack) => (
                <div
                  key={pack.key}
                  className={`relative flex flex-col overflow-hidden rounded-2xl border p-4 shadow-sm transition-transform hover:-translate-y-0.5 sm:p-5 ${
                    pack.bestValue
                      ? "border-blue-400/65 bg-gradient-to-b from-blue-500/15 to-background shadow-[0_18px_45px_-28px_rgba(59,130,246,0.8)]"
                      : "border-border/70 bg-gradient-to-b from-muted/70 to-background hover:border-slate-400/50"
                  }`}
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-1 ${
                      pack.bestValue
                        ? "bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500"
                        : "bg-border/70"
                    }`}
                  />
                  {pack.bestValue && (
                    <span className="mb-3 w-fit rounded-full bg-blue-500 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                      Best Value
                    </span>
                  )}
                  {pack.popular && !pack.bestValue && (
                    <span className="mb-3 w-fit rounded-full border border-border/70 bg-muted px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Most Popular
                    </span>
                  )}
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {pack.label}
                  </p>
                  <div className="mb-3 mt-1 flex items-baseline gap-2">
                    <span className="font-mono text-4xl font-semibold tracking-tight">
                      {pack.credits}
                    </span>
                    <span className="font-mono text-xs font-medium text-muted-foreground">
                      CR
                    </span>
                  </div>
                  <div className="mb-5 flex items-end justify-between border-y border-border/60 py-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        One-time
                      </p>
                      <span className="mt-1 block text-3xl font-bold">
                        ${pack.price}
                      </span>
                    </div>
                    <span className="rounded-md bg-muted/70 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                      {pack.unitCost}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleBuyCredits(pack)}
                    disabled={isLoading === `credits-${pack.credits}`}
                    className={`min-h-10 w-full rounded-xl px-4 py-2 text-sm font-semibold ${
                      pack.bestValue
                        ? "bg-blue-600 shadow-sm hover:bg-blue-500"
                        : "bg-foreground text-background hover:bg-foreground/90"
                    }`}
                  >
                    {isLoading === `credits-${pack.credits}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Buy Now"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
          Cancel anytime. Purchased credits never expire; subscription credits
          refresh monthly. Powered by Stripe.
        </p>
      </DialogContent>
    </Dialog>
  );
}
