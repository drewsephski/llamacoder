"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import AboutSection from "@/components/jack/about-section";
import ContactButton from "@/components/jack/contact-button";
import JackFooter from "@/components/jack/footer";
import Magnet from "@/components/jack/magnet";
import Marquee from "@/components/jack/marquee";
import ProjectsSection from "@/components/jack/projects-section";
import ServicesSection from "@/components/jack/services-section";

const portraitUrl = "/showcase/drew-portrait.png";

export default function JackPortfolioPage({
  fontClassName,
}: {
  fontClassName: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main
      className={`${fontClassName} jack-page min-h-screen overflow-x-clip bg-[#0c0c0c]`}
    >
      <section
        className="relative flex h-screen min-h-[620px] flex-col overflow-x-clip"
        id="home"
      >
        <motion.nav
          animate={{ opacity: 1, y: 0 }}
          className="relative z-30 flex items-center justify-between px-6 pt-6 text-sm font-medium uppercase tracking-wider text-[#d7e2ea] md:px-10 md:pt-8 md:text-lg lg:text-[1.4rem]"
          initial={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="hidden items-center gap-8 md:flex md:w-full md:justify-between">
            {[
              ["About", "#about"],
              ["Services", "#services"],
              ["Projects", "#projects"],
              ["Contact", "#contact"],
            ].map(([label, href]) => (
              <a
                className="transition-opacity duration-200 hover:opacity-70"
                href={href}
                key={label}
              >
                {label}
              </a>
            ))}
          </div>
          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            className="ml-auto rounded-full border border-[#d7e2ea]/30 px-4 py-2 text-xs transition-opacity hover:opacity-70 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </motion.nav>

        {menuOpen ? (
          <div className="absolute right-6 top-20 z-40 flex flex-col gap-4 rounded-2xl border border-[#d7e2ea]/20 bg-[#0c0c0c]/90 p-5 text-right text-sm uppercase tracking-wider backdrop-blur-md md:hidden">
            {[
              ["About", "#about"],
              ["Services", "#services"],
              ["Projects", "#projects"],
              ["Contact", "#contact"],
            ].map(([label, href]) => (
              <a href={href} key={label} onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
          </div>
        ) : null}

        <div className="relative z-0 mt-6 overflow-hidden sm:mt-4 md:-mt-5">
          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="hero-heading w-full whitespace-nowrap text-center text-[14vw] font-black uppercase leading-none tracking-tight sm:text-[15vw] md:text-[16vw] lg:text-[17.5vw]"
            initial={{ opacity: 0, y: 40 }}
            transition={{
              delay: 0.15,
              duration: 0.7,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            Hi, i&apos;m drew
          </motion.h1>
        </div>

        <Magnet className="absolute left-1/2 top-1/2 z-10 w-[280px] -translate-x-1/2 -translate-y-1/2 sm:bottom-0 sm:top-auto sm:w-[360px] sm:translate-y-0 md:w-[440px] lg:w-[520px]">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            transition={{
              delay: 0.6,
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            {/* The brief supplies a transparent portrait asset hosted by the design reference. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Drew, AI engineer and product builder"
              className="h-auto w-full"
              decoding="sync"
              fetchPriority="high"
              src={portraitUrl}
            />
          </motion.div>
        </Magnet>

        <div className="relative z-20 mt-auto flex items-end justify-between gap-6 px-6 pb-7 sm:px-8 sm:pb-8 md:px-10 md:pb-10">
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[160px] text-[clamp(0.75rem,1.4vw,1.5rem)] font-light uppercase leading-snug tracking-wide text-[#d7e2ea] sm:max-w-[220px] md:max-w-[260px]"
            initial={{ opacity: 0, y: 20 }}
            transition={{
              delay: 0.35,
              duration: 0.7,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            AI engineer, software builder, and motion designer shipping ideas
            from concept to product
          </motion.p>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{
              delay: 0.5,
              duration: 0.7,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <ContactButton />
          </motion.div>
        </div>
      </section>

      <Marquee />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <JackFooter />
    </main>
  );
}
