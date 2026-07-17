import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Github, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResourcesMenu } from "@/components/resources-menu";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-5 px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="Squid Agent home"
        >
          <Image
            src="/squidagent-logo.svg"
            alt=""
            width={28}
            height={28}
            priority
          />
          <span className="hidden whitespace-nowrap font-semibold tracking-tight min-[360px]:inline">
            Squid Agent
          </span>
        </Link>
        <nav
          aria-label="Marketing navigation"
          className="hidden items-center gap-7 md:flex"
        >
          <Link
            href="/gallery"
            className="inline-flex min-h-11 items-center whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Gallery
          </Link>
          <ResourcesMenu />
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <ResourcesMenu align="end" compact className="md:hidden" />
          <Button asChild size="sm" className="rounded-lg">
            <Link href="/" className="whitespace-nowrap">
              <span className="sm:hidden">Build</span>
              <span className="hidden sm:inline">Build with Squid</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/squidagent-logo.svg" alt="" width={28} height={28} />
            <span className="font-semibold tracking-tight">Squid Agent</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
            Generate exportable React apps with visible credit estimates,
            reversible checkpoints, and inspectable quality reports.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <a
              href="https://github.com/drewsephski"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <Github className="size-4" />
            </a>
            <a
              href="https://www.instagram.com/drew.sepeczi"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <Instagram className="size-4" />
            </a>
          </div>
        </div>
        <FooterColumn
          title="Research"
          links={[
            { href: "/compare", label: "AI builder comparisons" },
            { href: "/blog", label: "Blog" },
            { href: "/benchmarks", label: "Benchmarks" },
          ]}
        />
        <FooterColumn
          title="Product"
          links={[
            { href: "/", label: "Build an app" },
            { href: "/gallery", label: "Gallery" },
            { href: "/docs", label: "Documentation" },
            { href: "/dashboard", label: "Dashboard" },
            { href: "/dashboard/usage", label: "Usage ledger" },
            { href: "/contact", label: "Contact" },
          ]}
        />
        <FooterColumn
          title="Legal"
          links={[
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
            { href: "/cookies", label: "Cookies" },
          ]}
        />
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© {new Date().getUTCFullYear()} Squid Agent.</span>
          <span>Product comparisons are updated from primary sources.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <nav aria-label={title}>
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
