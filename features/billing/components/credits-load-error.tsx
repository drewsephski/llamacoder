"use client";

import { AlertTriangle } from "lucide-react";

interface CreditsLoadErrorProps {
  onRetryAction: () => void;
  className?: string;
}

export function CreditsLoadError({
  onRetryAction,
  className,
}: CreditsLoadErrorProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-muted-foreground ${className ?? ""}`}
      role="status"
    >
      <AlertTriangle className="size-3.5 shrink-0 text-amber-600" />
      <span>Couldn&apos;t load billing info.</span>
      <button
        type="button"
        onClick={onRetryAction}
        className="font-medium text-foreground underline-offset-2 hover:underline"
      >
        Retry
      </button>
    </div>
  );
}
