import { Check, ExternalLink } from "lucide-react";

type ComparisonVariant = "article" | "hub" | "homepage";

type Provider = {
  key: "lovable" | "bolt" | "base44" | "v0" | "squid";
  label: string;
  sourceHref?: string;
};

type ComparisonRow = {
  feature: string;
  values: Record<Provider["key"], string>;
};

const providers: readonly Provider[] = [
  {
    key: "lovable",
    label: "Lovable",
    sourceHref: "https://docs.lovable.dev/",
  },
  {
    key: "bolt",
    label: "Bolt.new",
    sourceHref: "https://support.bolt.new/",
  },
  {
    key: "base44",
    label: "Base44",
    sourceHref: "https://docs.base44.com/Getting-Started/Quick-start-guide",
  },
  {
    key: "v0",
    label: "v0",
    sourceHref: "https://v0.dev/docs/faqs",
  },
  { key: "squid", label: "Squid Agent" },
] as const;

const rows: readonly ComparisonRow[] = [
  {
    feature: "Workflow visibility",
    values: {
      lovable: "Plan mode and project history",
      bolt: "Plan and build modes",
      base44: "Discuss mode and prompt history",
      v0: "Chat, editor, and project history",
      squid: "Sources, approved plan, and build trail",
    },
  },
  {
    feature: "Code ownership",
    values: {
      lovable: "ZIP export and GitHub sync",
      bolt: "ZIP download and GitHub integration",
      base44: "ZIP export; GitHub on Builder+",
      v0: "Code export and bidirectional Git",
      squid: "Verified ZIP and GitHub publishing",
    },
  },
  {
    feature: "Cost visibility",
    values: {
      lovable: "Workspace credits and cloud balances",
      bolt: "Token balance and per-message usage",
      base44: "Message and integration credits",
      v0: "Credit balance and detailed usage log",
      squid: "Pre-run estimate and final receipt",
    },
  },
  {
    feature: "Full-stack path",
    values: {
      lovable: "Managed cloud, auth, and database",
      bolt: "Hosting, database, and server functions",
      base44: "Managed backend and functions",
      v0: "Next.js full stack and integrations",
      squid: "Portable React with explicit service setup",
    },
  },
  {
    feature: "Recovery and evidence",
    values: {
      lovable: "History preview and revert",
      bolt: "Visual version history and restore",
      base44: "Prompt-level revert and version history",
      v0: "Project history and Git workflow",
      squid: "Checkpoints, diffs, and quality reports",
    },
  },
] as const;

const variantClasses: Record<ComparisonVariant, string> = {
  article: "scroll-mt-28 py-16",
  hub: "mx-auto max-w-6xl px-6 pb-4 pt-16 lg:px-8 lg:pt-20",
  homepage: "relative z-10 w-full px-4 pb-16 pt-4 sm:px-6 sm:pb-24 sm:pt-8",
};

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
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(320px,0.58fr)] lg:items-end">
          <div>
            <p
              className={`text-xs font-medium uppercase tracking-[0.16em] text-primary ${
                isHomepage ? "font-mono-jb" : "font-mono"
              }`}
            >
              Feature comparison
            </p>
            <h2
              id={`feature-comparison-title-${variant}`}
              className={
                isHomepage
                  ? "mt-4 max-w-3xl font-display text-4xl leading-[0.98] tracking-tight text-foreground sm:text-5xl"
                  : "mt-3 max-w-3xl text-balance text-2xl font-semibold tracking-[-0.025em] sm:text-3xl"
              }
            >
              Compare the workflow after the first prompt.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            Every major builder can generate code. The durable differences are
            what you can inspect, recover, export, and account for as the
            project grows.
          </p>
        </div>

        <div className="mt-8 hidden overflow-hidden rounded-[22px] border border-border/80 bg-background shadow-[0_22px_60px_-46px_rgba(0,0,0,0.7)] lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Feature comparison of Lovable, Bolt.new, Base44, v0, and Squid
                Agent
              </caption>
              <thead>
                <tr className="bg-muted/55">
                  <th
                    scope="col"
                    className="w-[16%] border-b border-border px-5 py-4 font-semibold"
                  >
                    Feature
                  </th>
                  {providers.map((provider) => (
                    <th
                      key={provider.key}
                      scope="col"
                      className={`w-[16.8%] border-b border-border px-5 py-4 font-semibold ${
                        provider.key === "squid"
                          ? "bg-primary/[0.08] text-primary"
                          : ""
                      }`}
                    >
                      {provider.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr
                    key={row.feature}
                    className="align-top odd:bg-muted/[0.12]"
                  >
                    <th
                      scope="row"
                      className="px-5 py-5 font-semibold leading-6 text-foreground"
                    >
                      {row.feature}
                    </th>
                    {providers.map((provider) => (
                      <td
                        key={provider.key}
                        className={`px-5 py-5 leading-6 ${
                          provider.key === "squid"
                            ? "bg-primary/[0.045] font-medium text-foreground"
                            : "text-foreground/75"
                        }`}
                      >
                        <span className="flex items-start gap-2.5">
                          <span
                            className={`mt-1 flex size-4 shrink-0 items-center justify-center rounded-full ${
                              provider.key === "squid"
                                ? "bg-primary text-primary-foreground"
                                : "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                            }`}
                            aria-hidden="true"
                          >
                            <Check className="size-2.5" strokeWidth={3} />
                          </span>
                          <span>{row.values[provider.key]}</span>
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:hidden">
          {providers.map((provider) => (
            <article
              key={provider.key}
              className={`overflow-hidden rounded-[22px] border p-5 shadow-[0_18px_48px_-38px_rgba(0,0,0,0.65)] ${
                provider.key === "squid"
                  ? "border-primary/35 bg-primary/[0.045]"
                  : "border-border/80 bg-background/85"
              }`}
            >
              <h3
                className={`font-semibold ${
                  provider.key === "squid" ? "text-primary" : "text-foreground"
                }`}
              >
                {provider.label}
              </h3>
              <dl className="mt-4 divide-y divide-border/70">
                {rows.map((row) => (
                  <div key={row.feature} className="py-3 first:pt-0 last:pb-0">
                    <dt className="text-xs font-medium uppercase tracking-[0.11em] text-muted-foreground">
                      {row.feature}
                    </dt>
                    <dd className="mt-1.5 flex items-start gap-2 text-sm leading-6 text-foreground/80">
                      <Check
                        className={`mt-1 size-3.5 shrink-0 ${
                          provider.key === "squid"
                            ? "text-primary"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                      {row.values[provider.key]}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-border/60 pt-5 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-start sm:justify-between">
          <p>
            Reviewed July 15, 2026. Capabilities and plan limits change; verify
            the current workflow before choosing.
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
