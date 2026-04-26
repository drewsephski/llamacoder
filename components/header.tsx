import { memo } from "react";

import Link from "next/link";
import { AnimatedThemeToggleButton } from "@/components/ui/animated-theme-toggle-button";

function Header() {
  return (
    <header className="relative mx-auto flex w-full shrink-0 items-center justify-between px-4 py-6">
      <Link href="/" className="flex flex-row items-center gap-3">
        <img
          src="/squidcoder-logo.svg"
          alt="Squid Coder"
          className="h-9 object-contain"
        />
      </Link>
      <AnimatedThemeToggleButton type="horizontal" />
    </header>
  );
}

export default memo(Header);
