type PreviewBlock = {
  kind:
    | "nav"
    | "hero"
    | "line"
    | "short-line"
    | "button"
    | "image"
    | "tile-row";
};

const PREVIEW_BLOCKS: PreviewBlock[] = [
  { kind: "nav" },
  { kind: "hero" },
  { kind: "line" },
  { kind: "short-line" },
  { kind: "button" },
  { kind: "image" },
  { kind: "tile-row" },
];

function renderPreviewBlock(block: PreviewBlock, index: number) {
  const delay = `${index * 0.1}s`;

  if (block.kind === "nav") {
    return (
      <div className="generation-preview-nav" key={block.kind}>
        <span className="generation-preview-block generation-preview-logo" />
        <span className="generation-preview-block generation-preview-nav-line" />
        <span className="generation-preview-block generation-preview-nav-pill" />
      </div>
    );
  }

  if (block.kind === "hero") {
    return (
      <div className="generation-preview-hero" key={block.kind}>
        <span className="generation-preview-block generation-preview-hero-title" />
        <span className="generation-preview-block generation-preview-hero-line" />
        <span className="generation-preview-block generation-preview-hero-accent" />
      </div>
    );
  }

  if (block.kind === "tile-row") {
    return (
      <div className="generation-preview-tile-row" key={block.kind}>
        <span className="generation-preview-block generation-preview-tile" />
        <span className="generation-preview-block generation-preview-tile" />
        <span className="generation-preview-block generation-preview-tile" />
      </div>
    );
  }

  return (
    <span
      key={block.kind}
      className={`generation-preview-block generation-preview-${block.kind}`}
      style={{ animationDelay: delay }}
    />
  );
}

function renderPreviewTrack(trackKey: string) {
  return (
    <div className="generation-preview-group" key={trackKey}>
      {PREVIEW_BLOCKS.map(renderPreviewBlock)}
    </div>
  );
}

export function GenerationLoader({
  label = "Generating response",
  variant = "default",
}: {
  label?: string;
  variant?: "default" | "compact";
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`generation-loader ${variant === "compact" ? "is-compact" : "is-default"}`}
    >
      <style>{`
        .generation-loader {
          --generation-surface: hsl(var(--card) / 0.92);
          --generation-surface-muted: hsl(var(--muted) / 0.5);
          --generation-border: hsl(var(--border) / 0.62);
          --generation-blue: #2f80ff;
          --generation-preview: rgba(47, 128, 255, 0.14);
          --generation-preview-strong: rgba(101, 214, 255, 0.26);
          position: relative;
          display: flex;
          width: 100%;
          max-width: none;
          min-height: 0;
          flex-direction: column;
          align-items: stretch;
          gap: 10px;
          color: hsl(var(--foreground));
          font-family: inherit;
          text-align: center;
        }

        .dark .generation-loader {
          --generation-surface: hsl(var(--card) / 0.78);
          --generation-surface-muted: hsl(var(--muted) / 0.28);
          --generation-border: rgba(255, 255, 255, 0.12);
          --generation-preview: rgba(47, 128, 255, 0.16);
          --generation-preview-strong: rgba(101, 214, 255, 0.2);
        }

        .generation-stage {
          position: relative;
          display: flex;
          flex: 1 1 auto;
          width: 100%;
          min-height: 0;
          min-width: 0;
          isolation: isolate;
        }

        .generation-browser {
          position: relative;
          display: flex;
          flex: 1 1 auto;
          flex-direction: column;
          width: 100%;
          min-height: 0;
          overflow: hidden;
          border: 1px solid var(--generation-border);
          border-radius: 16px;
          background:
            radial-gradient(circle at 18% 0%, rgba(47, 128, 255, 0.16), transparent 34%),
            linear-gradient(180deg, var(--generation-surface), hsl(var(--background) / 0.9));
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            0 18px 46px -34px rgba(47, 128, 255, 0.8);
        }

        .generation-browser::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            110deg,
            transparent 0%,
            transparent 32%,
            rgba(101, 214, 255, 0.14) 44%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 62%,
            transparent 100%
          );
          transform: translateX(-120%);
          animation: generation-sweep 3.8s cubic-bezier(0.44, 0, 0.2, 1) infinite;
        }

        .generation-chrome {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 9px;
          border-bottom: 1px solid var(--generation-border);
          background: linear-gradient(180deg, hsl(var(--background) / 0.6), var(--generation-surface-muted));
          padding: 8px 10px;
        }

        .generation-window-controls {
          display: flex;
          gap: 4px;
        }

        .generation-window-controls span {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: rgba(47, 128, 255, 0.36);
        }

        .generation-address {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 6px;
          overflow: hidden;
          border-radius: 999px;
          background: hsl(var(--background) / 0.74);
          color: hsl(var(--muted-foreground));
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 10px;
          line-height: 1;
          padding: 5px 9px;
        }

        .generation-address-dot {
          width: 5px;
          height: 5px;
          flex: 0 0 auto;
          border-radius: 999px;
          background: var(--generation-blue);
          box-shadow: 0 0 0 4px rgba(47, 128, 255, 0.1);
          animation: generation-pulse 1.8s ease-in-out infinite;
        }

        .generation-address-text {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .generation-status-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: rgba(47, 128, 255, 0.12);
          color: hsl(var(--foreground) / 0.72);
          font-size: 9px;
          font-weight: 700;
          line-height: 1;
          padding: 5px 7px;
          text-transform: uppercase;
        }

        .generation-viewport {
          display: block;
          flex: 0 0 auto;
          height: 162px;
          min-height: 0;
          overflow: hidden;
        }

        .generation-preview-panel {
          min-width: 0;
        }

        .generation-preview-panel {
          position: relative;
          height: 100%;
          overflow: hidden;
          background:
            linear-gradient(180deg, hsl(var(--background) / 0.95), hsl(var(--muted) / 0.26)),
            hsl(var(--background));
        }

        .generation-preview-panel::before,
        .generation-preview-panel::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          z-index: 2;
          height: 24px;
          pointer-events: none;
        }

        .generation-preview-panel::before {
          top: 0;
          background: linear-gradient(180deg, hsl(var(--background)), transparent);
        }

        .generation-preview-panel::after {
          bottom: 0;
          background: linear-gradient(0deg, hsl(var(--background)), transparent);
        }

        .generation-preview-track {
          display: flex;
          flex-direction: column;
          animation: generation-scroll 8.5s linear infinite;
        }

        .generation-preview-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 14px;
        }

        .generation-preview-block {
          position: relative;
          display: block;
          overflow: hidden;
          border-radius: 7px;
          background: linear-gradient(90deg, var(--generation-preview), var(--generation-preview-strong));
        }

        .generation-preview-block::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 0%, transparent 42%, hsl(var(--background) / 0.7) 50%, transparent 58%, transparent 100%);
          transform: translateX(-110%);
          animation: generation-shimmer 2.4s ease-in-out infinite;
        }

        .generation-preview-nav {
          display: grid;
          grid-template-columns: 28px minmax(0, 1fr) 56px;
          align-items: center;
          gap: 8px;
        }

        .generation-preview-logo {
          width: 28px;
          height: 14px;
          border-radius: 999px;
        }

        .generation-preview-nav-line {
          width: 78%;
          height: 6px;
          justify-self: start;
        }

        .generation-preview-nav-pill {
          width: 56px;
          height: 12px;
          border-radius: 999px;
          justify-self: end;
        }

        .generation-preview-hero {
          display: flex;
          min-height: 48px;
          flex-direction: column;
          justify-content: center;
          gap: 7px;
          overflow: hidden;
          border-radius: 11px;
          background:
            radial-gradient(circle at 16% 22%, rgba(255, 255, 255, 0.34), transparent 16%),
            linear-gradient(135deg, rgba(47, 128, 255, 0.62), rgba(101, 214, 255, 0.22));
          padding: 10px;
        }

        .generation-preview-hero-title,
        .generation-preview-hero-line,
        .generation-preview-hero-accent {
          background: rgba(255, 255, 255, 0.32);
        }

        .generation-preview-hero-title {
          width: 66%;
          height: 10px;
        }

        .generation-preview-hero-line {
          width: 86%;
          height: 6px;
        }

        .generation-preview-hero-accent {
          width: 38%;
          height: 6px;
        }

        .generation-preview-line {
          width: 92%;
          height: 8px;
        }

        .generation-preview-short-line {
          width: 58%;
          height: 8px;
        }

        .generation-preview-button {
          width: 70px;
          height: 18px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(47, 128, 255, 0.82), rgba(101, 214, 255, 0.72));
        }

        .generation-preview-image {
          width: 100%;
          height: 42px;
          border-radius: 10px;
          background:
            radial-gradient(circle at 22% 24%, rgba(255, 255, 255, 0.32), transparent 17%),
            linear-gradient(135deg, rgba(47, 128, 255, 0.72), rgba(101, 214, 255, 0.38));
        }

        .generation-preview-tile-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 7px;
        }

        .generation-preview-tile {
          height: 30px;
          border-radius: 8px;
        }

        .generation-loader-label {
          display: inline-flex;
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 4;
          max-width: calc(100% - 32px);
          transform: translate(-50%, -50%);
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin: 0;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          background: hsl(var(--background) / 0.72);
          color: hsl(var(--foreground) / 0.9);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0;
          line-height: 1.2;
          padding: 7px 12px;
          pointer-events: none;
          text-shadow: 0 1px 12px hsl(var(--background));
          white-space: nowrap;
          backdrop-filter: blur(10px) saturate(140%);
          box-shadow: 0 12px 30px -22px rgba(0, 0, 0, 0.7);
        }

        .generation-loader-label span:first-child {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .generation-label-dots {
          display: inline-flex;
          gap: 3px;
        }

        .generation-label-dots span {
          width: 3px;
          height: 3px;
          border-radius: 999px;
          background: currentColor;
          opacity: 0.28;
          animation: generation-dot 1.4s ease-in-out infinite;
        }

        .generation-label-dots span:nth-child(2) { animation-delay: 0.18s; }
        .generation-label-dots span:nth-child(3) { animation-delay: 0.36s; }

        .generation-loader.is-compact {
          max-width: none;
          height: 100%;
          gap: 0;
        }

        .generation-loader.is-compact .generation-browser {
          height: 100%;
          border-radius: 14px;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            0 14px 34px -30px rgba(47, 128, 255, 0.88);
        }

        .generation-loader.is-compact .generation-chrome {
          gap: 7px;
          padding: 6px 8px;
        }

        .generation-loader.is-compact .generation-window-controls span {
          width: 5px;
          height: 5px;
        }

        .generation-loader.is-compact .generation-address {
          font-size: 8px;
          padding: 4px 7px;
        }

        .generation-loader.is-compact .generation-status-chip {
          font-size: 7px;
          padding: 4px 6px;
        }

        .generation-loader.is-compact .generation-viewport {
          flex: 1 1 auto;
          height: auto;
        }

        .generation-loader.is-compact .generation-preview-group {
          gap: 6px;
          padding: 9px;
        }

        .generation-loader.is-compact .generation-preview-nav {
          grid-template-columns: 22px minmax(0, 1fr) 42px;
          gap: 6px;
        }

        .generation-loader.is-compact .generation-preview-logo {
          width: 22px;
          height: 10px;
        }

        .generation-loader.is-compact .generation-preview-nav-line {
          height: 4px;
        }

        .generation-loader.is-compact .generation-preview-nav-pill {
          width: 42px;
          height: 8px;
        }

        .generation-loader.is-compact .generation-preview-hero {
          min-height: 30px;
          gap: 4px;
          border-radius: 8px;
          padding: 7px;
        }

        .generation-loader.is-compact .generation-preview-hero-title {
          height: 6px;
        }

        .generation-loader.is-compact .generation-preview-hero-line,
        .generation-loader.is-compact .generation-preview-hero-accent {
          height: 4px;
        }

        .generation-loader.is-compact .generation-preview-line,
        .generation-loader.is-compact .generation-preview-short-line {
          height: 5px;
        }

        .generation-loader.is-compact .generation-preview-button {
          width: 46px;
          height: 10px;
        }

        .generation-loader.is-compact .generation-preview-image {
          height: 22px;
          border-radius: 7px;
        }

        .generation-loader.is-compact .generation-preview-tile-row {
          gap: 5px;
        }

        .generation-loader.is-compact .generation-preview-tile {
          height: 15px;
        }

        .generation-loader.is-compact .generation-loader-label {
          font-size: 12px;
          padding: 6px 10px;
        }

        @keyframes generation-pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(47, 128, 255, 0.1); }
          50% { box-shadow: 0 0 0 6px rgba(47, 128, 255, 0); }
        }

        @keyframes generation-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }

        @keyframes generation-shimmer {
          0%, 18% { transform: translateX(-110%); }
          70%, 100% { transform: translateX(110%); }
        }

        @keyframes generation-sweep {
          0%, 20% { transform: translateX(-120%); }
          66%, 100% { transform: translateX(120%); }
        }

        @keyframes generation-dot {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
          40% { opacity: 0.95; transform: translateY(-2px); }
        }

        @media (max-width: 520px) {
          .generation-preview-nav {
            grid-template-columns: 24px minmax(0, 1fr) 46px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .generation-browser::after,
          .generation-address-dot,
          .generation-preview-track,
          .generation-preview-block::after,
          .generation-label-dots span {
            animation: none !important;
          }
        }
      `}</style>

      <div className="generation-stage" aria-hidden="true">
        <div className="generation-browser">
          <div className="generation-chrome">
            <div className="generation-window-controls">
              <span />
              <span />
              <span />
            </div>
            <div className="generation-address">
              <span className="generation-address-dot" />
              <span className="generation-address-text">
                squidagent.app/preview
              </span>
            </div>
            <span className="generation-status-chip">Live</span>
          </div>

          <div className="generation-viewport">
            <div className="generation-preview-panel">
              <div className="generation-preview-track">
                {renderPreviewTrack("top")}
                {renderPreviewTrack("bottom")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="generation-loader-label">
        <span>{label}</span>
        <span className="generation-label-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </p>
    </div>
  );
}
