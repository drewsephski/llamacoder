import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function DesignPartnerBanner() {
  return (
    <aside className="relative z-20 border-b border-border/70 bg-[#0062FF] text-white">
      <div className="mx-auto flex min-h-11 max-w-6xl flex-col items-start justify-center gap-1 px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-6">
        <p className="font-medium">
          Design partners wanted. Bring a real brief and build the first
          prototype with us at no charge.
        </p>
        <Link
          href="#design-partner-program"
          className="inline-flex min-h-8 shrink-0 items-center gap-1.5 font-semibold underline decoration-white/50 underline-offset-4 transition-colors hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0062FF]"
        >
          Apply for a working session
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}
