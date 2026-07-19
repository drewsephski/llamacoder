"use client";

import {
  ArrowUpRight,
  Compass,
  Instagram,
  Linkedin,
  Menu,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_120549_0cd82c36-56b3-4dd9-b190-069cfc3a623f.mp4";
const MISSION_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4";
const SOLUTION_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_125119_8e5ae31c-0021-4396-bc08-f7aebeb877a2.mp4";
const CTA_STREAM =
  "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

const navItems = [
  ["Home", "#home"],
  ["How It Works", "#how-it-works"],
  ["Philosophy", "#philosophy"],
  ["Use Cases", "#use-cases"],
] as const;

const features = [
  {
    title: "Curated Feed",
    description: "Find ideas worth keeping, without the constant scroll.",
    icon: Search,
  },
  {
    title: "Writer Tools",
    description: "Write, publish, and grow without giving up your voice.",
    icon: Sparkles,
  },
  {
    title: "Community",
    description: "Meet people who care about the same questions you do.",
    icon: Users,
  },
  {
    title: "Distribution",
    description: "Reach the right readers through a fair, open network.",
    icon: ArrowUpRight,
  },
] as const;

function LogoMark({ size = "default" }: { size?: "default" | "large" }) {
  const outer = size === "large" ? "h-10 w-10" : "h-7 w-7";
  const inner = size === "large" ? "h-5 w-5" : "h-3 w-3";

  return (
    <span aria-hidden="true" className={`mindloop-logo ${outer}`}>
      <span className={inner} />
    </span>
  );
}

function GlassButton({
  children,
  className = "",
  href,
  onClick,
  ariaLabel,
  type = "button",
}: {
  ariaLabel?: string;
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const classes = `mindloop-glass relative inline-flex items-center justify-center rounded-full text-foreground transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${className}`;

  if (href) {
    return (
      <a className={classes} href={href} onClick={onClick}>
        <span className="relative z-[1]">{children}</span>
      </a>
    );
  }

  return (
    <button aria-label={ariaLabel} className={classes} onClick={onClick} type={type === "submit" ? "submit" : "button"}>
      <span className="relative z-[1]">{children}</span>
    </button>
  );
}

function SocialLink({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      aria-label={label}
      className="mindloop-glass relative flex h-10 w-10 items-center justify-center rounded-full text-white/65 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      href="#footer"
    >
      <span className="relative z-[1]">{children}</span>
    </a>
  );
}

function MonochromeAvatar({ variant }: { variant: number }) {
  const face = ["#c8c8c8", "#8d8d8d", "#f0f0f0"][variant];

  return (
    <svg
      aria-hidden="true"
      className="h-8 w-8 rounded-full bg-neutral-800"
      viewBox="0 0 32 32"
    >
      <circle cx="16" cy="16" fill="#171717" r="16" />
      <circle cx="16" cy="13" fill={face} r="5.5" />
      <path d="M7.5 29c.9-6.1 4-9.1 8.5-9.1s7.6 3 8.5 9.1" fill={face} />
      <path d="M11 11.7c.8-3.4 2.5-5 5.1-5 2.9 0 4.4 1.7 4.9 4.9-1.4-.9-3.2-1.4-5.3-1.4-1.8 0-3.4.5-4.7 1.5Z" fill="#555" />
    </svg>
  );
}

function PlatformGlyph({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex h-32 w-32 items-center justify-center rounded-full border border-white/15 bg-white/[0.025] text-white/75 transition-colors duration-500 group-hover:border-white/35 group-hover:text-white sm:h-40 sm:w-40">
      <Icon aria-hidden="true" className="h-12 w-12" strokeWidth={1.2} />
    </div>
  );
}

function RevealLine({
  words,
  highlighted,
  className,
}: {
  words: string[];
  highlighted: string[];
  className: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 82%", "end 35%"],
  });

  return (
    <p className={className} ref={ref}>
      {words.map((word, index) => {
        return (
          <RevealWord
            key={`${word}-${index}`}
            progress={scrollYProgress}
            range={[index / words.length, (index + 1) / words.length]}
            highlighted={highlighted.includes(word.replace(/[—.,]/g, ""))}
          >{word}{" "}</RevealWord>
        );
      })}
    </p>
  );
}

function RevealWord({
  children,
  highlighted,
  progress,
  range,
}: {
  children: React.ReactNode;
  highlighted: boolean;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.16, 1]);

  return (
    <motion.span className={highlighted ? "text-white" : "text-[#d9d9d9]"} style={{ opacity }}>
      {children}
    </motion.span>
  );
}

function HlsVideo({ className }: { className: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let hls: import("hls.js").default | undefined;
    let cancelled = false;

    void import("hls.js").then(({ default: Hls }) => {
      if (cancelled || !videoRef.current) return;

      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(CTA_STREAM);
        hls.attachMedia(videoRef.current);
      } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
        videoRef.current.src = CTA_STREAM;
      }
    });

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, []);

  return (
    <video
      aria-hidden="true"
      autoPlay
      className={className}
      loop
      muted
      playsInline
      ref={videoRef}
      tabIndex={-1}
    />
  );
}

export default function MindloopPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  function handleSubscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setIsSubscribed(true);
  }

  return (
    <main className="mindloop-page min-h-screen overflow-hidden bg-black font-sans text-white selection:bg-white selection:text-black">
      <nav
        aria-label="Primary navigation"
        className="fixed left-0 top-0 z-50 w-full px-4 py-4 sm:px-8 md:px-28"
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          <a
            className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            href="https://squidagent.app"
          >
            <LogoMark />
            Mindloop
          </a>

          <div className="hidden items-center gap-4 text-xs text-white/55 md:flex">
            {navItems.map(([label, href], index) => (
              <span className="flex items-center gap-4" key={label}>
                {index > 0 && <span aria-hidden="true">•</span>}
                <a
                  className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  href={href}
                >
                  {label}
                </a>
              </span>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <SocialLink label="Mindloop on X">
              <span className="text-sm leading-none">𝕏</span>
            </SocialLink>
            <SocialLink label="Mindloop on LinkedIn">
              <Linkedin aria-hidden="true" className="h-4 w-4" />
            </SocialLink>
            <SocialLink label="Mindloop on Instagram">
              <Instagram aria-hidden="true" className="h-4 w-4" />
            </SocialLink>
          </div>

          <GlassButton
            ariaLabel={isMenuOpen ? "Close navigation" : "Open navigation"}
            className="h-10 w-10 md:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </GlassButton>
        </div>

        {isMenuOpen && (
          <div className="mindloop-glass mt-3 flex flex-col gap-1 rounded-2xl p-3 md:hidden">
            {navItems.map(([label, href]) => (
              <a
                className="rounded-xl px-4 py-3 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                href={href}
                key={label}
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </nav>

      <section
        aria-labelledby="mindloop-hero-title"
        className="relative flex min-h-[100svh] items-center justify-center px-6 pb-20 pt-28 text-center sm:px-10"
        id="home"
      >
        <video
          aria-hidden="true"
          autoPlay
          className="absolute inset-0 h-full w-full object-cover opacity-75"
          loop
          muted
          playsInline
          src={HERO_VIDEO}
          tabIndex={-1}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black to-transparent" />

        <motion.div className="relative z-10 flex w-full max-w-5xl flex-col items-center" {...fadeUp(0)}>
          <div className="mb-6 flex items-center gap-2 text-xs text-white/65 sm:text-sm">
            <div className="flex -space-x-2">
              {[0, 1, 2].map((variant) => (
                <MonochromeAvatar key={variant} variant={variant} />
              ))}
            </div>
            <span>7,000+ people already subscribed</span>
          </div>

          <h1
            className="max-w-5xl text-[clamp(3.25rem,9vw,8rem)] font-medium leading-[0.9] tracking-[-0.07em] text-white"
            id="mindloop-hero-title"
          >
            Get <em className="mindloop-serif font-normal tracking-[-0.05em]">Inspired</em> with Us
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-[#f2f2f2] sm:text-lg">
            Join our feed for meaningful updates, news around technology and a shared journey toward depth and direction.
          </p>

          <form
            className="mindloop-glass mt-9 flex w-full max-w-lg items-center rounded-full p-2"
            onSubmit={handleSubscribe}
          >
            <label className="sr-only" htmlFor="mindloop-email">
              Email address
            </label>
            <input
              className="relative z-[1] min-w-0 flex-1 bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/45"
              id="mindloop-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
              type="email"
              value={email}
            />
            <motion.button
              className="relative z-[1] shrink-0 rounded-full bg-white px-5 py-3 text-[10px] font-semibold tracking-[0.15em] text-black sm:px-8"
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubscribed ? "YOU’RE IN" : "SUBSCRIBE"}
            </motion.button>
          </form>
          <p aria-live="polite" className="mt-3 min-h-5 text-xs text-white/60">
            {isSubscribed ? "Welcome to the loop — check your inbox soon." : ""}
          </p>
        </motion.div>
      </section>

      <motion.section
        aria-labelledby="search-title"
        className="px-6 pb-8 pt-48 sm:px-10 md:pb-12 md:pt-64"
        id="how-it-works"
        {...fadeUp(0)}
      >
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-[clamp(2.75rem,7vw,7rem)] font-medium leading-[0.92] tracking-[-0.065em]" id="search-title">
            Search has <em className="mindloop-serif font-normal">changed.</em> Have you?
          </h2>
          <p className="mx-auto mb-20 mt-7 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg">
            The way we find ideas is changing. The way we choose what matters should change with it.
          </p>

          <div className="grid gap-14 sm:grid-cols-3 sm:gap-8">
            {[
              ["Open Platforms", "Search is no longer neutral. We built an open platform for ideas worth finding.", Search],
              ["Open Knowledge", "Writers shape the future. We give them the tools, not the algorithms.", Compass],
              ["Open Community", "Communities build meaning. We connect minds, not just content.", Users],
            ].map(([title, description, icon], index) => {
              const Icon = icon as LucideIcon;
              return (
                <motion.article className="group flex flex-col items-center text-center sm:items-start sm:text-left" key={title as string} {...fadeUp(index * 0.1)}>
                  <PlatformGlyph icon={Icon} />
                  <h3 className="mt-6 text-base font-semibold">{title as string}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/50">{description as string}</p>
                </motion.article>
              );
            })}
          </div>

          <p className="mt-20 text-center text-sm text-white/40">If you don&apos;t answer the questions, someone else will.</p>
        </div>
      </motion.section>

      <section className="px-6 pb-32 pt-28 sm:px-10 md:pb-44 md:pt-36" id="philosophy">
        <div className="mx-auto max-w-5xl">
          <motion.div className="relative mx-auto aspect-square max-w-[800px] overflow-hidden rounded-2xl border border-white/15" {...fadeUp(0)}>
            <video
              aria-hidden="true"
              autoPlay
              className="absolute inset-0 h-full w-full object-cover opacity-80"
              loop
              muted
              playsInline
              src={MISSION_VIDEO}
              tabIndex={-1}
            />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-x-6 bottom-6 h-1/3 bg-gradient-to-t from-black/40 to-transparent sm:inset-x-12" />
          </motion.div>

          <div className="mx-auto mt-20 max-w-4xl">
            <RevealLine
              className="text-2xl font-medium leading-[1.06] tracking-[-0.035em] sm:text-4xl lg:text-5xl"
              highlighted={["curiosity", "meets", "clarity"]}
              words={"We're building a space where curiosity meets clarity — where readers find depth, writers find reach, and every newsletter becomes a conversation worth having.".split(" ")}
            />
            <RevealLine
              className="mt-10 text-xl font-medium leading-[1.1] tracking-[-0.025em] sm:text-2xl lg:text-3xl"
              highlighted={[]}
              words={"A platform where content, community, and insight flow together — with less noise, less friction, and more meaning for everyone involved.".split(" ")}
            />
          </div>
        </div>
      </section>

      <section className="border-t border-white/15 px-6 py-32 sm:px-10 md:py-44" id="use-cases">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp(0)}>
            <p className="text-xs font-medium tracking-[0.28em] text-white/45">SOLUTION</p>
            <h2 className="mt-5 max-w-4xl text-4xl font-medium leading-[0.98] tracking-[-0.055em] sm:text-6xl">
              The platform for <em className="mindloop-serif font-normal">meaningful</em> content
            </h2>
          </motion.div>

          <motion.div className="mt-14 aspect-[3/1] overflow-hidden rounded-2xl border border-white/15" {...fadeUp(0.1)}>
            <video
              aria-label="Abstract monochrome motion study"
              autoPlay
              className="h-full w-full object-cover"
              loop
              muted
              playsInline
              src={SOLUTION_VIDEO}
            />
          </motion.div>

          <div className="mt-16 grid gap-12 md:grid-cols-4 md:gap-8">
            {features.map(({ title, description, icon: Icon }, index) => (
              <motion.article className="border-l border-white/20 pl-5" key={title} {...fadeUp(index * 0.08)}>
                <Icon aria-hidden="true" className="mb-7 h-5 w-5 text-white/70" strokeWidth={1.5} />
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/50">{description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-t border-white/15 px-6 py-32 sm:px-10 md:py-44" id="start">
        <HlsVideo className="absolute inset-0 z-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 z-[1] bg-black/55" />
        <motion.div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center" {...fadeUp(0)}>
          <LogoMark size="large" />
          <h2 className="mt-8 text-5xl font-medium tracking-[-0.065em] sm:text-7xl">
            Start Your <em className="mindloop-serif font-normal">Journey</em>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/55">
            Make space for the ideas that move you — and the people who understand why.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <a className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3.5 text-sm font-medium text-black transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70" href="https://squidagent.app">
              Build with Squid
            </a>
            <GlassButton className="rounded-lg px-8 py-3.5 text-sm" href="#use-cases">
              Start Writing
            </GlassButton>
          </div>
        </motion.div>
      </section>

      <footer className="flex flex-col gap-5 px-6 py-12 text-sm text-white/45 sm:px-10 md:flex-row md:items-center md:justify-between md:px-28" id="footer">
        <p>© 2026 Mindloop. All rights reserved.</p>
        <div className="flex gap-6">
          <a className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70" href="https://squidagent.app">Squid Agent</a>
          <a className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70" href="https://drewsepeczi.xyz">Drew&apos;s portfolio</a>
          <a className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70" href="https://drewsepeczi.xyz">Contact</a>
        </div>
      </footer>

      <style jsx global>{`
        .mindloop-page {
          --mindloop-muted: rgba(255, 255, 255, 0.55);
          color-scheme: dark;
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        }

        .mindloop-page .mindloop-serif {
          font-family: "Instrument Serif", Iowan Old Style, Georgia, serif;
          font-style: italic;
        }

        .mindloop-page .mindloop-logo {
          position: relative;
          display: inline-flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(255, 255, 255, 0.65);
          border-radius: 9999px;
        }

        .mindloop-page .mindloop-logo > span {
          display: block;
          border: 1px solid rgba(255, 255, 255, 0.65);
          border-radius: 9999px;
        }

        .mindloop-page .mindloop-glass {
          overflow: hidden;
          border: 0;
          background: rgba(255, 255, 255, 0.01);
          background-blend-mode: luminosity;
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
          position: relative;
          -webkit-backdrop-filter: blur(4px);
          backdrop-filter: blur(4px);
        }

        .mindloop-page .mindloop-glass::before {
          content: "";
          position: absolute;
          inset: 0;
          padding: 1.4px;
          border-radius: inherit;
          pointer-events: none;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.15) 20%, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0) 60%, rgba(255, 255, 255, 0.15) 80%, rgba(255, 255, 255, 0.45) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        @media (prefers-reduced-motion: reduce) {
          .mindloop-page *,
          .mindloop-page *::before,
          .mindloop-page *::after {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </main>
  );
}
