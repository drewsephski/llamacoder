"use client";

import { useEffect, useRef } from "react";

const PREVIEW_WIDTH = 1280;
const PREVIEW_HEIGHT = 800;

export function GalleryProjectPreview({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const iframe = iframeRef.current;
    if (!container || !iframe) return;

    const fitPreview = () => {
      const scale = container.clientWidth / PREVIEW_WIDTH;
      iframe.style.transform = `scale(${scale})`;
    };

    fitPreview();
    const resizeObserver = new ResizeObserver(fitPreview);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
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
        className="pointer-events-none absolute left-0 top-0 max-w-none origin-top-left border-0 bg-background"
      />
    </div>
  );
}
