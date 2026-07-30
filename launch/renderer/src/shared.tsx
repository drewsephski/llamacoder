/* eslint-disable @next/next/no-img-element -- standalone Vite renderer needs lossless local capture pixels */
import type { CSSProperties, ReactNode } from "react";

export const fileAsset = (relativePath: string) =>
  `/@fs/${__REPOSITORY_ROOT__}/${relativePath}`;

export function BrandFonts() {
  return (
    <style>{`
      @font-face {
        font-family: "Aeonik";
        src: url("${fileAsset("public/Aeonik/Aeonik-Regular.ttf")}") format("truetype");
        font-weight: 400;
        font-display: block;
      }
      @font-face {
        font-family: "Aeonik";
        src: url("${fileAsset("public/Aeonik/Aeonik-Medium.ttf")}") format("truetype");
        font-weight: 500;
        font-display: block;
      }
      @font-face {
        font-family: "Aeonik";
        src: url("${fileAsset("public/Aeonik/Aeonik-Bold.ttf")}") format("truetype");
        font-weight: 700;
        font-display: block;
      }
      @font-face {
        font-family: "Aeonik Mono";
        src: url("${fileAsset("public/Aeonik/AeonikMono-Regular.otf")}") format("opentype");
        font-weight: 400;
        font-display: block;
      }
    `}</style>
  );
}

export function SquidLogo({ className = "" }: { className?: string }) {
  return (
    <img
      className={className}
      src={fileAsset("public/squidagent-logo.svg")}
      alt="Squid Agent"
      draggable={false}
    />
  );
}

export function BrandLockup({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className={`brand-lockup ${inverse ? "is-inverse" : ""}`}>
      <SquidLogo className="brand-lockup-logo" />
      <span>Squid Agent</span>
    </div>
  );
}

export function AssetFrame({
  children,
  theme = "light",
  label,
  className = "",
}: {
  children: ReactNode;
  theme?: "light" | "dark";
  label: string;
  className?: string;
}) {
  return (
    <main
      className={`asset-frame asset-${theme} ${className}`}
      data-render-ready="true"
      aria-label={label}
    >
      <div className="asset-topline">
        <BrandLockup inverse={theme === "dark"} />
        <span className="asset-domain">squidagent.app</span>
      </div>
      {children}
    </main>
  );
}

export function BrowserImage({
  src,
  alt,
  objectPosition = "top center",
  className = "",
}: {
  src: string;
  alt: string;
  objectPosition?: string;
  className?: string;
}) {
  return (
    <figure className={`browser-image ${className}`}>
      <div className="browser-bar" aria-hidden="true">
        <span />
        <span />
        <span />
        <div className="browser-address">squidagent.app</div>
      </div>
      <div className="browser-viewport">
        <img src={src} alt={alt} style={{ objectPosition }} draggable={false} />
      </div>
    </figure>
  );
}

export function StageChip({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <span className={`stage-chip ${active ? "is-active" : ""}`}>{label}</span>
  );
}

export function StatusMark({
  status,
}: {
  status: "passed" | "review" | "untested";
}) {
  return (
    <span className={`status-mark status-${status}`} aria-hidden="true">
      {status === "passed" ? "✓" : status === "review" ? "!" : "-"}
    </span>
  );
}

export function ScreenshotLabel({ children }: { children: ReactNode }) {
  return <div className="screenshot-label">{children}</div>;
}

export function ProgressionIcon({
  kind,
  active = false,
  style,
}: {
  kind: "prompt" | "plan" | "app" | "verified" | "export";
  active?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`progression-icon progression-${kind} ${active ? "is-active" : ""}`}
      style={style}
      aria-hidden="true"
    >
      {kind === "prompt" && <span className="shape-prompt" />}
      {kind === "plan" && (
        <span className="shape-plan">
          <i />
          <i />
          <i />
        </span>
      )}
      {kind === "app" && (
        <span className="shape-app">
          <i />
        </span>
      )}
      {kind === "verified" && <span className="shape-verified">✓</span>}
      {kind === "export" && <span className="shape-export">↓</span>}
    </span>
  );
}
