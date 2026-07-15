"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { type ComponentType, type ReactNode, useMemo, useState } from "react";
import JSZip from "jszip";
import {
  ArrowRight,
  Check,
  CloudSun,
  Code2,
  Download,
  Eye,
  Files,
  FileText,
  Landmark,
  ListChecks,
  LockKeyhole,
  MonitorPlay,
  Radio,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  File as TreeFile,
  Folder as TreeFolder,
  Tree,
  type TreeViewElement,
} from "@/components/ui/file-tree";
import {
  EXAMPLE_PROJECT_FILES,
  EXAMPLE_PROJECT_PLAN,
  EXAMPLE_PROJECT_PROMPT,
} from "@/features/showcase/example-project";
import { buildExportBundle, getExportFilename } from "@/lib/export-bundle";

const CodeRunner = dynamic(() => import("@/components/code-runner"), {
  ssr: false,
});

const tabs = [
  { id: "Prompt", description: "Original request", icon: FileText },
  { id: "Plan", description: "Approved decisions", icon: ListChecks },
  { id: "Preview", description: "Interactive app", icon: MonitorPlay },
  { id: "Files", description: "Portable source", icon: Files },
  { id: "Quality", description: "Verification report", icon: ShieldCheck },
] as const;
type Tab = (typeof tabs)[number]["id"];

export function ExampleWorkspace() {
  const [tab, setTab] = useState<Tab>("Preview");
  const [selectedFile, setSelectedFile] = useState("App.tsx");
  const bundle = useMemo(() => buildExportBundle(EXAMPLE_PROJECT_FILES), []);
  const treeElements = useMemo(
    () => buildFileTree(EXAMPLE_PROJECT_FILES.map((file) => file.path)),
    [],
  );
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
    <main className="min-h-screen overflow-x-clip bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2.5 whitespace-nowrap text-sm font-medium tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Image
              src="/squidagent-logo.svg"
              alt="Squid Agent"
              width={28}
              height={28}
              className="size-7"
              priority
            />
            <span className="hidden sm:inline">Squid Agent</span>
            <span className="hidden text-muted-foreground sm:inline">
              / public example
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={download}
              aria-label="Download source"
              className="min-h-11 min-w-11 whitespace-nowrap px-0 sm:px-4"
            >
              <Download className="size-4" />
              <span className="hidden sm:inline">Download source</span>
            </Button>
            <Button asChild className="min-h-11 whitespace-nowrap">
              <Link href="/?starter=kanban-board">
                <span className="hidden sm:inline">Remix in Squid</span>
                <span className="sm:hidden">Remix</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-10 pt-12 sm:px-6 sm:pb-12 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-end">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 font-mono text-xs font-medium text-primary">
            <span
              className="size-2 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            PUBLIC BUILD · NO ACCOUNT REQUIRED
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[0.96] tracking-[-0.055em] [overflow-wrap:anywhere] sm:text-5xl lg:text-7xl">
            A generated app you can interrogate.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Use the board. Start the timer. Refresh two public APIs. Then
            inspect the original prompt, approved plan, portable source, and
            recorded quality checks behind Waypoint.
          </p>
        </div>

        <div className="grid grid-cols-2 border-y border-border/70">
          <ProofItem icon={Eye} label="App runtime" value="Interactive" />
          <ProofItem icon={Code2} label="Source export" value="Portable" />
          <ProofItem icon={Radio} label="API contracts" value="2 public" />
          <ProofItem
            icon={Check}
            label="Recorded quality"
            value={`${bundle.files.length} files`}
          />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid border-y border-border/70 text-sm sm:grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
          <div className="flex min-h-14 items-center gap-3 border-b border-border/70 py-3 sm:border-b-0 sm:border-r sm:px-4">
            <CloudSun className="size-4 shrink-0 text-primary" />
            <span className="whitespace-nowrap font-medium">Open-Meteo</span>
          </div>
          <p className="border-b border-border/70 py-3 text-muted-foreground sm:border-b-0 sm:px-4">
            Live Chicago forecast with explicit sample fallback.
          </p>
          <div className="flex min-h-14 items-center gap-3 border-b border-border/70 py-3 sm:border-b-0 sm:border-l sm:border-r sm:px-4">
            <Landmark className="size-4 shrink-0 text-primary" />
            <span className="whitespace-nowrap font-medium">
              Frankfurter v2
            </span>
          </div>
          <p className="py-3 text-muted-foreground sm:px-4">
            Reference USD rates with timeout and retry handling.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14">
        <div className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)]">
          <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
            <p className="mb-3 text-sm font-medium text-foreground">
              Inspect the build
            </p>
            <nav
              aria-label="Example workspace sections"
              className="grid grid-cols-2 border-t border-border/70 sm:grid-cols-5 lg:flex lg:flex-col"
            >
              {tabs.map((item) => {
                const Icon = item.icon;
                const active = tab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setTab(item.id)}
                    className={`group flex min-h-14 min-w-0 items-center gap-3 border-b border-border/70 px-2 text-left transition-[background-color,border-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary lg:min-h-16 lg:border-l-2 lg:px-3 ${
                      active
                        ? "border-l-primary bg-primary/[0.05] text-foreground"
                        : "border-l-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <Icon
                      className={`size-4 shrink-0 ${active ? "text-primary" : ""}`}
                    />
                    <span className="min-w-0">
                      <span className="block whitespace-nowrap text-sm font-medium">
                        {item.id}
                      </span>
                      <span className="mt-0.5 hidden text-xs text-muted-foreground lg:block">
                        {item.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>

            <Link
              href="/?starter=kanban-board"
              className="mt-5 hidden min-h-11 items-center gap-2 whitespace-nowrap text-sm font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary lg:inline-flex"
            >
              Build from this example
              <ArrowRight className="size-4" />
            </Link>
          </aside>

          <section
            aria-label={`${tab} view`}
            className="min-h-[640px] min-w-0 overflow-hidden border-y border-border/70 bg-card shadow-[0_1px_2px_hsl(var(--foreground)/0.04)]"
          >
            {tab === "Prompt" && (
              <div className="mx-auto max-w-4xl px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
                <div className="flex items-center gap-3 text-primary">
                  <span className="grid size-10 place-items-center rounded-lg bg-primary/10">
                    <FileText className="size-5" />
                  </span>
                  <p className="text-sm font-medium">Original request</p>
                </div>
                <h2 className="mt-8 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">
                  The brief behind Waypoint
                </h2>
                <blockquote className="mt-8 border-l-2 border-primary pl-5 text-xl leading-8 text-foreground/90 sm:pl-7 sm:text-2xl sm:leading-9">
                  {EXAMPLE_PROJECT_PROMPT}
                </blockquote>
                <p className="mt-8 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Squid turned this request into an approved plan before
                  generating the project. Open the Plan view to inspect those
                  decisions.
                </p>
              </div>
            )}

            {tab === "Plan" && (
              <div className="mx-auto max-w-4xl px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
                <div className="flex items-center gap-3 text-primary">
                  <span className="grid size-10 place-items-center rounded-lg bg-primary/10">
                    <ListChecks className="size-5" />
                  </span>
                  <p className="text-sm font-medium">
                    Approved before generation
                  </p>
                </div>
                <h2 className="mt-8 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                  Approved build plan
                </h2>
                <ol className="mt-10 border-t border-border/70">
                  {EXAMPLE_PROJECT_PLAN.map((step, index) => (
                    <li
                      key={step}
                      className="grid gap-3 border-b border-border/70 py-5 sm:grid-cols-[3rem_minmax(0,1fr)] sm:items-start sm:gap-5"
                    >
                      <span className="font-mono text-sm font-medium tabular-nums text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-base leading-7 text-foreground/80">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {tab === "Preview" && (
              <div className="min-w-0">
                <div className="grid gap-4 border-b border-border/70 bg-muted/30 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5">
                  <div>
                    <h2 className="text-sm font-semibold">
                      Interactive preview
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Drag a task, start the focus timer, or refresh the live
                      data.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                    <span className="inline-flex items-center gap-2 whitespace-nowrap font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      Running locally
                    </span>
                    <span className="whitespace-nowrap text-muted-foreground">
                      Open-Meteo · Frankfurter
                    </span>
                  </div>
                </div>
                <div className="h-[72svh] max-h-[820px] min-h-[620px] bg-slate-100">
                  <CodeRunner
                    files={EXAMPLE_PROJECT_FILES.map((file) => ({
                      path: file.path,
                      content: file.code,
                    }))}
                  />
                </div>
              </div>
            )}

            {tab === "Files" && (
              <div className="grid min-h-[680px] min-w-0 lg:grid-cols-[18rem_minmax(0,1fr)]">
                <aside className="min-w-0 bg-muted/30">
                  <div className="flex min-h-14 items-center justify-between gap-3 bg-muted/40 px-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">Project source</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {EXAMPLE_PROJECT_FILES.length} generated files
                      </p>
                    </div>
                    <span className="inline-flex min-h-8 items-center gap-1.5 whitespace-nowrap rounded-md bg-primary px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary-foreground shadow-sm">
                      <LockKeyhole className="size-3" aria-hidden="true" />
                      Read-only
                    </span>
                  </div>
                  <nav
                    aria-label="Generated files"
                    className="h-52 py-3 lg:h-[624px]"
                  >
                    <Tree
                      elements={treeElements}
                      initialSelectedId={selectedFile}
                      initialExpandedItems={["components", "data", "lib"]}
                      className="h-full"
                    >
                      {treeElements.map((element) =>
                        renderFileTreeNode(
                          element,
                          selected.path,
                          setSelectedFile,
                        ),
                      )}
                    </Tree>
                  </nav>
                </aside>

                <section
                  aria-label={`${selected.path} source`}
                  className="min-w-0 bg-slate-950 text-slate-200"
                >
                  <div className="flex min-h-14 items-center justify-between gap-4 bg-slate-900/80 px-4 sm:px-5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Code2 className="size-4 shrink-0 text-blue-400" />
                      <span className="truncate font-mono text-xs text-slate-200 sm:text-sm">
                        {selected.path}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-[10px] uppercase tracking-wider text-slate-500">
                      <span>{selected.language}</span>
                      <span className="hidden sm:inline">
                        {selected.code.split("\n").length} lines
                      </span>
                    </div>
                  </div>
                  <pre className="max-h-[720px] min-h-[520px] overflow-auto py-4 text-xs leading-6 sm:py-5 sm:text-[13px]">
                    <code className="block min-w-max">
                      {selected.code.split("\n").map((line, index) => (
                        <span
                          key={`${selected.path}-${index}`}
                          className="grid grid-cols-[3.25rem_minmax(0,1fr)] px-4 hover:bg-slate-900/70 sm:grid-cols-[4rem_minmax(0,1fr)] sm:px-5"
                        >
                          <span
                            aria-hidden="true"
                            className="select-none pr-3 text-right font-mono text-slate-600"
                          >
                            {index + 1}
                          </span>
                          <span className="pl-4 font-mono text-slate-300">
                            {line || " "}
                          </span>
                        </span>
                      ))}
                    </code>
                  </pre>
                </section>
              </div>
            )}

            {tab === "Quality" && (
              <div className="grid min-h-[680px] lg:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)]">
                <div className="flex flex-col justify-between border-b border-border/70 px-5 py-10 sm:px-10 sm:py-14 lg:border-b-0 lg:border-r lg:px-12">
                  <div>
                    <span className="grid size-12 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="size-6" />
                    </span>
                    <h2 className="mt-8 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                      Quality report
                    </h2>
                    <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
                      The export records what was checked, what remains
                      advisory, and how the connected public APIs are expected
                      to behave.
                    </p>
                  </div>

                  <div className="mt-10 border-l-2 border-emerald-500 pl-5">
                    <p className="font-semibold text-foreground">
                      Static checks passed
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      The download includes provider notes, resilient fallbacks,
                      source, package scripts, a README, the quality report, and
                      deployment configuration.
                    </p>
                  </div>
                </div>

                <div className="px-5 py-8 sm:px-8 sm:py-10">
                  <h3 className="text-sm font-semibold">Recorded results</h3>
                  <div className="mt-5 border-t border-border/70">
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

                  <Button
                    variant="outline"
                    onClick={download}
                    className="mt-8 min-h-11 w-full whitespace-nowrap"
                  >
                    <Download className="size-4" /> Download verified source
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>

        <Link
          href="/?starter=kanban-board"
          className="mt-6 inline-flex min-h-11 items-center gap-2 whitespace-nowrap text-sm font-medium text-primary underline decoration-primary/30 underline-offset-4 lg:hidden"
        >
          Build from this example
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Waypoint is a public Squid Agent build—not a product mockup.</p>
          <p className="flex flex-wrap gap-x-3 gap-y-2">
            <span>Open-Meteo</span>
            <span aria-hidden="true">·</span>
            <span>Frankfurter v2</span>
            <span aria-hidden="true">·</span>
            <Link
              className="whitespace-nowrap text-foreground underline decoration-border underline-offset-4 hover:decoration-primary"
              href="/?starter=kanban-board"
            >
              Remix this build
            </Link>
          </p>
        </div>
      </footer>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-h-20 items-center justify-between gap-5 border-b border-border/70 py-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function ProofItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 border-b border-border/70 px-3 py-4 even:border-l [&:nth-child(n+3)]:border-b-0">
      <Icon className="size-4 text-primary" />
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 whitespace-nowrap text-sm font-medium text-foreground">
        {value}
      </p>
    </div>
  );
}

function buildFileTree(paths: string[]): TreeViewElement[] {
  const roots: TreeViewElement[] = [];

  for (const path of paths) {
    const segments = path.split("/");
    let level = roots;
    let currentPath = "";

    segments.forEach((segment, index) => {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      const isFile = index === segments.length - 1;
      let node = level.find((item) => item.id === currentPath);

      if (!node) {
        node = {
          id: currentPath,
          name: segment,
          type: isFile ? "file" : "folder",
          children: isFile ? undefined : [],
        };
        level.push(node);
      }

      if (!isFile) level = node.children ?? [];
    });
  }

  return roots;
}

function renderFileTreeNode(
  element: TreeViewElement,
  selectedPath: string,
  onSelect: (path: string) => void,
): ReactNode {
  if (element.type === "folder" || element.children) {
    return (
      <TreeFolder
        key={element.id}
        value={element.id}
        element={element.name}
        isSelect={selectedPath.startsWith(`${element.id}/`)}
        className="min-h-9 px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {element.children?.map((child) =>
          renderFileTreeNode(child, selectedPath, onSelect),
        )}
      </TreeFolder>
    );
  }

  return (
    <TreeFile
      key={element.id}
      value={element.id}
      isSelect={selectedPath === element.id}
      handleSelect={onSelect}
      className="min-h-9 w-full min-w-0 px-2 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span aria-hidden="true" className="truncate">
        {element.name}
      </span>
      <span className="sr-only">{element.id}</span>
    </TreeFile>
  );
}
