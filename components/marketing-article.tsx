import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  Code2,
  Download,
  ExternalLink,
  FileCheck2,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getMarketingPath,
  marketingStructuredData,
  type MarketingPage,
} from "@/lib/marketing-pages";
import {
  MarketingFooter,
  MarketingHeader,
} from "@/components/marketing-chrome";

type MarketingArticleProps = {
  page: MarketingPage;
};

export function MarketingArticle({ page }: MarketingArticleProps) {
  const path = getMarketingPath(page);
  const sectionLabel =
    page.kind === "comparison"
      ? "Comparisons"
      : page.kind === "guide"
        ? "Guides"
        : "Benchmarks";
  const sectionHref =
    page.kind === "comparison"
      ? "/compare"
      : page.kind === "guide"
        ? "/blog"
        : "/benchmarks";
  const tocItems = [
    ...(page.table ? [{ label: page.table.caption, id: "at-a-glance" }] : []),
    ...(page.workflow
      ? [{ label: "Evaluation workflow", id: "workflow" }]
      : []),
    ...page.sections.map((section) => ({
      label: section.title,
      id: sectionId(section.title),
    })),
    ...(page.evidence ? [{ label: "What to verify", id: "evidence" }] : []),
    { label: "Frequently asked questions", id: "faqs" },
  ];
  const structuredData = marketingStructuredData(page);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingHeader />
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data).replace(/</g, "\\u003c"),
          }}
        />
      ))}

      <main>
        <article>
          <header className="relative overflow-hidden border-b border-border/70">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="mx-auto max-w-6xl px-6 pb-16 pt-8 lg:px-8 lg:pb-24 lg:pt-12">
              <nav
                aria-label="Breadcrumb"
                className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
              >
                <Link
                  href="/"
                  className="transition-colors hover:text-foreground"
                >
                  Home
                </Link>
                <ChevronRight className="size-3.5" aria-hidden="true" />
                <Link
                  href={sectionHref}
                  className="transition-colors hover:text-foreground"
                >
                  {sectionLabel}
                </Link>
                <ChevronRight className="size-3.5" aria-hidden="true" />
                <span aria-current="page" className="text-foreground/80">
                  {page.h1}
                </span>
              </nav>

              <div className="mt-12 grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.75fr)] lg:gap-16">
                <div>
                  <h1 className="text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl lg:leading-[1.04]">
                    {page.h1}
                  </h1>
                  <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
                    {page.intro}
                  </p>
                  <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="size-4" aria-hidden="true" />
                      {page.readingTime}
                    </span>
                    <span>Updated {formatDate(page.updatedAt)}</span>
                    <span>Reviewed by Squid Agent</span>
                  </div>
                </div>
                <ExportArtifactPreview kind={page.kind} />
              </div>

              <div className="mt-12 border-l-2 border-primary pl-5 text-sm leading-6 text-muted-foreground lg:max-w-4xl">
                <span className="font-semibold text-foreground">
                  Methodology:
                </span>{" "}
                Product comparisons use current official documentation and
                Squid&apos;s implemented behavior. Benchmark and guide pages
                separate observed product evidence from recommended practice.
              </div>
            </div>
          </header>

          <div className="mx-auto grid max-w-6xl gap-14 px-6 py-16 lg:px-8 xl:grid-cols-[210px_minmax(0,1fr)] xl:gap-16">
            <aside className="hidden xl:block">
              <nav aria-label="On this page" className="sticky top-28">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  On this page
                </p>
                <ul className="mt-4 border-l border-border">
                  {tocItems.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="-ml-px block border-l border-transparent py-2 pl-4 text-sm leading-5 text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <div className="min-w-0">
              <section className="border-y border-primary/20 bg-primary/[0.045] px-6 py-7 sm:px-8">
                <div className="flex items-start gap-4">
                  <CircleCheck
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <div>
                    <h2 className="text-base font-semibold">
                      The short answer
                    </h2>
                    <p className="mt-2 text-base leading-7 text-muted-foreground">
                      {page.summary}
                    </p>
                  </div>
                </div>
              </section>

              {page.table && <ComparisonTable table={page.table} />}

              {page.workflow && (
                <section id="workflow" className="scroll-mt-28 py-16">
                  <SectionHeading
                    label="A fair test"
                    title="Compare the complete workflow"
                    description="Use the same inputs and acceptance criteria, then evaluate the path from first request to a locally runnable artifact."
                  />
                  <ol className="mt-10 divide-y divide-border border-y border-border">
                    {page.workflow.map((step, index) => (
                      <li
                        key={step.title}
                        className="grid gap-4 py-7 sm:grid-cols-[3rem_1fr] sm:gap-6"
                      >
                        <span className="flex size-10 items-center justify-center rounded-full bg-primary font-mono text-sm font-semibold text-primary-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold tracking-tight">
                            {step.title}
                          </h3>
                          <p className="mt-2 leading-7 text-muted-foreground">
                            {step.body}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              <div className="divide-y divide-border border-y border-border">
                {page.sections.map((section, index) => (
                  <section
                    id={sectionId(section.title)}
                    key={section.title}
                    className="scroll-mt-28 py-12 sm:py-14"
                  >
                    <div className="grid gap-5 md:grid-cols-[4rem_minmax(0,1fr)] md:gap-8">
                      <span className="font-mono text-sm text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h2 className="text-balance text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                          {section.title}
                        </h2>
                        <p className="mt-4 text-[1.05rem] leading-8 text-muted-foreground">
                          {section.body}
                        </p>
                        {section.points && (
                          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                            {section.points.map((point) => (
                              <li
                                key={point}
                                className="flex gap-3 text-sm leading-6 text-foreground/85"
                              >
                                <Check
                                  className="mt-1 size-4 shrink-0 text-primary"
                                  aria-hidden="true"
                                />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </section>
                ))}
              </div>

              {page.codeExample && (
                <section className="py-16">
                  <SectionHeading
                    label="Technical example"
                    title={page.codeExample.title}
                    description={page.codeExample.body}
                  />
                  <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl shadow-slate-950/10">
                    <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3 font-mono text-xs text-slate-400">
                      <Code2 className="size-4" aria-hidden="true" />
                      {page.codeExample.filename}
                    </div>
                    <pre className="overflow-x-auto p-5 text-sm leading-7">
                      <code>{page.codeExample.code}</code>
                    </pre>
                  </div>
                </section>
              )}

              {page.evidence && (
                <section id="evidence" className="scroll-mt-28 py-16">
                  <SectionHeading
                    label="Decision evidence"
                    title="What to verify before choosing"
                    description="Use primary documentation and your own exported artifacts. Product capabilities and pricing change too quickly for memory-based comparisons."
                  />
                  <div className="mt-10 grid border-l border-t border-border sm:grid-cols-2">
                    {page.evidence.map((item) => (
                      <div
                        key={`${item.label}-${item.title}`}
                        className="border-b border-r border-border p-6 sm:p-7"
                      >
                        <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">
                          {item.label}
                        </p>
                        <h3 className="mt-4 text-lg font-semibold tracking-tight">
                          {item.title}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          {item.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {page.sources && (
                <section className="border-y border-border py-12">
                  <SectionHeading
                    label="Primary sources"
                    title="Verify the current product behavior"
                    description="These official pages informed this comparison and may change after the review date above."
                  />
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {page.sources.map((source) => (
                      <a
                        key={source.href}
                        href={source.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-start justify-between gap-4 border border-border p-5 transition-colors hover:border-primary/50 hover:bg-primary/[0.025]"
                      >
                        <span>
                          <span className="font-medium">{source.label}</span>
                          <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                            {source.description}
                          </span>
                        </span>
                        <ExternalLink
                          className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                          aria-hidden="true"
                        />
                      </a>
                    ))}
                  </div>
                </section>
              )}

              <section id="faqs" className="scroll-mt-28 py-16">
                <SectionHeading
                  label="FAQ"
                  title="Frequently asked questions"
                  description="Direct answers to the questions buyers and builders ask before committing a project to an AI app builder."
                />
                <div className="mt-8 divide-y divide-border border-y border-border">
                  {page.faqs.map((faq) => (
                    <details key={faq.question} className="group py-5">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-medium marker:content-none">
                        {faq.question}
                        <ChevronRight
                          className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
                          aria-hidden="true"
                        />
                      </summary>
                      <p className="max-w-3xl pb-1 pt-4 leading-7 text-muted-foreground">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>

              <section className="pb-16">
                <SectionHeading
                  label="Keep researching"
                  title="Related guides and comparisons"
                />
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {page.internalLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group border border-border p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                    >
                      <span className="flex items-center justify-between gap-4 font-medium">
                        {link.label}
                        <ArrowRight
                          className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                        {link.description}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <section className="border-y border-primary/20 bg-primary/[0.045]">
            <div className="mx-auto flex max-w-6xl flex-col gap-7 px-6 py-12 sm:flex-row sm:items-center sm:justify-between lg:px-8">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Build an app you can inspect, restore, and keep.
                </h2>
                <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
                  See the expected model cost before generation, review the
                  resulting files, and export a verified React project when it
                  is ready.
                </p>
              </div>
              <Button asChild size="lg" className="shrink-0 rounded-lg">
                <Link href={`/?source=${encodeURIComponent(path)}`}>
                  {page.cta}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </section>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}

function ComparisonTable({
  table,
}: {
  table: NonNullable<MarketingPage["table"]>;
}) {
  return (
    <section id="at-a-glance" className="scroll-mt-28 py-16">
      <SectionHeading
        label="At a glance"
        title={table.caption}
        description={table.description}
      />
      <div className="mt-8 overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <caption className="sr-only">{table.caption}</caption>
            <thead>
              <tr className="bg-muted/50">
                {table.columns.map((column, index) => (
                  <th
                    key={column}
                    scope="col"
                    className={`border-b border-border px-5 py-4 font-semibold ${
                      index === 1 ? "bg-primary/[0.06] text-primary" : ""
                    }`}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {table.rows.map((row) => (
                <tr key={row.join("-")} className="align-top">
                  {row.map((cell, index) => (
                    <td
                      key={`${index}-${cell}`}
                      className={`px-5 py-5 leading-6 ${
                        index === 0
                          ? "font-medium text-foreground"
                          : index === 1
                            ? "bg-primary/[0.035] text-foreground/85"
                            : "text-muted-foreground"
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ExportArtifactPreview({ kind }: { kind: MarketingPage["kind"] }) {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
      <div className="absolute -inset-8 -z-10 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1),transparent_65%)]" />
      <div className="overflow-hidden rounded-2xl border border-primary/25 bg-background shadow-2xl shadow-primary/10">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <CircleCheck className="size-4 text-primary" />
            {kind === "benchmark"
              ? "Evidence package ready"
              : "Export verified"}
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            passed
          </span>
        </div>
        <div className="grid grid-cols-[126px_1fr]">
          <div className="border-r border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-xs font-medium">
              <Folder className="size-3.5 text-primary" />
              react-app
            </div>
            <div className="mt-4 space-y-2 font-mono text-[10px] text-muted-foreground">
              <p>components/</p>
              <p>pages/</p>
              <p>App.tsx</p>
              <p>package.json</p>
              <p>README.md</p>
              <p className="text-primary">quality-report.json</p>
            </div>
          </div>
          <div className="p-4 font-mono text-[10px] leading-5 text-muted-foreground">
            <p className="text-primary">import</p>
            <p>React from &quot;react&quot;;</p>
            <p className="mt-3 text-primary">export default</p>
            <p>function App() &#123;</p>
            <p className="pl-3">return &lt;Routes /&gt;;</p>
            <p>&#125;</p>
            <div className="mt-5 flex items-center gap-2 border-t border-border pt-3 text-foreground">
              <FileCheck2 className="size-3.5 text-primary" />
              Imports resolved
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border bg-primary/[0.035] px-4 py-3 text-xs">
          <span className="text-muted-foreground">
            Source + verification artifacts
          </span>
          <span className="flex items-center gap-1.5 font-medium text-primary">
            <Download className="size-3.5" />
            Download ZIP
          </span>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">
        {label}
      </p>
      <h2 className="mt-3 text-balance text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

function sectionId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
