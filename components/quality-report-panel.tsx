"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { usePlausible } from "next-plausible";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GeneratedFilesQualityReport } from "@/lib/generated-files";
import type { RuntimeVerificationReport } from "@/features/generation/runtime-verification";

type ExportStatus = "verified" | "warning" | "failed" | null;

export function QualityReportPanel({
  report,
  exportStatus,
  runtimeVerification,
}: {
  report: GeneratedFilesQualityReport;
  exportStatus: ExportStatus;
  runtimeVerification?: RuntimeVerificationReport | null;
}) {
  const [open, setOpen] = useState(false);
  const plausible = usePlausible();
  const warningCount =
    report.diagnostics.length + report.accessibilityWarnings.length;
  const warningsByFile = useMemo(() => {
    const grouped = new Map<string, string[]>();
    for (const warning of [
      ...report.diagnostics,
      ...report.accessibilityWarnings,
    ]) {
      const path = warning.path || "Project";
      grouped.set(path, [...(grouped.get(path) ?? []), warning.message]);
    }
    return Array.from(grouped.entries());
  }, [report.accessibilityWarnings, report.diagnostics]);
  const apiStatus = report.apiIntegration.status;
  const apiStatusLabel =
    apiStatus === "verified"
      ? "API integration verified"
      : apiStatus === "setup_required"
        ? "API setup required"
        : apiStatus === "blocked"
          ? "API integration blocked"
          : "No API integration detected";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          plausible("Quality Report Opened", {
            props: { status: report.status, warningCount },
          });
        }
      }}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={`inline-flex h-8 gap-1.5 px-2.5 text-xs ${
          report.status === "passed"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300"
            : "border-amber-500/30 bg-amber-500/10 text-amber-800 hover:bg-amber-500/15 dark:text-amber-300"
        }`}
        aria-label={`Open quality report: ${report.status}`}
      >
        {report.status === "passed" ? (
          <CheckCircle2 className="size-3.5" />
        ) : (
          <AlertTriangle className="size-3.5" />
        )}
        <span className="hidden sm:inline">
          Quality {report.status === "passed" ? "passed" : "review"}
        </span>
      </Button>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            Static quality report
          </DialogTitle>
          <DialogDescription>
            Squid inspected the generated source. These checks do not replace
            running the app in its real production environment.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <section aria-labelledby="quality-passed">
            <h3 id="quality-passed" className="text-sm font-semibold">
              What passed
            </h3>
            <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["Generated files", report.filesGenerated],
                ["Source files", report.sourceFiles],
                ["Resolved imports", report.importsResolved],
                ["Protected paths", report.protectedPathsBlocked],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-border/70 bg-muted/30 p-3"
                >
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 text-lg font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="quality-review">
            <h3 id="quality-review" className="text-sm font-semibold">
              What needs review
            </h3>
            {warningsByFile.length === 0 ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="size-4" /> No static diagnostics or
                baseline accessibility warnings were found.
              </p>
            ) : (
              <div className="mt-3 grid gap-2">
                {warningsByFile.map(([path, warnings]) => (
                  <div
                    key={path}
                    className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3"
                  >
                    <p className="font-mono text-xs font-semibold">{path}</p>
                    <ul className="mt-2 grid gap-1 text-sm text-muted-foreground">
                      {warnings.map((warning, index) => (
                        <li key={`${warning}-${index}`}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section
            aria-labelledby="quality-api"
            className={`rounded-lg border p-3 ${
              apiStatus === "verified"
                ? "border-emerald-500/25 bg-emerald-500/5"
                : apiStatus === "setup_required"
                  ? "border-amber-500/25 bg-amber-500/5"
                  : apiStatus === "blocked"
                    ? "border-destructive/25 bg-destructive/5"
                    : "border-border/70 bg-muted/30"
            }`}
          >
            <h3
              id="quality-api"
              className="flex items-center gap-2 text-sm font-semibold"
            >
              {apiStatus === "verified" ? (
                <CheckCircle2 className="size-4 text-emerald-600" />
              ) : apiStatus === "blocked" ? (
                <AlertTriangle className="size-4 text-destructive" />
              ) : (
                <ShieldCheck className="size-4 text-muted-foreground" />
              )}
              {apiStatusLabel}
            </h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {report.apiIntegration.requestsDetected} request
              {report.apiIntegration.requestsDetected === 1 ? "" : "s"} detected
              {report.apiIntegration.environmentVariables.length
                ? `; ${report.apiIntegration.environmentVariables.length} publishable environment value${report.apiIntegration.environmentVariables.length === 1 ? "" : "s"} must be configured.`
                : "."}
            </p>
            {report.apiIntegration.providers.length > 0 && (
              <div className="mt-3 grid gap-2">
                {report.apiIntegration.providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="rounded-md border border-border/70 bg-background/70 px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold">{provider.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {provider.policyStatus} · {provider.runtime}
                      </span>
                    </div>
                    <a
                      href={provider.docsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block truncate text-xs text-primary underline-offset-4 hover:underline"
                    >
                      Official documentation
                    </a>
                  </div>
                ))}
              </div>
            )}
            {report.apiIntegration.policyWarnings.length > 0 && (
              <ul className="mt-3 grid gap-1 text-xs leading-5 text-muted-foreground">
                {report.apiIntegration.policyWarnings.map((warning) => (
                  <li key={warning}>• {warning}</li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="quality-not-tested">
            <h3 id="quality-not-tested" className="text-sm font-semibold">
              What Squid did not test
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Live endpoint availability, provider-side CORS, authentication,
              real persistence, cross-browser behavior, and production
              deployment still require environment-specific verification.
            </p>
          </section>

          <section
            className="rounded-lg border border-border/70 p-3"
            aria-label="Runtime verification"
          >
            <h3 className="text-sm font-semibold">Runtime verification</h3>
            {runtimeVerification ? (
              <div className="mt-2 grid gap-1 text-sm text-muted-foreground">
                <p>
                  Status:{" "}
                  <span className="font-medium text-foreground">
                    {runtimeVerification.status}
                  </span>{" "}
                  at {runtimeVerification.viewport.width}×
                  {runtimeVerification.viewport.height}
                </p>
                <p>
                  {runtimeVerification.clickableElements} interactive controls ·{" "}
                  {runtimeVerification.unnamedClickableElements} without an
                  accessible name
                </p>
                <p>
                  {runtimeVerification.horizontalOverflow
                    ? "Horizontal overflow detected"
                    : "No horizontal overflow detected"}
                  {runtimeVerification.runtimeError
                    ? ` · ${runtimeVerification.runtimeError}`
                    : " · no preview runtime error"}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Not run for this version. Open the preview and choose Test.
              </p>
            )}
          </section>

          <section
            className="rounded-lg border border-border/70 p-3"
            aria-label="Export verification"
          >
            <p className="text-sm font-medium">
              Export verification: {exportStatus ?? "not run"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Export verification runs when you download the source bundle.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
