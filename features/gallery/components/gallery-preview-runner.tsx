"use client";

import { useCallback, useRef, useState } from "react";

import CodeRunner from "@/components/code-runner";
import type { PreviewLifecycle } from "@/components/preview-status-overlay";

const PREVIEW_MESSAGE_SOURCE = "squid-gallery-preview";

export function GalleryPreviewRunner({
  files,
}: {
  files: Array<{ path: string; content: string }>;
}) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const statusRef = useRef(status);
  const handleLifecycleChange = useCallback((lifecycle: PreviewLifecycle) => {
    const nextStatus =
      lifecycle.status === "ready"
        ? "ready"
        : lifecycle.status === "error" || lifecycle.status === "timeout"
          ? "error"
          : "loading";
    if (nextStatus === statusRef.current) return;

    statusRef.current = nextStatus;
    setStatus(nextStatus);
    window.parent.postMessage(
      { source: PREVIEW_MESSAGE_SOURCE, type: nextStatus },
      window.location.origin,
    );
  }, []);

  return (
    <div className="size-full" data-gallery-preview-status={status}>
      <CodeRunner
        files={files}
        onPreviewLifecycleChange={handleLifecycleChange}
        showStatusOverlay
      />
    </div>
  );
}
