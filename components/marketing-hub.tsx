import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, Scale } from "lucide-react";
import type { MarketingPage } from "@/lib/marketing-pages";
import {
  SITE_NAME,
  SITE_URL,
  getMarketingPath,
  guideTopicClusters,
} from "@/lib/marketing-pages";
import {
  MarketingFooter,
  MarketingHeader,
} from "@/components/marketing-chrome";
import { AiBuilderFeatureComparison } from "@/components/ai-builder-feature-comparison";

type MarketingHubProps = {
  kind: MarketingPage["kind"];
  title: string;
  intro: string;
  pages: MarketingPage[];
};

const hubConfig = {
  comparison: {
    label: "Evidence-led research",
    icon: Scale,
    path: "/compare",
    supporting:
      "Every comparison is reviewed against current official documentation and Squid's live implementation.",
  },
  guide: {
    label: "Practical field guides",
    icon: BookOpen,
    path: "/blog",
    supporting:
      "Production-minded guidance for evaluating, editing, recovering, and exporting AI-generated React apps.",
  },
  benchmark: {
    label: "Reproducible methodology",
    icon: BarChart3,
    path: "/benchmarks",
    supporting:
      "Transparent scoring systems that publish the prompt, files, usage, viewport evidence, and clean-room build result.",
  },
};

const hubQuickLinks = {
  comparison: [
    {
      href: "/what-is-squid-agent",
      label: "What is Squid Agent?",
      description:
        "Understand the product boundaries and how this differs from Squid AI (getsquid.ai).",
    },
    {
      href: "/compare/squid-vs-bolt-for-agencies",
      label: "For agencies",
      description:
        "Compare versioning and delivery behavior for studio workflows.",
    },
    {
      href: "/compare/squid-vs-lovable-for-startups",
      label: "For startups",
      description:
        "Compare portability, spend clarity, and recovery when speed matters.",
    },
    {
      href: "/compare/squid-vs-v0-for-design-led-teams",
      label: "For design-led teams",
      description:
        "Compare component, interaction, and export expectations across tools.",
    },
    {
      href: "/compare/squid-vs-getsquid-ai",
      label: "Squid vs Squid AI",
      description:
        "Disambiguate brand naming and compare ownership and output quality signals.",
    },
  ],
  guide: [
    {
      href: "/what-is-squid-agent",
      label: "What is Squid Agent?",
      description:
        "Review identity, workflow intent, and when to use Squid Agent.",
    },
    {
      href: "/blog/export-react-app-from-ai",
      label: "Export from AI without surprises",
      description:
        "Use this problem-led entry guide before planning your first handoff.",
    },
    {
      href: "/blog/ai-coding-tool-comparison-with-credits",
      label: "Compare credits and spend signals",
      description:
        "Set expectations for budget and delivery before choosing a builder.",
    },
    {
      href: "/blog/how-to-evaluate-ai-generated-react-code",
      label: "Validate generated React output",
      description:
        "Use this review checklist before accepting the first finished build.",
    },
  ],
  benchmark: [
    {
      href: "/blog/ai-coding-tool-comparison-with-credits",
      label: "Compare cost signals before running a benchmark",
      description:
        "Set your acceptance criteria and budget guardrails before scoring outputs.",
    },
  ],
} as const;

export function MarketingHub({ kind, title, intro, pages }: MarketingHubProps) {
  const config = hubConfig[kind];
  const Icon = config.icon;
  const hubUrl = `${SITE_URL}${config.path}`;
  const guideSections =
    kind === "guide"
      ? guideTopicClusters.map((cluster) => ({
          ...cluster,
          pages: cluster.slugs
            .map((slug) => pages.find((page) => page.slug === slug))
            .filter((page): page is MarketingPage => Boolean(page)),
        }))
      : [];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": hubUrl,
    name: title,
    description: intro,
    url: hubUrl,
    inLanguage: "en-US",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: config.label,
          item: hubUrl,
        },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      "@id": `${hubUrl}#articles`,
      itemListElement: pages.map((page, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: page.h1,
        url: `${SITE_URL}${getMarketingPath(page)}`,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <main>
        <header className="relative overflow-hidden border-b border-border">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
            <div className="grid items-end gap-10 lg:grid-cols-[1fr_340px]">
              <div>
                <div className="flex items-center gap-2.5 text-sm font-medium text-primary">
                  <Icon className="size-4" aria-hidden="true" />
                  {config.label}
                </div>
                <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                  {title}
                </h1>
                <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
                  {intro}
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {hubQuickLinks[kind].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group rounded-xl border border-border/70 bg-background p-4 transition-colors hover:border-primary/35 hover:bg-primary/[0.03]"
                    >
                      <p className="text-sm font-semibold">{link.label}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {link.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="border-l-2 border-primary pl-5 text-sm leading-6 text-muted-foreground">
                {config.supporting}
              </div>
            </div>
          </div>
        </header>

        {kind === "comparison" && <AiBuilderFeatureComparison variant="hub" />}

        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
          {kind === "guide" ? (
            <div>
              <div className="mb-14 flex items-end justify-between gap-6 border-b border-border pb-5">
                <div>
                  <h2 className="text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                    Explore AI app building by topic
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Follow a focused path through builder selection, visual
                    generation, cost control, verification, and product-specific
                    implementation.
                  </p>
                </div>
                <p className="hidden font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground sm:block">
                  {pages.length} {pages.length === 1 ? "guide" : "guides"}
                </p>
              </div>

              <div className="space-y-20">
                {guideSections.map((section, sectionIndex) => (
                  <section
                    key={section.id}
                    id={section.id}
                    aria-labelledby={`${section.id}-heading`}
                    className="scroll-mt-24"
                  >
                    <div className="mb-7 max-w-3xl">
                      <h2
                        id={`${section.id}-heading`}
                        className="text-2xl font-semibold tracking-[-0.025em] sm:text-3xl"
                      >
                        {section.title}
                      </h2>
                      <p className="mt-3 leading-7 text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {section.pages.map((page, index) => (
                        <MarketingHubCard
                          key={page.slug}
                          page={page}
                          kind={kind}
                          displayIndex={pages.findIndex(
                            (candidate) => candidate.slug === page.slug,
                          )}
                          featured={sectionIndex === 0 && index === 0}
                          totalPages={pages.length}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
              {pages.map((page, index) => (
                <MarketingHubCard
                  key={page.slug}
                  page={page}
                  kind={kind}
                  displayIndex={index}
                  featured={pages.length % 2 === 1 && index === 0}
                  totalPages={pages.length}
                />
              ))}
            </div>
          )}
        </div>

        <section className="border-y border-primary/20 bg-primary/[0.045]">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-3 lg:px-8">
            <TrustPoint
              index="01"
              title="Current sources"
              body="Competitor facts link to official product documentation and carry a visible review date."
            />
            <TrustPoint
              index="02"
              title="Explicit methodology"
              body="Recommendations explain the acceptance criteria and evidence behind the conclusion."
            />
            <TrustPoint
              index="03"
              title="No fake certainty"
              body="Fast-changing plans and capabilities are framed as a dated snapshot, not permanent truth."
            />
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function MarketingHubCard({
  page,
  kind,
  displayIndex,
  featured,
  totalPages,
}: {
  page: MarketingPage;
  kind: MarketingPage["kind"];
  displayIndex: number;
  featured: boolean;
  totalPages: number;
}) {
  const Heading = kind === "guide" ? "h3" : "h2";

  return (
    <Link
      href={getMarketingPath(page)}
      className={
        kind === "guide"
          ? `group relative flex min-h-[340px] flex-col overflow-hidden rounded-2xl border border-border bg-background p-7 transition-[border-color,background-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-primary/[0.025] hover:shadow-[0_18px_50px_-32px_hsl(var(--primary)/0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-8 ${
              featured ? "md:col-span-2 lg:col-span-2 lg:min-h-[380px]" : ""
            }`
          : `group relative flex min-h-[310px] flex-col bg-background p-7 transition-colors hover:bg-primary/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:p-9 ${
              featured && totalPages % 2 === 1 ? "md:col-span-2" : ""
            }`
      }
    >
      {kind === "guide" && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />
      )}
      <div className="flex items-center justify-between gap-4 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
        <span>
          {kind === "guide"
            ? String(displayIndex + 1).padStart(2, "0")
            : page.readingTime}
        </span>
        <span>
          {kind === "guide"
            ? `${formatShortDate(page.publishedAt)} · ${page.readingTime}`
            : `Updated ${formatShortDate(page.updatedAt)}`}
        </span>
      </div>
      <Heading
        className={`mt-10 max-w-2xl text-balance font-semibold tracking-[-0.025em] ${
          kind === "guide" && featured
            ? "text-3xl sm:text-4xl"
            : "text-2xl sm:text-3xl"
        }`}
      >
        {page.h1}
      </Heading>
      <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
        {page.summary}
      </p>
      <span className="mt-auto flex items-center gap-2 pt-9 text-sm font-semibold text-primary">
        Read the {kind === "guide" ? "guide" : kind}
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}

function TrustPoint({
  index,
  title,
  body,
}: {
  index: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <p className="font-mono text-xs text-primary">{index}</p>
      <h2 className="mt-3 font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
