"use client";

import type { ReactNode } from "react";

import { CometSpinner } from "@/components/loading-ui/comet-spinner";

export default function Spinner({
  loading = true,
  children,
  className = "size-3",
  label = "Loading",
}: {
  loading?: boolean;
  children?: ReactNode;
  className?: string;
  label?: string;
}) {
  if (!loading) return children;

  const spinner = <CometSpinner className={className} aria-label={label} />;

  if (!children) return spinner;

  return (
    <span className="relative flex h-full items-center justify-center">
      <span className="invisible flex">{children}</span>

      <span className="absolute inset-0 flex items-center justify-center">
        {spinner}
      </span>
    </span>
  );
}
