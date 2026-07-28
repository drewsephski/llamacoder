"use client";

import { animate, motion, useMotionValue } from "framer-motion";
import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

interface DraggableProjectRailProps {
  ariaLabel: string;
  children: ReactNode;
  desktopBreakpoint: 768 | 1024;
  variant: "landing" | "shipped";
}

const DRAG_CLICK_THRESHOLD_PX = 6;

export function DraggableProjectRail({
  ariaLabel,
  children,
  desktopBreakpoint,
  variant,
}: DraggableProjectRailProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);
  const x = useMotionValue(0);
  const [maxDrag, setMaxDrag] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!viewport || !track) return;

    const nextMaxDrag = Math.max(0, track.scrollWidth - viewport.clientWidth);
    setMaxDrag(nextMaxDrag);
    x.set(Math.max(-nextMaxDrag, Math.min(0, x.get())));
  }, [x]);

  useLayoutEffect(() => {
    measure();

    const observer = new ResizeObserver(measure);
    if (viewportRef.current) observer.observe(viewportRef.current);
    if (trackRef.current) observer.observe(trackRef.current);

    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    const desktopQuery = window.matchMedia(
      `(min-width: ${desktopBreakpoint}px)`,
    );
    const syncDesktopState = () => {
      setIsDesktop(desktopQuery.matches);
      if (desktopQuery.matches) x.set(0);
      requestAnimationFrame(measure);
    };

    syncDesktopState();
    desktopQuery.addEventListener("change", syncDesktopState);
    return () => desktopQuery.removeEventListener("change", syncDesktopState);
  }, [desktopBreakpoint, measure, x]);

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!draggedRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    draggedRef.current = false;
  };

  return (
    <div
      ref={viewportRef}
      className={`showcase-rail-viewport showcase-rail-viewport--${variant}`}
      aria-label={ariaLabel}
    >
      <motion.div
        ref={trackRef}
        className={`showcase-rail showcase-rail--${variant}`}
        drag={!isDesktop && maxDrag > 0 ? "x" : false}
        dragConstraints={{ left: -maxDrag, right: 0 }}
        dragElastic={0.08}
        dragMomentum={false}
        style={{ x }}
        onPointerDownCapture={() => {
          draggedRef.current = false;
        }}
        onDragStart={() => {
          draggedRef.current = false;
        }}
        onDrag={(_, info) => {
          if (Math.abs(info.offset.x) >= DRAG_CLICK_THRESHOLD_PX) {
            draggedRef.current = true;
          }
        }}
        onDragEnd={(_, info) => {
          const track = trackRef.current;
          const firstCard = track?.firstElementChild as HTMLElement | null;
          if (!track || !firstCard) return;

          const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
          const step = firstCard.getBoundingClientRect().width + gap;
          const projectedX = x.get() + info.velocity.x * 0.18;
          const target = Math.max(
            -maxDrag,
            Math.min(0, Math.round(projectedX / step) * step),
          );

          animate(x, target, {
            type: "spring",
            stiffness: 320,
            damping: 34,
          });
        }}
        onClickCapture={handleClickCapture}
      >
        {children}
      </motion.div>
    </div>
  );
}
