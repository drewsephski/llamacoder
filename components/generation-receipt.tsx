"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Coins,
  FileDiff,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { usePlausible } from "next-plausible";

import type { ProjectMessage } from "@/features/projects/contracts";
import { getMessageGeneratedFiles } from "@/features/generation/message-files";
import { buildGeneratedFilesQualityReport } from "@/lib/generated-files";
import { cn } from "@/lib/utils";

export function GenerationReceipt({
  message,
  previousMessage,
}: {
  message: ProjectMessage;
  previousMessage?: ProjectMessage;
}) {
  const [open, setOpen] = useState(false);
  const plausible = usePlausible();
  const receipt = message.generationReceipt;
  const files = useMemo(() => getMessageGeneratedFiles(message), [message]);
  const previousFiles = useMemo(
    () => (previousMessage ? getMessageGeneratedFiles(previousMessage) : []),
    [previousMessage],
  );
  const details = useMemo(() => {
    const previous = new Map(
      previousFiles.map((file) => [file.path, file.code]),
    );
    const current = new Map(files.map((file) => [file.path, file.code]));
    return {
      added: files.filter((file) => !previous.has(file.path)).length,
      modified: files.filter(
        (file) =>
          previous.has(file.path) && previous.get(file.path) !== file.code,
      ).length,
      removed: previousFiles.filter((file) => !current.has(file.path)).length,
      report: buildGeneratedFilesQualityReport(files),
    };
  }, [files, previousFiles]);

  if (!receipt || files.length === 0) return null;
  const warningCount =
    details.report.diagnostics.length +
    details.report.accessibilityWarnings.length;
  const isRepair =
    receipt.phase === "preview_repair" || receipt.status === "free_repair";

  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-border/60 bg-card/50">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        onClick={() => {
          setOpen((value) => !value);
          if (!open) {
            plausible("Generation Receipt Expanded", {
              props: { chargedCredits: receipt.actualCredits, isRepair },
            });
          }
        }}
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Coins className="size-3.5 shrink-0" />
          <span className="font-medium text-foreground">
            {receipt.actualCredits === 0
              ? "No credits charged"
              : `${receipt.actualCredits} credit${receipt.actualCredits === 1 ? "" : "s"} charged`}
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">
            {details.added} added · {details.modified} changed ·{" "}
            {details.removed} removed
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="grid gap-3 border-t border-border/60 px-3 py-3 text-xs sm:grid-cols-2">
          <div className="flex gap-2">
            <Coins className="mt-0.5 size-3.5 text-amber-500" />
            <div>
              <p className="font-medium text-foreground">Credits</p>
              <p className="mt-1 text-muted-foreground">
                Estimated {receipt.estimatedCredits ?? "—"} · charged{" "}
                {receipt.actualCredits} · refunded {receipt.refundedCredits}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <FileDiff className="mt-0.5 size-3.5 text-blue-500" />
            <div>
              <p className="font-medium text-foreground">Files changed</p>
              <p className="mt-1 text-muted-foreground">
                {details.added} added · {details.modified} modified ·{" "}
                {details.removed} removed
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <ShieldCheck className="mt-0.5 size-3.5 text-emerald-500" />
            <div>
              <p className="font-medium text-foreground">Static checks</p>
              <p className="mt-1 text-muted-foreground">
                Files, imports, protected paths, and baseline accessibility ·{" "}
                {warningCount} warning{warningCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Wrench className="mt-0.5 size-3.5 text-violet-500" />
            <div>
              <p className="font-medium text-foreground">Automatic repair</p>
              <p className="mt-1 text-muted-foreground">
                {isRepair
                  ? "Applied at no charge"
                  : "Not recorded for this version"}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/usage"
            className="font-medium text-primary underline-offset-4 hover:underline sm:col-span-2"
          >
            View full usage ledger
          </Link>
        </div>
      )}
    </div>
  );
}
