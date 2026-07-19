"use client";

import { motion, useReducedMotion } from "framer-motion";

const heroVideoUrl =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260603_132049_036591b8-6e92-4760-b94c-a7ea6eef315c.mp4";

function EyeMark() {
  return (
    <span
      aria-hidden="true"
      className="mx-1 inline-flex h-[0.72em] w-[16px] items-center justify-center rounded-full border-[2px] border-[#1a1a1a] align-[0.03em] md:mx-2 md:w-[42px] lg:w-[62px]"
    >
      <span className="size-2 rounded-full bg-[#1a1a1a]" />
    </span>
  );
}

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const contentTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.8 };

  return (
    <section
      aria-labelledby="mentality-hero-title"
      className="relative flex min-h-[110vh] w-full flex-col items-center justify-start overflow-hidden bg-bg-base sm:min-h-[140vh]"
      id="hero"
    >
      <div className="pointer-events-none absolute left-0 top-[15vh] z-0 h-[95vh] w-full sm:top-[20vh] sm:h-[120vh]">
        <video
          aria-hidden="true"
          autoPlay
          className="h-full w-full object-cover opacity-100"
          loop
          muted
          playsInline
          src={heroVideoUrl}
          tabIndex={-1}
        />
        <div className="absolute left-0 top-0 h-24 w-full bg-gradient-to-b from-bg-base to-transparent sm:h-32" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-12 gap-x-4 px-8 pt-[31vh] md:gap-x-8 md:px-16 md:pt-[34vh] lg:px-20">
        <div className="col-span-12 md:col-span-10 md:col-start-2">
          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="mentality-display max-w-[1050px] text-[clamp(2.4rem,6.4vw,6.65rem)] font-normal leading-[0.93] tracking-[-0.065em] text-[#8e8e8e]"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
            id="mentality-hero-title"
            transition={contentTransition}
          >
            <span className="text-[#1a1a1a]">Remix: Mentality offers</span>{" "}
            information
            <br />
            and resources to help you manage
            <br />
            your
            <EyeMark />
            mental wellbeing.
          </motion.h1>

          <motion.form
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 w-full max-w-[430px]"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
            onSubmit={(event) => event.preventDefault()}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { delay: 0.15, duration: 0.8 }
            }
          >
            <div className="flex items-center rounded-[6px] border border-black/[0.05] bg-white p-1 pl-4 shadow-sm shadow-black/[0.04]">
              <label className="sr-only" htmlFor="mentality-search">
                Ask a question about mental wellbeing
              </label>
              <input
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#1a1a1a] outline-none placeholder:text-[#8e8e8e] focus-visible:ring-0"
                id="mentality-search"
                placeholder="Ask me anything..."
                type="text"
              />
              <button
                aria-label="Ask question"
                className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/60 focus-visible:ring-offset-2"
                type="submit"
              >
                <svg
                  aria-hidden="true"
                  className="size-4"
                  fill="none"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 8h9M8.5 3.5 13 8l-4.5 4.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.35"
                  />
                </svg>
              </button>
            </div>
          </motion.form>
        </div>
      </div>

      <a
        aria-label="Switch language from Polish to English"
        className="absolute right-6 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/60 bg-white/35 px-3 py-2 text-[11px] lowercase tracking-[0.02em] text-[#1a1a1a] shadow-sm backdrop-blur-md transition-colors hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/50 sm:right-8"
        href="#language"
      >
        pl — en
      </a>

      <span className="absolute bottom-8 left-8 z-10 text-[10px] lowercase tracking-[0.02em] text-[#1a1a1a]/70 md:left-16 lg:left-20">
        2024
      </span>
      <span className="absolute bottom-8 right-8 z-10 text-[10px] lowercase tracking-[0.02em] text-[#1a1a1a]/70 md:right-16 lg:right-20">
        mental health tools
      </span>
    </section>
  );
}
