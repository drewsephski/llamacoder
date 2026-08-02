"use client";

import {
  Check,
  Code2,
  Download,
  FileImage,
  Github,
  ListChecks,
  MousePointer2,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useState, type CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type WorkflowFallbackVariant = "create" | "plan" | "verify";

type WorkflowMediaCardProps = {
  alt: string;
  className?: string;
  description: string;
  fallback: WorkflowFallbackVariant;
  label: string;
  posterSrc: string;
  reduceMotion: boolean;
  title: string;
  titleId: string;
  videoSrc: string;
};

type MediaState = "loading" | "ready" | "error";

export function WorkflowMediaCard({
  alt,
  className,
  description,
  fallback,
  label,
  posterSrc,
  reduceMotion,
  title,
  titleId,
  videoSrc,
}: WorkflowMediaCardProps) {
  const [mediaState, setMediaState] = useState<MediaState>("loading");
  const handleVideoRef = useCallback((video: HTMLVideoElement | null) => {
    if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setMediaState("ready");
    }
  }, []);

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "workflow-media-card relative overflow-hidden rounded-[24px] border border-border/70 bg-background/80 shadow-[0_18px_48px_-34px_rgba(0,0,0,0.55)] backdrop-blur",
        className,
      )}
    >
      <div
        className="workflow-media-frame relative overflow-hidden"
        data-media-state={mediaState}
      >
        <WorkflowMediaFallback variant={fallback} />

        {reduceMotion ? (
          <Image
            src={posterSrc}
            alt={alt}
            width={1270}
            height={760}
            sizes="(min-width: 768px) 440px, calc(100vw - 2rem)"
            className="workflow-media-asset absolute inset-0 size-full object-cover"
            onLoad={() => setMediaState("ready")}
            onError={() => setMediaState("error")}
          />
        ) : (
          <video
            ref={handleVideoRef}
            className="workflow-media-asset absolute inset-0 size-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={posterSrc}
            aria-label={alt}
            disablePictureInPicture
            disableRemotePlayback
            tabIndex={-1}
            onCanPlay={() => setMediaState("ready")}
            onLoadedData={() => setMediaState("ready")}
            onPlaying={() => setMediaState("ready")}
            onTimeUpdate={() => {
              if (mediaState === "loading") setMediaState("ready");
            }}
            onError={() => setMediaState("error")}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}
      </div>
      <div className="border-t border-border/60 px-4 py-3.5 sm:px-5">
        <h3
          id={titleId}
          className="text-sm font-medium leading-5 text-foreground/90"
        >
          {title}
        </h3>
        <p className="sr-only">
          {label}. {description}
        </p>
      </div>
    </article>
  );
}

function WorkflowMediaFallback({
  variant,
}: {
  variant: WorkflowFallbackVariant;
}) {
  return (
    <div
      className="workflow-media-fallback absolute inset-0 overflow-hidden"
      data-fallback-variant={variant}
      aria-hidden="true"
    >
      <div className="workflow-skeleton-glow" />
      <div className="workflow-skeleton-topbar">
        <span />
        <span />
        <span />
        <div className="workflow-skeleton-progress">
          <i />
        </div>
      </div>

      {variant === "create" ? <CreateFallback /> : null}
      {variant === "plan" ? <PlanFallback /> : null}
      {variant === "verify" ? <VerifyFallback /> : null}
    </div>
  );
}

function CreateFallback() {
  return (
    <div className="workflow-skeleton-create">
      <section className="workflow-skeleton-pane workflow-skeleton-source">
        <div className="workflow-skeleton-kicker">
          <FileImage aria-hidden="true" />
          <span>Visual reference</span>
        </div>
        <div className="workflow-skeleton-lines">
          <i />
          <i />
        </div>
        <div className="workflow-skeleton-file">
          <span />
          <div>
            <i />
            <i />
          </div>
          <Check aria-hidden="true" />
        </div>
        <div className="workflow-skeleton-action">
          <Code2 aria-hidden="true" />
          <span />
        </div>
      </section>

      <section className="workflow-skeleton-pane workflow-skeleton-preview">
        <div className="workflow-skeleton-browser">
          <i />
          <i />
          <i />
        </div>
        <div className="workflow-skeleton-device">
          <div className="workflow-skeleton-device-copy">
            <i />
            <i />
            <i />
          </div>
          <span />
        </div>
        <div className="workflow-skeleton-scan" />
      </section>

      <MousePointer2
        className="workflow-skeleton-cursor workflow-skeleton-cursor-create"
        aria-hidden="true"
      />
    </div>
  );
}

function PlanFallback() {
  return (
    <div className="workflow-skeleton-plan">
      <div className="workflow-skeleton-prompt">
        <span>You</span>
        <i />
        <Check aria-hidden="true" />
      </div>

      <section className="workflow-skeleton-plan-card">
        <div className="workflow-skeleton-plan-title">
          <span>
            <ListChecks aria-hidden="true" />
          </span>
          <div>
            <i />
            <i />
          </div>
        </div>
        <div className="workflow-skeleton-plan-rows">
          {[0, 1, 2].map((index) => (
            <div key={index} style={{ "--row-index": index } as CSSProperties}>
              <b>0{index + 1}</b>
              <span>
                <i />
                <i />
              </span>
              <Check aria-hidden="true" />
            </div>
          ))}
        </div>
        <div className="workflow-skeleton-plan-actions">
          <i />
          <i />
        </div>
      </section>

      <MousePointer2
        className="workflow-skeleton-cursor workflow-skeleton-cursor-plan"
        aria-hidden="true"
      />
    </div>
  );
}

function VerifyFallback() {
  return (
    <div className="workflow-skeleton-verify">
      <div className="workflow-skeleton-app-ghost">
        <span />
        <span />
        <span />
      </div>

      <section className="workflow-skeleton-export-card">
        <div className="workflow-skeleton-export-title">
          <div>
            <i />
            <i />
          </div>
          <span>
            <ShieldCheck aria-hidden="true" />
            Verified
          </span>
        </div>
        <div className="workflow-skeleton-export-actions">
          <div>
            <span>
              <Download aria-hidden="true" />
            </span>
            <i />
          </div>
          <div>
            <span>
              <Github aria-hidden="true" />
            </span>
            <i />
          </div>
        </div>
        <div className="workflow-skeleton-verified-line">
          <Check aria-hidden="true" />
          <i />
        </div>
      </section>

      <MousePointer2
        className="workflow-skeleton-cursor workflow-skeleton-cursor-verify"
        aria-hidden="true"
      />
    </div>
  );
}
