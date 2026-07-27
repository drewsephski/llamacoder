"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" as const },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

const PARAGRAPH_ONE =
  "We're building a space where ideas become systems — where founders find leverage, builders find speed, and every prompt becomes a product worth shipping.";

const PARAGRAPH_TWO =
  "A platform where planning, generation, and verification flow together — with less guesswork, less friction, and more working software for everyone involved.";

const HIGHLIGHTED_WORDS = ["ideas", "become", "systems"] as const;

function RevealWord({
  children,
  highlighted,
  progress,
  range,
  reduceMotion,
}: {
  children: React.ReactNode;
  highlighted: boolean;
  progress: MotionValue<number>;
  range: [number, number];
  reduceMotion: boolean | null;
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);

  return (
    <motion.span
      className={highlighted ? "text-foreground" : "text-muted-foreground"}
      style={{ opacity: reduceMotion ? 1 : opacity }}
    >
      {children}
    </motion.span>
  );
}

function RevealLine({
  words,
  highlighted,
  className,
  reduceMotion,
}: {
  words: string[];
  highlighted: readonly string[];
  className: string;
  reduceMotion: boolean | null;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 82%", "end 35%"],
  });

  return (
    <p className={`relative ${className}`} ref={ref}>
      {words.map((word, index) => (
        <RevealWord
          key={`${word}-${index}`}
          highlighted={highlighted.includes(word.replace(/[—.,]/g, ""))}
          progress={scrollYProgress}
          range={[index / words.length, (index + 1) / words.length]}
          reduceMotion={reduceMotion}
        >
          {word}{" "}
        </RevealWord>
      ))}
    </p>
  );
}

export function HomepageScrollStatement() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-label="Product statement"
      className="relative z-10 w-full px-4 py-16 sm:px-6 sm:py-24 md:py-28"
      data-testid="homepage-scroll-statement"
    >
      <div className="mx-auto w-full max-w-4xl">
        <motion.div {...fadeUp(0)}>
          <RevealLine
            className="text-2xl font-medium leading-[1.15] tracking-[-1px] md:text-4xl lg:text-5xl"
            highlighted={HIGHLIGHTED_WORDS}
            reduceMotion={reduceMotion}
            words={PARAGRAPH_ONE.split(" ")}
          />
        </motion.div>

        <motion.div {...fadeUp(0.12)}>
          <RevealLine
            className="mt-10 text-xl font-medium leading-[1.2] tracking-[-0.5px] md:text-2xl lg:text-3xl"
            highlighted={[]}
            reduceMotion={reduceMotion}
            words={PARAGRAPH_TWO.split(" ")}
          />
        </motion.div>
      </div>
    </section>
  );
}
