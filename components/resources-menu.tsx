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
  FileText,
  LifeBuoy,
  Scale,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const resourceLinks = [
  {
    href: "/docs",
    label: "Documentation",
    description: "Product guides and reference",
    icon: FileText,
  },
  {
    href: "/blog",
    label: "Blog",
    description: "Practical guides for generated React",
    icon: BookOpen,
  },
  {
    href: "/compare",
    label: "Comparisons",
    description: "Squid and other AI app builders",
    icon: Scale,
  },
  {
    href: "/benchmarks",
    label: "Benchmarks",
    description: "Transparent screenshot-to-React tests",
    icon: BarChart3,
  },
  {
    href: "/contact",
    label: "Support",
    description: "Get help or send feedback",
    icon: LifeBuoy,
  },
] as const;

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
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
      onFocusCapture={() => {
        cancelClose();
        setOpen(true);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
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
                    onClick={() => setOpen(false)}
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
}: {
  onNavigate?: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-2">
      <p className="px-2 pb-1 pt-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Resources
      </p>
      <nav aria-label="Resources">
        <ul className="grid grid-cols-2 gap-1">
          {resourceLinks.map((link) => {
            const Icon = link.icon;

            return (
              <li key={link.href} className="min-w-0">
                <Link
                  href={link.href}
                  onClick={onNavigate}
                  className="flex min-h-12 items-center gap-2 whitespace-nowrap rounded-lg px-2.5 text-sm font-medium text-foreground transition-[background-color,transform] duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary active:translate-y-px motion-reduce:transition-colors"
                >
                  <Icon
                    className="size-4 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
