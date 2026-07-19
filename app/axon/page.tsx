import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-axon-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-axon-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Axon — Digital Workers for Mundane Workflows",
  description:
    "Deploy intelligent digital workers on tedious browser workflows and give your team more capacity.",
};

const navigation = ["Features", "Plans", "Security", "About"] as const;

function AxonLogo() {
  return (
    <svg
      aria-label="Axon"
      className="h-6 w-6 shrink-0"
      role="img"
      viewBox="0 0 256 256"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="#1B133C" />
      <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="#1B133C" />
    </svg>
  );
}

export default function AxonPage() {
  return (
    <main
      className={`${inter.variable} ${instrumentSerif.variable} axon-page relative flex h-screen w-full flex-col overflow-hidden bg-white`}
    >
      <div className="absolute inset-0 z-0">
        <video
          aria-hidden="true"
          autoPlay
          className="h-[130%] w-full object-cover object-top"
          loop
          muted
          playsInline
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260714_113715_c7e0daa0-8bdd-4486-a2da-040901f8f0ea.mp4"
          tabIndex={-1}
        />
      </div>

      <nav
        aria-label="Primary navigation"
        className="relative z-10 flex justify-center px-4 pt-4 md:pt-6"
      >
        <div className="flex items-center gap-6 rounded-xl bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md md:gap-8 md:px-6">
          <a
            aria-label="Back to Squid Agent"
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B133C]/40 focus-visible:ring-offset-2"
            href="https://squidagent.app"
          >
            <AxonLogo />
          </a>
          <div className="hidden items-center gap-6 sm:flex md:gap-8">
            {navigation.map((item) => (
              <a
                className="text-sm font-medium text-[#1B133C]/80 transition-colors hover:text-[#1B133C] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B133C]/40 focus-visible:ring-offset-2"
                href={`#${item.toLowerCase()}`}
                key={item}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <section
        aria-labelledby="axon-hero-title"
        className="relative z-10 mt-8 flex flex-col items-center px-4 text-center md:mt-16"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-xl border border-[#1B133C]/10 bg-white/70 px-4 py-2 text-sm font-medium backdrop-blur-sm">
          <span
            aria-hidden="true"
            className="flex h-5 w-5 items-center justify-center rounded bg-orange-500 text-xs font-bold text-white"
          >
            Y
          </span>
          <span>Funded by Y Combinator</span>
        </div>

        <h1
          className="max-w-4xl font-[family-name:var(--font-axon-serif)] text-4xl leading-[0.95] tracking-tight text-[#1B133C] sm:text-5xl md:text-7xl lg:text-8xl"
          id="axon-hero-title"
        >
          <span className="block">Deploy digital workers</span>
          <span className="block">for mundane workflows</span>
        </h1>

        <p className="mt-5 max-w-3xl text-xs leading-relaxed text-[#1B133C]/70 sm:mt-6 sm:text-sm md:text-base">
          Eliminate your tedious browser work and 10x your team&apos;s capacity.
          Put intelligent agents on every routine process so you grow faster and
          deliver more for clients — effortlessly.
        </p>

        <button
          className="mt-7 rounded-xl bg-[#FEFEFE] px-6 py-3 text-sm font-semibold text-[#1B133C] shadow-[0px_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:shadow-[0px_6px_16px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B133C]/50 focus-visible:ring-offset-2 sm:mt-8 sm:px-8 sm:py-3.5"
          type="button"
        >
          Get Early Access
        </button>
      </section>
    </main>
  );
}
