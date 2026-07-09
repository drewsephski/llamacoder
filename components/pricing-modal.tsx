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
  formatModelCreditRange,
  getModelTier,
} from "@/lib/billing";
import { Button } from "./ui/button";
import { useStripeCheckout } from "@/lib/queries";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remainingCredits?: number;
  isAuthenticated?: boolean;
  initialTab?: PricingTab;
  currentTier?: SubscriptionTier;
}

type PricingTab = "plans" | "credits";
type SubscriptionTier = "free" | "pro" | "pro_plus";

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
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const isCurrentTier = (tier: SubscriptionTier) =>
    isAuthenticated && currentTier === tier;

  const handleBuyCredits = async (pack: {
    key: string;
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
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
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
      <DialogContent className="max-h-[calc(100svh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-5xl gap-0 overflow-y-auto overscroll-contain p-4 sm:max-h-[calc(100svh-3rem)] sm:w-[calc(100vw-2rem)] sm:p-5">
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
            <div className="flex flex-col rounded-xl border border-border/50 bg-muted/40 p-4 transition-colors hover:border-border/80 sm:p-5">
              <div className="mb-3 flex items-center gap-2.5">
                <Zap className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold">Free</h3>
              </div>
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold">$0</span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">Forever free</p>

              <ul className="mb-5 flex-1 space-y-2.5 text-sm sm:mb-6">
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
                className="w-full cursor-default rounded-xl bg-muted/60 px-4 py-2.5 text-sm font-medium text-muted-foreground"
              >
                {currentTier === "free" ? "Current Plan" : "Included"}
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="relative flex flex-col rounded-xl border-2 border-blue-500/50 bg-gradient-to-b from-blue-50/50 to-transparent p-4 shadow-lg shadow-blue-500/5 dark:from-blue-950/30 dark:to-transparent sm:p-5">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  Popular
                </span>
              </div>
              <div className="mb-3 mt-2 flex items-center gap-2.5">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Pro</h3>
              </div>
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold">$9</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                100 credits/month
              </p>

              <ul className="mb-5 flex-1 space-y-2.5 text-sm sm:mb-6">
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
                <Button disabled className="min-h-[44px] w-full rounded-xl">
                  Current Plan
                </Button>
              ) : currentTier === "pro_plus" ? (
                <Button
                  disabled
                  variant="outline"
                  className="min-h-[44px] w-full rounded-xl"
                >
                  Included in Pro Plus
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubscribe("pro")}
                  disabled={isLoading === "pro"}
                  className="min-h-[44px] w-full rounded-xl px-4 py-2.5"
                >
                  {isLoading === "pro" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              )}
            </div>

            {/* Pro Plus Plan */}
            <div className="flex flex-col rounded-xl border border-border/50 bg-muted/40 p-4 transition-colors hover:border-border/80 sm:p-5">
              <div className="mb-3 flex items-center gap-2.5">
                <Crown className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-semibold">Pro Plus</h3>
              </div>
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold">$29</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                500 credits/month
              </p>

              <ul className="mb-5 flex-1 space-y-2.5 text-sm sm:mb-6">
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
                <Button disabled className="min-h-[44px] w-full rounded-xl">
                  Current Plan
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubscribe("pro_plus")}
                  disabled={isLoading === "pro_plus"}
                  className="min-h-[44px] w-full rounded-xl border-b-[4px] border-amber-600 bg-amber-500 px-4 py-2.5 text-white hover:-translate-y-[1px] hover:border-b-[6px] hover:brightness-110 active:translate-y-[2px] active:border-b-[2px] active:brightness-90"
                >
                  {isLoading === "pro_plus" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : currentTier === "pro" ? (
                    "Upgrade to Pro Plus"
                  ) : (
                    "Subscribe"
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
              {[
                {
                  key: "small",
                  credits: CREDIT_PACKS.small.credits,
                  price: CREDIT_PACKS.small.price,
                  popular: false,
                  bestValue: false,
                },
                {
                  key: "medium",
                  credits: CREDIT_PACKS.medium.credits,
                  price: CREDIT_PACKS.medium.price,
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
                  popular:
                    "popular" in CREDIT_PACKS.large &&
                    Boolean(CREDIT_PACKS.large.popular),
                  bestValue:
                    "bestValue" in CREDIT_PACKS.large &&
                    Boolean(CREDIT_PACKS.large.bestValue),
                },
              ].map((pack) => (
                <div
                  key={pack.key}
                  className={`flex flex-col rounded-xl border p-4 transition-colors hover:border-border/80 sm:p-5 ${
                    pack.bestValue
                      ? "border-2 border-blue-500/50 bg-gradient-to-b from-blue-50/50 to-transparent shadow-lg shadow-blue-500/5 dark:from-blue-950/30 dark:to-transparent"
                      : "border-border/50 bg-muted/40"
                  }`}
                >
                  {pack.bestValue && (
                    <span className="mb-3 w-fit rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      Best Value
                    </span>
                  )}
                  {pack.popular && !pack.bestValue && (
                    <span className="mb-3 w-fit rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      Most Popular
                    </span>
                  )}
                  <div className="mb-1 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{pack.credits}</span>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">credits</p>
                  <div className="mb-5 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">${pack.price}</span>
                  </div>
                  <Button
                    onClick={() => handleBuyCredits(pack)}
                    disabled={isLoading === `credits-${pack.credits}`}
                    className="min-h-[44px] w-full rounded-xl px-4 py-2.5"
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
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              Credits are charged only when a new app version is saved. Final
              cost depends on model and generation size.
            </p>
          </div>
        )}

        {/* Model Comparison */}
        <div className="mt-6 border-t border-border/50 pt-5">
          <h4 className="mb-3 text-sm font-semibold">Available Models</h4>
          <div className="grid grid-cols-1 gap-1.5 text-[13px] sm:grid-cols-2 lg:grid-cols-3">
            {MODELS.map((m) => (
              <div
                key={m.value}
                className={`flex min-w-0 items-center justify-between gap-3 rounded-lg px-3 py-2.5 ${
                  m.free
                    ? "border border-green-200/50 bg-green-50/50 dark:border-green-900/30 dark:bg-green-950/20"
                    : m.group === "premium"
                      ? "border border-amber-300/60 bg-amber-50/60 dark:border-yellow-500/25 dark:bg-yellow-950/20"
                      : "border border-border/50 bg-muted/40"
                }`}
              >
                <span className="min-w-0 truncate font-medium">
                  {m.label}
                </span>
                <span
                  className={`shrink-0 text-xs font-medium ${
                    m.free
                      ? "text-green-600 dark:text-green-400"
                      : m.group === "premium"
                        ? "text-amber-600 dark:text-yellow-400"
                        : "text-muted-foreground"
                  }`}
                >
                  {formatModelCreditRange(m.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
          Cancel anytime. Purchased credits never expire; subscription credits
          refresh monthly. Powered by Stripe.
        </p>
      </DialogContent>
    </Dialog>
  );
}
