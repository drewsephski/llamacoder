"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Zap,
  Check,
  Sparkles,
  Crown,
  Lock,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";
import { MODELS } from "@/lib/constants";
import { CREDIT_PACKS, MODEL_PRICING, getModelCreditCost } from "@/lib/billing";
import { Button } from "./ui/button";
import { useStripeCheckout } from "@/lib/queries";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remainingCredits?: number;
  isAuthenticated?: boolean;
}

export function PricingModal({
  open,
  onOpenChange,
  remainingCredits = 0,
  isAuthenticated = false,
}: PricingModalProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"plans" | "credits">("plans");
  const checkoutMutation = useStripeCheckout();

  const handleSubscribe = async (plan: string) => {
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

  const freeModel = MODELS.find((m) => m.free);
  const paidModels = MODELS.filter((m) => m.paid);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-[95vw] overflow-y-auto p-4 sm:max-w-[90vw] sm:p-6 lg:max-w-7xl lg:overflow-visible">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight sm:gap-3 sm:text-3xl">
            <Crown className="h-7 w-7 text-amber-500" />
            Unlock Premium AI Models
          </DialogTitle>
          <DialogDescription className="mt-2 text-base leading-relaxed text-muted-foreground">
            {remainingCredits > 0
              ? `You have ${remainingCredits} credit${remainingCredits === 1 ? "" : "s"} remaining.`
              : "Upgrade to access powerful AI models and create more projects."}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="mt-4 flex gap-2 rounded-xl bg-muted/50 p-1 sm:mt-6">
          <Button
            onClick={() => setActiveTab("plans")}
            variant={activeTab === "plans" ? "default" : "ghost"}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
          >
            Subscription Plans
          </Button>
          <Button
            onClick={() => setActiveTab("credits")}
            variant={activeTab === "credits" ? "default" : "ghost"}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
          >
            Buy Credits
          </Button>
        </div>

        {activeTab === "plans" ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Free Plan */}
            <div className="flex flex-col rounded-2xl border border-border/50 bg-muted/40 p-4 transition-colors hover:border-border/80 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Zap className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold">Free</h3>
              </div>
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold">$0</span>
              </div>
              <p className="mb-6 text-sm text-muted-foreground">Forever free</p>

              <ul className="mb-8 flex-1 space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <span className="text-muted-foreground">
                    {freeModel?.label} model only
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
                    Premium models locked
                  </span>
                </li>
              </ul>

              <Button
                disabled
                className="w-full cursor-default rounded-xl bg-muted/60 px-4 py-2.5 text-sm font-medium text-muted-foreground"
              >
                Current Plan
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="relative flex flex-col rounded-2xl border-2 border-blue-500/50 bg-gradient-to-b from-blue-50/50 to-transparent p-4 shadow-lg shadow-blue-500/5 dark:from-blue-950/30 dark:to-transparent sm:p-6">
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
              <p className="mb-6 text-sm text-muted-foreground">
                100 credits/month
              </p>

              <ul className="mb-8 flex-1 space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span className="text-muted-foreground">
                    All {paidModels.length}+ premium models
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span className="text-muted-foreground">
                    100 credits monthly
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
            </div>

            {/* Pro Plus Plan */}
            <div className="flex flex-col rounded-2xl border border-border/50 bg-muted/40 p-4 transition-colors hover:border-border/80 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Crown className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-semibold">Pro Plus</h3>
              </div>
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold">$29</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <p className="mb-6 text-sm text-muted-foreground">
                500 credits/month
              </p>

              <ul className="mb-8 flex-1 space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span className="text-muted-foreground">
                    Everything in Pro
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span className="text-muted-foreground">
                    500 credits monthly
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span className="text-muted-foreground">
                    Early access to new models
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span className="text-muted-foreground">
                    Dedicated support
                  </span>
                </li>
              </ul>

              <Button
                onClick={() => handleSubscribe("pro_plus")}
                disabled={isLoading === "pro_plus"}
                className="min-h-[44px] w-full rounded-xl border-b-[4px] border-amber-600 bg-amber-500 px-4 py-2.5 text-white hover:-translate-y-[1px] hover:border-b-[6px] hover:brightness-110 active:translate-y-[2px] active:border-b-[2px] active:brightness-90"
              >
                {isLoading === "pro_plus" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Subscribe"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              Buy credits to use premium models. Credits never expire.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  key: "small",
                  credits: CREDIT_PACKS.small.credits,
                  price: CREDIT_PACKS.small.price,
                  popular: false,
                },
                {
                  key: "medium",
                  credits: CREDIT_PACKS.medium.credits,
                  price: CREDIT_PACKS.medium.price,
                  popular: true,
                },
                {
                  key: "large",
                  credits: CREDIT_PACKS.large.credits,
                  price: CREDIT_PACKS.large.price,
                  popular: false,
                },
              ].map((pack) => (
                <div
                  key={pack.key}
                  className={`flex flex-col rounded-2xl border p-4 transition-colors hover:border-border/80 sm:p-6 ${
                    pack.popular
                      ? "border-2 border-blue-500/50 bg-gradient-to-b from-blue-50/50 to-transparent shadow-lg shadow-blue-500/5 dark:from-blue-950/30 dark:to-transparent"
                      : "border-border/50 bg-muted/40"
                  }`}
                >
                  {pack.popular && (
                    <span className="mb-3 w-fit rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      Best Value
                    </span>
                  )}
                  <div className="mb-1 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{pack.credits}</span>
                  </div>
                  <p className="mb-6 text-sm text-muted-foreground">credits</p>
                  <div className="mb-6 flex items-baseline gap-1">
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
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              1 credit = 1 generation with standard models. Premium models cost
              2+ credits.
            </p>
          </div>
        )}

        {/* Model Comparison */}
        <div className="mt-8 border-t border-border/50 pt-6">
          <h4 className="mb-4 text-sm font-semibold">Available Models</h4>
          <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
            {MODELS.map((m) => (
              <div
                key={m.value}
                className={`flex items-center justify-between rounded-xl p-3 ${
                  m.free
                    ? "border border-green-200/50 bg-green-50/50 dark:border-green-900/30 dark:bg-green-950/20"
                    : "border border-border/50 bg-muted/40"
                }`}
              >
                <span className="flex items-center gap-2 font-medium">
                  {m.label}
                </span>
                <span
                  className={`text-xs font-medium ${m.free ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
                >
                  {m.free
                    ? `${getModelCreditCost(m.value)} credit`
                    : `${getModelCreditCost(m.value)} credits`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          Cancel anytime. Credits never expire. Powered by Stripe.
        </p>
      </DialogContent>
    </Dialog>
  );
}
