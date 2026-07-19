"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

export default function BottomLeftCard() {
  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="rivr-motion-slide-in absolute bottom-28 left-auto right-4 flex w-fit min-w-[140px] flex-col gap-2 rounded-[1.2rem] bg-white/30 p-3 backdrop-blur-xl md:bottom-6 md:left-6 md:right-auto md:min-w-[150px] md:p-4 lg:bottom-10 lg:left-10 lg:min-w-[180px] lg:gap-3 lg:rounded-[2.2rem] lg:p-5"
      initial={{ opacity: 0, x: -20 }}
      transition={{ delay: 0.2, duration: 0.8 }}
    >
      <div className="flex flex-col">
        <span className="text-2xl font-normal tracking-tight text-[rgba(30,50,90,0.9)] md:text-3xl">
          5.2K
        </span>
        <span className="text-[10px] font-normal uppercase tracking-wider text-[rgba(30,50,90,0.6)] md:text-[12px]">
          Active Yielders
        </span>
      </div>

      <motion.button
        className="group flex items-center gap-2 self-start rounded-full bg-white py-1.5 pl-1.5 pr-5 transition-colors hover:bg-white/90"
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="flex items-center justify-center rounded-full bg-[rgba(30,50,90,0.1)] p-1">
          <ArrowUpRight
            aria-hidden="true"
            className="h-4 w-4 text-[rgba(30,50,90,0.9)]"
          />
        </span>
        <span className="text-[14px] font-normal text-[rgba(30,50,90,0.9)]">
          Join Discord
        </span>
      </motion.button>
    </motion.div>
  );
}
