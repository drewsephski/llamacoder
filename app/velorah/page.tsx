import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-velorah-body",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-velorah-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Velorah — Where dreams rise through the silence",
  description:
    "Velorah designs digital spaces for deep thinkers, bold creators, and quiet rebels.",
};

const navigation = ["Home", "Studio", "About", "Journal", "Reach Us"] as const;

function GlassLink({
  children,
  className = "",
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
}) {
  return (
    <a
      className={`liquid-glass inline-flex items-center justify-center rounded-full text-foreground transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${className}`}
      href={href}
    >
      <span className="relative z-[1]">{children}</span>
    </a>
  );
}

export default function VelorahPage() {
  return (
    <main
      className={`${inter.variable} ${instrumentSerif.variable} velorah-page relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-background text-foreground`}
    >
      <video
        aria-hidden="true"
        autoPlay
        className="absolute inset-0 z-0 h-full w-full object-cover"
        loop
        muted
        playsInline
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
        tabIndex={-1}
      />

      <nav
        aria-label="Primary navigation"
        className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-8"
      >
        <a
          className="shrink-0 text-3xl tracking-tight text-foreground transition-opacity hover:opacity-80 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70"
          href="https://squidagent.app"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Velorah<sup className="text-xs">®</sup>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {navigation.map((item, index) => (
            <a
              className={`text-sm transition-colors focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70 ${index === 0 ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
              key={item}
            >
              {item}
            </a>
          ))}
        </div>

        <GlassLink className="px-5 py-2.5 text-sm sm:px-6" href="#journey">
          Begin Journey
        </GlassLink>
      </nav>

      <section
        aria-labelledby="velorah-hero-title"
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-[90px] text-center"
        id="home"
      >
        <h1
          className="animate-fade-rise max-w-7xl text-5xl font-normal leading-[0.95] tracking-[-2.46px] text-foreground sm:text-7xl md:text-8xl"
          id="velorah-hero-title"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="block">
            Where <em className="not-italic text-muted-foreground">dreams</em>{" "}
            rise
          </span>
          <span className="block">
            <em className="not-italic text-muted-foreground">
              through the silence.
            </em>
          </span>
        </h1>

        <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          We&apos;re designing tools for deep thinkers, bold creators, and quiet
          rebels. Amid the chaos, we build digital spaces for sharp focus and
          inspired work.
        </p>

        <div className="animate-fade-rise-delay-2 mt-12" id="journey">
          <GlassLink
            className="cursor-pointer px-14 py-5 text-base"
            href="#studio"
          >
            Begin Journey
          </GlassLink>
        </div>
      </section>
    </main>
  );
}
