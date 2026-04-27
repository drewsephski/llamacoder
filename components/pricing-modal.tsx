"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Zap, Check } from "lucide-react";
import { toast } from "sonner";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remainingCredits?: number;
}

export function PricingModal({
  open,
  onOpenChange,
  remainingCredits = 0,
}: PricingModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please sign in to subscribe");
          onOpenChange(false);
          return;
        }
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    "100 AI generations per month",
    "All premium AI models",
    "Priority support",
    "Unlimited chat history",
    "Export your apps",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Zap className="h-6 w-6 text-yellow-500" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription className="text-base">
            {remainingCredits > 0
              ? `You have ${remainingCredits} generation${remainingCredits === 1 ? "" : "s"} remaining this month.`
              : "You've used all your free generations."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Pricing Card */}
          <div className="rounded-xl border border-border bg-muted/50 p-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">$9</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Get 100 AI generations every month
            </p>
          </div>

          {/* Features */}
          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <Check className="h-5 w-5 shrink-0 text-green-500" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[48px] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Subscribe Now"
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Cancel anytime. Powered by Stripe.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
