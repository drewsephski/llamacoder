"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";

function AnimatedWord({
  word,
  index,
  progress,
  total,
}: {
  word: string;
  index: number;
  progress: MotionValue<number>;
  total: number;
}) {
  const start = Math.max(0, index / total - 0.15);
  const end = Math.min(1, start + 0.3);
  const opacity = useTransform(progress, [start, end], [0.2, 1]);

  return (
    <span className="relative inline-block whitespace-nowrap">
      <span aria-hidden="true" className="invisible">
        {word}
      </span>
      <motion.span
        aria-hidden="true"
        className="absolute inset-0"
        style={{ opacity }}
      >
        {word}
      </motion.span>
    </span>
  );
}

function useAnimatedProgress() {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"],
  });

  return { progress: scrollYProgress, ref };
}

export default function AnimatedText({ text }: { text: string }) {
  const { progress, ref } = useAnimatedProgress();
  const words = text.split(" ");

  return (
    <p
      aria-label={text}
      className="max-w-[680px] text-pretty text-center text-[clamp(1rem,2vw,1.35rem)] font-medium leading-relaxed text-[#d7e2ea]"
      ref={ref}
    >
      {words.map((word, index) => (
        <span aria-hidden="true" key={`${word}-${index}`}>
          <AnimatedWord
            index={index}
            progress={progress}
            total={words.length}
            word={word}
          />{" "}
        </span>
      ))}
    </p>
  );
}
