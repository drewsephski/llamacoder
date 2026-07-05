"use client";

import { useState } from "react";
import { Coins } from "lucide-react";
import { PricingModal } from "@/components/pricing-modal";
import { Button } from "@/components/ui/button";

interface DashboardCreditsButtonProps {
  credits: number;
}

export function DashboardCreditsButton({
  credits,
}: DashboardCreditsButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="ghost"
        className="gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 hover:bg-accent hover:text-white"
        aria-label="Buy more credits"
      >
        <Coins className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-medium">{credits}</span>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          credits
        </span>
      </Button>
      <PricingModal
        open={open}
        onOpenChange={setOpen}
        remainingCredits={credits}
        isAuthenticated
        initialTab="credits"
      />
    </>
  );
}
