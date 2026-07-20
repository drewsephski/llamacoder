import { ArrowUpRight, PanelsTopLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { ShowcaseLandingSummary } from "@/features/gallery/showcase-landings/types";

export function ShowcaseLandingCard({
  landing,
}: {
  landing: ShowcaseLandingSummary;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border/80 bg-background shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-lg hover:shadow-foreground/[0.12]">
      <Link
        href={`/gallery/${landing.slug}`}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`Open ${landing.title} landing page`}
      >
        <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-muted">
          <Image
            src={landing.thumbnailUrl}
            alt={`Preview of ${landing.title}`}
            fill
            unoptimized
            loading="eager"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-top"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
          <span
            className="pointer-events-none absolute inset-x-2 top-3 inline-block w-fit rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/90 backdrop-blur-lg"
            style={{
              color: landing.accent,
              borderColor: landing.accent,
            }}
          >
            {landing.category}
          </span>
          <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            <span
              className="size-1.5 rounded-full shadow-[0_0_10px_currentColor]"
              style={{ backgroundColor: landing.accent, color: landing.accent }}
            />
            Live page
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p
                className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                style={{ borderColor: landing.accent }}
              >
                <PanelsTopLeft className="size-3.5" />
                Theme
              </p>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {landing.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {landing.description}
              </p>
            </div>
            <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/90 bg-background text-muted-foreground transition-colors duration-200 group-hover:border-foreground/30 group-hover:bg-foreground/5 group-hover:text-foreground">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
