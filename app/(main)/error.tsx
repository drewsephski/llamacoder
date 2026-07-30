"use client";

import { useEffect } from "react";

import { PageErrorState } from "@/components/page-status/page-error-state";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageErrorState
      description="An unexpected error occurred. Please try again."
      primaryAction={{ label: "Try again", onClick: reset }}
      reference={error.digest}
      secondaryAction={{
        label: "Go home",
        onClick: () => {
          window.location.href = "/";
        },
      }}
      title="Something went wrong"
    />
  );
}
