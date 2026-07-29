"use client";

import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";

import "./border-glow.css";

interface BorderGlowProps {
  children: ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: readonly string[];
  fillOpacity?: number;
}

type BorderGlowStyles = CSSProperties & Record<`--${string}`, string | number>;

const GRADIENT_POSITIONS = [
  "80% 55%",
  "69% 34%",
  "8% 6%",
  "41% 38%",
  "86% 85%",
  "82% 18%",
  "51% 4%",
] as const;
const GRADIENT_KEYS = [
  "--gradient-one",
  "--gradient-two",
  "--gradient-three",
  "--gradient-four",
  "--gradient-five",
  "--gradient-six",
  "--gradient-seven",
] as const;
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1] as const;

function parseHsl(value: string) {
  const match = value.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };

  return {
    h: Number.parseFloat(match[1]),
    s: Number.parseFloat(match[2]),
    l: Number.parseFloat(match[3]),
  };
}

function buildGlowVars(glowColor: string, intensity: number) {
  const { h, s, l } = parseHsl(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ["", "-60", "-50", "-40", "-30", "-20", "-10"];
  const variables: BorderGlowStyles = {};

  opacities.forEach((opacity, index) => {
    variables[`--glow-color${keys[index]}`] =
      `hsl(${base} / ${Math.min(opacity * intensity, 100)}%)`;
  });

  return variables;
}

function buildGradientVars(colors: readonly string[]) {
  const palette = colors.length > 0 ? colors : ["#0062ff"];
  const variables: BorderGlowStyles = {};

  GRADIENT_KEYS.forEach((key, index) => {
    const color = palette[Math.min(COLOR_MAP[index], palette.length - 1)];
    variables[key] =
      `radial-gradient(at ${GRADIENT_POSITIONS[index]}, ${color} 0px, transparent 50%)`;
  });
  variables["--gradient-base"] = `linear-gradient(${palette[0]} 0 100%)`;

  return variables;
}

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
const easeInCubic = (value: number) => value * value * value;

export function BorderGlow({
  children,
  className = "",
  edgeSensitivity = 30,
  glowColor = "216 100 56",
  backgroundColor = "hsl(var(--background))",
  borderRadius = 16,
  glowRadius = 32,
  glowIntensity = 0.85,
  coneSpread = 25,
  animated = false,
  colors = ["#0062ff", "#0ca8ff", "#67e8f9"],
  fillOpacity = 0.22,
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const scaleX = dx === 0 ? Number.POSITIVE_INFINITY : centerX / Math.abs(dx);
    const scaleY = dy === 0 ? Number.POSITIVE_INFINITY : centerY / Math.abs(dy);
    const edge = Math.min(Math.max(1 / Math.min(scaleX, scaleY), 0), 1);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;

    card.style.setProperty("--edge-proximity", (edge * 100).toFixed(3));
    card.style.setProperty(
      "--cursor-angle",
      `${(angle < 0 ? angle + 360 : angle).toFixed(3)}deg`,
    );
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (
      !animated ||
      !card ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let cancelled = false;
    const timers: number[] = [];
    const frames: number[] = [];
    const angleStart = 110;
    const angleEnd = 465;

    const animateValue = ({
      start = 0,
      end = 100,
      duration,
      delay = 0,
      ease,
      onUpdate,
      onEnd,
    }: {
      start?: number;
      end?: number;
      duration: number;
      delay?: number;
      ease: (value: number) => number;
      onUpdate: (value: number) => void;
      onEnd?: () => void;
    }) => {
      const timer = window.setTimeout(() => {
        const startedAt = performance.now();
        const tick = (now: number) => {
          if (cancelled) return;
          const progress = Math.min((now - startedAt) / duration, 1);
          onUpdate(start + (end - start) * ease(progress));
          if (progress < 1) frames.push(requestAnimationFrame(tick));
          else onEnd?.();
        };
        frames.push(requestAnimationFrame(tick));
      }, delay);
      timers.push(timer);
    };

    card.classList.add("sweep-active");
    card.style.setProperty("--cursor-angle", `${angleStart}deg`);
    animateValue({
      duration: 500,
      ease: easeOutCubic,
      onUpdate: (value) =>
        card.style.setProperty("--edge-proximity", `${value}`),
    });
    animateValue({
      duration: 1500,
      end: 50,
      ease: easeInCubic,
      onUpdate: (value) =>
        card.style.setProperty(
          "--cursor-angle",
          `${(angleEnd - angleStart) * (value / 100) + angleStart}deg`,
        ),
    });
    animateValue({
      delay: 1500,
      duration: 2250,
      start: 50,
      ease: easeOutCubic,
      onUpdate: (value) =>
        card.style.setProperty(
          "--cursor-angle",
          `${(angleEnd - angleStart) * (value / 100) + angleStart}deg`,
        ),
    });
    animateValue({
      delay: 2500,
      duration: 1500,
      start: 100,
      end: 0,
      ease: easeInCubic,
      onUpdate: (value) =>
        card.style.setProperty("--edge-proximity", `${value}`),
      onEnd: () => card.classList.remove("sweep-active"),
    });

    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
      frames.forEach(cancelAnimationFrame);
      card.classList.remove("sweep-active");
    };
  }, [animated]);

  const style: BorderGlowStyles = {
    "--card-bg": backgroundColor,
    "--edge-sensitivity": edgeSensitivity,
    "--border-radius": `${borderRadius}px`,
    "--glow-padding": `${glowRadius}px`,
    "--cone-spread": coneSpread,
    "--fill-opacity": fillOpacity,
    ...buildGlowVars(glowColor, glowIntensity),
    ...buildGradientVars(colors),
  };

  return (
    <div
      ref={cardRef}
      className={`border-glow-card ${className}`}
      style={style}
      onPointerMove={handlePointerMove}
    >
      <span className="edge-light" aria-hidden="true" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}
