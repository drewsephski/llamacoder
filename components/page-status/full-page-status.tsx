import type { ReactNode } from "react";

import { CometSpinner } from "@/components/loading-ui/comet-spinner";
import {
  PageStatusShell,
  type PageStatusVariant,
} from "@/components/page-status/page-status-shell";
import { cn } from "@/lib/utils";

export function FullPageStatus({
  description,
  label,
  spinnerClassName,
  variant = "page",
}: {
  description?: ReactNode;
  label: string;
  spinnerClassName?: string;
  variant?: PageStatusVariant;
}) {
  return (
    <PageStatusShell variant={variant}>
      <div
        aria-atomic="true"
        aria-live="polite"
        className="flex flex-col items-center justify-center gap-4 text-center"
        role="status"
      >
        <CometSpinner
          aria-hidden="true"
          className={cn("block size-8", spinnerClassName)}
          role="presentation"
          variant="page"
        />
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          {description ? (
            <div className="text-xs text-muted-foreground">{description}</div>
          ) : null}
        </div>
      </div>
    </PageStatusShell>
  );
}
