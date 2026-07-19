import type { AnchorHTMLAttributes } from "react";

type ContactButtonProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export default function ContactButton({
  className = "",
  ...props
}: ContactButtonProps) {
  return (
    <a
      className={`inline-flex items-center justify-center rounded-full bg-[linear-gradient(123deg,#18011f_7%,#b600a8_37%,#7621b0_72%,#be4c00_100%)] px-8 py-3 text-xs font-medium uppercase tracking-widest text-white shadow-[0_4px_4px_rgba(181,1,167,0.25),inset_4px_4px_12px_#7721b1] outline outline-2 outline-offset-[-3px] outline-white transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-offset-2 focus-visible:outline-[#d7e2ea] sm:px-10 sm:py-3.5 sm:text-sm md:px-12 md:py-4 md:text-base ${className}`}
      href="https://drewsepeczi.xyz"
      {...props}
    >
      Start a project
    </a>
  );
}
