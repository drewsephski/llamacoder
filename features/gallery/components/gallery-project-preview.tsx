"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const PREVIEW_WIDTH = 1280;
const PREVIEW_HEIGHT = 720;
const PREVIEW_OVERSCAN = 1.01;
const PREVIEW_MESSAGE_SOURCE = "squid-gallery-preview";
const PREVIEW_FALLBACK_TIMEOUT_MS = 15_000;

export function GalleryProjectPreview({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<"loading" | "compiling" | "ready">(
    "loading",
  );

  useEffect(() => {
    const container = containerRef.current;
    const iframe = iframeRef.current;
    if (!container || !iframe) return;

    const fitPreview = () => {
      const scale = (container.clientWidth / PREVIEW_WIDTH) * PREVIEW_OVERSCAN;
      iframe.style.transform = `scale(${scale})`;
    };
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== iframe.contentWindow ||
        event.data?.source !== PREVIEW_MESSAGE_SOURCE
      ) {
        return;
      }
      if (event.data.type === "ready" || event.data.type === "error") {
        setStatus("ready");
      }
    };

    fitPreview();
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(fitPreview);
    resizeObserver?.observe(container);
    if (!resizeObserver) {
      window.addEventListener("resize", fitPreview);
    }
    window.addEventListener("message", onMessage);
    const fallbackTimer = window.setTimeout(
      () => setStatus("ready"),
      PREVIEW_FALLBACK_TIMEOUT_MS,
    );

    return () => {
      resizeObserver?.disconnect();
      if (!resizeObserver) {
        window.removeEventListener("resize", fitPreview);
      }
      window.removeEventListener("message", onMessage);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-muted/30"
    >
      <iframe
        ref={iframeRef}
        src={`/gallery/${slug}/preview`}
        title={`${title} live preview`}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
        tabIndex={-1}
        aria-hidden="true"
        width={PREVIEW_WIDTH}
        height={PREVIEW_HEIGHT}
        onLoad={() =>
          setStatus((currentStatus) =>
            currentStatus === "ready" ? "ready" : "compiling",
          )
        }
        className="pointer-events-none absolute left-0 top-0 max-w-none origin-top-left border-0 bg-background"
      />

      {status !== "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted via-background to-primary/10 text-muted-foreground transition-opacity">
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          <span className="text-xs font-medium">
            {status === "loading" ? "Loading preview" : "Building preview"}
          </span>
        </div>
      )}
    </div>
  );
}
