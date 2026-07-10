"use client";

import { DownloadIcon, ExternalLink, Loader2 } from "lucide-react";
import { SiNetlify } from "react-icons/si";

import { Vercel } from "@/logos/vercel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ProjectExportDialogProps = {
  appTitle: string;
  disabled: boolean;
  isOpen: boolean;
  isVerifying: boolean;
  onDownload: () => void;
  onOpenChange: (open: boolean) => void;
  onOpenProvider: (provider: "vercel" | "netlify") => void;
};

export function ProjectExportDialog({
  appTitle,
  disabled,
  isOpen,
  isVerifying,
  onDownload,
  onOpenChange,
  onOpenProvider,
}: ProjectExportDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Export {appTitle}</DialogTitle>
          <DialogDescription>
            Download a verified source bundle or open a deploy provider. The
            export includes Vite, Tailwind, Vercel, Netlify, and Workers config
            files.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <ProviderButton
            description="Opens Vercel import. Use the downloaded repo; it includes `vercel.json` for SPA routing."
            disabled={disabled || isVerifying}
            icon={
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                <Vercel className="size-4" aria-hidden="true" />
              </span>
            }
            label="Deploy to Vercel"
            onClick={() => onOpenProvider("vercel")}
            tone="vercel"
          />
          <ProviderButton
            description="Opens Netlify import. Use the downloaded repo; it includes `netlify.toml` with the build and redirect settings."
            disabled={disabled || isVerifying}
            icon={
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                <SiNetlify className="size-4" aria-hidden="true" />
              </span>
            }
            label="Deploy to Netlify"
            onClick={() => onOpenProvider("netlify")}
            tone="netlify"
          />
          <button
            type="button"
            onClick={onDownload}
            disabled={disabled || isVerifying}
            className="group flex w-full items-start gap-3 rounded-lg border border-border bg-background p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              {isVerifying ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <DownloadIcon className="size-4" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-sm font-semibold text-foreground">
                {isVerifying ? "Verifying export" : "Download ZIP"}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                Saves the complete source bundle with package scripts, quality
                report, and deploy config files.
              </span>
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProviderButton({
  description,
  disabled,
  icon,
  label,
  onClick,
  tone,
}: {
  description: string;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  tone: "vercel" | "netlify";
}) {
  const hoverClass =
    tone === "vercel"
      ? "hover:border-blue-500/50 hover:bg-blue-500/5"
      : "hover:border-emerald-500/50 hover:bg-emerald-500/5";
  const iconClass =
    tone === "vercel"
      ? "group-hover:text-blue-500"
      : "group-hover:text-emerald-500";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group flex w-full items-start gap-3 rounded-lg border border-border bg-background p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${hoverClass}`}
    >
      {icon}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {label}
          <ExternalLink
            className={`size-3.5 text-muted-foreground transition-colors ${iconClass}`}
          />
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  );
}
