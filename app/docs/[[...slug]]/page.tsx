import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import type { TOCItemType } from "fumadocs-core/toc";
import { getMDXComponents } from "@/components/mdx";
import { buildDocsNavigation } from "@/lib/docs/navigation";
import { docsSource } from "@/lib/docs/source";
import { BrandIdentityQuickFaq } from "@/components/brand-identity-quick-faq";

type DocsPageProps = {
  params: Promise<{ slug?: string[] }>;
};

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params;
  const page = docsSource.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const navigation = buildDocsNavigation(docsSource.getPageTree()).flatMap(
    (section) => section.items,
  );
  const pageIndex = navigation.findIndex((item) => item.href === page.url);
  const previous = pageIndex > 0 ? navigation[pageIndex - 1] : undefined;
  const next = pageIndex >= 0 ? navigation[pageIndex + 1] : undefined;
  const toc = page.data.toc as TOCItemType[];
  const isDocsIndex = page.url === "/docs";

  return (
    <div className="mx-auto grid max-w-[1180px] gap-12 px-5 py-10 sm:px-8 sm:py-14 xl:grid-cols-[minmax(0,760px)_200px] xl:px-12">
      <main className="min-w-0">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-foreground"
        >
          <Link href="/docs" className="transition-colors hover:text-primary">
            Docs
          </Link>
          {page.slugs.map((segment, index) => (
            <span key={segment} className="flex items-center gap-1.5">
              <ChevronRight className="size-3.5" />
              <span
                className={
                  index === page.slugs.length - 1
                    ? "text-foreground"
                    : undefined
                }
              >
                {segment
                  .split("-")
                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                  .join(" ")}
              </span>
            </span>
          ))}
        </nav>

        <header className="mb-10 border-b border-border pb-8">
          <h1 className="text-balance text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
            {page.data.title}
          </h1>
          {page.data.description ? (
            <p className="mt-4 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
              {page.data.description}
            </p>
          ) : null}
        </header>
        {isDocsIndex ? <BrandIdentityQuickFaq className="px-0 py-8" /> : null}

        <article className="docs-prose prose prose-zinc max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mt-14 prose-h2:border-t prose-h2:border-border prose-h2:pt-10 prose-h3:mt-9 prose-p:leading-7 prose-a:font-medium prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:before:content-none prose-code:after:content-none prose-pre:my-7 prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-pre:bg-zinc-950 prose-pre:p-4 prose-pre:text-zinc-100 prose-li:my-1.5 prose-hr:border-border">
          <MDX components={getMDXComponents()} />
        </article>

        <nav
          aria-label="Documentation pagination"
          className="mt-14 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
        >
          {previous ? (
            <Link
              href={previous.href}
              className="group rounded-xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
                Previous
              </span>
              <span className="mt-2 block font-semibold text-foreground">
                {previous.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={next.href}
              className="group rounded-xl border border-border p-4 text-right transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              <span className="flex items-center justify-end gap-1.5 text-xs font-medium text-muted-foreground">
                Next
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="mt-2 block font-semibold text-foreground">
                {next.title}
              </span>
            </Link>
          ) : null}
        </nav>
      </main>

      {toc.length > 0 ? (
        <aside className="hidden xl:block">
          <div className="sticky top-24">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              On this page
            </h2>
            <nav aria-label="On this page">
              <ul className="space-y-2 border-l border-border pl-4">
                {toc.map((item) => (
                  <li key={item.url}>
                    <a
                      href={item.url}
                      className="block text-sm leading-5 text-muted-foreground transition-colors hover:text-primary"
                      style={{
                        paddingLeft: `${Math.max(0, item.depth - 2) * 10}px`,
                      }}
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>
      ) : null}
    </div>
  );
}

export function generateStaticParams() {
  return docsSource.generateParams();
}

export async function generateMetadata({
  params,
}: DocsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = docsSource.getPage(slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: page.url,
    },
    openGraph: {
      title: `${page.data.title} | Squid Agent Docs`,
      description: page.data.description,
      url: page.url,
      type: "article",
    },
  };
}
