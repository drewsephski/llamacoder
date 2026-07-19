"use client";

import { ArrowRight, Check } from "lucide-react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const HERO_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";
const FEATURE_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4";

const STORYBOARD_ICON =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png&w=1280&q=85";
const CRITIQUES_ICON =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png&w=1280&q=85";
const CAPSULE_ICON =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png&w=1280&q=85";

const HERO_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E\")";
const FEATURES_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E\")";

const aboutCopy =
  "Over the last seven years, I have worked with Parallax, a Berlin-based production house that crafts cinema, series, and Noir Studio in Paris. Together, we have created work that has earned international acclaim at several major festivals.";

const featureCards = [
  {
    number: "01",
    title: "Project Storyboard.",
    icon: STORYBOARD_ICON,
    items: [
      "Visualize every scene",
      "Map your creative direction",
      "Keep every reference close",
      "Share a clear point of view",
    ],
  },
  {
    number: "02",
    title: "Smart Critiques.",
    icon: CRITIQUES_ICON,
    items: [
      "AI-powered analysis",
      "Actionable creative notes",
      "Connected tool integrations",
    ],
  },
  {
    number: "03",
    title: "Immersion Capsule.",
    icon: CAPSULE_ICON,
    items: [
      "Silence every notification",
      "Curated ambient soundscapes",
      "Sync your schedule",
    ],
  },
] as const;

type Segment = {
  text: string;
  className?: string;
};

function WordsPullUp({
  className = "",
  showAsterisk = false,
  text,
}: {
  className?: string;
  showAsterisk?: boolean;
  text: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const words = text.split(" ");

  return (
    <span
      ref={ref}
      className={`inline-flex flex-wrap ${className}`}
      aria-label={text}
    >
      {words.map((word, index) => (
        <motion.span
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="mr-[0.24em] inline-block"
          key={`${word}-${index}`}
          transition={{
            delay: index * 0.08,
            duration: 0.65,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <span className="relative inline-block">
            {word}
            {showAsterisk && index === words.length - 1 && (
              <sup className="absolute -right-[0.3em] top-[0.65em] text-[0.31em] leading-none">
                *
              </sup>
            )}
          </span>
        </motion.span>
      ))}
    </span>
  );
}

function WordsPullUpMultiStyle({ segments }: { segments: Segment[] }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const words = segments.flatMap((segment) =>
    segment.text
      .split(" ")
      .map((word) => ({ className: segment.className, word })),
  );

  return (
    <span ref={ref} className="inline-flex flex-wrap justify-center">
      {words.map(({ className, word }, index) => (
        <motion.span
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className={`mr-[0.24em] inline-block ${className ?? ""}`}
          key={`${word}-${index}`}
          transition={{
            delay: index * 0.08,
            duration: 0.65,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

function AnimatedLetter({
  character,
  index,
  total,
  progress,
}: {
  character: string;
  index: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  total: number;
}) {
  const charProgress = index / total;
  const opacity = useTransform(
    progress,
    [Math.max(0, charProgress - 0.1), Math.min(1, charProgress + 0.05)],
    [0.2, 1],
  );

  return <motion.span style={{ opacity }}>{character}</motion.span>;
}

function AnimatedParagraph({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"],
  });

  return (
    <p
      ref={ref}
      className="text-xs leading-[1.35] text-[#DEDBC8] sm:text-sm md:text-base"
    >
      {Array.from(text).map((character, index) => (
        <AnimatedLetter
          character={character}
          index={index}
          key={`${character}-${index}`}
          progress={scrollYProgress}
          total={text.length}
        />
      ))}
    </p>
  );
}

function FeatureCard({
  icon,
  items,
  number,
  title,
}: (typeof featureCards)[number]) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.article
      ref={ref}
      animate={
        isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
      }
      className="flex min-h-[420px] flex-col bg-[#212121] p-5 sm:p-6 lg:h-[480px]"
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* The supplied feature artwork is remote and intentionally unoptimized. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className="h-10 w-10 rounded object-cover sm:h-12 sm:w-12"
        src={icon}
      />
      <div className="mt-8 flex items-start justify-between gap-4">
        <h3 className="text-lg leading-tight text-[#E1E0CC] sm:text-xl">
          {title}
        </h3>
        <span className="text-xs text-gray-500">{number}</span>
      </div>
      <ul className="mt-7 space-y-3">
        {items.map((item) => (
          <li
            className="flex items-start gap-2 text-xs text-gray-400 sm:text-sm"
            key={item}
          >
            <Check
              aria-hidden="true"
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#DEDBC8]"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <a
        className="mt-auto inline-flex items-center gap-2 self-start text-xs text-[#E1E0CC] transition-all hover:gap-3 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E1E0CC] focus-visible:ring-offset-2 focus-visible:ring-offset-[#212121]"
        href="#inquiries"
      >
        Learn more
        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 -rotate-45" />
      </a>
    </motion.article>
  );
}

export default function PrismaPage({
  fontClassName,
}: {
  fontClassName: string;
}) {
  return (
    <main
      className={`${fontClassName} prisma-page min-h-screen bg-black text-[#E1E0CC]`}
      style={{ fontFamily: "var(--font-prisma-almarai), sans-serif" }}
    >
      <section className="h-screen bg-black p-4 md:p-6" id="top">
        <div className="relative h-full overflow-hidden rounded-2xl md:rounded-[2rem]">
          <video
            aria-hidden="true"
            autoPlay
            className="absolute inset-0 h-full w-full object-cover"
            loop
            muted
            playsInline
            src={HERO_VIDEO_URL}
            tabIndex={-1}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay"
            style={{ backgroundImage: HERO_NOISE }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"
          />

          <nav
            aria-label="Primary navigation"
            className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 items-center gap-3 rounded-b-2xl bg-black px-4 py-2 sm:gap-6 sm:px-6 sm:py-2.5 md:gap-12 md:rounded-b-3xl md:px-8 lg:gap-14"
          >
            {[
              ["Our story", "#about"],
              ["Collective", "#collective"],
              ["Workshops", "#features"],
              ["Programs", "#features"],
              ["Inquiries", "#inquiries"],
            ].map(([label, href]) => (
              <a
                className="whitespace-nowrap text-[10px] transition-colors hover:text-[#E1E0CC] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E1E0CC] sm:text-xs md:text-sm"
                href={href}
                key={label}
                style={{ color: "rgba(225, 224, 204, 0.8)" }}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 z-10 grid grid-cols-1 items-end gap-8 p-5 sm:p-8 md:grid-cols-12 md:gap-4 md:p-10 lg:p-12">
            <h1 className="col-span-1 min-w-0 text-[26vw] font-medium leading-[0.85] tracking-[-0.07em] text-[#E1E0CC] sm:text-[24vw] md:col-span-8 md:text-[22vw] lg:text-[20vw] xl:text-[19vw] 2xl:text-[20vw]">
              <WordsPullUp showAsterisk text="Prisma" />
            </h1>

            <div className="col-span-1 flex max-w-sm flex-col items-start gap-5 pb-2 md:col-span-4 md:justify-self-end md:pb-4">
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="text-xs leading-[1.2] text-[#DEDBC8]/70 sm:text-sm md:text-base"
                initial={{ opacity: 0, y: 20 }}
                transition={{
                  delay: 0.5,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                Prisma is a worldwide network of visual artists, filmmakers and
                storytellers bound not by place, status or labels but by passion
                and hunger to unlock potential through our unique perspectives.
              </motion.p>
              <motion.a
                animate={{ opacity: 1, y: 0 }}
                className="group inline-flex items-center gap-2 rounded-full bg-[#DEDBC8] py-1.5 pl-4 pr-1.5 text-sm font-medium text-black transition-[gap] hover:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DEDBC8] focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-base"
                href="#inquiries"
                initial={{ opacity: 0, y: 20 }}
                transition={{
                  delay: 0.7,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                Join the lab
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 text-[#E1E0CC]"
                  />
                </span>
              </motion.a>
            </div>
          </div>
        </div>
      </section>

      <section
        className="bg-black px-4 py-20 sm:px-6 sm:py-28 md:py-36"
        id="about"
      >
        <div className="mx-auto max-w-6xl bg-[#101010] px-5 py-14 text-center sm:px-10 sm:py-20 md:px-16 md:py-28">
          <p className="text-[10px] text-[#DEDBC8] sm:text-xs">Visual arts</p>
          <h2 className="mx-auto mt-8 max-w-3xl text-3xl font-normal leading-[0.95] text-[#E1E0CC] sm:text-4xl sm:leading-[0.9] md:text-5xl lg:text-6xl xl:text-7xl">
            <WordsPullUpMultiStyle
              segments={[
                { text: "I am Marcus Chen," },
                {
                  text: "a self-taught director.",
                  className: "font-[var(--font-prisma-serif)] italic",
                },
                {
                  text: "I have skills in color grading, visual effects, and narrative design.",
                },
              ]}
            />
          </h2>
          <div
            className="mx-auto mt-12 max-w-3xl"
            style={{ fontFamily: "var(--font-prisma-almarai), sans-serif" }}
          >
            <AnimatedParagraph text={aboutCopy} />
          </div>
        </div>
      </section>

      <section
        className="relative min-h-screen overflow-hidden bg-black px-4 py-20 sm:px-6 sm:py-28"
        id="features"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{ backgroundImage: FEATURES_NOISE }}
        />
        <div className="relative mx-auto max-w-6xl">
          <h2 className="max-w-4xl text-xl font-normal leading-tight text-[#E1E0CC] sm:text-2xl md:text-3xl lg:text-4xl">
            <WordsPullUpMultiStyle
              segments={[
                { text: "Studio-grade workflows for visionary creators." },
                {
                  text: "Built for pure vision. Powered by art.",
                  className: "text-gray-500",
                },
              ]}
            />
          </h2>

          <div className="mt-12 grid gap-2 md:grid-cols-2 lg:h-[480px] lg:grid-cols-4">
            <motion.article
              className="relative min-h-[420px] overflow-hidden lg:h-[480px]"
              initial={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <video
                aria-hidden="true"
                autoPlay
                className="absolute inset-0 h-full w-full object-cover"
                loop
                muted
                playsInline
                src={FEATURE_VIDEO_URL}
                tabIndex={-1}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <p className="absolute bottom-5 left-5 text-lg text-[#E1E0CC] sm:bottom-6 sm:left-6 sm:text-xl">
                Your creative canvas.
              </p>
            </motion.article>

            {featureCards.map((card, index) => (
              <motion.div
                key={card.number}
                initial={{ opacity: 0, scale: 0.95 }}
                transition={{
                  delay: (index + 1) * 0.15,
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
                viewport={{ once: true, margin: "-100px" }}
                whileInView={{ opacity: 1, scale: 1 }}
              >
                <FeatureCard {...card} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-black" id="inquiries" />
    </main>
  );
}
