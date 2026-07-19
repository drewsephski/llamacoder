"use client";

import Link from "next/link";
import {
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  Copy,
  Grid2X2,
  Layers3,
  ListTodo,
  Menu,
  Monitor,
  PanelLeft,
  Plus,
  RotateCw,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FormEvent, useRef, useState, useSyncExternalStore } from "react";

const backgroundImage =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260611_133301_d5f2a94a-b22e-4e4a-a6b6-eacdddf1f5b0.png&w=1280&q=85";
const grassImage =
  "https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1781191264/grass_eam204.png";

const DESIGN_WIDTH = 896;
const DESIGN_HEIGHT = 590;

const navigation = ["Toolkit", "Plans", "News"] as const;

function QuestlyLogo({ className = "size-6" }: { className?: string }) {
  return (
    <svg
      aria-label="Questly"
      className={className}
      fill="currentColor"
      role="img"
      viewBox="0 0 256 256"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M144 256H27.598L144 139.598V256ZM256 207.5 200 256V56H0L48 0h208v207.5ZM0 204.402V112h92.402L0 204.402Z" />
    </svg>
  );
}

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav
      aria-label="Primary navigation"
      className="questly-fade-down relative z-20 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5 lg:px-10"
    >
      <a
        aria-label="Questly home"
        className="text-gray-900 transition-opacity hover:opacity-70 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/50"
        href="https://squidagent.app"
      >
        <QuestlyLogo className="size-5 sm:size-6" />
      </a>

      <div className="hidden items-center gap-8 md:flex">
        {navigation.map((item) => (
          <a
            className="flex items-center gap-1 text-[13px] text-gray-700 transition-colors hover:text-gray-900 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/40"
            href={`#${item.toLowerCase()}`}
            key={item}
          >
            {item}
            {item === "Toolkit" ? (
              <ChevronDown aria-hidden="true" className="size-3.5" />
            ) : null}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Link
          className="rounded-full bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/50 focus-visible:ring-offset-2 sm:px-5"
          href="https://squidagent.app"
        >
          Get started
        </Link>
        <button
          aria-controls="questly-mobile-menu"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="flex size-9 items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-gray-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/50 md:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          type="button"
        >
          {isMenuOpen ? (
            <X aria-hidden="true" className="size-5" />
          ) : (
            <Menu aria-hidden="true" className="size-5" />
          )}
        </button>
      </div>

      {isMenuOpen ? (
        <div
          className="absolute left-4 right-4 top-full rounded-2xl bg-white/80 px-5 py-3 shadow-lg ring-1 ring-gray-200 backdrop-blur-xl md:hidden"
          id="questly-mobile-menu"
        >
          {navigation.map((item) => (
            <a
              className="block border-b border-gray-200 py-3 text-[15px] text-gray-700 transition-colors last:border-b-0 hover:text-gray-900 focus-visible:outline-none"
              href={`#${item.toLowerCase()}`}
              key={item}
              onClick={() => setIsMenuOpen(false)}
            >
              {item}
            </a>
          ))}
        </div>
      ) : null}
    </nav>
  );
}

function SearchForm() {
  const [query, setQuery] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const signUpUrl = query.trim()
      ? `/sign-up?query=${encodeURIComponent(query.trim())}`
      : "/sign-up";
    window.location.assign(signUpUrl);
  };

  return (
    <form
      aria-label="Find content opportunities"
      className="questly-fade-up mt-5 flex w-full max-w-xl items-center gap-3 rounded-full bg-white/60 py-1.5 pl-5 pr-1.5 shadow-[0_12px_35px_rgba(59,83,45,0.08)] ring-1 ring-gray-200 backdrop-blur-md sm:mt-6"
      onSubmit={handleSubmit}
      style={{ animationDelay: "220ms" }}
    >
      <input
        aria-label="What makes content rank in AI search?"
        className="min-w-0 flex-1 bg-transparent py-2 text-sm text-gray-900 outline-none placeholder:text-gray-500 sm:text-base"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="What makes content rank in AI search?"
        type="search"
        value={query}
      />
      <button
        aria-label="Start with this question"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 active:scale-95 sm:size-10"
        type="submit"
      >
        <ArrowUp aria-hidden="true" className="size-4 sm:size-[18px]" />
      </button>
    </form>
  );
}

function BrowserTitleBar() {
  return (
    <div className="flex items-center gap-3 border-b border-white/5 bg-[#242427] px-4 py-2.5 text-white/40">
      <div className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
      </div>
      <PanelLeft aria-hidden="true" className="size-3.5" />
      <ChevronLeft aria-hidden="true" className="size-3.5" />
      <ChevronRight aria-hidden="true" className="size-3.5 text-white/25" />
      <div className="mx-auto flex min-w-0 items-center gap-2 rounded-md bg-[#1a1a1c] px-6 py-1 text-[10px] text-white/60">
        <Monitor aria-hidden="true" className="size-3" />
        <span className="truncate">questly.ai</span>
      </div>
      <div className="flex shrink-0 items-center gap-3" aria-hidden="true">
        <RotateCw className="size-3.5" />
        <Share2 className="size-3.5" />
        <Plus className="size-3.5" />
        <Copy className="size-3.5" />
      </div>
    </div>
  );
}

const sidebarItems: { icon: LucideIcon; label: string }[] = [
  { icon: Compass, label: "Uncover" },
  { icon: Layers3, label: "Subjects" },
  { icon: ListTodo, label: "Inbox" },
];

function DashboardSidebar() {
  return (
    <aside className="w-[22%] shrink-0 border-r border-white/5 bg-[#1e1e21] px-3 py-3.5 text-white">
      <div className="flex items-center justify-between px-1 pb-4">
        <QuestlyLogo className="size-4 text-white/70" />
        <Grid2X2 aria-hidden="true" className="size-3.5 text-white/30" />
      </div>
      <div className="mb-4 flex items-center gap-2 rounded-md bg-white/[0.04] px-2 py-1.5">
        <span className="flex size-4 items-center justify-center rounded bg-[#e8553f] text-[9px] font-semibold">
          C
        </span>
        <span className="text-[10px] text-white/80">CareNest</span>
        <ChevronDown
          aria-hidden="true"
          className="ml-auto size-3 text-white/30"
        />
      </div>
      <div className="space-y-1">
        {sidebarItems.map(({ icon: Icon, label }) => (
          <div
            className="flex items-center gap-2 rounded-md px-2 py-2 text-[10px] text-white/60"
            key={label}
          >
            <Icon aria-hidden="true" className="size-3.5" />
            {label}
          </div>
        ))}
      </div>
      <div className="mt-7 px-2 text-[8px] uppercase tracking-[0.16em] text-white/25">
        Recent articles
      </div>
      <div className="mt-2 space-y-2.5 px-2">
        {[
          "Choosing a care plan",
          "Safer stairs at home",
          "Mobility aids explained",
        ].map((article) => (
          <div
            className="flex items-start gap-2 text-[9px] leading-tight text-white/50"
            key={article}
          >
            <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-[#28c840]/70" />
            {article}
          </div>
        ))}
      </div>
    </aside>
  );
}

const stats = [
  ["RELEASED", "62", "Posts indexed"],
  ["BREADTH", "12", "Subject groups"],
  ["REMAINING", "412", "Ready to draft"],
  ["MAX REACH", "3,156,200", "Searches a month"],
] as const;

const subjects = ["Elder Care", "Mobility", "Home Safety"] as const;

const drafts = [
  ["How do I choose an elder care plan?", "12.4K", "Medium", "Drafting"],
  ["What mobility aid is right for my parent?", "8.9K", "Easy", "Drafting"],
  ["How can I make stairs safer at home?", "6.2K", "Medium", "Ready"],
  ["When should I update a care plan?", "4.8K", "Hard", "Drafting"],
  ["What belongs in a home safety checklist?", "3.1K", "Easy", "Ready"],
] as const;

function DashboardMain() {
  return (
    <div className="min-w-0 flex-1 bg-[#1a1a1c] px-5 py-5 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-[#e8553f] text-sm font-semibold">
            C
          </span>
          <div>
            <div className="text-sm font-medium text-white">CareNest</div>
            <div className="text-[10px] text-white/45">
              Content visibility workspace
            </div>
          </div>
        </div>
        <button
          className="flex items-center gap-1.5 rounded-md bg-white/90 px-3 py-2 text-[10px] font-medium text-[#1a1a1c]"
          type="button"
        >
          <Sparkles aria-hidden="true" className="size-3" />
          Generate
        </button>
      </div>

      <div className="mt-5 grid grid-cols-4 divide-x divide-white/5 rounded-xl bg-white/[0.03] ring-1 ring-white/5">
        {stats.map(([label, value, detail]) => (
          <div className="min-w-0 px-3 py-3.5 first:pl-4 last:pr-4" key={label}>
            <div className="text-[8px] tracking-wider text-white/35">
              {label}
            </div>
            <div className="mt-1 truncate text-xl font-medium text-white">
              {value}
            </div>
            <div className="mt-0.5 truncate text-[9px] text-white/40">
              {detail}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-[1fr_1.45fr] gap-4">
        <div>
          <div className="mb-2 text-[11px] font-medium text-white/80">
            Subjects
          </div>
          <div className="grid grid-cols-3 gap-2">
            {subjects.map((subject, index) => (
              <div
                className="rounded-lg bg-white/[0.03] px-2.5 py-3 ring-1 ring-white/5"
                key={subject}
              >
                <span
                  className={`mb-4 flex size-5 items-center justify-center rounded-full ${index === 0 ? "bg-[#93c86b]/20 text-[#a9d987]" : index === 1 ? "bg-[#f29b80]/20 text-[#f29b80]" : "bg-[#8bc6bd]/20 text-[#8bc6bd]"}`}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                </span>
                <div className="text-[10px] text-white/80">{subject}</div>
                <div className="mt-2 text-[8px] text-white/35">
                  {index + 7} / {index + 12} articles
                </div>
                <div className="mt-2 h-1 rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${index === 0 ? "w-3/4 bg-[#a9d987]" : index === 1 ? "w-1/2 bg-[#f29b80]" : "w-2/3 bg-[#8bc6bd]"}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-lg bg-white/[0.03] ring-1 ring-white/5">
          <div className="border-b border-white/5 px-3 py-2 text-[11px] font-medium text-white/80">
            Drafting inbox
          </div>
          <div className="grid grid-cols-[1.8fr_0.55fr_0.55fr_0.55fr] gap-2 border-b border-white/5 px-3 py-2 text-[7px] uppercase tracking-wider text-white/30">
            <span>Question</span>
            <span>Volume</span>
            <span>Difficulty</span>
            <span>Status</span>
          </div>
          {drafts.map(([question, volume, difficulty, status]) => (
            <div
              className="grid grid-cols-[1.8fr_0.55fr_0.55fr_0.55fr] gap-2 border-b border-white/5 px-3 py-2 text-[8px] text-white/55 last:border-b-0"
              key={question}
            >
              <span className="truncate">{question}</span>
              <span>{volume}</span>
              <span>{difficulty}</span>
              <span
                className={
                  status === "Drafting"
                    ? "text-[#febc2e]/80"
                    : "text-[#28c840]/70"
                }
              >
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="overflow-hidden rounded-t-2xl bg-[#1a1a1c] text-left shadow-[0_-20px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
      <BrowserTitleBar />
      <div className="flex min-h-[546px]">
        <DashboardSidebar />
        <DashboardMain />
      </div>
    </div>
  );
}

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>) {
  return useSyncExternalStore(
    (onStoreChange) => {
      const element = ref.current;
      if (!element || typeof ResizeObserver === "undefined") {
        return () => undefined;
      }
      const observer = new ResizeObserver(onStoreChange);
      observer.observe(element);
      return () => observer.disconnect();
    },
    () => ref.current?.getBoundingClientRect().width ?? DESIGN_WIDTH,
    () => DESIGN_WIDTH,
  );
}

function ScaledDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useContainerWidth(containerRef);
  const scale = Math.min(1, width / DESIGN_WIDTH);

  return (
    <div
      className="relative mx-auto w-full"
      ref={containerRef}
      style={{ height: `${DESIGN_HEIGHT * scale}px` }}
    >
      <div
        className="absolute top-0"
        style={{
          left: `calc(50% - ${DESIGN_WIDTH / 2}px)`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${DESIGN_WIDTH}px`,
        }}
      >
        <DashboardMockup />
      </div>
    </div>
  );
}

export function QuestlyPage() {
  return (
    <main
      className="questly-page relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-cover bg-center text-gray-900"
      id="questly-hero"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <Navbar />

      <div className="min-h-8 flex-1 shrink-0 sm:min-h-12 lg:min-h-16" />

      <section
        aria-labelledby="questly-title"
        className="relative z-10 flex flex-col items-center px-5 text-center"
      >
        <h1
          className="text-[40px] font-normal leading-[1.05] tracking-tight text-gray-900 min-[400px]:text-[44px] sm:text-6xl lg:text-7xl xl:text-[80px]"
          id="questly-title"
        >
          <span className="questly-fade-up block">Get cited.</span>
          <span
            className="questly-fade-up block"
            style={{ animationDelay: "100ms" }}
          >
            Effortlessly.
          </span>
        </h1>

        <SearchForm />

        <p
          className="questly-fade-up mt-4 max-w-md text-sm leading-relaxed text-gray-600 sm:mt-5 sm:text-base lg:text-lg"
          style={{ animationDelay: "340ms" }}
        >
          Ship articles that answer actual customer questions
          <br />
          -- and be seen on{" "}
          <Sparkles aria-hidden="true" className="-mt-1 inline size-4" />{" "}
          ChatGPT
        </p>

        <div
          className="questly-fade-up mt-4 flex flex-wrap items-center justify-center gap-3 sm:mt-5"
          style={{ animationDelay: "460ms" }}
        >
          <Link
            className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            href="https://squidagent.app"
          >
            Try It Free
          </Link>
          <Link
            className="rounded-full px-6 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-gray-300 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/50 focus-visible:ring-offset-2"
            href="https://drewsepeczi.xyz"
          >
            Talk to sales
          </Link>
        </div>
      </section>

      <div className="min-h-10 flex-1 shrink-0 sm:min-h-12 lg:min-h-16" />

      <div
        className="questly-hero-rise relative z-0 mx-auto -mb-10 w-[92%] max-w-4xl shrink-0 sm:-mb-20 sm:w-[84%] lg:-mb-32 lg:w-[72%]"
        style={{ animationDelay: "620ms" }}
      >
        <ScaledDashboard />
      </div>

      {/* The meadow edge is part of the supplied art direction and sits above the browser mockup. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 z-10 w-full select-none"
        src={grassImage}
      />
    </main>
  );
}
