"use client";

import { ArrowUpRight, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

export default function BottomRightCorner() {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="rivr-motion-fade-up absolute bottom-0 right-0 flex items-center gap-3 rounded-tl-[1.5rem] bg-[#f0f0f0] p-3 pl-8 pt-5 sm:gap-4 sm:rounded-tl-[2rem] sm:p-4 sm:pl-10 sm:pt-6 md:gap-6 md:rounded-tl-[3.5rem] md:p-6 md:pl-14 md:pt-8"
      initial={{ opacity: 0, y: 20 }}
      transition={{ delay: 0.4, duration: 0.8 }}
    >
      <div className="pointer-events-none absolute -top-[1.5rem] right-0 h-[1.5rem] w-[1.5rem] sm:-top-[2rem] sm:h-[2rem] sm:w-[2rem] md:-top-[3.5rem] md:h-[3.5rem] md:w-[3.5rem]">
        <svg
          aria-hidden="true"
          fill="none"
          height="100%"
          viewBox="0 0 56 56"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M56 56V0C56 30.9279 30.9279 56 0 56H56Z" fill="#f0f0f0" />
        </svg>
      </div>
      <div className="pointer-events-none absolute -left-[1.5rem] bottom-0 h-[1.5rem] w-[1.5rem] sm:-left-[2rem] sm:h-[2rem] sm:w-[2rem] md:-left-[3.5rem] md:h-[3.5rem] md:w-[3.5rem]">
        <svg
          aria-hidden="true"
          fill="none"
          height="100%"
          viewBox="0 0 56 56"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M56 56H0C30.9279 56 56 30.9279 56 0V56Z" fill="#f0f0f0" />
        </svg>
      </div>

      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(30,50,90,0.1)] bg-[rgba(30,50,90,0.05)] md:h-14 md:w-14">
        <ArrowUpRight
          aria-hidden="true"
          className="text-[rgba(30,50,90,0.8)]"
        />
      </div>
      <div>
        <p className="text-[16px] font-normal text-[rgba(30,50,90,0.95)] md:text-[20px]">
          Documentation
        </p>
        <button
          className="flex cursor-pointer items-center gap-1 text-[rgba(30,50,90,0.6)] transition-colors hover:text-[rgba(30,50,90,0.8)] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(30,50,90,0.4)]"
          type="button"
        >
          <span className="text-[12px] font-normal md:text-[15px]">
            Library
          </span>
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
