"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <div className="flex items-center gap-2 text-red-500">
        <AlertCircle className="h-6 w-6" />
        <h2 className="text-lg font-semibold">Failed to load dashboard</h2>
      </div>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        {error.message || "We couldn\'t load your dashboard. Please try again."}
      </p>
      <div className="flex gap-2">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
        <Button onClick={() => window.location.reload()} variant="outline">
          Refresh page
        </Button>
      </div>
    </div>
  );
}
