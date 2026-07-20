"use client";

import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  PanelsTopLeft,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import CodeRunner from "@/components/code-runner";
import { Button } from "@/components/ui/button";
import type { ShowcaseLanding } from "@/features/gallery/showcase-landings/types";

export function ShowcaseLandingPage({ landing }: { landing: ShowcaseLanding }) {
  const [didCopy, setDidCopy] = useState(false);

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(landing.prompt);
    setDidCopy(true);
    window.setTimeout(() => setDidCopy(false), 1600);
  };

  return (
    <div className="min-h-dvh w-full bg-background">
      <aside className="flex w-full shrink-0 flex-col border-b border-border bg-background px-5 py-5 lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:h-dvh lg:w-[360px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <Link
          href="/gallery"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to gallery
        </Link>

        <div className="mt-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3" />
            Landing page showcase
          </div>
          <p className="mt-5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <PanelsTopLeft className="size-3.5" />
            {landing.category}
          </p>
          <h1
            className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight"
            style={{ color: landing.accent }}
          >
            {landing.title}
          </h1>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Distinct theme landing concept
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {landing.description}
          </p>
        </div>

        <div className="mt-7 border-y border-border py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Design intent
          </p>
          <ul className="mt-3 grid gap-2">
            {landing.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-2 rounded-md border border-dashed border-border px-2.5 py-2 text-sm leading-5 text-foreground/80"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full" style={{ backgroundColor: landing.accent }} />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 rounded-xl border border-dashed border-border bg-muted/45 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Built to copy
          </p>
          <p className="mt-2 text-sm leading-6 text-foreground/80">
            Use the generated prompt below as your starting brief. It targets real
            interaction behavior, not UI chrome.
          </p>
        </div>

        <div className="mt-5 grid gap-2">
          <Button onClick={copyPrompt}>
            {didCopy ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            {didCopy ? "Prompt copied" : "Copy the build prompt"}
          </Button>
          <Button asChild variant="outline">
            <a
              href={`/gallery/${landing.slug}/preview`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="size-4" />
              Open page only
            </a>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Build your own app</Link>
          </Button>
        </div>

        <p className="mt-auto hidden pt-6 text-xs leading-5 text-muted-foreground lg:block">
          A fictional product concept rendered in the same isolated React
          preview used by generated projects.
        </p>
      </aside>

      <div className="w-full lg:pl-[360px]">
        <main className="h-dvh min-h-[720px] w-full min-w-0 overflow-hidden bg-muted">
          <CodeRunner files={landing.files} />
        </main>
      </div>
    </div>
  );
}
