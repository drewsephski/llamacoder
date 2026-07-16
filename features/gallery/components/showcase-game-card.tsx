import { ArrowUpRight, Gamepad2 } from "lucide-react";
import Link from "next/link";

import { GalleryProjectPreview } from "@/features/gallery/components/gallery-project-preview";
import type { ShowcaseGameSummary } from "@/features/gallery/showcase-games/types";

export function ShowcaseGameCard({ game }: { game: ShowcaseGameSummary }) {
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-background transition-[border-color,box-shadow] duration-200 hover:border-foreground/15 hover:shadow-sm hover:shadow-foreground/[0.025]">
      <Link
        href={`/gallery/${game.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-slate-950">
          <GalleryProjectPreview slug={game.slug} title={game.title} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            <span
              className="size-1.5 rounded-full shadow-[0_0_10px_currentColor]"
              style={{ backgroundColor: game.accent, color: game.accent }}
            />
            Live game
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <Gamepad2 className="size-3.5" />
                {game.category}
              </p>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {game.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {game.description}
              </p>
            </div>
            <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          </div>
        </div>
      </Link>
    </article>
  );
}
