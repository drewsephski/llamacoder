"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Clock, Link as LinkIcon, Menu, X } from "lucide-react";
import {
  ChromaFlow,
  FilmGrain,
  FlutedGlass,
  Shader,
  Swirl,
} from "shaders/react";

const londonTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  timeZone: "Europe/London",
});

const images = {
  small:
    "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090123_74be96d4-9c1b-40cf-932a-96f4f4babed3.png&w=1280&q=85",
  large:
    "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090133_c157d30b-a99a-4477-bec1-a446149ec3f2.png&w=1280&q=85",
} as const;

const projects = [
  {
    title: "Narrativ",
    description:
      "Winner of Site of the Month 2025 - an interactive 3D showcase driving record engagement",
    video:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260516_122702_390f5305-8719-41d5-ae80-d23ab3796c28.mp4",
    action: "Learn more",
  },
  {
    title: "Luminar",
    description:
      "Transforming a dated platform into a conversion-focused brand experience",
    video:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260516_123323_f909c2b8-ff6c-4edf-882b-8ebcdbe389b5.mp4",
    action: "View case study",
  },
] as const;

function AxionShader() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
      <Shader
        className="absolute inset-0 h-full w-full"
        disableTelemetry
        style={{ position: "absolute", inset: 0 }}
      >
        <Swirl colorA="#ffffff" colorB="#f0f0f0" detail={1.7} speed={0.45} />
        <ChromaFlow
          baseColor="#ffffff"
          downColor="#ff5f03"
          leftColor="#ff5f03"
          momentum={13}
          radius={3.5}
          rightColor="#ff5f03"
          upColor="#ff5f03"
        />
        <FlutedGlass
          aberration={0.61}
          angle={31}
          frequency={8}
          highlight={0.12}
          highlightSoftness={0}
          lightAngle={-90}
          refraction={4}
          shape="rounded"
          softness={1}
          speed={0.15}
        />
        <FilmGrain strength={0.05} />
      </Shader>
    </div>
  );
}

function PartnerMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0 fill-current text-[#E8704E] sm:size-6"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m19.6 66.5 19.7-11 .3-1-.3-.5h-1l-3.3-.2-11.2-.3L14 53l-9.5-.5-2.4-.5L0 49l.2-1.5 2-1.3 2.9.2 6.3.5 9.5.6 6.9.4L38 49.1h1.6l.2-.7-.5-.4-.4-.4L29 41l-10.6-7-5.6-4.1-3-2-1.5-2-.6-4.2 2.7-3 3.7.3.9.2 3.7 2.9 8 6.1L37 36l1.5 1.2.6-.4.1-.3-.7-1.1L33 25l-6-10.4-2.7-4.3-.7-2.6c-.3-1-.4-2-.4-3l3-4.2L28 0l4.2.6L33.8 2l2.6 6 4.1 9.3L47 29.9l2 3.8 1 3.4.3 1h.7v-.5l.5-7.2 1-8.7 1-11.2.3-3.2 1.6-3.8 3-2L61 2.6l2 2.9-.3 1.8-1.1 7.7L59 27.1l-1.5 8.2h.9l1-1.1 4.1-5.4 6.9-8.6 3-3.5L77 13l2.3-1.8h4.3l3.1 4.7-1.4 4.9-4.4 5.6-3.7 4.7-5.3 7.1-3.2 5.7.3.4h.7l12-2.6 6.4-1.1 7.6-1.3 3.5 1.6.4 1.6-1.4 3.4-8.2 2-9.6 2-14.3 3.3-.2.1.2.3 6.4.6 2.8.2h6.8l12.6 1 3.3 2 1.9 2.7-.3 2-5.1 2.6-6.8-1.6-16-3.8-5.4-1.3h-.8v.4l4.6 4.5 8.3 7.5L89 80.1l.5 2.4-1.3 2-1.4-.2-9.2-7-3.6-3-8-6.8h-.5v.7l1.8 2.7 9.8 14.7.5 4.5-.7 1.4-2.6 1-2.7-.6-5.8-8-6-9-4.7-8.2-.5.4-2.9 30.2-1.3 1.5-3 1.2-2.5-2-1.4-3 1.4-6.2 1.6-8 1.3-6.4 1.2-7.9.7-2.6v-.2H49L43 72l-9 12.3-7.2 7.6-1.7.7-3-1.5.3-2.8L24 86l10-12.8 6-7.9 4-4.6-.1-.5h-.3L17.2 77.4l-4.7.6-2-2 .2-3 1-1 8-5.5Z" />
    </svg>
  );
}

function RollText({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative flex h-5 flex-col overflow-hidden">
      <span className="block transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-5 motion-reduce:transition-none">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="block transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-5 motion-reduce:transition-none"
      >
        {children}
      </span>
    </span>
  );
}

function ArrowButton({
  children,
  className,
  href,
  label,
}: {
  children: React.ReactNode;
  className: string;
  href: string;
  label: string;
}) {
  return (
    <a
      aria-label={label}
      className={`group inline-flex items-center justify-between gap-4 rounded-full pl-5 pr-2 py-2 text-[13px] font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 sm:pl-6 ${className}`}
      href={href}
    >
      <RollText>{children}</RollText>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white sm:size-8">
        <ArrowRight
          aria-hidden="true"
          className="text-[#F26522] transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45 motion-reduce:transition-none"
          size={16}
          strokeWidth={1.8}
        />
      </span>
    </a>
  );
}

function LondonTime() {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const updateTime = () => setTime(londonTimeFormatter.format(new Date()));
    updateTime();
    const interval = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap text-[13px] text-gray-600">
      <Clock aria-hidden="true" size={14} strokeWidth={1.7} />
      {time} in London
    </span>
  );
}

function PrimaryNav({
  onMenuToggle,
  open,
}: {
  onMenuToggle: () => void;
  open: boolean;
}) {
  return (
    <nav
      aria-label="Primary navigation"
      className="relative z-20 mx-auto flex w-full max-w-[1440px] items-center p-2 sm:p-3"
    >
      <div className="flex w-full items-center justify-between rounded-full bg-white p-1.5 sm:p-2">
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            aria-label="Axion Studio home"
            className="flex size-9 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold tracking-tight text-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 sm:size-10 sm:text-[11px]"
            href="https://squidagent.app"
          >
            AX
          </a>
          <div className="hidden items-center gap-6 md:flex">
            {[
              ["Projects", "#projects"],
              ["Studio", "#about"],
              ["Journal", "#projects"],
              ["Connect", "#about"],
            ].map(([label, href]) => (
              <a
                className="text-sm text-gray-900 transition-colors duration-300 hover:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                href={href}
                key={label}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-5 lg:flex">
          <span className="text-[13px] text-gray-600">Taking on projects for Q1 2026</span>
          <LondonTime />
          <a
            className="group inline-flex items-center gap-3 rounded-full bg-gray-900 pl-5 pr-2 py-2 text-[13px] font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            href="#about"
          >
            <RollText>Book a strategy call</RollText>
            <span className="flex size-6 items-center justify-center rounded-full bg-white">
              <ArrowRight
                aria-hidden="true"
                className="text-gray-900 transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45 motion-reduce:transition-none"
                size={13}
                strokeWidth={1.8}
              />
            </span>
          </a>
        </div>

        <button
          aria-controls="axion-mobile-menu"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 md:hidden"
          onClick={onMenuToggle}
          type="button"
        >
          {open ? "Close" : "Menu"}
          {open ? <X aria-hidden="true" size={15} /> : <Menu aria-hidden="true" size={15} />}
        </button>
      </div>
    </nav>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-500 md:hidden ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      id="axion-mobile-menu"
      onClick={onClose}
    >
      <div
        aria-label="Mobile navigation"
        className={`absolute inset-x-3 bottom-3 rounded-2xl bg-white p-5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:p-6 ${open ? "translate-y-0" : "translate-y-[calc(100%+1rem)]"}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-center justify-between">
          <LondonTime />
          <button
            aria-label="Close menu"
            className="flex size-9 items-center justify-center rounded-full bg-gray-900 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={16} />
          </button>
        </div>
        <div className="mt-10 flex flex-col gap-4">
          {["Projects", "Studio", "Journal", "Connect"].map((label) => (
            <a
              className="text-[28px] font-medium leading-8 tracking-[-0.04em] text-gray-900"
              href={label === "Projects" ? "#projects" : "#about"}
              key={label}
              onClick={onClose}
            >
              {label}
            </a>
          ))}
        </div>
        <ArrowButton className="mt-10 w-full bg-[#F26522] text-white" href="#about" label="Start a project">
          Start a project
        </ArrowButton>
      </div>
    </div>
  );
}

function Hero({ onMenuToggle, menuOpen }: { onMenuToggle: () => void; menuOpen: boolean }) {
  return (
    <section
      aria-labelledby="axion-hero-title"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#EFEFEF]"
      id="top"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[#EFEFEF]" />
      <AxionShader />
      <PrimaryNav onMenuToggle={onMenuToggle} open={menuOpen} />
      <div className="relative z-20 flex flex-1 flex-col justify-end px-5 pb-14 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20">
        <div className="mx-auto w-full max-w-[1440px]">
          <p className="mb-5 text-[13px] tracking-wide text-gray-900 sm:mb-8 sm:text-sm">Axion Studio</p>
          <h1
            className="max-w-[1120px] text-[clamp(1.75rem,7vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 sm:text-[clamp(2.5rem,5vw,4.2rem)]"
            id="axion-hero-title"
          >
            We craft digital experiences
            <br className="hidden sm:block" /> <span className="sm:hidden"> </span>
            for brands ready to dominate
            <br className="hidden sm:block" /> <span className="sm:hidden"> </span>
            their category online.
          </h1>
          <div className="mt-8 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:items-center sm:gap-5">
            <ArrowButton className="w-fit bg-[#F26522] text-white" href="#about" label="Start a project">
              Start a project
            </ArrowButton>
            <a
              className="inline-flex w-fit items-center gap-2 rounded-[4px] bg-white px-3 py-2.5 text-[13px] font-medium text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              href="#about"
            >
              <PartnerMark />
              Certified Partner
              <span className="rounded bg-gray-900 px-1.5 py-0.5 text-[10px] leading-none text-white sm:px-2 sm:text-[11px]">Featured</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionBadge({ label, number }: { label: string; number: string }) {
  return (
    <div className="mb-6 flex items-center gap-3 sm:mb-8">
      <span className="flex size-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold leading-none text-white sm:size-7 sm:text-xs">
        {number}
      </span>
      <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium sm:px-4 sm:py-1.5 sm:text-[13px]">
        {label}
      </span>
    </div>
  );
}

function About() {
  return (
    <section className="overflow-hidden bg-white pb-12 pt-16 sm:pb-16 sm:pt-20 lg:pb-24 lg:pt-32" id="about">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <SectionBadge label="Introducing Axion" number="1" />
        <h2 className="mb-12 max-w-[1000px] text-[clamp(1.5rem,4vw,3.2rem)] font-medium leading-[1.12] tracking-[-0.02em] text-gray-900 sm:mb-16 lg:mb-28">
          Strategy-led creatives, delivering
          <br className="hidden sm:block" /> results in digital and beyond.
        </h2>

        <div className="lg:hidden">
          <div className="mb-10 flex flex-col items-start gap-7 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-md text-[15px] font-medium leading-[1.6] text-gray-900">
              Through research, creative thinking and iteration we help growing brands realize their digital full potential.
            </p>
            <ArrowButton className="bg-[#F26522] text-white" href="#projects" label="About our studio">
              About our studio
            </ArrowButton>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
            <img alt="Axion Studio creative work" className="aspect-[438/346] w-full rounded-xl object-cover sm:w-[45%] sm:rounded-2xl" src={images.small} />
            <img alt="Axion Studio digital experience" className="aspect-[3/2] w-full rounded-xl object-cover sm:w-[55%] sm:rounded-2xl" src={images.large} />
          </div>
        </div>

        <div className="hidden grid-cols-[26%_1fr_48%] items-end gap-6 lg:grid xl:gap-8">
          <img alt="Axion Studio creative work" className="aspect-[438/346] w-full rounded-2xl object-cover" src={images.small} />
          <div className="flex h-full flex-col justify-end gap-7 pb-1">
            <p className="whitespace-nowrap text-base font-medium leading-[1.65] text-gray-900">
              Through research, creative thinking and iteration
              <br /> we help growing brands realize their digital
              <br /> full potential.
            </p>
            <ArrowButton className="w-fit bg-[#F26522] text-white" href="#projects" label="About our studio">
              About our studio
            </ArrowButton>
          </div>
          <img alt="Axion Studio digital experience" className="aspect-[3/2] w-full rounded-2xl object-cover" src={images.large} />
        </div>
      </div>
    </section>
  );
}

function ProjectAction({ dark, label }: { dark: boolean; label: string }) {
  return (
    <span
      className={`absolute bottom-4 left-4 flex h-9 w-9 items-center overflow-hidden rounded-full transition-all duration-300 ease-in-out ${dark ? "bg-gray-900 text-white group-hover:w-[168px]" : "bg-white text-gray-900 group-hover:w-[148px]"}`}
    >
      <span className="flex min-w-9 items-center justify-center">
        {dark ? <ArrowRight aria-hidden="true" className="-rotate-45 transition-transform duration-300 group-hover:rotate-0" size={14} /> : <LinkIcon aria-hidden="true" className="-rotate-45 transition-transform duration-300 group-hover:rotate-0" size={14} />}
      </span>
      <span className="whitespace-nowrap pr-4 text-[13px] font-medium opacity-0 transition-opacity delay-100 duration-300 group-hover:opacity-100">{label}</span>
    </span>
  );
}

function Projects() {
  return (
    <section className="bg-[#F5F5F5] pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-28" id="projects">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <SectionBadge label="Featured client work" number="2" />
        <h2 className="mb-10 text-[clamp(1.75rem,7vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 sm:mb-14 sm:text-[clamp(2.5rem,5vw,4.2rem)] lg:mb-16">
          Our projects
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:gap-7">
          {projects.map((project, index) => (
            <article key={project.title}>
              <div className={`group relative cursor-pointer overflow-hidden rounded-2xl ${index === 0 ? "aspect-[329/246] bg-[#1a1d2e]" : "aspect-square bg-[#6b6b6b]"}`}>
                <video
                  aria-label={`${project.title} case study preview`}
                  autoPlay
                  className="h-full w-full object-cover"
                  loop
                  muted
                  playsInline
                  src={project.video}
                />
                <ProjectAction dark={index === 1} label={project.action} />
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-gray-600 sm:text-sm">{project.description}</p>
              <h3 className="mt-1 text-sm font-semibold text-gray-900 sm:text-[15px]">{project.title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AxionStudioPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <main className="axion-studio-page min-h-screen bg-white text-gray-900 antialiased">
      <Hero menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />
      <About />
      <Projects />
      <MobileMenu onClose={() => setMenuOpen(false)} open={menuOpen} />
    </main>
  );
}
