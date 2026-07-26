import type { ComponentProps, CSSProperties } from "react";

import { cn } from "@/lib/utils";

const SHADOW_ANIMATION = "loading-ui-comet-shadow";
const ROTATION_ANIMATION = "loading-ui-comet-rotation";

type CometSpinnerProps = ComponentProps<"span"> & {
  headScale?: number;
  radiusScale?: number;
  variant?: CometSpinnerVariant;
};

type CometSpinnerStyle = CSSProperties & {
  "--loading-ui-comet-head": string;
  "--loading-ui-comet-radius": string;
};

type CometSpinnerVariant = "inline" | "page";

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function CometSpinner({
  "aria-label": ariaLabel = "Loading",
  className,
  style,
  headScale,
  radiusScale,
  variant = "inline",
  role = "status",
  ...props
}: CometSpinnerProps) {
  const defaultHeadScale = variant === "page" ? 0.2 : 0.14;
  const defaultRadiusScale = variant === "page" ? 0.83 : 0.46;
  const safeHeadScale = clamp(headScale ?? defaultHeadScale, 0.08, 0.35);
  const safeRadiusScale = clamp(radiusScale ?? defaultRadiusScale, 0.3, 1.1);
  const cometStyle = {
    ...style,
    containerType: "size",
    "--loading-ui-comet-head": `${(safeHeadScale * 100).toFixed(2)}cqmin`,
    "--loading-ui-comet-radius": `${(safeRadiusScale * 100).toFixed(2)}cqmin`,
  } as CometSpinnerStyle;

  return (
    <>
      <style href="loading-ui-comet-spinner" precedence="default">{`
        @keyframes ${SHADOW_ANIMATION} {
          0% {
            box-shadow:
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.1),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.2),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.3),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.385);
          }

          5%,
          95% {
            box-shadow:
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.1),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.2),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.3),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.385);
          }

          10%,
          59% {
            box-shadow:
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2),
              calc(var(--loading-ui-comet-radius) * -0.105) calc(var(--loading-ui-comet-radius) * -0.994) 0 calc(var(--loading-ui-comet-head) * -2.1),
              calc(var(--loading-ui-comet-radius) * -0.208) calc(var(--loading-ui-comet-radius) * -0.978) 0 calc(var(--loading-ui-comet-head) * -2.2),
              calc(var(--loading-ui-comet-radius) * -0.308) calc(var(--loading-ui-comet-radius) * -0.95) 0 calc(var(--loading-ui-comet-head) * -2.3),
              calc(var(--loading-ui-comet-radius) * -0.358) calc(var(--loading-ui-comet-radius) * -0.934) 0 calc(var(--loading-ui-comet-head) * -2.385);
          }

          20% {
            box-shadow:
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2),
              calc(var(--loading-ui-comet-radius) * -0.407) calc(var(--loading-ui-comet-radius) * -0.913) 0 calc(var(--loading-ui-comet-head) * -2.1),
              calc(var(--loading-ui-comet-radius) * -0.669) calc(var(--loading-ui-comet-radius) * -0.743) 0 calc(var(--loading-ui-comet-head) * -2.2),
              calc(var(--loading-ui-comet-radius) * -0.808) calc(var(--loading-ui-comet-radius) * -0.588) 0 calc(var(--loading-ui-comet-head) * -2.3),
              calc(var(--loading-ui-comet-radius) * -0.902) calc(var(--loading-ui-comet-radius) * -0.41) 0 calc(var(--loading-ui-comet-head) * -2.385);
          }

          38% {
            box-shadow:
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2),
              calc(var(--loading-ui-comet-radius) * -0.454) calc(var(--loading-ui-comet-radius) * -0.892) 0 calc(var(--loading-ui-comet-head) * -2.1),
              calc(var(--loading-ui-comet-radius) * -0.777) calc(var(--loading-ui-comet-radius) * -0.629) 0 calc(var(--loading-ui-comet-head) * -2.2),
              calc(var(--loading-ui-comet-radius) * -0.934) calc(var(--loading-ui-comet-radius) * -0.358) 0 calc(var(--loading-ui-comet-head) * -2.3),
              calc(var(--loading-ui-comet-radius) * -0.988) calc(var(--loading-ui-comet-radius) * -0.108) 0 calc(var(--loading-ui-comet-head) * -2.385);
          }

          100% {
            box-shadow:
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.1),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.2),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.3),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.385);
          }
        }

        @keyframes ${ROTATION_ANIMATION} {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .loading-ui-comet-orbit {
            animation: none !important;
            transform: rotate(40deg) translateZ(0) !important;
          }
        }
      `}</style>
      <span
        data-slot="comet-spinner"
        role={role}
        aria-label={ariaLabel}
        className={cn(
          "relative inline-flex aspect-square size-4 shrink-0 items-center justify-center align-middle",
          className,
        )}
        style={cometStyle}
        {...props}
      >
        <span
          aria-hidden="true"
          className="loading-ui-comet-orbit absolute inset-0 rounded-full"
          style={{
            animation: `${SHADOW_ANIMATION} var(--duration, 1.7s) infinite var(--easing, ease), ${ROTATION_ANIMATION} var(--duration, 1.7s) infinite var(--easing, ease)`,
            transform: "translateZ(0)",
          }}
        />
        <span className="sr-only">{ariaLabel}</span>
      </span>
    </>
  );
}

export { CometSpinner, type CometSpinnerVariant };
