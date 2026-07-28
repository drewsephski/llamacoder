"use client";

import Image from "next/image";
import Link from "next/link";

export type ProjectCapability =
  | "Auth"
  | "Stripe"
  | "Database"
  | "API"
  | "Responsive";

export interface ShowcaseProjectCardProps {
  name: string;
  href: string;
  category: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  capabilities?: readonly ProjectCapability[];
  layout?: "grid" | "rail";
}

const capabilityStyles: Record<ProjectCapability, string> = {
  Auth: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  Stripe:
    "border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  Database:
    "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  API: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Responsive:
    "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
};

export function ShowcaseProjectCard({
  name,
  href,
  category,
  description,
  imageSrc,
  imageAlt,
  capabilities = ["Responsive"],
  layout = "grid",
}: ShowcaseProjectCardProps) {
  const isExternal = href.startsWith("http");
  const linkClassName =
    "group showcase-card block min-w-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4";
  const railClassName =
    layout === "rail" ? " snap-start [scroll-snap-stop:always]" : "";

  const content = (
    <>
      <div className="showcase-preview relative aspect-video overflow-hidden rounded-2xl border border-border/80 bg-muted/40 shadow-[0_18px_50px_-38px_rgba(0,0,0,0.7)]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          draggable={false}
          sizes={
            layout === "rail"
              ? "(min-width: 768px) 50vw, 85vw"
              : "(min-width: 768px) 50vw, 100vw"
          }
          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03] motion-reduce:transition-none"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90 group-focus-visible:opacity-90 motion-reduce:transition-none"
          aria-hidden="true"
        />
        {capabilities.length > 0 ? (
          <div
            className="showcase-capabilities pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-1 flex-wrap gap-1.5 p-3 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100"
            aria-label={`${name} capabilities`}
          >
            {capabilities.map((capability) => (
              <span
                key={capability}
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] backdrop-blur-sm ${capabilityStyles[capability]}`}
              >
                {capability}
              </span>
            ))}
          </div>
        ) : null}
        <div
          className="showcase-preview-hint pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:opacity-0"
          aria-hidden="true"
        >
          <span className="rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            Open preview
          </span>
        </div>
      </div>

      <div className="pt-5">
        <p className="text-xs font-medium text-blue-500">{category}</p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            {name}
          </h3>
          <span
            className="relative mr-2 mt-1 h-5 w-14 shrink-0 text-muted-foreground transition-colors duration-300 group-hover:text-foreground motion-reduce:transition-none"
            aria-hidden="true"
          >
            <span className="absolute left-0 top-1/2 h-px w-8 -translate-y-1/2 bg-current transition-[width,height] duration-300 ease-out group-hover:h-0.5 group-hover:w-12 motion-reduce:transition-none" />
            <span className="absolute left-6 top-1/2 size-2 -translate-y-1/2 rotate-45 border-r border-t border-current transition-[left,width,height,border-width] duration-300 ease-out group-hover:left-[2.625rem] group-hover:size-2.5 group-hover:border-r-2 group-hover:border-t-2 motion-reduce:transition-none" />
          </span>
        </div>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`${linkClassName}${railClassName}`}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={`${linkClassName}${railClassName}`}>
      {content}
    </Link>
  );
}
