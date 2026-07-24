import { ArrowRight, Check, ExternalLink, Minus, X } from "lucide-react";

type ComparisonVariant = "article" | "hub" | "homepage";
type ProviderKey = "lovable" | "bolt" | "base44" | "v0" | "squid";
type SupportLevel = "yes" | "limited" | "no";

type Provider = {
  key: ProviderKey;
  label: string;
  sourceHref?: string;
};

type ComparisonValue = {
  status: SupportLevel;
  text: string;
};

type ComparisonRow = {
  stage: string;
  feature: string;
  detail: string;
  values: Record<ProviderKey, ComparisonValue>;
};

const providers: readonly Provider[] = [
  {
    key: "lovable",
    label: "Lovable",
    sourceHref: "https://docs.lovable.dev/introduction/credits-and-usage",
  },
  {
    key: "bolt",
    label: "Bolt.new",
    sourceHref: "https://support.bolt.new/",
  },
  {
    key: "base44",
    label: "Base44",
    sourceHref: "https://docs.base44.com/Account-and-billing/Credits",
  },
  {
    key: "v0",
    label: "v0",
    sourceHref: "https://v0.dev/docs",
  },
  { key: "squid", label: "Squid Agent" },
] as const;

const mobileProviders = [providers[4], ...providers.slice(0, 4)];

const rows: readonly ComparisonRow[] = [
  {
    stage: "Before the run",
    feature: "Expected build total",
    detail: "Know the likely spend before generation starts.",
    values: {
      lovable: { status: "no", text: "No run-total estimate" },
      bolt: { status: "no", text: "Tokens accrue as work runs" },
      base44: { status: "limited", text: "Typical ranges only" },
      v0: { status: "limited", text: "Model rates, not a run total" },
      squid: { status: "yes", text: "Model-specific estimate" },
    },
  },
  {
    stage: "After the run",
    feature: "Per-result cost record",
    detail: "See what one request actually used.",
    values: {
      lovable: { status: "yes", text: "Exact response cost" },
      bolt: { status: "limited", text: "Token balance and usage" },
      base44: { status: "yes", text: "Credits used per prompt" },
      v0: { status: "yes", text: "Detailed usage event log" },
      squid: { status: "yes", text: "Estimate, charge, refund, status" },
    },
  },
  {
    stage: "After the run",
    feature: "Charge only saved results",
    detail: "Protect credits when the initial build fails.",
    values: {
      lovable: { status: "no", text: "Stopped work is still charged" },
      bolt: { status: "no", text: "Tokens are consumed during work" },
      base44: { status: "no", text: "AI messages draw credits" },
      v0: { status: "no", text: "Failed runs can use credits" },
      squid: { status: "yes", text: "Failed initial runs cost 0" },
    },
  },
  {
    stage: "Take it with you",
    feature: "Source code exit",
    detail: "Keep working outside the builder.",
    values: {
      lovable: { status: "yes", text: "Download and Git sync" },
      bolt: { status: "yes", text: "ZIP and GitHub" },
      base44: { status: "yes", text: "Eject and GitHub" },
      v0: { status: "yes", text: "Export and Git workflow" },
      squid: { status: "yes", text: "Verified ZIP and GitHub publishing" },
    },
  },
  {
    stage: "Take it with you",
    feature: "Evidence ships with code",
    detail: "Carry the generator's checks into handoff.",
    values: {
      lovable: { status: "no", text: "No bundled reports documented" },
      bolt: { status: "no", text: "No bundled reports documented" },
      base44: { status: "no", text: "No bundled reports documented" },
      v0: { status: "no", text: "No bundled reports documented" },
      squid: { status: "yes", text: "Quality + verification reports" },
    },
  },
  {
    stage: "When it breaks",
    feature: "Selective file recovery",
    detail: "Undo one direction without replacing good work.",
    values: {
      lovable: { status: "no", text: "Whole-version revert" },
      bolt: { status: "no", text: "Whole-version restore" },
      base44: { status: "no", text: "Prompt-level revert" },
      v0: { status: "no", text: "Git-centered recovery" },
      squid: { status: "yes", text: "Restore only selected files" },
    },
  },
  {
    stage: "When it breaks",
    feature: "Free built-in repair",
    detail: "Fix generator-caused preview errors without surprise spend.",
    values: {
      lovable: { status: "yes", text: "Try-to-fix is free" },
      bolt: { status: "no", text: "Free restore, not auto-repair" },
      base44: { status: "limited", text: "Free auto-fix on paid plans" },
      v0: { status: "limited", text: "20 free fixes/day; conditions" },
      squid: { status: "yes", text: "Automatic preview repair is free" },
    },
  },
  {
    stage: "Platform tradeoff",
    feature: "Managed backend included",
    detail: "Choose convenience or choose your own service stack.",
    values: {
      lovable: { status: "yes", text: "Cloud, auth, and database" },
      bolt: { status: "yes", text: "Cloud, database, and hosting" },
      base44: { status: "yes", text: "Managed backend and functions" },
      v0: { status: "yes", text: "Vercel services and integrations" },
      squid: { status: "no", text: "Bring your preferred services" },
    },
  },
] as const;

const handoffSteps = [
  { stage: "Before", value: "See the estimate" },
  { stage: "After", value: "Read the receipt" },
  { stage: "Outside Squid", value: "Keep code + evidence" },
] as const;

const supportStyles: Record<
  SupportLevel,
  { label: string; icon: typeof Check; className: string }
> = {
  yes: {
    label: "Included",
    icon: Check,
    className: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  },
  limited: {
    label: "Limited",
    icon: Minus,
    className: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  },
  no: {
    label: "Not documented as equivalent",
    icon: X,
    className: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
  },
};

const variantClasses: Record<ComparisonVariant, string> = {
  article: "scroll-mt-28 py-16",
  hub: "mx-auto max-w-6xl px-6 pb-4 pt-16 lg:px-8 lg:pt-20",
  homepage: "relative z-10 w-full px-4 pb-16 pt-4 sm:px-6 sm:pb-24 sm:pt-8",
};

function StatusIcon({
  status,
  isSquid,
}: {
  status: SupportLevel;
  isSquid: boolean;
}) {
  const config = supportStyles[status];
  const Icon = config.icon;

  return (
    <span
      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
        isSquid && status === "yes"
          ? "bg-primary text-primary-foreground"
          : config.className
      }`}
    >
      <Icon className="size-3" strokeWidth={3} aria-hidden="true" />
      <span className="sr-only">{config.label}: </span>
    </span>
  );
}

export function AiBuilderFeatureComparison({
  variant = "article",
}: {
  variant?: ComparisonVariant;
}) {
  const isHomepage = variant === "homepage";

  return (
    <section
      id="feature-comparison"
      aria-labelledby={`feature-comparison-title-${variant}`}
      className={variantClasses[variant]}
    >
      <div
        className={
          isHomepage
            ? "mx-auto w-full max-w-6xl border-y border-border/70 py-12 sm:py-16"
            : undefined
        }
      >
        <div
          className={
            isHomepage
              ? "mx-auto max-w-3xl text-center"
              : "grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(320px,0.58fr)] lg:items-end"
          }
        >
          <div>
            {!isHomepage ? (
              <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-primary">
                Decision guide
              </p>
            ) : null}
            <h2
              id={`feature-comparison-title-${variant}`}
              className={
                isHomepage
                  ? "font-display text-4xl leading-[1.02] tracking-tight text-foreground sm:text-5xl"
                  : "mt-3 max-w-3xl text-balance text-2xl font-semibold tracking-[-0.025em] sm:text-3xl"
              }
            >
              The first prompt is the easy part.
            </h2>
          </div>
          <p
            className={
              isHomepage
                ? "mx-auto mt-5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7"
                : "max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7"
            }
          >
            Choose the workflow that stays clear when a build fails, costs more
            than expected, or needs to leave the platform.
          </p>
        </div>

        <div className="relative mt-8 overflow-hidden rounded-[22px] border border-primary/25 bg-primary/[0.045] p-5 sm:p-6">
          <div
            className="pointer-events-none absolute -right-12 -top-24 size-56 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative grid gap-5 lg:grid-cols-[0.65fr_1.35fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                The Squid handoff
              </p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-foreground/75">
                One visible trail from expected spend to a portable,
                self-describing project.
              </p>
            </div>
            <ol className="grid gap-3 sm:grid-cols-3 sm:gap-0">
              {handoffSteps.map((step, index) => (
                <li key={step.stage} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1 rounded-xl border border-primary/20 bg-background/65 px-4 py-3">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                      {step.stage}
                    </span>
                    <span className="mt-1 block text-sm font-medium text-foreground">
                      {step.value}
                    </span>
                  </div>
                  {index < handoffSteps.length - 1 ? (
                    <ArrowRight
                      className="hidden size-4 shrink-0 text-primary/60 sm:block"
                      aria-hidden="true"
                    />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {(Object.keys(supportStyles) as SupportLevel[]).map((status) => {
            const config = supportStyles[status];
            const Icon = config.icon;
            return (
              <span key={status} className="inline-flex items-center gap-1.5">
                <span
                  className={`flex size-4 items-center justify-center rounded-full ${config.className}`}
                >
                  <Icon
                    className="size-2.5"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                </span>
                {config.label}
              </span>
            );
          })}
        </div>

        <div className="mt-4 hidden overflow-hidden rounded-[22px] border border-border/80 bg-background shadow-[0_22px_60px_-46px_rgba(0,0,0,0.7)] lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Feature comparison of Lovable, Bolt.new, Base44, v0, and Squid
                Agent
              </caption>
              <thead>
                <tr className="bg-muted/55">
                  <th
                    scope="col"
                    className="w-[20%] border-b border-border px-5 py-4 font-semibold"
                  >
                    What matters
                  </th>
                  {providers.map((provider) => (
                    <th
                      key={provider.key}
                      scope="col"
                      className={`w-[16%] border-b border-border px-4 py-4 font-semibold ${
                        provider.key === "squid"
                          ? "bg-primary/[0.1] text-primary"
                          : ""
                      }`}
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        {provider.label}
                        {provider.key === "squid" ? (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-primary-foreground">
                            Export-first
                          </span>
                        ) : null}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr
                    key={row.feature}
                    className="align-top transition-colors odd:bg-muted/[0.12] hover:bg-muted/[0.22]"
                  >
                    <th scope="row" className="px-5 py-5">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/80">
                        {row.stage}
                      </span>
                      <span className="mt-1.5 block font-semibold leading-5 text-foreground">
                        {row.feature}
                      </span>
                      <span className="mt-1 block text-xs font-normal leading-5 text-muted-foreground">
                        {row.detail}
                      </span>
                    </th>
                    {providers.map((provider) => {
                      const value = row.values[provider.key];
                      const isSquid = provider.key === "squid";
                      return (
                        <td
                          key={provider.key}
                          className={`px-4 py-5 leading-5 ${
                            isSquid
                              ? "bg-primary/[0.055] font-medium text-foreground"
                              : "text-foreground/75"
                          }`}
                        >
                          <span className="flex items-start gap-2.5">
                            <StatusIcon
                              status={value.status}
                              isSquid={isSquid}
                            />
                            <span>{value.text}</span>
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:hidden">
          {mobileProviders.map((provider) => {
            const isSquid = provider.key === "squid";
            return (
              <article
                key={provider.key}
                className={`overflow-hidden rounded-[22px] border p-5 shadow-[0_18px_48px_-38px_rgba(0,0,0,0.65)] ${
                  isSquid
                    ? "border-primary/40 bg-primary/[0.055] sm:col-span-2"
                    : "border-border/80 bg-background/85"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3
                    className={`font-semibold ${
                      isSquid ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {provider.label}
                  </h3>
                  {isSquid ? (
                    <span className="rounded-full bg-primary px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-primary-foreground">
                      Export-first
                    </span>
                  ) : null}
                </div>
                <dl
                  className={`mt-4 grid divide-y divide-border/70 ${
                    isSquid ? "sm:grid-cols-2 sm:gap-x-6 sm:divide-y-0" : ""
                  }`}
                >
                  {rows.map((row) => {
                    const value = row.values[provider.key];
                    return (
                      <div
                        key={row.feature}
                        className="border-border/70 py-3 first:pt-0 last:pb-0 sm:border-b"
                      >
                        <dt>
                          <span className="block text-[9px] font-semibold uppercase tracking-[0.11em] text-primary/75">
                            {row.stage}
                          </span>
                          <span className="mt-1 block text-xs font-medium text-muted-foreground">
                            {row.feature}
                          </span>
                        </dt>
                        <dd className="mt-1.5 flex items-start gap-2 text-sm leading-5 text-foreground/80">
                          <StatusIcon status={value.status} isSquid={isSquid} />
                          {value.text}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </article>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-border/60 pt-5 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-2xl">
            Reviewed July 16, 2026. An X means no equivalent built-in workflow
            was documented in the linked sources; it does not mean the outcome
            is technically impossible.
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:justify-end">
            <span className="font-medium text-foreground/70">
              Official docs
            </span>
            {providers
              .filter(
                (provider): provider is Provider & { sourceHref: string } =>
                  Boolean(provider.sourceHref),
              )
              .map((provider) => (
                <a
                  key={provider.key}
                  href={provider.sourceHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-primary"
                >
                  {provider.label}
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
