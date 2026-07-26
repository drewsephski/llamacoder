/* Hallmark · component: resources dropdown · genre: modern-minimal · theme: existing Squid token system
 * states: default · hover · focus · active · open · reduced-motion
 * contrast: existing background, foreground, muted, and primary token pairs
 */
"use client";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ChevronDown,
  DatabaseZap,
  FileText,
  Info,
  LifeBuoy,
  Search,
  Scale,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ResourceLink = {
  href: string;
  label: string;
  shortLabel?: string;
  description: string;
  icon: LucideIcon;
};

export const resourceLinks: ResourceLink[] = [
  {
    href: "/search",
    label: "Search",
    shortLabel: "Search",
    description: "Find guides, docs, comparisons, and examples",
    icon: Search,
  },
  {
    href: "/docs",
    label: "Documentation",
    shortLabel: "Docs",
    description: "Product guides and reference",
    icon: FileText,
  },
  {
    href: "/blog",
    label: "Blog",
    shortLabel: "Blog",
    description: "Practical guides for generated React",
    icon: BookOpen,
  },
  {
    href: "/compare",
    label: "Comparisons",
    shortLabel: "Compare",
    description: "Squid vs other AI app builders",
    icon: Scale,
  },
  {
    href: "/benchmarks",
    label: "Benchmarks",
    shortLabel: "Benchmarks",
    description: "Transparent screenshot-to-React tests",
    icon: BarChart3,
  },
  {
    href: "/supabase",
    label: "Supabase walkthrough",
    shortLabel: "Supabase",
    description: "OAuth, RLS, and backend verification",
    icon: DatabaseZap,
  },
  {
    href: "/what-is-squid-agent",
    label: "What is Squid Agent?",
    shortLabel: "About",
    description: "Disambiguation and product identity overview",
    icon: Info,
  },
  {
    href: "/contact",
    label: "Support",
    shortLabel: "Help",
    description: "Get help or send feedback",
    icon: LifeBuoy,
  },
];

type ResourcesMenuProps = {
  align?: "center" | "end";
  className?: string;
  compact?: boolean;
};

export function ResourcesMenu({
  align = "center",
  className,
  compact = false,
}: ResourcesMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinnedOpen = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    if (pinnedOpen.current) return;
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          pinnedOpen.current = false;
          setOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          pinnedOpen.current = false;
          setOpen(false);
          triggerRef.current?.focus();
        }

        if (event.key === "ArrowDown" && event.target === triggerRef.current) {
          event.preventDefault();
          setOpen(true);
          requestAnimationFrame(() => firstLinkRef.current?.focus());
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          cancelClose();
          pinnedOpen.current = !pinnedOpen.current;
          setOpen(pinnedOpen.current);
        }}
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-sm font-medium text-muted-foreground transition-[background-color,color,transform] duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:translate-y-px motion-reduce:transition-colors",
          compact && "size-11 gap-0 px-0 sm:w-auto sm:px-3",
        )}
      >
        {compact ? (
          <BookOpen className="size-4 sm:hidden" aria-hidden="true" />
        ) : null}
        <span className={cn(compact && "hidden sm:inline")}>Resources</span>
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
            compact && "hidden sm:block",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
        {compact ? <span className="sr-only sm:hidden">Resources</span> : null}
      </button>

      <div
        id={panelId}
        className={cn(
          "absolute top-full z-50 mt-3 w-[min(27rem,calc(100vw-2rem))] rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-xl shadow-foreground/10 transition-[opacity,transform] duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] motion-reduce:translate-y-0 motion-reduce:transition-opacity",
          compact
            ? "fixed inset-x-4 top-16 mt-2 w-auto"
            : align === "end"
              ? "right-0"
              : "left-1/2 -translate-x-1/2",
          open
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-1 opacity-0",
        )}
      >
        <div className="px-3 pb-2 pt-2">
          <p className="text-sm font-semibold tracking-tight">Explore Squid</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Learn, compare, and get help.
          </p>
        </div>
        <nav aria-label="Resources">
          <ul className="space-y-0.5">
            {resourceLinks.map((link, index) => {
              const Icon = link.icon;

              return (
                <li key={link.href}>
                  <Link
                    ref={index === 0 ? firstLinkRef : undefined}
                    href={link.href}
                    onClick={() => {
                      pinnedOpen.current = false;
                      setOpen(false);
                    }}
                    className="group flex min-h-14 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-[background-color,transform] duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary active:translate-y-px motion-reduce:transition-colors"
                  >
                    <Icon
                      className="size-4 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-primary group-focus-visible:text-primary motion-reduce:transition-none"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block whitespace-nowrap text-sm font-medium text-foreground">
                        {link.label}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                        {link.description}
                      </span>
                    </span>
                    <ArrowRight
                      className="size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export function MobileResourcesList({
  onNavigate,
  compact = false,
}: {
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const links = (
    <nav aria-label="Mobile resources">
      <ul className={cn("grid", compact ? "gap-1 p-1.5 pt-0" : "gap-2 p-2")}>
        {resourceLinks.map((link) => {
          const Icon = link.icon;

          return (
            <li key={link.href} className="min-w-0">
              <Link
                href={link.href}
                onClick={onNavigate}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg text-left text-sm font-medium text-foreground transition-[background-color,transform] duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary active:scale-[0.99] motion-reduce:transition-colors",
                  compact ? "min-h-11 px-2.5 py-1.5" : "min-h-12 px-3 py-2",
                )}
                aria-label={link.label}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-sm ring-1 ring-border/70">
                  <Icon
                    className="size-3.5"
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                </span>
                <span className="min-w-0 truncate">
                  {link.shortLabel ?? link.label}
                </span>
                <ArrowRight
                  className="ml-auto size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  if (!compact) {
    return (
      <div className="rounded-xl border border-border bg-muted/30">
        <p className="px-4 pb-1 pt-3 text-xs font-semibold text-muted-foreground">
          Resources
        </p>
        {links}
      </div>
    );
  }

  return (
    <details className="group rounded-xl border border-border/80 bg-muted/35 open:bg-muted/50">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
        <BookOpen className="size-4 text-primary" strokeWidth={1.9} />
        <span>Resources</span>
        <span className="ml-auto text-xs font-medium text-muted-foreground">
          {resourceLinks.length}
        </span>
        <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      {links}
    </details>
  );
}
