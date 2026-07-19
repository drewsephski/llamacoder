"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import {
  Circle,
  Instagram,
  Linkedin,
  Twitter,
  type LucideIcon,
} from "lucide-react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260602_150901_c45b90ec-18d7-42ff-90e2-b95d7109e330.mp4";

const SERVICES = [
  "Website",
  "Mobile App",
  "Web App",
  "E-Commerce",
  "Visual Identity",
  "3D & Motion",
  "Digital Marketing",
  "Growth & Consulting",
  "Other",
] as const;

const socialLinks = [
  {
    label: "Twitter",
    href: "https://drewsepeczi.xyz",
    icon: Twitter,
    className: "bg-gray-100 text-gray-800",
  },
  {
    label: "Circle",
    href: "https://drewsepeczi.xyz",
    icon: Circle,
    className: "bg-pink-100 text-pink-500",
  },
  {
    label: "Instagram",
    href: "https://drewsepeczi.xyz",
    icon: Instagram,
    className: "bg-orange-100 text-orange-400",
  },
  {
    label: "LinkedIn",
    href: "https://drewsepeczi.xyz",
    icon: Linkedin,
    className: "bg-blue-100 text-blue-600",
  },
] as const;

function SocialBtn({
  href,
  icon: Icon,
  label,
  className,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  className: string;
}) {
  return (
    <a
      aria-label={label}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${className}`}
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <Icon aria-hidden="true" size={13} strokeWidth={2.2} />
    </a>
  );
}

function FormaLogo() {
  return (
    <svg
      aria-label="Forma"
      className="h-8 w-8 text-black"
      role="img"
      viewBox="0 0 256 256"
    >
      <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="currentColor" />
      <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="currentColor" />
    </svg>
  );
}

export default function FormaPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const toggleService = (service: string) => {
    setSelected((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSending(false);
    setSent(true);
  };

  return (
    <main
      className="forma-page min-h-screen bg-white p-3 sm:p-4 md:p-6"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <section className="relative min-h-[calc(100vh-24px)] overflow-hidden rounded-2xl sm:min-h-[calc(100vh-32px)] sm:rounded-3xl md:min-h-[calc(100vh-48px)] lg:h-[calc(100vh-48px)]">
        <video
          aria-hidden="true"
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          loop
          muted
          playsInline
          src={VIDEO_URL}
          tabIndex={-1}
        />

        <div className="relative z-10 flex min-h-[calc(100vh-24px)] flex-col gap-6 p-4 sm:min-h-[calc(100vh-32px)] sm:p-6 md:min-h-[calc(100vh-48px)] md:p-8 lg:h-full">
          <nav
            aria-label="Primary navigation"
            className="flex w-full items-center gap-3 rounded-2xl bg-white/60 py-2 pl-3 pr-2 shadow-sm backdrop-blur-md sm:w-auto sm:gap-6 sm:pl-4"
          >
            <a
              aria-label="Forma home"
              className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              href="https://squidagent.app"
            >
              <FormaLogo />
            </a>

            <div className="hidden items-center gap-3 sm:flex sm:gap-6">
              {[
                ["Our story", "#story"],
                ["Expertise", "#expertise"],
                ["Our work", "#work"],
                ["Journal", "#journal"],
              ].map(([label, href]) => (
                <a
                  className="whitespace-nowrap text-sm font-medium text-gray-800 transition-opacity hover:opacity-60 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  href={href}
                  key={label}
                >
                  {label}
                </a>
              ))}
            </div>

            <a
              className="ml-auto rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 sm:px-5"
              href="#contact"
            >
              Start a project
            </a>
          </nav>

          <div className="min-h-[2rem] flex-1" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <p className="shrink-0 text-3xl font-medium leading-tight text-white drop-shadow-lg sm:text-4xl lg:max-w-lg xl:max-w-2xl xl:text-5xl">
              We craft bold ideas
              <br />
              and ship them as{" "}
              <span
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                }}
              >
                products
              </span>
            </p>

            <div className="w-full shrink-0 lg:w-[min(480px,45%)]" id="contact">
              <div className="flex flex-col gap-4 overflow-hidden rounded-2xl bg-white p-4 shadow-2xl sm:rounded-3xl sm:p-6">
                <h1 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
                  Say hello! 👋
                </h1>

                <div className="flex flex-row items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-2.5">
                  <div className="flex min-w-0 flex-col">
                    <span className="text-xs text-gray-500">
                      Drop us a line
                    </span>
                    <a
                      className="truncate text-sm font-semibold text-blue-600 transition-opacity hover:underline hover:opacity-80 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      href="https://drewsepeczi.xyz"
                    >
                      drewsepeczi.xyz
                    </a>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {socialLinks.map((social) => (
                      <SocialBtn key={social.label} {...social} />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm font-medium text-gray-400">
                  <span className="h-px flex-1 bg-gray-200" />
                  <span>OR</span>
                  <span className="h-px flex-1 bg-gray-200" />
                </div>

                {sent ? (
                  <div
                    aria-live="polite"
                    className="flex flex-col items-center justify-center gap-3 py-6 text-center"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-xl text-green-600">
                      ✓
                    </div>
                    <h2 className="text-base font-semibold text-gray-900">
                      You&apos;re all set!
                    </h2>
                    <p className="text-sm text-gray-500">
                      Expect a reply within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <label
                      className="text-sm font-medium text-black"
                      htmlFor="forma-message"
                    >
                      Tell us about your vision
                    </label>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        aria-label="Full name"
                        className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-sm placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Full name"
                        required
                        type="text"
                        value={name}
                      />
                      <input
                        aria-label="Email"
                        className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-sm placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Email"
                        required
                        type="email"
                        value={email}
                      />
                    </div>

                    <textarea
                      className="min-w-0 resize-none rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-sm placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                      id="forma-message"
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="What are you looking to build or improve..."
                      required
                      rows={4}
                      value={message}
                    />

                    <fieldset className="flex flex-col gap-2">
                      <legend className="text-sm font-medium text-black">
                        I need help with...
                      </legend>
                      <div className="flex flex-wrap gap-1.5">
                        {SERVICES.map((service) => {
                          const isSelected = selected.includes(service);

                          return (
                            <button
                              aria-pressed={isSelected}
                              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-1 ${
                                isSelected
                                  ? "border-black bg-gray-100 text-black"
                                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                              }`}
                              key={service}
                              onClick={() => toggleService(service)}
                              type="button"
                            >
                              {service}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    <button
                      className="w-full rounded-2xl bg-black py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-60"
                      disabled={sending}
                      type="submit"
                    >
                      {sending ? "Sending..." : "Send my message"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
