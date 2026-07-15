import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";

type FooterProps = {
  showPageLinks?: boolean;
};

const landingLinks = [
  { href: "/example", label: "Example" },
  { href: "/docs", label: "Docs" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

const Footer = memo(({ showPageLinks = false }: FooterProps) => {
  if (showPageLinks) {
    return (
      <footer className="mt-auto w-full px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-10 sm:px-6 sm:pb-8 sm:pt-16">
        <div className="mx-auto w-full max-w-6xl border-t border-border/70 pt-8 sm:pt-10">
          <p className="max-w-[26ch] text-3xl font-medium leading-[1.05] tracking-[-0.035em] text-foreground sm:text-4xl">
            Research, build, verify, and ship React apps with code you own.
          </p>

          <div className="mt-10 flex flex-col gap-5 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2.5 self-start whitespace-nowrap text-sm font-medium tracking-tight text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Image
                src="/squidagent-logo.svg"
                alt="Squid Agent"
                width={24}
                height={24}
                className="h-6 w-auto"
              />
              Squid Agent
            </Link>

            <nav aria-label="Footer navigation">
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:justify-end">
                {landingLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-auto flex w-full flex-col items-center justify-center gap-3 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 text-center sm:flex-row sm:justify-between sm:gap-4 sm:px-6 sm:pb-6 sm:pt-4 sm:text-left">
      <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-sm sm:justify-start">
        <Image
          src="/squidagent-logo.svg"
          alt="Squid Agent"
          width={24}
          height={24}
          className="h-6 w-auto opacity-90 transition-opacity hover:opacity-100"
        />
        <span className="font-medium tracking-tight text-foreground/80">
          Squid Agent
        </span>
        <span className="text-border">·</span>
        <span className="text-xs text-muted-foreground/60">
          Turn ideas into apps
        </span>
      </div>
      <SocialLinks />
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;

function SocialLinks() {
  return (
    <div className="flex items-center gap-0.5">
      <Link
        href="https://www.instagram.com/drew.sepeczi"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Instagram"
      >
        <Instagram className="h-[15px] w-[15px]" strokeWidth={1.5} />
      </Link>
      <Link
        href="https://github.com/drewsephski"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
        aria-label="GitHub"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
        </svg>
      </Link>
    </div>
  );
}
