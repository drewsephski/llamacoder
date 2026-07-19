"use client";

import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";

type MagnetProps = {
  children: ReactNode;
  className?: string;
  padding?: number;
  strength?: number;
};

export default function Magnet({
  children,
  className,
  padding = 150,
  strength = 3,
}: MagnetProps) {
  const [transform, setTransform] = useState("translate3d(0, 0, 0)");
  const [transition, setTransition] = useState("transform 0.6s ease-in-out");

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - (bounds.left + bounds.width / 2);
    const y = event.clientY - (bounds.top + bounds.height / 2);
    const isActive =
      Math.abs(x) <= bounds.width / 2 + padding &&
      Math.abs(y) <= bounds.height / 2 + padding;

    setTransition(
      isActive ? "transform 0.3s ease-out" : "transform 0.6s ease-in-out",
    );
    setTransform(
      isActive
        ? `translate3d(${x / strength}px, ${y / strength}px, 0)`
        : "translate3d(0, 0, 0)",
    );
  };

  return (
    <div
      className={className}
      onMouseLeave={() => {
        setTransition("transform 0.6s ease-in-out");
        setTransform("translate3d(0, 0, 0)");
      }}
      onMouseMove={handleMove}
    >
      <div style={{ transform, transition, willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
}
