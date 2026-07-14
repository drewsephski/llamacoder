"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import JSZip from "jszip";
import {
  Check,
  Code2,
  Download,
  Eye,
  FileText,
  Radio,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  EXAMPLE_PROJECT_FILES,
  EXAMPLE_PROJECT_PLAN,
  EXAMPLE_PROJECT_PROMPT,
} from "@/features/showcase/example-project";
import { buildExportBundle, getExportFilename } from "@/lib/export-bundle";

const CodeRunner = dynamic(() => import("@/components/code-runner"), {
  ssr: false,
});

const tabs = ["Prompt", "Plan", "Preview", "Files", "Quality"] as const;
type Tab = (typeof tabs)[number];

export function ExampleWorkspace() {
  const [tab, setTab] = useState<Tab>("Preview");
  const [selectedFile, setSelectedFile] = useState("App.tsx");
  const bundle = useMemo(() => buildExportBundle(EXAMPLE_PROJECT_FILES), []);
  const selected =
    EXAMPLE_PROJECT_FILES.find((file) => file.path === selectedFile) ??
    EXAMPLE_PROJECT_FILES[0];
  const warningCount =
    bundle.qualityReport.diagnostics.length +
    bundle.qualityReport.accessibilityWarnings.length;
  const apiPolicyNotes =
    bundle.qualityReport.apiIntegration.policyWarnings.length;

  const download = async () => {
    const zip = new JSZip();
    for (const file of bundle.files) zip.file(file.path, file.content);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = getExportFilename("Waypoint");
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-background/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-medium text-primary">
              Squid Agent
            </Link>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Waypoint · public example
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Interactive board, live public APIs, and portable source. No
              account or credits required.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={download}>
              <Download className="size-4" /> Download source
            </Button>
            <Button asChild>
              <Link href="/?starter=kanban-board">Remix in Squid</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <Button
              key={item}
              variant={tab === item ? "default" : "outline"}
              size="sm"
              onClick={() => setTab(item)}
            >
              {item}
            </Button>
          ))}
        </div>

        <section className="min-h-[760px] overflow-hidden rounded-2xl border bg-card shadow-sm">
          {tab === "Prompt" && (
            <div className="mx-auto max-w-3xl p-8 sm:p-12">
              <FileText className="size-6 text-primary" />
              <h2 className="mt-5 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Original prompt
              </h2>
              <p className="mt-4 text-2xl leading-relaxed">
                {EXAMPLE_PROJECT_PROMPT}
              </p>
            </div>
          )}

          {tab === "Plan" && (
            <div className="mx-auto max-w-3xl p-8 sm:p-12">
              <h2 className="text-2xl font-semibold">Approved build plan</h2>
              <ol className="mt-8 space-y-5">
                {EXAMPLE_PROJECT_PLAN.map((step, index) => (
                  <li key={step} className="flex gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {index + 1}
                    </span>
                    <p className="pt-1 text-muted-foreground">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {tab === "Preview" && (
            <div className="h-[760px] bg-[#eef2f7]">
              <CodeRunner
                files={EXAMPLE_PROJECT_FILES.map((file) => ({
                  path: file.path,
                  content: file.code,
                }))}
              />
            </div>
          )}

          {tab === "Files" && (
            <div className="grid min-h-[620px] md:grid-cols-[260px_1fr]">
              <nav className="border-b p-3 md:border-b-0 md:border-r">
                {EXAMPLE_PROJECT_FILES.map((file) => (
                  <button
                    type="button"
                    key={file.path}
                    onClick={() => setSelectedFile(file.path)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${selected.path === file.path ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    <Code2 className="size-4" /> {file.path}
                  </button>
                ))}
              </nav>
              <pre className="overflow-auto bg-slate-950 p-6 text-sm leading-6 text-slate-200">
                <code>{selected.code}</code>
              </pre>
            </div>
          )}

          {tab === "Quality" && (
            <div className="mx-auto max-w-3xl p-8 sm:p-12">
              <ShieldCheck className="size-8 text-emerald-500" />
              <h2 className="mt-5 text-2xl font-semibold">Quality report</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Metric
                  label="Files generated"
                  value={bundle.qualityReport.filesGenerated}
                />
                <Metric
                  label="Imports resolved"
                  value={bundle.qualityReport.importsResolved}
                />
                <Metric label="Warnings" value={warningCount} />
                <Metric label="API policy notes" value={apiPolicyNotes} />
              </div>
              <div className="mt-8 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
                <Check className="mt-0.5 size-4 text-emerald-500" />
                <p>
                  Static checks passed. The download includes provider notes,
                  resilient API fallbacks, source, package scripts, a README,
                  quality report, and deployment configuration.
                </p>
              </div>
            </div>
          )}
        </section>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="size-3.5" /> Public read-only workspace
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="size-3.5 text-emerald-500" /> Static checks passed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Radio className="size-3.5 text-blue-500" /> Open-Meteo +
            Frankfurter APIs
          </span>
          <span>{bundle.files.length} portable export files</span>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
