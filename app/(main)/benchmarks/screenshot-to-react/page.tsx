import Link from "next/link";
import { Button } from "@/components/ui/button";
import { benchmarkPage, marketingMetadata } from "@/lib/marketing-pages";
import type { Metadata } from "next";

export const metadata: Metadata = marketingMetadata(benchmarkPage);

export default function ScreenshotToReactBenchmarkPage() {
  return (
    <main className="min-h-screen bg-background">
      <article className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-16 lg:px-8">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Squid
        </Link>
        <header className="space-y-5">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            {benchmarkPage.h1}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            {benchmarkPage.intro}
          </p>
        </header>
        <div className="grid gap-5">
          {benchmarkPage.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <h2 className="text-xl font-semibold tracking-tight">
                {section.title}
              </h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                {section.body}
              </p>
              {section.points && (
                <ul className="mt-5 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  {section.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
        <Button asChild className="self-start">
          <Link href="/">{benchmarkPage.cta}</Link>
        </Button>
      </article>
    </main>
  );
}
