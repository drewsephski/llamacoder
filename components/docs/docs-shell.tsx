import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnimatedThemeToggleButton } from "@/components/ui/animated-theme-toggle-button";
import { DocsMobileNavigation } from "@/components/docs/docs-mobile-navigation";
import { DocsNavigation } from "@/components/docs/docs-navigation";
import { DocsSearch } from "@/components/docs/docs-search";
import type { DocsNavSection } from "@/lib/docs/navigation";

export function DocsShell({
  children,
  sections,
}: {
  children: ReactNode;
  sections: DocsNavSection[];
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-4 sm:px-6">
          <DocsMobileNavigation sections={sections} />
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
            aria-label="Squid Agent home"
          >
            <Image
              src="/squidagent-logo.svg"
              alt=""
              width={28}
              height={28}
              priority
            />
            <span className="hidden font-semibold tracking-tight sm:inline">
              Squid Agent
            </span>
          </Link>
          <span className="hidden h-5 w-px bg-border sm:block" />
          <Link
            href="/docs"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Docs
          </Link>
          <Link
            href="/gallery"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline"
          >
            Gallery
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <DocsSearch />
            <AnimatedThemeToggleButton
              variant="horizontal"
              className="flex size-10 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-muted"
              aria-label="Toggle color theme"
            />
            <Link
              href="/"
              className="hidden h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 md:flex"
            >
              Build an app
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] overflow-y-auto border-r border-border px-5 py-8 lg:block">
          <DocsNavigation sections={sections} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
