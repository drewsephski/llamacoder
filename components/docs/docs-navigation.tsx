"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DocsNavSection } from "@/lib/docs/navigation";
import { cn } from "@/lib/utils";

type DocsNavigationProps = {
  sections: DocsNavSection[];
  onNavigate?: () => void;
};

export function DocsNavigation({ sections, onNavigate }: DocsNavigationProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Documentation" className="space-y-7">
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {section.title}
          </h2>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm leading-5 transition-colors",
                      active
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}
