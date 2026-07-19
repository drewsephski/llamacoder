"use client";

import { motion } from "motion/react";

import BottomLeftCard from "@/components/rivr/bottom-left-card";
import BottomRightCorner from "@/components/rivr/bottom-right-corner";
import HeroBadge from "@/components/rivr/hero-badge";
import Navbar from "@/components/rivr/navbar";

const heroVideoUrl =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260428_193507_4286c423-2fd9-4efd-92bd-91a939453fc1.mp4";

export default function Hero() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#f0f0f0] p-3 md:p-5">
      <section
        aria-labelledby="rivr-hero-title"
        className="group relative flex h-full w-full max-w-[1536px] flex-col items-center overflow-hidden rounded-[1.5rem] bg-white/10 shadow-none md:rounded-[3rem]"
      >
        <video
          aria-hidden="true"
          autoPlay
          className="absolute inset-0 z-0 h-full w-full object-cover object-[65%] lg:object-center"
          loop
          muted
          playsInline
          src={heroVideoUrl}
          tabIndex={-1}
        />

        <div className="relative z-10 flex h-full w-full flex-col items-center">
          <Navbar />

          <div className="flex w-full max-w-4xl flex-col items-center px-6 pt-8 text-center">
            <HeroBadge />
            <motion.h1
              animate={{ opacity: 1, scale: 1 }}
              className="rivr-motion-scale-in mb-2 text-4xl font-normal leading-[1.05] tracking-tight text-[#5E6470] sm:text-5xl md:text-6xl lg:text-[80px]"
              initial={{ opacity: 0, scale: 0.98 }}
              id="rivr-hero-title"
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Fluid Asset Streams
            </motion.h1>
            <motion.p
              animate={{ opacity: 1 }}
              className="rivr-motion-fade-in max-w-xl text-sm font-normal leading-relaxed text-[#5E6470] opacity-80 sm:text-base md:text-lg"
              initial={{ opacity: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Access Smart Vaults, stake RIVR, NFTs, transform rigid holdings
              into liquid cash instantly.
            </motion.p>
          </div>

          <BottomLeftCard />
          <BottomRightCorner />
        </div>
      </section>
    </div>
  );
}
