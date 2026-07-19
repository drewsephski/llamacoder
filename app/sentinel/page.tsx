"use client";

import { lazy, Suspense } from "react";

import { Button } from "@/components/ui/button";

const Spline = lazy(() => import("@splinetool/react-spline"));

const sceneUrl = "https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode";

const navigation = [
  "Services",
  "About Us",
  "Projects",
  "Team",
  "Contacts",
] as const;

type SentinelTheme = React.CSSProperties & Record<`--${string}`, string>;

const sentinelTheme: SentinelTheme = {
  "--background": "0 0% 10%",
  "--foreground": "0 0% 96%",
  "--primary": "119 99% 46%",
  "--primary-foreground": "0 0% 4%",
  "--secondary": "0 0% 18%",
  "--secondary-foreground": "0 0% 96%",
  "--muted": "0 0% 16%",
  "--muted-foreground": "0 0% 60%",
  "--accent": "119 99% 46%",
  "--accent-foreground": "0 0% 4%",
  "--destructive": "0 84% 60%",
  "--border": "0 0% 20%",
  "--input": "0 0% 20%",
  "--ring": "119 99% 46%",
  "--radius": "0.5rem",
  "--nav-button": "0 0% 18%",
  "--hero-bg": "0 0% 8%",
};

function SentinelMark() {
  return (
    <span
      aria-hidden="true"
      className="relative inline-flex size-5 items-center justify-center"
    >
      <span className="absolute size-3 rounded-full border border-primary" />
      <span className="size-1.5 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]" />
    </span>
  );
}

function SentinelNavbar() {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 sm:px-8 lg:px-16"
    >
      <a
        className="group flex items-center gap-2 text-xl font-semibold tracking-[-0.04em] text-foreground transition-opacity hover:opacity-80 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        href="https://squidagent.app"
      >
        <SentinelMark />
        SENTINEL
      </a>

      <div className="hidden items-center gap-8 md:flex">
        {navigation.map((item) => (
          <a
            className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
            key={item}
          >
            {item}
          </a>
        ))}
      </div>

      <Button
        className="hidden rounded-lg px-6 text-xs uppercase tracking-[0.2em] md:inline-flex"
        onClick={() => {
          window.location.href = "/contact";
        }}
        size="lg"
        variant="navCta"
      >
        Get Quote
      </Button>
    </nav>
  );
}

function SentinelHero() {
  return (
    <section
      aria-labelledby="sentinel-hero-title"
      className="relative flex min-h-[100svh] items-end overflow-hidden bg-hero-bg"
      id="top"
    >
      <div aria-hidden="true" className="absolute inset-0">
        <Suspense fallback={<div className="absolute inset-0 bg-hero-bg" />}>
          <Spline className="h-full w-full" scene={sceneUrl} />
        </Suspense>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-black/30"
      />

      <div className="pointer-events-none relative z-10 w-full max-w-[90%] px-6 pb-10 pt-32 sm:max-w-md md:px-10 md:pb-10 lg:max-w-2xl">
        <div
          className="animate-fade-up opacity-0"
          style={{ animationDelay: "0.2s" }}
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-primary">
            Security, implemented correctly
          </p>
          <h1
            className="mb-2 text-[clamp(3rem,8vw,6rem)] font-bold uppercase leading-[1.05] tracking-[-0.05em] text-foreground md:mb-4"
            id="sentinel-hero-title"
          >
            SENTINEL<span className="text-primary"> AI</span>
          </h1>
        </div>

        <p
          className="mb-3 animate-fade-up text-[clamp(1.125rem,2.5vw,1.875rem)] font-light leading-tight text-foreground/80 opacity-0 md:mb-6"
          style={{ animationDelay: "0.4s" }}
        >
          We implement security correctly.
        </p>

        <p
          className="mb-4 max-w-xl animate-fade-up text-[clamp(0.875rem,1.5vw,1.25rem)] font-light leading-relaxed text-muted-foreground opacity-0 md:mb-8"
          style={{ animationDelay: "0.55s" }}
        >
          Enterprise security systems built in days. AI-powered surveillance
          deployed with zero-trust architecture. Smart access control set up for
          your entire facility. All of it done right, not just fast.
        </p>

        <div
          className="flex animate-fade-up flex-wrap gap-3 font-bold opacity-0"
          style={{ animationDelay: "0.7s" }}
        >
          <button
            className="pointer-events-auto cursor-pointer rounded-sm bg-primary px-6 py-3 text-sm text-primary-foreground transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-hero-bg active:scale-[0.97] md:px-8 md:py-4"
            onClick={() => {
              window.location.href = "/contact";
            }}
            type="button"
          >
            Book a Call
          </button>
          <button
            className="pointer-events-auto cursor-pointer rounded-sm bg-white px-6 py-3 text-sm text-background transition-all hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-hero-bg active:scale-[0.97] md:px-8 md:py-4"
            onClick={() => {
              window.location.hash = "projects";
            }}
            type="button"
          >
            Our Work
          </button>
        </div>

        <p
          className="mt-4 animate-fade-up text-xs font-light text-muted-foreground/60 opacity-0 md:mt-6"
          style={{ animationDelay: "0.85s" }}
        >
          Trusted security partner. Columbus, OH. 12 systems deployed.
        </p>
      </div>
    </section>
  );
}

export default function SentinelPage() {
  return (
    <main
      className="sentinel-page relative min-h-[100svh] bg-hero-bg font-sora text-foreground antialiased"
      style={sentinelTheme}
    >
      <SentinelNavbar />
      <SentinelHero />
    </main>
  );
}
