"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Zap, Check, Sparkles, Crown, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { MODELS } from "@/lib/constants";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remainingCredits?: number;
  isAuthenticated?: boolean;
}

const CREDIT_PACKS = [
  { key: "small", credits: 10, price: 5, popular: false },
  { key: "medium", credits: 25, price: 10, popular: true },
  { key: "large", credits: 60, price: 20, popular: false },
];

export function PricingModal({
  open,
  onOpenChange,
  remainingCredits = 0,
  isAuthenticated = false,
}: PricingModalProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"plans" | "credits">("plans");

  const handleSubscribe = async (plan: string) => {
    if (!isAuthenticated) {
      window.location.href = "/sign-in";
      return;
    }

    setIsLoading(plan);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      window.location.href = data.url;
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleBuyCredits = async (pack: typeof CREDIT_PACKS[0]) => {
    if (!isAuthenticated) {
      window.location.href = "/sign-in";
      return;
    }

    setIsLoading(`credits-${pack.credits}`);
    try {
      const response = await fetch("/api/stripe/credits-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pack: pack.key }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      window.location.href = data.url;
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const freeModel = MODELS.find(m => m.free);
  const paidModels = MODELS.filter(m => m.paid);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <Crown className="h-7 w-7 text-amber-500" />
            Unlock Premium AI Models
          </DialogTitle>
          <DialogDescription className="text-base mt-2 text-muted-foreground leading-relaxed">
            {remainingCredits > 0
              ? `You have ${remainingCredits} credit${remainingCredits === 1 ? "" : "s"} remaining.`
              : "Upgrade to access powerful AI models and create more projects."}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 p-1 bg-muted/50 rounded-xl">
          <button
            onClick={() => setActiveTab("plans")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === "plans"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            Subscription Plans
          </button>
          <button
            onClick={() => setActiveTab("credits")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === "credits"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            Buy Credits
          </button>
        </div>

        {activeTab === "plans" ? (
          <div className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Free Plan */}
            <div className="rounded-2xl border border-border/50 bg-muted/40 p-6 flex flex-col hover:border-border/80 transition-colors">
              <div className="flex items-center gap-2.5 mb-3">
                <Zap className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold text-lg">Free</h3>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold">$0</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Forever free</p>
              
              <ul className="space-y-3 text-sm mb-8 flex-1">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{freeModel?.label} only</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">1 free project</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Basic support</span>
                </li>
              </ul>

              <button
                disabled
                className="w-full py-2.5 px-4 rounded-xl bg-muted/60 text-muted-foreground text-sm font-medium cursor-default"
              >
                Current Plan
              </button>
            </div>

            {/* Pro Plan */}
            <div className="rounded-2xl border-2 border-blue-500/50 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/30 dark:to-transparent p-6 flex flex-col relative shadow-lg shadow-blue-500/5">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  Popular
                </span>
              </div>
              <div className="flex items-center gap-2.5 mb-3 mt-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-lg">Pro</h3>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold">$9</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">100 credits/month</p>
              
              <ul className="space-y-3 text-sm mb-8 flex-1">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">All {paidModels.length}+ premium models</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">100 credits monthly</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Priority generation</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Export projects</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe("pro")}
                disabled={isLoading === "pro"}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
              >
                {isLoading === "pro" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>

            {/* Unlimited Plan */}
            <div className="rounded-2xl border border-border/50 bg-muted/40 p-6 flex flex-col hover:border-border/80 transition-colors">
              <div className="flex items-center gap-2.5 mb-3">
                <Crown className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-lg">Unlimited</h3>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold">$29</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Unlimited credits</p>
              
              <ul className="space-y-3 text-sm mb-8 flex-1">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Unlimited generations</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Early access to new models</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Dedicated support</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe("unlimited")}
                disabled={isLoading === "unlimited"}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
              >
                {isLoading === "unlimited" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Buy credits to use premium models. Credits never expire.
            </p>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {CREDIT_PACKS.map((pack) => (
                <div
                  key={pack.key}
                  className={`rounded-2xl border p-6 flex flex-col hover:border-border/80 transition-colors ${
                    pack.popular
                      ? "border-2 border-blue-500/50 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/30 dark:to-transparent shadow-lg shadow-blue-500/5"
                      : "border-border/50 bg-muted/40"
                  }`}
                >
                  {pack.popular && (
                    <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full w-fit mb-3 shadow-sm">
                      Best Value
                    </span>
                  )}
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-bold">{pack.credits}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">credits</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-bold">${pack.price}</span>
                  </div>
                  <button
                    onClick={() => handleBuyCredits(pack)}
                    disabled={isLoading === `credits-${pack.credits}`}
                    className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2 ${
                      pack.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isLoading === `credits-${pack.credits}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Buy Now"
                    )}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
              1 credit = 1 generation with standard models. Premium models cost 2 credits.
            </p>
          </div>
        )}

        {/* Model Comparison */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <h4 className="font-semibold mb-4 text-sm">Available Models</h4>
          <div className="grid gap-2 text-sm">
            {MODELS.map((m) => (
              <div
                key={m.value}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  m.free
                    ? "bg-green-50/50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-900/30"
                    : "bg-muted/40 border border-border/50"
                }`}
              >
                <span className="flex items-center gap-2 font-medium">
                  {m.label}
                </span>
                <span className={`text-xs font-medium ${m.free ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                  {m.free ? "Free" : m.value.includes('pro') || m.value.includes('maverick') ? "2 credits" : "1 credit"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 leading-relaxed">
          Cancel anytime. Credits never expire. Powered by Stripe.
        </p>
      </DialogContent>
    </Dialog>
  );
}
