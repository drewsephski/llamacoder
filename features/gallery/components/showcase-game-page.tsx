"use client";

import CodeRunner from "@/components/code-runner";
import { Button } from "@/components/ui/button";
import type { ShowcaseGame } from "@/features/gallery/showcase-games/types";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Gamepad2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function ShowcaseGamePage({ game }: { game: ShowcaseGame }) {
  const [didCopy, setDidCopy] = useState(false);

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(game.prompt);
    setDidCopy(true);
    window.setTimeout(() => setDidCopy(false), 1600);
  };

  return (
    <div className="flex min-h-dvh w-full flex-col bg-background lg:h-dvh lg:flex-row lg:overflow-hidden">
      <aside className="flex w-full shrink-0 flex-col border-b border-border bg-background px-5 py-5 lg:w-[360px] lg:border-b-0 lg:border-r">
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
            Squid Arcade showcase
          </div>
          <p className="mt-5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Gamepad2 className="size-3.5" />
            {game.category}
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight">
            {game.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {game.description}
          </p>
        </div>

        <div className="mt-7 border-y border-border py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Controls
          </p>
          <ul className="mt-3 grid gap-2">
            {game.controls.map((control) => (
              <li
                key={control}
                className="flex items-start gap-2 text-sm leading-5 text-foreground/80"
              >
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: game.accent }}
                />
                {control}
              </li>
            ))}
          </ul>
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
              href={`/gallery/${game.slug}/preview`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="size-4" />
              Open game only
            </a>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Build your own app</Link>
          </Button>
        </div>

        <p className="mt-auto hidden pt-6 text-xs leading-5 text-muted-foreground lg:block">
          Runs in the same isolated React preview used by generated projects. No
          game engine or image assets required.
        </p>
      </aside>

      <main className="min-h-[640px] flex-1 bg-slate-950 lg:min-h-0">
        <CodeRunner files={game.files} />
      </main>
    </div>
  );
}
