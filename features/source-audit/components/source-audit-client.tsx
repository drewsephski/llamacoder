"use client";

import { useRef, useState } from "react";
import { usePlausible } from "next-plausible";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileArchive,
  Github,
  ScanSearch,
  XCircle,
} from "lucide-react";

import { CometSpinner } from "@/components/loading-ui/comet-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  sourceAuditReportSchema,
  type SourceAuditReport,
} from "@/features/source-audit/contracts";
import { cn } from "@/lib/utils";

export function SourceAuditClient() {
  const plausible = usePlausible();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<SourceAuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"zip" | "github" | null>(null);

  async function runZipAudit() {
    if (!file) {
      fileInputRef.current?.click();
      return;
    }
    const formData = new FormData();
    formData.set("archive", file);
    await runAudit("zip", formData);
  }

  async function runGitHubAudit() {
    if (!githubUrl.trim()) return;
    await runAudit("github", JSON.stringify({ githubUrl: githubUrl.trim() }));
  }

  async function runAudit(kind: "zip" | "github", body: FormData | string) {
    setLoading(kind);
    setError(null);
    setReport(null);
    plausible("Source Audit Started", { props: { kind } });
    try {
      const response = await fetch("/api/source-audit", {
        method: "POST",
        headers:
          typeof body === "string"
            ? { "Content-Type": "application/json" }
            : undefined,
        body,
      });
      const payload = (await response.json().catch(() => null)) as {
        report?: unknown;
        message?: string;
      } | null;
      if (!response.ok) {
        throw new Error(
          payload?.message ?? "Squid could not audit this project.",
        );
      }
      const parsed = sourceAuditReportSchema.safeParse(payload?.report);
      if (!parsed.success)
        throw new Error("Squid returned an invalid audit report.");
      setReport(parsed.data);
      plausible("Source Audit Completed", {
        props: { kind, status: parsed.data.overallStatus },
      });
    } catch (auditError) {
      const message =
        auditError instanceof Error
          ? auditError.message
          : "Squid could not audit this project.";
      setError(message);
      plausible("Source Audit Failed", { props: { kind } });
    } finally {
      setLoading(null);
    }
  }

  function downloadReport() {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "squid-source-audit.json";
    anchor.click();
    URL.revokeObjectURL(url);
    plausible("Source Audit Downloaded", {
      props: { status: report.overallStatus },
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
      <header className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-end">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-primary">
            Free Vibe Code Health Check
          </p>
          <h1 className="mt-5 max-w-4xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-7xl">
            Find out what your AI-built app is actually ready for.
          </h1>
        </div>
        <p className="max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
          Audit a public GitHub repository or exported ZIP from any app builder.
          Squid checks portability, project structure, environment setup, and
          obvious client-secret exposure without running the code.
        </p>
      </header>

      <section
        aria-label="Choose a source to audit"
        className="mt-12 grid border-y border-border lg:grid-cols-2"
      >
        <div className="py-8 lg:border-r lg:border-border lg:pr-10">
          <div className="flex items-center gap-3">
            <Github className="size-5" />
            <h2 className="text-lg font-semibold">Public GitHub repository</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Squid downloads the default branch from github.com. Private
            repositories are not supported by this public tool.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Input
              type="url"
              value={githubUrl}
              onChange={(event) => setGithubUrl(event.target.value)}
              placeholder="https://github.com/owner/repository"
              aria-label="Public GitHub repository URL"
              className="min-h-11 flex-1"
            />
            <Button
              type="button"
              onClick={runGitHubAudit}
              disabled={!githubUrl.trim() || loading !== null}
              className="min-h-11"
            >
              {loading === "github" ? (
                <CometSpinner className="size-4" aria-hidden="true" />
              ) : (
                <ScanSearch className="size-4" />
              )}
              Audit repository
            </Button>
          </div>
        </div>

        <div className="border-t border-border py-8 lg:border-t-0 lg:pl-10">
          <div className="flex items-center gap-3">
            <FileArchive className="size-5" />
            <h2 className="text-lg font-semibold">Exported ZIP</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Files stay in memory for this request and are not saved. Maximum
            compressed size: 4 MB.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,application/zip"
            className="sr-only"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setError(null);
            }}
          />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-11 min-w-0 flex-1 justify-start"
            >
              <FileArchive className="size-4 shrink-0" />
              <span className="truncate">{file?.name ?? "Choose a ZIP"}</span>
            </Button>
            <Button
              type="button"
              onClick={runZipAudit}
              disabled={!file || loading !== null}
              className="min-h-11"
            >
              {loading === "zip" ? (
                <CometSpinner className="size-4" aria-hidden="true" />
              ) : (
                <ScanSearch className="size-4" />
              )}
              Audit ZIP
            </Button>
          </div>
        </div>
      </section>

      {error ? (
        <div
          className="mt-8 flex gap-3 border-l-2 border-destructive bg-destructive/5 p-4 text-sm"
          role="alert"
        >
          <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold">Audit could not run</p>
            <p className="mt-1 text-muted-foreground">{error}</p>
          </div>
        </div>
      ) : null}

      {report ? (
        <AuditReport report={report} onDownload={downloadReport} />
      ) : (
        <ScopePreview />
      )}
    </div>
  );
}

function AuditReport({
  report,
  onDownload,
}: {
  report: SourceAuditReport;
  onDownload: () => void;
}) {
  const statusLabel =
    report.overallStatus === "passed"
      ? "Static checks passed"
      : report.overallStatus === "failed"
        ? "Blocking findings"
        : "Review needed";
  return (
    <section aria-labelledby="audit-result" className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-6">
        <div>
          <p className="font-mono text-xs text-muted-foreground">
            {report.source.label} · {report.framework}
          </p>
          <h2
            id="audit-result"
            className="mt-2 text-3xl font-semibold tracking-tight"
          >
            {statusLabel}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {report.inventory.filesInspected} files inspected ·{" "}
            {report.inventory.sourceFiles} source files
          </p>
        </div>
        <Button variant="outline" onClick={onDownload}>
          <Download className="size-4" />
          Download report
        </Button>
      </div>
      <div className="divide-y divide-border border-b border-border">
        {report.findings.map((finding) => {
          const Icon =
            finding.status === "passed"
              ? CheckCircle2
              : finding.status === "failed"
                ? XCircle
                : AlertTriangle;
          return (
            <article
              key={finding.id}
              className="grid gap-4 py-6 md:grid-cols-[220px_minmax(0,1fr)_minmax(220px,0.7fr)] md:gap-8"
            >
              <div className="flex items-start gap-3">
                <Icon
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    finding.status === "passed" && "text-emerald-600",
                    finding.status === "review" && "text-amber-600",
                    finding.status === "failed" && "text-destructive",
                  )}
                />
                <div>
                  <h3 className="font-semibold">{finding.label}</h3>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {finding.status}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-6">{finding.summary}</p>
              <ul className="grid gap-1 text-xs leading-5 text-muted-foreground">
                {finding.details.map((detail) => (
                  <li key={detail}>• {detail}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
      <div className="mt-8 grid gap-3 text-sm leading-6 text-muted-foreground">
        {report.scope.map((item) => (
          <p key={item}>— {item}</p>
        ))}
      </div>
    </section>
  );
}

function ScopePreview() {
  return (
    <section className="mt-16 grid gap-8 md:grid-cols-[0.7fr_1fr] md:items-start">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          What this proves
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
          Evidence before migration
        </h2>
      </div>
      <div className="divide-y divide-border border-y border-border">
        {[
          ["Structure", "Manifest, entry point, source inventory"],
          ["Reproducibility", "Build command and dependency lockfile"],
          ["Secrets", "Obvious client-side credential assignments"],
          ["Portability", "Recognized app-builder runtime coupling"],
          ["Environment", "Runtime values and handoff documentation"],
        ].map(([label, detail]) => (
          <div key={label} className="flex gap-6 py-4 text-sm">
            <span className="w-32 shrink-0 font-medium">{label}</span>
            <span className="text-muted-foreground">{detail}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
