import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  FileCheck2,
  XCircle,
} from "lucide-react";

import type {
  BuildPassport,
  BuildPassportCheck,
} from "@/features/verification/build-passport";
import { cn } from "@/lib/utils";

const statusCopy = {
  verified: "Verified",
  review: "Review needed",
  failed: "Failed",
} as const;

export function BuildPassportView({ passport }: { passport: BuildPassport }) {
  return (
    <article className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-3xl">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Squid Build Passport · revision evidence
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
            {passport.project.title}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
            A revision-specific record of what Squid checked, what passed, and
            what still needs human or production verification.
          </p>
        </div>
        <StatusMark status={passport.overallStatus} />
      </header>

      <section className="grid border-b border-border sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Source files" value={passport.evidence.sourceFiles} />
        <Metric
          label="Resolved imports"
          value={passport.evidence.resolvedImports}
        />
        <Metric
          label="Source findings"
          value={
            passport.evidence.diagnostics +
            passport.evidence.accessibilityWarnings
          }
        />
        <Metric
          label="Exported files"
          value={passport.evidence.exportedFiles ?? "Not run"}
        />
      </section>

      <section aria-labelledby="passport-checks" className="py-10 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Evidence chain</p>
            <h2
              id="passport-checks"
              className="mt-1 text-2xl font-semibold tracking-tight"
            >
              Four separate claims, never one vague score
            </h2>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            Generated {formatDate(passport.generatedAt)}
          </p>
        </div>

        <div className="mt-8 divide-y divide-border border-y border-border">
          {passport.checks.map((check) => (
            <CheckRow key={check.id} check={check} />
          ))}
        </div>
      </section>

      <section
        aria-labelledby="passport-limitations"
        className="grid gap-5 border-t border-border pt-10 md:grid-cols-[220px_minmax(0,1fr)]"
      >
        <div>
          <FileCheck2 className="size-5 text-muted-foreground" />
          <h2 id="passport-limitations" className="mt-3 font-semibold">
            Limits of this passport
          </h2>
        </div>
        <ul className="grid gap-3 text-sm leading-6 text-muted-foreground">
          {passport.limitations.map((limitation) => (
            <li key={limitation} className="flex gap-3">
              <span aria-hidden="true" className="text-foreground">
                —
              </span>
              <span>{limitation}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

function StatusMark({ status }: { status: BuildPassport["overallStatus"] }) {
  const Icon =
    status === "verified"
      ? CheckCircle2
      : status === "failed"
        ? XCircle
        : AlertTriangle;
  return (
    <div
      className={cn(
        "flex min-w-52 items-center gap-3 border-l-2 px-4 py-3",
        status === "verified" && "border-emerald-500 bg-emerald-500/5",
        status === "review" && "border-amber-500 bg-amber-500/5",
        status === "failed" && "border-destructive bg-destructive/5",
      )}
      role="status"
    >
      <Icon className="size-5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">Overall status</p>
        <p className="font-semibold">{statusCopy[status]}</p>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="sm:not-first:border-l border-border py-6 sm:px-5 sm:first:pl-0 lg:py-8">
      <p className="font-mono text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function CheckRow({ check }: { check: BuildPassportCheck }) {
  const Icon =
    check.status === "passed"
      ? CheckCircle2
      : check.status === "failed"
        ? XCircle
        : check.status === "review"
          ? AlertTriangle
          : CircleDashed;
  return (
    <div className="grid gap-4 py-6 md:grid-cols-[220px_minmax(0,1fr)_minmax(220px,0.7fr)] md:gap-8">
      <div className="flex items-start gap-3">
        <Icon
          className={cn(
            "mt-0.5 size-4 shrink-0",
            check.status === "passed" && "text-emerald-600",
            check.status === "review" && "text-amber-600",
            check.status === "failed" && "text-destructive",
            ["not_run", "not_applicable"].includes(check.status) &&
              "text-muted-foreground",
          )}
        />
        <div>
          <h3 className="font-semibold">{check.label}</h3>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {check.status.replaceAll("_", " ")}
          </p>
        </div>
      </div>
      <p className="text-sm leading-6 text-foreground">{check.summary}</p>
      <div>
        <ul className="grid gap-1 text-xs leading-5 text-muted-foreground">
          {check.details.map((detail) => (
            <li key={detail}>• {detail}</li>
          ))}
        </ul>
        {check.checkedAt ? (
          <p className="mt-2 font-mono text-[10px] text-muted-foreground">
            {formatDate(check.checkedAt)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}
