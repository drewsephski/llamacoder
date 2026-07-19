"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
};

export default function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
}: FadeInProps) {
  return (
    <motion.div
      animate={{ opacity: 1, x: 0, y: 0 }}
      className={className}
      initial={{ opacity: 0, x, y }}
      transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
    >
      {children}
    </motion.div>
  );
}
