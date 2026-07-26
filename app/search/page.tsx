import Link from "next/link";
import { Search } from "lucide-react";

import {
  MarketingFooter,
  MarketingHeader,
} from "@/components/marketing-chrome";
import { docsSource } from "@/lib/docs/source";
import {
  benchmarkPage,
  blogPages,
  comparisonPages,
  getMarketingPath,
} from "@/lib/marketing-pages";
import { publicShowcasePages } from "@/lib/public-pages";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata = createNoIndexMetadata({
  title: "Search Squid Agent",
  description:
    "Search Squid Agent documentation, AI app builder comparisons, React generation guides, benchmarks, and public examples.",
  path: "/search",
  keywords: ["Squid Agent search", "AI app builder guides"],
});

type SearchEntry = {
  href: string;
  title: string;
  description: string;
  section: string;
};

const fixedEntries: readonly SearchEntry[] = [
  {
    href: "/",
    title: "AI React app builder with exportable code",
    description:
      "Research, plan, build, verify, restore, and export production-ready React apps.",
    section: "Product",
  },
  {
    href: "/gallery",
    title: "AI-built React app gallery",
    description:
      "Explore public apps and landing pages built with Squid Agent.",
    section: "Examples",
  },
  {
    href: "/blog",
    title: "AI app builder guides",
    description:
      "Practical guidance for generated React code, export, verification, and recovery.",
    section: "Guides",
  },
  {
    href: "/compare",
    title: "AI app builder comparisons",
    description:
      "Compare Squid Agent with Lovable, Bolt.new, and v0 using current evidence.",
    section: "Comparisons",
  },
  {
    href: "/benchmarks",
    title: "AI app builder benchmarks",
    description:
      "Use reproducible rubrics for screenshot-to-React generation and export readiness.",
    section: "Benchmarks",
  },
];

const searchableEntries: readonly SearchEntry[] = [
  ...fixedEntries,
  ...comparisonPages.map((page) => ({
    href: getMarketingPath(page),
    title: page.h1,
    description: page.description,
    section: "Comparisons",
  })),
  ...blogPages.map((page) => ({
    href: getMarketingPath(page),
    title: page.h1,
    description: page.description,
    section: "Guides",
  })),
  {
    href: getMarketingPath(benchmarkPage),
    title: benchmarkPage.h1,
    description: benchmarkPage.description,
    section: "Benchmarks",
  },
  ...docsSource.getPages().map((page) => ({
    href: page.url,
    title: page.data.title,
    description:
      page.data.description ??
      "Squid Agent documentation for building and exporting React apps.",
    section: "Documentation",
  })),
  ...publicShowcasePages.map((page) => ({
    href: page.path,
    title: page.title,
    description: page.description,
    section: "Examples",
  })),
];

function normalize(value: string) {
  return value
    .toLocaleLowerCase("en")
    .replaceAll(/[^a-z0-9]+/g, " ")
    .trim();
}

function searchSite(query: string): SearchEntry[] {
  const terms = normalize(query).split(" ").filter(Boolean);
  if (terms.length === 0) return fixedEntries.slice(0, 5);

  return searchableEntries
    .map((entry) => {
      const title = normalize(entry.title);
      const description = normalize(entry.description);
      const section = normalize(entry.section);
      const score = terms.reduce((total, term) => {
        if (title === term) return total + 12;
        if (title.includes(term)) return total + 6;
        if (section.includes(term)) return total + 3;
        if (description.includes(term)) return total + 1;
        return total;
      }, 0);
      return { entry, score };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 24)
    .map(({ entry }) => entry);
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const rawQuery = (await searchParams).q;
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : (rawQuery ?? ""))
    .trim()
    .slice(0, 100);
  const results = searchSite(query);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-4xl px-6 py-16 sm:py-20 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
          Site search
        </p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          Search Squid Agent
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          Find documentation, AI app builder comparisons, React generation
          guides, benchmarks, and public examples.
        </p>

        <form
          action="/search"
          className="mt-8 flex gap-3"
          method="get"
          role="search"
        >
          <label className="sr-only" htmlFor="site-search-query">
            Search Squid Agent
          </label>
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden="true"
              className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            />
            <input
              className="min-h-12 w-full rounded-xl border border-border bg-background py-3 pl-12 pr-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              defaultValue={query}
              id="site-search-query"
              maxLength={100}
              name="q"
              placeholder="Search AI app builder guides…"
              type="search"
            />
          </div>
          <button
            className="min-h-12 rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            type="submit"
          >
            Search
          </button>
        </form>

        <section aria-labelledby="search-results-heading" className="mt-12">
          <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
            <h2 id="search-results-heading" className="text-2xl font-semibold">
              {query ? `Results for “${query}”` : "Popular resources"}
            </h2>
            <span className="text-sm text-muted-foreground">
              {results.length} {results.length === 1 ? "result" : "results"}
            </span>
          </div>

          {results.length > 0 ? (
            <ul className="divide-y divide-border">
              {results.map((result) => (
                <li key={result.href}>
                  <Link
                    className="group block py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
                    href={result.href}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      {result.section}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight group-hover:text-primary">
                      {result.title}
                    </h3>
                    <p className="mt-2 max-w-3xl leading-7 text-muted-foreground">
                      {result.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12">
              <p className="text-lg font-medium">No matching resources yet.</p>
              <p className="mt-2 text-muted-foreground">
                Try a product, workflow, competitor, or app type such as
                “Lovable,” “export,” “screenshot,” or “dashboard.”
              </p>
            </div>
          )}
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
