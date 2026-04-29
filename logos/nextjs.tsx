import type { SVGProps } from "react";

const Nextjs = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
    <mask
      id="nextjs-mask"
      maskUnits="userSpaceOnUse"
      width="180"
      height="180"
      x="0"
      y="0"
      style={{ maskType: "alpha" }}
    >
      <circle cx="90" cy="90" fill="black" r="90" />
    </mask>
    <g mask="url(#nextjs-mask)">
      <circle cx="90" cy="90" fill="black" r="90" />
      <path
        d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
        fill="url(#nextjs-gradient1)"
      />
      <rect
        fill="url(#nextjs-gradient2)"
        width="12"
        height="72"
        x="115"
        y="54"
      />
    </g>
    <defs>
      <linearGradient
        id="nextjs-gradient1"
        x1="109"
        x2="144.5"
        y1="116.5"
        y2="160.5"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="white" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </linearGradient>
      <linearGradient
        id="nextjs-gradient2"
        x1="121"
        x2="120.799"
        y1="54"
        y2="106.875"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="white" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

export { Nextjs };
