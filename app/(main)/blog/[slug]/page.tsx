import { notFound } from "next/navigation";
import Link from "next/link";
import {
  blogPages,
  marketingMetadata,
  type MarketingPage,
} from "@/lib/marketing-pages";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = blogPages.find((candidate) => candidate.slug === slug);
  if (!page) return {};
  return marketingMetadata(page);
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params;
  const page = blogPages.find((candidate) => candidate.slug === slug);
  if (!page) notFound();

  return <MarketingArticle page={page} />;
}

function MarketingArticle({ page }: { page: MarketingPage }) {
  return (
    <main className="min-h-screen bg-background">
      <article className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16 lg:px-8">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Squid
        </Link>
        <header className="space-y-5">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            {page.h1}
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            {page.intro}
          </p>
        </header>
        <div className="space-y-10">
          {page.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-semibold tracking-tight">
                {section.title}
              </h2>
              <p className="mt-3 leading-8 text-muted-foreground">
                {section.body}
              </p>
              {section.points && (
                <ul className="mt-5 grid gap-2 text-muted-foreground">
                  {section.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">Try the workflow</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Squid shows estimated credits before generation and keeps the output
            exportable after generation.
          </p>
          <Button asChild className="mt-5">
            <Link href="/">{page.cta}</Link>
          </Button>
        </div>
      </article>
    </main>
  );
}
