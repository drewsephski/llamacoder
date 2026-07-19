"use client";

import { ArrowUpRight, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

const navigation = [
  { label: "Ecosystem", hasDropdown: false },
  { label: "Economics", hasDropdown: true },
  { label: "Developers", hasDropdown: false },
  { label: "Governance", hasDropdown: true },
] as const;

export default function Navbar() {
  return (
    <nav
      aria-label="Primary navigation"
      className="relative z-10 flex w-full items-center justify-between px-6 py-6 md:px-10"
    >
      <div aria-hidden="true" className="hidden flex-1 md:block" />

      <ul className="hidden items-center gap-8 text-sm font-normal text-[rgb(45,45,45)] md:flex">
        {navigation.map(({ hasDropdown, label }) => (
          <li key={label}>
            <button
              className="group flex cursor-pointer items-center gap-1 transition-opacity hover:opacity-70 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(30,50,90,0.4)]"
              type="button"
            >
              {label}
              {hasDropdown ? (
                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                />
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      <div className="md:hidden">
        <a
          aria-label="Back to Squid Agent"
          className="text-xl font-normal tracking-tighter text-[rgba(30,50,90,0.9)] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(30,50,90,0.4)]"
          href="https://squidagent.app"
        >
          RIVR
        </a>
      </div>

      <div className="flex flex-1 justify-end">
        <motion.a
          aria-label="Book a demo"
          className="group flex items-center gap-2 rounded-full bg-[rgba(30,50,90,0.8)] py-1.5 pl-2 pr-4 text-white transition-colors hover:bg-[rgba(30,50,90,1)] md:gap-3 md:py-2 md:pr-6"
          href="https://drewsepeczi.xyz"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="flex items-center justify-center rounded-full bg-white/20 p-1 md:p-1.5">
            <ArrowUpRight
              aria-hidden="true"
              className="h-4 w-4 text-white md:h-5 md:w-5"
            />
          </span>
          <span className="text-xs font-normal md:text-sm">Book Demo</span>
        </motion.a>
      </div>
    </nav>
  );
}
