type PreviewBlock = {
  kind: "bar" | "wide-bar" | "image" | "pill" | "cards";
  width?: string;
};

const PREVIEW_BLOCKS: PreviewBlock[] = [
  { kind: "bar", width: "34%" }, // nav logo
  { kind: "wide-bar", width: "64%" }, // hero title
  { kind: "bar", width: "86%" }, // hero copy line 1
  { kind: "bar", width: "56%" }, // hero copy line 2
  { kind: "pill" }, // CTA button
  { kind: "image" }, // hero visual
  { kind: "cards" }, // feature row
];

function renderPreviewGroup(groupKey: string) {
  return (
    <div className="generation-loader-preview-group" key={groupKey}>
      {PREVIEW_BLOCKS.map((block, i) => {
        const delay = `${i * 0.14}s`;
        if (block.kind === "image") {
          return (
            <div
              key={`${groupKey}-${i}`}
              className="gl-block gl-block-image"
              style={{ animationDelay: delay }}
            />
          );
        }
        if (block.kind === "pill") {
          return (
            <div
              key={`${groupKey}-${i}`}
              className="gl-block gl-block-pill"
              style={{ animationDelay: delay }}
            />
          );
        }
        if (block.kind === "cards") {
          return (
            <div key={`${groupKey}-${i}`} className="gl-cards-row">
              <div
                className="gl-block gl-block-card"
                style={{ animationDelay: delay }}
              />
              <div
                className="gl-block gl-block-card"
                style={{ animationDelay: `${i * 0.14 + 0.08}s` }}
              />
            </div>
          );
        }
        return (
          <div
            key={`${groupKey}-${i}`}
            className={`gl-block gl-block-bar ${block.kind === "wide-bar" ? "is-wide" : ""}`}
            style={{ width: block.width, animationDelay: delay }}
          />
        );
      })}
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
      className={`generation-loader ${variant === "compact" ? "is-compact" : ""} flex w-full max-w-[380px] flex-col items-center gap-5 text-center`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600&family=JetBrains+Mono:wght@400;500&display=swap');

        .generation-loader-stage {
          position: relative;
          display: grid;
          place-items: center;
          width: 100%;
          height: 236px;
          isolation: isolate;
        }

        /* ---------- Ambient brand glow ---------- */
        .generation-loader-glow {
          position: absolute;
          border-radius: 28px;
          filter: blur(34px);
          opacity: 0.36;
          pointer-events: none;
          z-index: 0;
          animation: generation-loader-drift 9s ease-in-out infinite;
        }
        .generation-loader-glow-blue {
          width: 190px;
          height: 190px;
          top: -36px;
          left: -18px;
          background: #2563eb;
        }
        .generation-loader-glow-teal {
          width: 160px;
          height: 160px;
          bottom: -34px;
          right: -14px;
          background: #38bdf8;
          animation-delay: -3s;
        }
        .generation-loader-glow-violet {
          width: 120px;
          height: 120px;
          bottom: 10px;
          left: -30px;
          background: #60a5fa;
          opacity: 0.24;
          animation-delay: -6s;
        }

        /* ---------- Floating token chips orbiting the window ---------- */
        .generation-loader-chip {
          position: absolute;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 22px;
          width: 22px;
          border-radius: 6px;
          border: 1px solid color-mix(in srgb, currentColor 30%, hsl(var(--border)));
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.72)),
            color-mix(in srgb, currentColor 10%, hsl(var(--background)));
          box-shadow: 0 10px 24px rgba(37, 99, 235, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.8);
          animation: generation-loader-chip-float 5s ease-in-out infinite;
        }
        .generation-loader-chip::after {
          content: "";
          width: 9px;
          height: 9px;
          border-radius: 3px;
          background: currentColor;
          opacity: 0.75;
        }
        .generation-loader-chip-one {
          top: 6px;
          left: -6px;
          color: #2563eb;
        }
        .generation-loader-chip-two {
          top: 34px;
          right: -10px;
          color: #0ea5e9;
          animation-delay: -1.6s;
        }
        .generation-loader-chip-three {
          bottom: 20px;
          left: -12px;
          color: #3b82f6;
          animation-delay: -3.2s;
        }
        .dark .generation-loader-chip {
          background:
            linear-gradient(180deg, hsl(var(--secondary) / 0.8), hsl(var(--card))),
            color-mix(in srgb, currentColor 14%, hsl(var(--card)));
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4);
        }

        /* ---------- The browser window ---------- */
        .generation-loader-browser {
          position: relative;
          z-index: 2;
          width: 300px;
          max-width: 90%;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(37, 99, 235, 0.18);
          background: hsl(var(--card));
          box-shadow:
            0 24px 56px -18px rgba(37, 99, 235, 0.42),
            0 2px 10px rgba(15, 23, 42, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
          transform: perspective(1000px) rotateX(2deg);
          animation: generation-loader-float 4.8s ease-in-out infinite;
        }
        .dark .generation-loader-browser {
          box-shadow:
            0 26px 60px -14px rgba(0, 0, 0, 0.55),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }

        .generation-loader-chrome {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 11px;
          background: linear-gradient(180deg, rgba(37, 99, 235, 0.08), hsl(var(--muted) / 0.46));
          border-bottom: 1px solid rgba(37, 99, 235, 0.14);
        }
        .generation-loader-dots {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
        }
        .generation-loader-dots span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.28);
        }
        .generation-loader-url {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 5px;
          min-width: 0;
          padding: 3px 9px;
          border-radius: 6px;
          background: hsl(var(--background) / 0.88);
          font-family: "JetBrains Mono", ui-monospace, monospace;
          font-size: 10.5px;
          color: hsl(var(--muted-foreground));
        }
        .generation-loader-lock {
          width: 6px;
          height: 6px;
          border-radius: 2px;
          border: 1.1px solid hsl(var(--muted-foreground) / 0.5);
          flex-shrink: 0;
        }
        .generation-loader-url-text {
          overflow: hidden;
          white-space: nowrap;
        }
        .generation-loader-url-caret {
          display: inline-block;
          width: 1px;
          height: 9px;
          margin-left: 1px;
          vertical-align: -1px;
          background: #2563eb;
          animation: generation-loader-caret 1s steps(2, end) infinite;
        }
        .generation-loader-live {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
          font-family: "JetBrains Mono", ui-monospace, monospace;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: hsl(var(--muted-foreground));
        }
        .generation-loader-live-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #2563eb;
          animation: generation-loader-pulse 1.8s infinite;
        }

        .generation-loader-viewport {
          position: relative;
          display: flex;
          flex-direction: column;
          height: 168px;
          overflow: hidden;
        }

        /* ---------- Code pane: typing effect ---------- */
        .generation-loader-code-pane {
          position: relative;
          flex: 0 0 64px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
          padding: 10px 13px;
          background:
            linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.94));
          border-bottom: 1px solid rgba(96, 165, 250, 0.18);
          overflow: hidden;
        }
        .generation-loader-code-line {
          display: flex;
          align-items: center;
          white-space: nowrap;
          font-family: "JetBrains Mono", ui-monospace, monospace;
          font-size: 10.5px;
          line-height: 1;
          clip-path: inset(0 100% 0 0);
          animation: generation-loader-type 3.6s steps(26, end) infinite;
        }
        .generation-loader-code-line-two { animation-delay: 0.5s; }
        .generation-loader-code-line-three {
          animation-delay: 1s;
          display: flex;
          align-items: center;
        }
        .tok-kw { color: #93c5fd; }
        .tok-fn { color: #60a5fa; }
        .tok-str { color: #bfdbfe; }
        .tok-tag { color: #93c5fd; }
        .tok-attr { color: #7dd3fc; }
        .tok-punc { color: rgba(226, 232, 240, 0.55); }
        .generation-loader-code-cursor {
          display: inline-block;
          width: 5px;
          height: 10px;
          margin-left: 3px;
          border-radius: 1px;
          background: #f8fafc;
          animation: generation-loader-caret 1s steps(2, end) infinite;
        }

        /* ---------- Preview pane: scrolling app skeleton ---------- */
        .generation-loader-preview-pane {
          position: relative;
          flex: 1;
          overflow: hidden;
          background: linear-gradient(180deg, hsl(var(--background)), rgba(37, 99, 235, 0.06));
        }
        .generation-loader-preview-pane::before,
        .generation-loader-preview-pane::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          height: 18px;
          z-index: 2;
          pointer-events: none;
        }
        .generation-loader-preview-pane::before {
          top: 0;
          background: linear-gradient(180deg, hsl(var(--background)), transparent);
        }
        .generation-loader-preview-pane::after {
          bottom: 0;
          background: linear-gradient(0deg, hsl(var(--background)), transparent);
        }
        .generation-loader-preview-track {
          display: flex;
          flex-direction: column;
          animation: generation-loader-scroll 8s linear infinite;
        }
        .generation-loader-preview-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px 13px;
        }

        .gl-block {
          position: relative;
          overflow: hidden;
          border-radius: 5px;
          background: linear-gradient(90deg, rgba(37, 99, 235, 0.14), rgba(96, 165, 250, 0.08));
        }
        .gl-block::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            110deg,
            transparent 0%,
            transparent 40%,
            hsl(var(--background) / 0.85) 50%,
            transparent 60%,
            transparent 100%
          );
          transform: translateX(-120%);
          animation: generation-loader-shimmer 2.4s ease-in-out infinite;
        }
        .gl-block-bar { height: 7px; }
        .gl-block-bar.is-wide { height: 11px; border-radius: 6px; }
        .gl-block-pill {
          height: 16px;
          width: 64px;
          border-radius: 999px;
          background: linear-gradient(120deg, #2563eb, #60a5fa);
        }
        .gl-block-image {
          height: 46px;
          width: 100%;
          border-radius: 8px;
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 48%, #7dd3fc 100%);
          opacity: 0.9;
        }
        .gl-cards-row {
          display: flex;
          gap: 8px;
        }
        .gl-block-card {
          height: 34px;
          flex: 1;
          border-radius: 7px;
        }

        .generation-loader-sweep {
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          background: linear-gradient(
            115deg,
            transparent 0%,
            transparent 36%,
            rgba(147, 197, 253, 0.18) 49%,
            transparent 62%,
            transparent 100%
          );
          transform: translateX(-130%);
          animation: generation-loader-scan 3.4s ease-in-out infinite;
        }

        /* ---------- Label ---------- */
        .generation-loader-label {
          display: inline-flex;
          align-items: baseline;
          gap: 2px;
          font-family: "DM Sans", system-ui, sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: -0.01em;
          color: hsl(var(--foreground) / 0.82);
        }

        .generation-loader.is-compact {
          max-width: 300px;
          gap: 2px;
        }
        .generation-loader.is-compact .generation-loader-stage {
          height: 112px;
        }
        .generation-loader.is-compact .generation-loader-glow,
        .generation-loader.is-compact .generation-loader-chip {
          display: none;
        }
        .generation-loader.is-compact .generation-loader-browser {
          width: 252px;
          border-radius: 13px;
          box-shadow:
            0 18px 42px -24px rgba(37, 99, 235, 0.52),
            0 1px 7px rgba(15, 23, 42, 0.08);
        }
        .generation-loader.is-compact .generation-loader-chrome {
          gap: 6px;
          padding: 6px 8px;
        }
        .generation-loader.is-compact .generation-loader-dots span {
          width: 5px;
          height: 5px;
        }
        .generation-loader.is-compact .generation-loader-url {
          padding: 2px 6px;
          font-size: 8px;
        }
        .generation-loader.is-compact .generation-loader-live {
          font-size: 7px;
        }
        .generation-loader.is-compact .generation-loader-viewport {
          height: 76px;
        }
        .generation-loader.is-compact .generation-loader-code-pane {
          flex-basis: 34px;
          gap: 3px;
          padding: 6px 9px;
        }
        .generation-loader.is-compact .generation-loader-code-line {
          font-size: 8px;
        }
        .generation-loader.is-compact .generation-loader-code-cursor {
          width: 4px;
          height: 8px;
        }
        .generation-loader.is-compact .generation-loader-preview-group {
          gap: 5px;
          padding: 8px 9px;
        }
        .generation-loader.is-compact .gl-block-bar {
          height: 5px;
        }
        .generation-loader.is-compact .gl-block-bar.is-wide {
          height: 8px;
        }
        .generation-loader.is-compact .gl-block-pill {
          height: 11px;
          width: 48px;
        }
        .generation-loader.is-compact .gl-block-image {
          height: 24px;
          border-radius: 6px;
        }
        .generation-loader.is-compact .gl-cards-row {
          gap: 5px;
        }
        .generation-loader.is-compact .gl-block-card {
          height: 18px;
        }
        .generation-loader.is-compact .generation-loader-label {
          font-size: 13px;
          font-weight: 600;
        }
        .generation-loader-label-dots {
          display: inline-flex;
          gap: 2px;
          margin-left: 2px;
        }
        .generation-loader-label-dots span {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.3;
          animation: generation-loader-dot-pulse 1.4s ease-in-out infinite;
        }
        .generation-loader-label-dots span:nth-child(2) { animation-delay: 0.18s; }
        .generation-loader-label-dots span:nth-child(3) { animation-delay: 0.36s; }

        /* ---------- Keyframes ---------- */
        @keyframes generation-loader-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(10px, -10px) scale(1.08); }
        }
        @keyframes generation-loader-float {
          0%, 100% { transform: perspective(1000px) rotateX(2deg) translateY(0); }
          50% { transform: perspective(1000px) rotateX(2deg) translateY(-5px); }
        }
        @keyframes generation-loader-chip-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.75; }
          50% { transform: translateY(-9px) scale(1.06); opacity: 1; }
        }
        @keyframes generation-loader-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.42); }
          50% { box-shadow: 0 0 0 5px rgba(37, 99, 235, 0); }
        }
        @keyframes generation-loader-caret {
          0%, 45% { opacity: 1; }
          46%, 100% { opacity: 0.15; }
        }
        @keyframes generation-loader-type {
          0% { clip-path: inset(0 100% 0 0); }
          40%, 60% { clip-path: inset(0 0% 0 0); }
          100% { clip-path: inset(0 100% 0 0); }
        }
        @keyframes generation-loader-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes generation-loader-shimmer {
          0%, 15% { transform: translateX(-120%); }
          65%, 100% { transform: translateX(120%); }
        }
        @keyframes generation-loader-scan {
          0%, 18% { transform: translateX(-130%); }
          58%, 100% { transform: translateX(130%); }
        }
        @keyframes generation-loader-dot-pulse {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .generation-loader-glow,
          .generation-loader-chip,
          .generation-loader-browser,
          .generation-loader-url-caret,
          .generation-loader-code-line,
          .generation-loader-code-cursor,
          .generation-loader-preview-track,
          .gl-block::after,
          .generation-loader-sweep,
          .generation-loader-live-dot,
          .generation-loader-label-dots span {
            animation: none !important;
          }
          .generation-loader-code-line { clip-path: inset(0 0 0 0); }
        }
      `}</style>

      <div className="generation-loader-stage" aria-hidden="true">
        <div className="generation-loader-glow generation-loader-glow-blue" />
        <div className="generation-loader-glow generation-loader-glow-teal" />
        <div className="generation-loader-glow generation-loader-glow-violet" />

        <span className="generation-loader-chip generation-loader-chip-one" />
        <span className="generation-loader-chip generation-loader-chip-two" />
        <span className="generation-loader-chip generation-loader-chip-three" />

        <div className="generation-loader-browser">
          <div className="generation-loader-chrome">
            <div className="generation-loader-dots">
              <span />
              <span />
              <span />
            </div>
            <div className="generation-loader-url">
              <span className="generation-loader-lock" />
              <span className="generation-loader-url-text">
                squidagent.app/preview
                <span className="generation-loader-url-caret" />
              </span>
            </div>
            <span className="generation-loader-live">
              <span className="generation-loader-live-dot" />
              LIVE
            </span>
          </div>

          <div className="generation-loader-viewport">
            <div className="generation-loader-code-pane">
              <div className="generation-loader-code-line">
                <span className="tok-kw">const</span>
                <span className="tok-punc">&nbsp;app&nbsp;=&nbsp;</span>
                <span className="tok-fn">generate</span>
                <span className="tok-punc">(prompt)</span>
              </div>
              <div className="generation-loader-code-line generation-loader-code-line-two">
                <span className="tok-tag">&lt;Hero</span>
                <span className="tok-attr">&nbsp;title</span>
                <span className="tok-punc">=</span>
                <span className="tok-str">&quot;Build fast&quot;</span>
                <span className="tok-tag">&nbsp;/&gt;</span>
              </div>
              <div className="generation-loader-code-line generation-loader-code-line-three">
                <span className="tok-kw">export default</span>
                <span className="tok-punc">&nbsp;App</span>
                <span className="generation-loader-code-cursor" />
              </div>
            </div>

            <div className="generation-loader-preview-pane">
              <div className="generation-loader-preview-track">
                {renderPreviewGroup("a")}
                {renderPreviewGroup("b")}
              </div>
            </div>

            <div className="generation-loader-sweep" />
          </div>
        </div>
      </div>

      <p className="generation-loader-label">
        <span>{label}</span>
        <span className="generation-loader-label-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </p>
    </div>
  );
}
