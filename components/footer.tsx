import { memo } from "react";
import Link from "next/link";
import Image from "next/image";

const Footer = memo(() => {
  return (
    <footer className="mt-auto flex w-full items-center justify-between gap-4 px-6 pb-6 pt-4">
      <div className="flex items-center gap-2.5 text-sm">
        <Image
          src="/squidcoder-logo.svg"
          alt="Squid Coder"
          width={24}
          height={24}
          className="h-6 w-auto opacity-90 transition-opacity hover:opacity-100"
        />
        <span className="font-medium tracking-tight text-foreground/80">
          Squid Coder
        </span>
        <span className="text-border">·</span>
        <span className="text-xs text-muted-foreground/60">
          Turn ideas into apps
        </span>
      </div>
      <div className="flex items-center gap-0.5">
        <Link
          href="https://x.com/drewsepeczi"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
          aria-label="X (Twitter)"
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
            <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
            <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
          </svg>
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
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
