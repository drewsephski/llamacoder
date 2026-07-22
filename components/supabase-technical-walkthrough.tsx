"use client";

import {
  ArrowDown,
  ArrowRight,
  Check,
  CircleDot,
  CloudCog,
  DatabaseZap,
  KeyRound,
  LockKeyhole,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  SquareTerminal,
  UserCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type ControlPlane = "user" | "squid" | "supabase" | "generated-app";

type WalkthroughStep = {
  id: string;
  label: string;
  title: string;
  summary: string;
  event: string;
  activePlanes: ControlPlane[];
  log: Array<{ key: string; value: string; tone?: "good" | "warn" }>;
  allowed: string;
  blocked: string;
};

const walkthroughSteps: WalkthroughStep[] = [
  {
    id: "intent",
    label: "Intent",
    title: "Detect the backend before writing code",
    summary:
      "Squid recognizes that accounts, shared records, or durable state require a real backend. Generation pauses before the model can improvise local-only persistence.",
    event: "persistence.preflight",
    activePlanes: ["user", "squid"],
    log: [
      { key: "intent.detected", value: "true", tone: "good" },
      { key: "recommendation", value: "require_database" },
      { key: "generation", value: "held", tone: "warn" },
    ],
    allowed: "The user can connect Supabase or choose a frontend-only build.",
    blocked: "The agent cannot silently replace persistence with local state.",
  },
  {
    id: "connect",
    label: "Connect",
    title: "Authorize the control plane",
    summary:
      "The user connects an existing Supabase organization or starts project provisioning. OAuth tokens remain encrypted on Squid's server.",
    event: "supabase.oauth.connected",
    activePlanes: ["user", "squid", "supabase"],
    log: [
      { key: "oauth.pkce", value: "enabled", tone: "good" },
      { key: "binding.status", value: "provisioning" },
      { key: "browser.token", value: "never exposed", tone: "good" },
    ],
    allowed:
      "Squid can inspect the organizations and projects the user approved.",
    blocked: "The generated application never receives a Management API token.",
  },
  {
    id: "capabilities",
    label: "Probe",
    title: "Measure capabilities instead of assuming them",
    summary:
      "Squid records the Supabase project and independently checks project, database, secret, and Auth capabilities before enabling privileged operations.",
    event: "supabase.capabilities.checked",
    activePlanes: ["squid", "supabase"],
    log: [
      { key: "projects.read", value: "verified", tone: "good" },
      { key: "database.write", value: "verified", tone: "good" },
      { key: "auth.write", value: "verified", tone: "good" },
    ],
    allowed: "The server can prepare a bounded, non-destructive backend plan.",
    blocked: "An expired or underscoped connection cannot continue as healthy.",
  },
  {
    id: "approve",
    label: "Approve",
    title: "Put a person in front of database changes",
    summary:
      "Squid presents the exact backend plan and checksum. The server refuses SQL execution unless the approval belongs to the current user and bound project.",
    event: "supabase.backend.approved",
    activePlanes: ["user", "squid"],
    log: [
      { key: "template", value: "authenticated_tasks@1" },
      { key: "destructive", value: "false", tone: "good" },
      { key: "approval", value: "explicit", tone: "good" },
    ],
    allowed: "The approved migration can run once against the bound project.",
    blocked:
      "The model cannot execute arbitrary SQL or switch project targets.",
  },
  {
    id: "verify",
    label: "Verify",
    title: "Read the database back",
    summary:
      "After applying the migration, Squid queries the resulting database shape. It checks columns, constraints, grants, RLS, ownership policies, and anonymous access.",
    event: "supabase.backend.verified",
    activePlanes: ["squid", "supabase"],
    log: [
      { key: "row_level_security", value: "true", tone: "good" },
      { key: "ownership_policies", value: "4 / 4", tone: "good" },
      { key: "anon_access", value: "revoked", tone: "good" },
    ],
    allowed: "Verified facts become generation context.",
    blocked:
      "A successful API response alone does not count as a working backend.",
  },
  {
    id: "generate",
    label: "Generate",
    title: "Give the app the minimum safe surface",
    summary:
      "Only after verification does generation resume. The app imports Squid's protected Supabase adapter and receives a project URL plus browser-safe publishable key.",
    event: "generation.backend.ready",
    activePlanes: ["squid", "generated-app"],
    log: [
      { key: "client.import", value: "@/lib/supabase" },
      { key: "publishable_key", value: "validated", tone: "good" },
      { key: "service_role", value: "absent", tone: "good" },
    ],
    allowed: "The generated app can use Auth and CRUD through verified RLS.",
    blocked:
      "The model cannot overwrite the adapter or export privileged secrets.",
  },
];

const planeDetails: Array<{
  id: ControlPlane;
  label: string;
  location: string;
  icon: LucideIcon;
}> = [
  { id: "user", label: "User approval", location: "Browser", icon: UserCheck },
  {
    id: "squid",
    label: "Squid control plane",
    location: "Server",
    icon: CloudCog,
  },
  {
    id: "supabase",
    label: "Supabase project",
    location: "Management + Postgres",
    icon: DatabaseZap,
  },
  {
    id: "generated-app",
    label: "Generated app",
    location: "Browser-safe runtime",
    icon: SquareTerminal,
  },
];

const verificationChecks = [
  ["Table", "public.tasks exists"],
  ["Shape", "Columns + constraints match"],
  ["RLS", "Enabled on the table"],
  ["Grants", "Authenticated CRUD only"],
  ["Policies", "Four ownership rules"],
  ["Anon", "Direct access revoked"],
] as const;

function StepMarker({
  active,
  complete,
}: {
  active: boolean;
  complete: boolean;
}) {
  if (complete) {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-[#1167ff] text-white">
        <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
      </span>
    );
  }

  return (
    <span
      className={`flex size-6 items-center justify-center rounded-full border transition-colors ${
        active
          ? "border-[#1167ff] bg-[#e8f0ff] text-[#1167ff] dark:bg-[#0b2b5f]"
          : "border-[#c7d2e0] bg-white text-[#738198] dark:border-[#26384b] dark:bg-[#0d1824] dark:text-[#7890aa]"
      }`}
    >
      <CircleDot className="size-3" aria-hidden="true" />
    </span>
  );
}

function StatusValue({
  value,
  tone,
}: {
  value: string;
  tone?: "good" | "warn";
}) {
  return (
    <span
      className={
        tone === "good"
          ? "text-[#14935f] dark:text-[#53daa2]"
          : tone === "warn"
            ? "text-[#a65a00] dark:text-[#f4b562]"
            : "text-[#173457] dark:text-[#c8d9ed]"
      }
    >
      {value}
    </span>
  );
}

export function SupabaseTechnicalWalkthrough() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const transcriptRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);
    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!isPlaying || reducedMotion) return;

    const timer = window.setTimeout(() => {
      if (activeIndex === walkthroughSteps.length - 1) {
        setIsPlaying(false);
        return;
      }
      setActiveIndex((current) => current + 1);
    }, 2800);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isPlaying, reducedMotion]);

  const activeStep = walkthroughSteps[activeIndex];

  const startWalkthrough = () => {
    setActiveIndex(0);
    setIsPlaying(!reducedMotion);
    transcriptRef.current?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f4f7fb] font-['Aeonik'] text-[#13233a] selection:bg-[#b9d0ff] dark:bg-[#07111b] dark:text-[#edf4fc]">
      <main>
        <section className="relative overflow-hidden border-b border-[#cdd8e5] dark:border-[#203244]">
          <div
            className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-25"
            aria-hidden="true"
            style={{
              backgroundImage:
                "linear-gradient(#dce5f0 1px, transparent 1px), linear-gradient(90deg, #dce5f0 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage:
                "linear-gradient(to bottom, black 0%, black 72%, transparent 100%)",
            }}
          />
          <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:px-10 lg:py-24">
            <div>
              <div className="inline-flex items-center gap-2 border border-[#b9c8d9] bg-white/75 px-3 py-1.5 font-['Aeonik_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#50647c] shadow-sm backdrop-blur dark:border-[#2b4055] dark:bg-[#0c1926]/80 dark:text-[#98acc1]">
                <span className="size-1.5 rounded-full bg-[#3ecf8e] shadow-[0_0_0_4px_rgba(62,207,142,0.14)]" />
                Squid × Supabase · implementation walkthrough
              </div>
              <h1 className="mt-8 max-w-4xl text-balance text-[clamp(3.25rem,8vw,7.25rem)] font-medium leading-[0.86] tracking-[-0.067em]">
                Generated code is not a backend.
              </h1>
              <p className="mt-8 max-w-2xl text-pretty text-lg leading-8 text-[#52657c] dark:text-[#9fb1c4] sm:text-xl sm:leading-9">
                Squid holds database-backed generation until a real Supabase
                project is connected, approved, and read back as verified. This
                walkthrough shows the control plane, the trust boundary, and the
                receipt that unlocks generation.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={startWalkthrough}
                  className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#1167ff] px-5 text-sm font-semibold text-white shadow-[0_12px_30px_-14px_rgba(17,103,255,0.9)] transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[#0058ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1167ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f7fb] motion-reduce:transform-none dark:focus-visible:ring-offset-[#07111b]"
                >
                  <Play className="size-4 fill-current" aria-hidden="true" />
                  Run the walkthrough
                  <span className="font-['Aeonik_Mono'] text-[10px] font-normal uppercase tracking-[0.12em] text-white/70">
                    6 stages
                  </span>
                </button>
                <a
                  href="#trust-boundary"
                  className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#b9c8d9] bg-white/70 px-5 text-sm font-semibold text-[#203550] transition-colors hover:border-[#1167ff] hover:text-[#1167ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1167ff] focus-visible:ring-offset-2 dark:border-[#2b4055] dark:bg-[#0b1825]/70 dark:text-[#dce8f6]"
                >
                  Inspect the trust boundary
                  <ArrowDown className="size-4" aria-hidden="true" />
                </a>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#cdd8e5] pt-5 font-['Aeonik_Mono'] text-[10px] uppercase tracking-[0.14em] text-[#61758d] dark:border-[#203244] dark:text-[#849bb2]">
                <span className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#14935f]" /> Source
                  implemented
                </span>
                <span className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#14935f]" /> Focused tests
                </span>
                <span className="flex items-center gap-2">
                  <CircleDot className="size-3.5 text-[#b36a0d]" /> Live
                  provider run pending
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 bg-[#1167ff]/10 blur-3xl dark:bg-[#1167ff]/15" />
              <div className="relative border border-[#aebfd1] bg-[#0a1522] p-1 shadow-[0_28px_80px_-38px_rgba(11,39,77,0.6)] dark:border-[#31465c]">
                <div className="flex items-center justify-between border-b border-[#26394d] px-4 py-3 font-['Aeonik_Mono'] text-[10px] uppercase tracking-[0.14em] text-[#86a0bb]">
                  <span>Backend readiness transcript</span>
                  <span className="flex items-center gap-2 text-[#51d9a0]">
                    <span className="size-1.5 rounded-full bg-current" />
                    gate active
                  </span>
                </div>
                <div className="space-y-4 p-4 font-['Aeonik_Mono'] text-xs sm:p-5">
                  <p className="text-[#6f89a5]">
                    <span className="text-[#51d9a0]">$</span> squid inspect
                    --backend supabase
                  </p>
                  <div className="space-y-3 border-l border-[#2c435a] pl-4">
                    <p className="flex items-start gap-3 text-[#c7d7e8]">
                      <span className="text-[#5b99ff]">01</span>
                      persistence intent requires shared records
                    </p>
                    <p className="flex items-start gap-3 text-[#c7d7e8]">
                      <span className="text-[#5b99ff]">02</span>
                      management authorization isolated server-side
                    </p>
                    <p className="flex items-start gap-3 text-[#c7d7e8]">
                      <span className="text-[#5b99ff]">03</span>
                      database plan approved by project owner
                    </p>
                    <p className="flex items-start gap-3 text-[#c7d7e8]">
                      <span className="text-[#5b99ff]">04</span>
                      schema + RLS read back from Postgres
                    </p>
                    <p className="flex items-start gap-3 text-[#51d9a0]">
                      <span>✓</span>
                      browser runtime receives publishable surface only
                    </p>
                  </div>
                  <div className="border border-[#244936] bg-[#0f2b21] px-4 py-3 text-[#79e3b8]">
                    generation.backend = verified
                  </div>
                  <p className="text-[#6f89a5]">
                    privileged credentials exported:{" "}
                    <span className="text-[#ffb26a]">0</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          ref={transcriptRef}
          id="walkthrough"
          className="scroll-mt-20 border-b border-[#cdd8e5] dark:border-[#203244]"
        >
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
            <div className="flex flex-col gap-5 border-b border-[#cdd8e5] pb-8 dark:border-[#203244] lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="font-['Aeonik_Mono'] text-[11px] uppercase tracking-[0.16em] text-[#1167ff] dark:text-[#66a0ff]">
                  Control plane · six state transitions
                </p>
                <h2 className="mt-4 max-w-3xl text-balance text-3xl font-medium tracking-[-0.04em] sm:text-5xl">
                  Watch generation earn access to the backend.
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveIndex(0);
                    setIsPlaying(!reducedMotion);
                  }}
                  className="inline-flex min-h-11 items-center gap-2 border border-[#b9c8d9] bg-white px-4 text-sm font-semibold transition-colors hover:border-[#1167ff] hover:text-[#1167ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1167ff] dark:border-[#2b4055] dark:bg-[#0b1825]"
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                  Replay
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlaying((current) => !current)}
                  disabled={
                    reducedMotion || activeIndex === walkthroughSteps.length - 1
                  }
                  className="inline-flex min-h-11 items-center gap-2 bg-[#13233a] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#263c59] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1167ff] disabled:cursor-not-allowed disabled:opacity-45 dark:bg-[#dce8f6] dark:text-[#0a1522]"
                >
                  {isPlaying ? (
                    <Pause
                      className="size-3.5 fill-current"
                      aria-hidden="true"
                    />
                  ) : (
                    <Play
                      className="size-3.5 fill-current"
                      aria-hidden="true"
                    />
                  )}
                  {isPlaying ? "Pause" : "Continue"}
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)]">
              <ol aria-label="Walkthrough stages" className="space-y-1">
                {walkthroughSteps.map((step, index) => {
                  const active = index === activeIndex;
                  const complete = index < activeIndex;
                  return (
                    <li key={step.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveIndex(index);
                          setIsPlaying(false);
                        }}
                        aria-current={active ? "step" : undefined}
                        className={`group flex min-h-16 w-full items-center gap-3 border-l-2 px-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1167ff] ${
                          active
                            ? "border-[#1167ff] bg-[#e8f0ff] dark:bg-[#0b2545]"
                            : "border-transparent hover:border-[#9db8dd] hover:bg-white/70 dark:hover:bg-[#0b1825]"
                        }`}
                      >
                        <StepMarker active={active} complete={complete} />
                        <span>
                          <span className="block font-['Aeonik_Mono'] text-[9px] uppercase tracking-[0.14em] text-[#738198] dark:text-[#8298af]">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="mt-0.5 block text-sm font-semibold">
                            {step.label}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="min-w-0 border border-[#b9c8d9] bg-white shadow-[0_24px_70px_-44px_rgba(28,65,112,0.7)] dark:border-[#2b4055] dark:bg-[#0b1825]">
                <div className="grid gap-px bg-[#cbd6e2] dark:bg-[#263a4e] xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
                  <div className="bg-white p-6 dark:bg-[#0b1825] sm:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-['Aeonik_Mono'] text-[10px] uppercase tracking-[0.14em] text-[#1167ff] dark:text-[#66a0ff]">
                        Stage {String(activeIndex + 1).padStart(2, "0")} ·{" "}
                        {activeStep.event}
                      </p>
                      <span
                        className={`border px-2 py-1 font-['Aeonik_Mono'] text-[9px] uppercase tracking-[0.12em] ${
                          activeIndex === walkthroughSteps.length - 1
                            ? "border-[#95d4b8] bg-[#edf9f3] text-[#14784f] dark:border-[#24513e] dark:bg-[#0c271d] dark:text-[#65dda9]"
                            : "border-[#b9c8d9] text-[#60748b] dark:border-[#30465c] dark:text-[#90a7bd]"
                        }`}
                      >
                        {activeIndex === walkthroughSteps.length - 1
                          ? "generation released"
                          : "generation held"}
                      </span>
                    </div>
                    <h3 className="mt-8 max-w-2xl text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
                      {activeStep.title}
                    </h3>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-[#586b81] dark:text-[#9bafc3] sm:text-lg sm:leading-8">
                      {activeStep.summary}
                    </p>

                    <div className="mt-9 grid gap-3 sm:grid-cols-2">
                      <div className="border border-[#b9dbc9] bg-[#f0fbf6] p-4 dark:border-[#24513e] dark:bg-[#0c271d]">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#14784f] dark:text-[#65dda9]">
                          <Check className="size-4" aria-hidden="true" />
                          Allowed
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[#456b59] dark:text-[#9fc8b4]">
                          {activeStep.allowed}
                        </p>
                      </div>
                      <div className="border border-[#e3c3ba] bg-[#fff6f3] p-4 dark:border-[#5a392f] dark:bg-[#2a1713]">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#a14932] dark:text-[#f3a28b]">
                          <X className="size-4" aria-hidden="true" />
                          Blocked
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[#76594f] dark:text-[#d3aea2]">
                          {activeStep.blocked}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0a1522] p-6 font-['Aeonik_Mono'] text-xs sm:p-8">
                    <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.14em] text-[#7891aa]">
                      <span>Event payload</span>
                      <span>
                        {activeIndex + 1}/{walkthroughSteps.length}
                      </span>
                    </div>
                    <div className="mt-8 space-y-4">
                      {activeStep.log.map((item) => (
                        <div
                          key={item.key}
                          className="grid grid-cols-[minmax(0,1fr)_auto] gap-5 border-b border-[#203448] pb-3"
                        >
                          <span className="min-w-0 break-words text-[#8299b0]">
                            {item.key}
                          </span>
                          <StatusValue value={item.value} tone={item.tone} />
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 border border-[#26415a] bg-[#0d1d2c] p-4 text-[#9fb5ca]">
                      <p className="text-[9px] uppercase tracking-[0.14em] text-[#617f9d]">
                        gate decision
                      </p>
                      <p className="mt-3 leading-6">
                        {activeIndex === walkthroughSteps.length - 1
                          ? "continue_generation()"
                          : `await ${walkthroughSteps[activeIndex + 1].event}()`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#cbd6e2] bg-[#f5f8fb] p-5 dark:border-[#263a4e] dark:bg-[#091520] sm:p-6">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {planeDetails.map((plane, index) => {
                      const Icon = plane.icon;
                      const active = activeStep.activePlanes.includes(plane.id);
                      return (
                        <div key={plane.id} className="relative">
                          <div
                            className={`min-h-28 border p-4 transition-[border-color,background-color,box-shadow] ${
                              active
                                ? "border-[#1167ff] bg-white shadow-[inset_0_3px_0_#1167ff] dark:bg-[#0d1d2c]"
                                : "border-[#d1dbe6] bg-[#f8fafc] opacity-55 dark:border-[#26394c] dark:bg-[#0b1825]"
                            }`}
                          >
                            <Icon
                              className={`size-5 ${active ? "text-[#1167ff]" : "text-[#7b8da2]"}`}
                              aria-hidden="true"
                            />
                            <p className="mt-4 text-sm font-semibold">
                              {plane.label}
                            </p>
                            <p className="mt-1 font-['Aeonik_Mono'] text-[9px] uppercase tracking-[0.1em] text-[#708299] dark:text-[#8498ad]">
                              {plane.location}
                            </p>
                          </div>
                          {index < planeDetails.length - 1 && (
                            <ArrowRight
                              className="absolute -right-4 top-1/2 z-10 hidden size-5 -translate-y-1/2 rounded-full bg-[#f5f8fb] p-0.5 text-[#7c90a5] dark:bg-[#091520] xl:block"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="trust-boundary"
          className="scroll-mt-20 border-b border-[#cdd8e5] bg-white dark:border-[#203244] dark:bg-[#091520]"
        >
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
              <div className="lg:sticky lg:top-24">
                <p className="font-['Aeonik_Mono'] text-[11px] uppercase tracking-[0.16em] text-[#1167ff] dark:text-[#66a0ff]">
                  Trust boundary
                </p>
                <h2 className="mt-4 text-balance text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
                  The model never becomes the control plane.
                </h2>
                <p className="mt-6 text-lg leading-8 text-[#586b81] dark:text-[#9bafc3]">
                  Squid separates what generated browser code needs from what
                  infrastructure management requires. RLS remains the
                  authorization boundary—not a privileged key hidden in a
                  bundle.
                </p>
              </div>

              <div className="grid gap-px border border-[#becbda] bg-[#becbda] dark:border-[#2b4055] dark:bg-[#2b4055] sm:grid-cols-2">
                <article className="bg-[#f1fbf6] p-6 dark:bg-[#0c271d] sm:p-8">
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#d6f6e7] text-[#14784f] dark:bg-[#154632] dark:text-[#68dfad]">
                    <KeyRound className="size-5" aria-hidden="true" />
                  </div>
                  <p className="mt-8 font-['Aeonik_Mono'] text-[10px] uppercase tracking-[0.14em] text-[#25805b] dark:text-[#70caa4]">
                    Browser receives
                  </p>
                  <h3 className="mt-3 text-2xl font-medium tracking-[-0.03em]">
                    A deliberately small surface
                  </h3>
                  <ul className="mt-6 space-y-4 text-sm leading-6 text-[#466b59] dark:text-[#a2c7b5]">
                    <li className="flex gap-3">
                      <Check className="mt-1 size-4 shrink-0 text-[#14935f]" />
                      Validated HTTPS project URL
                    </li>
                    <li className="flex gap-3">
                      <Check className="mt-1 size-4 shrink-0 text-[#14935f]" />
                      <code>sb_publishable_*</code> or validated legacy anon key
                    </li>
                    <li className="flex gap-3">
                      <Check className="mt-1 size-4 shrink-0 text-[#14935f]" />
                      Protected <code>@/lib/supabase</code> adapter
                    </li>
                    <li className="flex gap-3">
                      <Check className="mt-1 size-4 shrink-0 text-[#14935f]" />
                      Authenticated access governed by verified RLS
                    </li>
                  </ul>
                </article>

                <article className="bg-[#fff7f3] p-6 dark:bg-[#2a1713] sm:p-8">
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#ffe3d8] text-[#a14932] dark:bg-[#553023] dark:text-[#f1a28a]">
                    <LockKeyhole className="size-5" aria-hidden="true" />
                  </div>
                  <p className="mt-8 font-['Aeonik_Mono'] text-[10px] uppercase tracking-[0.14em] text-[#a05a44] dark:text-[#db9d89]">
                    Server only
                  </p>
                  <h3 className="mt-3 text-2xl font-medium tracking-[-0.03em]">
                    The infrastructure boundary
                  </h3>
                  <ul className="mt-6 space-y-4 text-sm leading-6 text-[#76594f] dark:text-[#d5b0a4]">
                    <li className="flex gap-3">
                      <X className="mt-1 size-4 shrink-0 text-[#b94e33]" />
                      OAuth access and refresh tokens
                    </li>
                    <li className="flex gap-3">
                      <X className="mt-1 size-4 shrink-0 text-[#b94e33]" />
                      Management API operations
                    </li>
                    <li className="flex gap-3">
                      <X className="mt-1 size-4 shrink-0 text-[#b94e33]" />
                      Migration SQL and schema verification queries
                    </li>
                    <li className="flex gap-3">
                      <X className="mt-1 size-4 shrink-0 text-[#b94e33]" />
                      Secret or legacy service-role credentials
                    </li>
                  </ul>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#cdd8e5] dark:border-[#203244]">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <div className="flex size-11 items-center justify-center rounded-full bg-[#dff7ec] text-[#14784f] dark:bg-[#154632] dark:text-[#68dfad]">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </div>
                <p className="mt-7 font-['Aeonik_Mono'] text-[11px] uppercase tracking-[0.16em] text-[#14935f] dark:text-[#53daa2]">
                  Verification receipt
                </p>
                <h2 className="mt-4 text-balance text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
                  Success is a database state, not an API status.
                </h2>
                <p className="mt-6 text-lg leading-8 text-[#586b81] dark:text-[#9bafc3]">
                  Squid does not unlock backend-dependent generation because a
                  migration request returned 200. It reads the resulting
                  Postgres metadata and requires every invariant below.
                </p>
              </div>

              <div className="border border-[#aebfd1] bg-[#0a1522] p-1 dark:border-[#31465c]">
                <div className="flex items-center justify-between border-b border-[#26394d] px-5 py-4 font-['Aeonik_Mono'] text-[10px] uppercase tracking-[0.14em] text-[#86a0bb]">
                  <span>authenticated_tasks · v1</span>
                  <span className="text-[#51d9a0]">6 / 6 passed</span>
                </div>
                <div className="grid gap-px bg-[#203448] sm:grid-cols-2">
                  {verificationChecks.map(([label, detail], index) => (
                    <div
                      key={label}
                      className="flex min-h-28 items-start gap-4 bg-[#0c1927] p-5"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#295d49] bg-[#102b21] text-[#51d9a0]">
                        <Check className="size-3.5" strokeWidth={2.5} />
                      </span>
                      <div>
                        <p className="font-['Aeonik_Mono'] text-[9px] uppercase tracking-[0.13em] text-[#5c7b98]">
                          invariant {String(index + 1).padStart(2, "0")}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[#e0ebf7]">
                          {label}
                        </p>
                        <p className="mt-1 text-sm text-[#8299b0]">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3 bg-[#0f2b21] px-5 py-4 font-['Aeonik_Mono'] text-xs text-[#79e3b8] sm:flex-row sm:items-center sm:justify-between">
                  <span>generation.backendContext = verified</span>
                  <span className="text-[9px] uppercase tracking-[0.12em] text-[#4fae83]">
                    ready to generate
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#11233b] text-white dark:bg-[#0a1522]">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-10 lg:py-20">
            <div>
              <p className="font-['Aeonik_Mono'] text-[10px] uppercase tracking-[0.16em] text-[#7fafff]">
                Built in the open
              </p>
              <h2 className="mt-4 max-w-3xl text-balance text-3xl font-medium tracking-[-0.04em] sm:text-5xl">
                The interesting part is the boundary—not the SDK call.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#afc1d6] sm:text-lg sm:leading-8">
                This implementation is under active validation. Source and
                focused tests are in place; the final live OAuth and provider
                provisioning run remains explicit rather than implied.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#48627e] px-5 text-sm font-semibold text-white transition-colors hover:border-[#7fafff] hover:text-[#9fc1ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7fafff]"
              >
                Share technical feedback
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
