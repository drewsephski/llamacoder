import {
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  Music2,
  Twitter,
  Youtube,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260419_064822_f120e48a-d545-45dd-a02d-facb07829888.mp4";
const LEADERSHIP_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260419_065931_e3ca7b53-d32e-4ad5-81de-dc9d6fcfda6d.mp4";
const ROADMAP_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260417_110451_9f82b157-dc92-4a9f-a341-c25594ec20e1.mp4";

const steps = [
  "Learn how to spot AI opportunities that boost productivity across roles and deliver visible results.",
  "Build structures that support your team so AI efficiencies multiply across the organization.",
  "Gain the skills to drive culture change like securing buy-in and reducing resistance.",
  "Get frameworks to deliver AI pilots that prove impact fast and build credibility with measurable results.",
] as const;

const socials: { label: string; icon: LucideIcon }[] = [
  { label: "Facebook", icon: Facebook },
  { label: "Twitter", icon: Twitter },
  { label: "Instagram", icon: Instagram },
  { label: "YouTube", icon: Youtube },
  { label: "LinkedIn", icon: Linkedin },
  { label: "Music", icon: Music2 },
];

const footerLinks = ["Support", "Privacy", "Terms", "Unsubscribe"] as const;

type DesignRocketCertificatesPageProps = {
  fontClassName: string;
};

const serifStyle = { fontFamily: "'Instrument Serif', serif" };

function ArrowButton({
  children,
  className = "",
  href = "#enroll",
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  return (
    <a
      className={`inline-flex items-center gap-3 rounded-lg bg-[#DCFF00] px-6 py-3 font-bold text-[#0A0A0A] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#c9ea00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DCFF00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] ${className}`}
      href={href}
    >
      {children}
      <ArrowRight aria-hidden="true" className="h-5 w-5" strokeWidth={2.5} />
    </a>
  );
}

function SolidButton({
  children,
  href = "#enroll",
}: {
  children: React.ReactNode;
  href?: string;
}) {
  return (
    <a
      className="inline-block rounded-lg bg-white px-8 py-3 font-bold text-[#0A0A0A] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#E8E8E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111]"
      href={href}
    >
      {children}
    </a>
  );
}

function Divider() {
  return (
    <div aria-hidden="true" className="flex justify-center py-8">
      <span className="h-px w-24 bg-white/20" />
    </div>
  );
}

function Step({ number, children }: { number: number; children: string }) {
  return (
    <li className="mb-6 flex items-start gap-5 last:mb-0">
      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#DCFF00] text-xs font-bold text-[#0A0A0A]">
        {number}
      </span>
      <p className="text-[17px] leading-[1.55] text-[#E8E8E8]">{children}</p>
    </li>
  );
}

function VideoCard({ src, label }: { src: string; label: string }) {
  return (
    <div className="px-6 pb-10 sm:px-[42px]">
      <a
        aria-label={label}
        className="group block overflow-hidden rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DCFF00] focus-visible:ring-offset-4 focus-visible:ring-offset-[#111111]"
        href="#enroll"
      >
        <video
          aria-hidden="true"
          autoPlay
          className="h-[280px] w-full rounded-[14px] object-cover transition-transform duration-700 group-hover:scale-[1.03] sm:h-[370px]"
          loop
          muted
          playsInline
          preload="metadata"
          src={src}
          tabIndex={-1}
        />
      </a>
    </div>
  );
}

function Footer() {
  return (
    <footer
      className="border-t border-white/5 bg-[#080808] px-6 pb-10 pt-12 text-center text-white sm:px-10"
      id="footer"
    >
      <a
        className="inline-block pb-8 text-[30px] font-bold tracking-tight text-white transition-colors hover:text-[#DCFF00] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DCFF00]"
        href="https://squidagent.app"
      >
        Design Rocket
      </a>

      <p className="mx-auto max-w-[500px] pb-8 text-[12px] leading-[1.5] text-[#83837D]">
        Microsoft is a collaborator on this specific course. Microsoft does not
        endorse Design Rocket generally or other Design Rocket products.
      </p>

      <Divider />

      <div className="flex justify-center gap-5 pb-5">
        {socials.map(({ label, icon: Icon }) => (
          <a
            aria-label={label}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-white hover:bg-white hover:text-[#1E1E1E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DCFF00]"
            href="#footer"
            key={label}
          >
            <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
          </a>
        ))}
      </div>

      <p className="mx-auto max-w-[470px] pb-4 text-[10px] leading-[1.6] text-[#83837D]">
        If you no longer want to receive updates on Design Rocket Certificates,
        you can unsubscribe at any time by clicking &quot;unsubscribe&quot;
        below.
      </p>

      <nav
        aria-label="Footer navigation"
        className="flex flex-wrap items-center justify-center gap-x-2 text-[12px]"
      >
        {footerLinks.map((label, index) => (
          <span className="inline-flex items-center gap-x-2" key={label}>
            {index > 0 ? <span className="text-[#8F8E88]">|</span> : null}
            <a
              className="text-white transition-colors hover:text-[#DCFF00] hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DCFF00]"
              href="#footer"
            >
              {label}
            </a>
          </span>
        ))}
      </nav>

      <a
        className="mt-3 inline-block text-[12px] text-white/80 transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DCFF00]"
        href="#footer"
      >
        ©2026 Design Rocket, 660 4th Street #443, San Francisco, CA 94107 USA
      </a>
    </footer>
  );
}

export function DesignRocketCertificatesPage({
  fontClassName,
}: DesignRocketCertificatesPageProps) {
  return (
    <main
      className={`${fontClassName} min-h-screen bg-[#050505] px-4 py-10 font-sans text-[#F2F2F2]`}
      id="top"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <article className="mx-auto max-w-[640px] overflow-hidden bg-[#111111] text-[#F2F2F2] shadow-2xl ring-1 ring-white/5">
        <section
          aria-labelledby="design-rocket-hero-title"
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: "640 / 820" }}
        >
          <video
            aria-hidden="true"
            autoPlay
            className="absolute inset-0 h-full w-full object-cover"
            loop
            muted
            playsInline
            preload="metadata"
            src={HERO_VIDEO}
            tabIndex={-1}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(17,17,17,0) 45%, rgba(17,17,17,0.45) 68%, rgba(17,17,17,0.9) 88%, rgba(17,17,17,1) 100%)",
            }}
          />

          <div className="relative z-10 flex h-full flex-col items-center px-6 pb-10 pt-12 text-center">
            <a
              className="text-white transition-colors hover:text-[#DCFF00] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DCFF00]"
              href="https://squidagent.app"
            >
              <span
                className="block text-[28px] leading-[0.95] tracking-tight"
                style={serifStyle}
              >
                Design Rocket
              </span>
              <span className="mt-1 block text-[13px] font-medium tracking-[0.22em]">
                CERTIFICATES
              </span>
            </a>

            <p className="mt-40 text-[13px] font-semibold tracking-[0.28em] text-white">
              NOW AVAILABLE
            </p>

            <div className="flex flex-1 flex-col items-center justify-end">
              <h1
                className="max-w-[560px] text-[clamp(3rem,10.5vw,58px)] leading-[1.02] tracking-tight text-white"
                id="design-rocket-hero-title"
                style={serifStyle}
              >
                Learn to lead AI
                <br />
                and unlock new value
              </h1>
              <a
                className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#D8F90A] px-8 py-4 font-semibold text-[#1E1E1E] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#c9ea00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8F90A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111]"
                href="#enroll"
              >
                Enroll Now
                <ArrowRight
                  aria-hidden="true"
                  className="h-5 w-5"
                  strokeWidth={2.5}
                />
              </a>
            </div>
          </div>
        </section>

        <div className="bg-[#111111]">
          <section
            className="px-6 pb-8 pt-4 text-center sm:px-[78px]"
            id="intro"
          >
            <p className="text-[18px] leading-[1.55]">
              Built in collaboration with Microsoft, this certificate course
              gives you the toolkit to lead AI transformation across your
              organization. Learn to spot opportunities, launch AI pilots, and
              scale adoption grounded in responsible practices and proven
              frameworks.
            </p>
          </section>

          <div className="flex justify-center pb-14">
            <ArrowButton href="#transform">Get Started</ArrowButton>
          </div>

          <Divider />

          <section aria-labelledby="transform-title" id="transform">
            <div className="px-6 pb-8 sm:px-9">
              <h2
                className="text-center text-[clamp(2.6rem,7vw,46px)] leading-[1.05] tracking-tight"
                id="transform-title"
                style={serifStyle}
              >
                Transform how you lead with AI
              </h2>
            </div>

            <VideoCard
              label="Watch the AI leadership transformation video"
              src={LEADERSHIP_VIDEO}
            />

            <ol className="mx-auto max-w-[489px] px-6 pb-10 sm:px-0">
              {steps.map((step, index) => (
                <Step key={step} number={index + 1}>
                  {step}
                </Step>
              ))}
            </ol>

            <div className="flex justify-center pb-14">
              <SolidButton>Enroll Now</SolidButton>
            </div>
          </section>

          <Divider />

          <section aria-labelledby="roadmap-title" id="roadmap">
            <div className="px-6 pb-7 sm:px-9">
              <h2
                className="text-center text-[clamp(2.6rem,7vw,46px)] leading-[1.05] tracking-tight"
                id="roadmap-title"
                style={serifStyle}
              >
                <span className="block">Build your AI</span>
                <span className="block">transformation roadmap</span>
              </h2>
            </div>

            <VideoCard
              label="Watch the AI transformation roadmap video"
              src={ROADMAP_VIDEO}
            />

            <p className="px-6 pb-8 text-center text-[18px] leading-[1.55] sm:px-[78px]">
              You&apos;ll finish this hands-on course with a personal AI
              Transformation Plan: your playbook for pilot proposals, data
              strategy and governance. Use it to help secure buy-in, guide
              rollout, and scale adoption responsibly.
            </p>

            <div className="flex justify-center pb-14">
              <SolidButton>Learn More</SolidButton>
            </div>
          </section>

          <section className="px-6 pb-12 sm:px-14" id="enroll">
            <div className="rounded-[10px] bg-[#D8F90A] px-6 py-12 text-center sm:px-8">
              <h2
                className="mb-3 text-[clamp(2.8rem,8vw,52px)] leading-[1.02] tracking-tight text-[#1E1E1E]"
                style={serifStyle}
              >
                Ready to lead AI
                <br />
                at work?
              </h2>
              <p className="mb-8 px-2 text-[18px] leading-[1.5] text-[#1E1E1E] sm:px-4">
                Enroll now and be the leader your team has been waiting for.
              </p>
              <ArrowButton href="#footer">Enroll Now</ArrowButton>
            </div>
          </section>
        </div>

        <Footer />
      </article>
    </main>
  );
}
