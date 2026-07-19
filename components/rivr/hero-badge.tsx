"use client";

import { Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function HeroBadge() {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="rivr-motion-fade-up mx-auto mb-3 flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/60 px-4 py-2 backdrop-blur-md"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Sparkles
        aria-hidden="true"
        className="h-4 w-4 text-[rgba(30,50,90,0.8)]"
      />
      <span className="text-[14px] font-normal text-[rgba(30,50,90,0.9)]">
        Fluid Staking
      </span>
    </motion.div>
  );
}
