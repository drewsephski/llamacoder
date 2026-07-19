"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const navigation = [
  { label: "service", href: "#service" },
  { label: "patient resources", href: "#patient-resources" },
  { label: "about us", href: "#about-us" },
  { label: "education center", href: "#education-center" },
] as const;

function CloverMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-7 shrink-0"
      fill="none"
      viewBox="0 0 26 26"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="13" cy="7" fill="#1a1a1a" r="5.5" />
      <circle cx="19" cy="13" fill="#1a1a1a" r="5.5" />
      <circle cx="13" cy="19" fill="#1a1a1a" r="5.5" />
      <circle cx="7" cy="13" fill="#1a1a1a" r="5.5" />
      <circle cx="13" cy="13" fill="#edeef5" r="2.5" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span aria-hidden="true" className="relative block h-4 w-5">
      <motion.span
        animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
        className="absolute left-0 top-0 h-px w-5 origin-center bg-[#1a1a1a]"
        transition={{ duration: 0.2 }}
      />
      <motion.span
        animate={open ? { opacity: 0, x: 5 } : { opacity: 1, x: 0 }}
        className="absolute left-0 top-[7px] h-px w-5 bg-[#1a1a1a]"
        transition={{ duration: 0.15 }}
      />
      <motion.span
        animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
        className="absolute bottom-0 left-0 h-px w-5 origin-center bg-[#1a1a1a]"
        transition={{ duration: 0.2 }}
      />
    </span>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed left-0 top-0 z-50 w-full bg-gradient-to-b from-[#f1f1f1]/80 to-transparent py-6 backdrop-blur-[2px] md:py-10"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-12 items-center gap-x-4 px-8 md:gap-x-8 md:px-16 lg:px-20">
        <a
          aria-label="mėntality home"
          className="col-span-7 flex min-w-0 items-center gap-2.5 text-[#1a1a1a] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#edeef5]/80 md:col-span-3"
          href="https://squidagent.app"
          onClick={closeMenu}
        >
          <CloverMark />
          <span className="mentality-display truncate text-[1.35rem] leading-none tracking-[-0.04em] sm:text-2xl">
            mėntality
          </span>
        </a>

        <div className="col-span-4 hidden items-center justify-center gap-6 md:col-span-6 md:flex lg:gap-8">
          {navigation.map(({ href, label }) => (
            <a
              className="whitespace-nowrap text-[11px] lowercase tracking-[-0.01em] text-[#1a1a1a]/75 transition-colors hover:text-[#1a1a1a] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/50"
              href={href}
              key={label}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="col-span-5 flex items-center justify-end gap-3 md:col-span-3 md:gap-4">
          <a
            className="hidden text-[11px] lowercase tracking-[-0.01em] text-[#1a1a1a]/80 transition-opacity hover:opacity-60 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/50 sm:inline-flex"
            href="#help"
          >
            find help
          </a>
          <a
            className="hidden items-center rounded-full bg-[#1a1a1a] px-4 py-2.5 text-[11px] lowercase tracking-[-0.01em] text-white transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#edeef5] sm:inline-flex"
            href="#get-started"
          >
            get started <span className="ml-1.5 text-sm leading-none">→</span>
          </a>
          <button
            aria-controls="mentality-mobile-menu"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="flex size-10 items-center justify-center rounded-full border border-[#1a1a1a]/10 bg-white/35 backdrop-blur-sm transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/50 md:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            type="button"
          >
            <MenuIcon open={isMenuOpen} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isMenuOpen ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-4 right-4 top-full rounded-3xl border border-black/[0.06] bg-white/80 p-3 shadow-lg shadow-black/[0.06] backdrop-blur-xl md:hidden"
            exit={{ opacity: 0, y: -12 }}
            id="mentality-mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col">
              {navigation.map(({ href, label }, index) => (
                <a
                  className="rounded-2xl px-4 py-3 text-sm lowercase text-[#1a1a1a] transition-colors hover:bg-[#edeef5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1a1a1a]/50"
                  href={href}
                  key={label}
                  onClick={closeMenu}
                >
                  <span className="mr-3 text-[10px] text-[#1a1a1a]/40">
                    0{index + 1}
                  </span>
                  {label}
                </a>
              ))}
              <div className="mt-2 flex items-center gap-4 border-t border-black/[0.06] px-4 pt-3">
                <a
                  className="text-xs lowercase text-[#1a1a1a]/75"
                  href="#help"
                  onClick={closeMenu}
                >
                  find help
                </a>
                <a
                  className="rounded-full bg-[#1a1a1a] px-4 py-2 text-xs lowercase text-white"
                  href="#get-started"
                  onClick={closeMenu}
                >
                  get started →
                </a>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
