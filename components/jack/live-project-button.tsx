import type { AnchorHTMLAttributes } from "react";

type LiveProjectButtonProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export default function LiveProjectButton({
  className = "",
  ...props
}: LiveProjectButtonProps) {
  return (
    <a
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 border-[#d7e2ea] px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-[#d7e2ea] transition-colors duration-200 hover:bg-[#d7e2ea]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7e2ea] sm:px-8 sm:py-3 sm:text-sm ${className}`}
      href="https://drewsepeczi.xyz"
      {...props}
    >
      Live Project
    </a>
  );
}
