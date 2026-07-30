import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type PageStatusVariant = "page" | "constrained";

export function PageStatusShell({
  children,
  className,
  variant = "page",
  ...props
}: ComponentProps<"div"> & { variant?: PageStatusVariant }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4",
        variant === "page" ? "min-h-dvh" : "min-h-full",
        className,
      )}
      data-slot="page-status-shell"
      {...props}
    >
      {children}
    </div>
  );
}
