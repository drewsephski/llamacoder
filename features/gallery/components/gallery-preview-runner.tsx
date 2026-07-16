"use client";

import { useState } from "react";

import CodeRunner from "@/components/code-runner";

const PREVIEW_MESSAGE_SOURCE = "squid-gallery-preview";

export function GalleryPreviewRunner({
  files,
}: {
  files: Array<{ path: string; content: string }>;
}) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  return (
    <div className="size-full" data-gallery-preview-status={status}>
      <CodeRunner
        files={files}
        onPreviewHealthChange={(health) => {
          const nextStatus = health.status === "working" ? "ready" : "error";
          setStatus(nextStatus);
          window.parent.postMessage(
            { source: PREVIEW_MESSAGE_SOURCE, type: nextStatus },
            window.location.origin,
          );
        }}
      />
    </div>
  );
}
