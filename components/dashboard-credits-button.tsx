"use client";

import { useState } from "react";
import { Coins } from "lucide-react";
import { PricingModal } from "@/features/billing/components/pricing-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardCreditsButtonProps {
  credits: number;
  currentTier?: "free" | "pro" | "pro_plus";
  className?: string;
  compact?: boolean;
  showLabel?: boolean;
}

export function DashboardCreditsButton({
  credits,
  currentTier = "free",
  className,
  compact = false,
  showLabel = false,
}: DashboardCreditsButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="ghost"
        className={cn(
          "gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 hover:bg-accent hover:text-white",
          compact && "size-11 px-0 min-[360px]:w-auto min-[360px]:px-3",
          className,
        )}
        aria-label="Buy more credits"
      >
        <Coins className="h-4 w-4 text-amber-500" />
        <span
          className={cn(
            "text-sm font-medium",
            compact && "hidden min-[360px]:inline",
          )}
        >
          {credits}
        </span>
        <span
          className={cn(
            "text-xs text-muted-foreground",
            showLabel ? "inline" : "hidden sm:inline",
            compact && "hidden",
          )}
        >
          credits
        </span>
      </Button>
      <PricingModal
        open={open}
        onOpenChange={setOpen}
        remainingCredits={credits}
        isAuthenticated
        initialTab="credits"
        currentTier={currentTier}
      />
    </>
  );
}
