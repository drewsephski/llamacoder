import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Neon } from "@/logos/neon";
import { BetterAuth } from "@/logos/better-auth";
import { Bun } from "@/logos/bun";
import { Shadcn } from "@/logos/shadcn";
import { PostgreSQL } from "@/logos/postgresql";
import { Prisma } from "@/logos/prisma";
import { Tailwind } from "@/logos/tailwind";
import { TypeScript } from "@/logos/typescript";

const BrandLogo = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => <img src={src} alt={alt} className={className} />;

const brands = [
  {
    id: "typescript",
    name: "TypeScript",
    type: "component",
    component: TypeScript,
  },
  {
    id: "react",
    name: "React",
    logo: "https://svgl.app/library/react_light.svg",
    logoDark: "https://svgl.app/library/react_dark.svg",
  },
  {
    id: "shadcn",
    name: "shadcn",
    type: "component",
    component: Shadcn,
  },
  {
    id: "tailwind",
    name: "Tailwind",
    type: "component",
    component: Tailwind,
  },
  {
    id: "vercel",
    name: "Vercel",
    logo: "https://svgl.app/library/vercel.svg",
    logoDark: "https://svgl.app/library/vercel_dark.svg",
  },
  {
    id: "nextjs",
    name: "Next.js",
    logo: "https://svgl.app/library/nextjs_icon_dark.svg",
    logoDark: "https://svgl.app/library/nextjs_icon_dark.svg",
  },
  {
    id: "openai",
    name: "OpenAI",
    logo: "https://svgl.app/library/openai.svg",
    logoDark: "https://svgl.app/library/openai_dark.svg",
  },
  {
    id: "supabase",
    name: "Supabase",
    logo: "https://svgl.app/library/supabase.svg",
    logoDark: "https://svgl.app/library/supabase.svg",
  },
  {
    id: "clerk",
    name: "Clerk",
    logo: "https://svgl.app/library/clerk-icon-light.svg",
    logoDark: "https://svgl.app/library/clerk-icon-dark.svg",
  },
  {
    id: "stripe",
    name: "Stripe",
    logo: "https://svgl.app/library/stripe.svg",
    logoDark: "https://svgl.app/library/stripe.svg",
  },
  {
    id: "better-auth",
    name: "Better Auth",
    type: "component",
    component: BetterAuth,
  },
  {
    id: "neon",
    name: "Neon",
    type: "component",
    component: Neon,
  },
  {
    id: "bun",
    name: "Bun",
    type: "component",
    component: Bun,
  },

  {
    id: "postgres",
    name: "Postgres",
    type: "component",
    component: PostgreSQL,
  },
  {
    id: "prisma",
    name: "Prisma",
    type: "component",
    component: Prisma,
  },
  {
    id: "firecrawl",
    name: "Firecrawl",
    logo: "https://svgl.app/library/firecrawl.svg",
    logoDark: "https://svgl.app/library/firecrawl.svg",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    logo: "https://svgl.app/library/openrouter_light.svg",
    logoDark: "https://svgl.app/library/openrouter_dark.svg",
  },
];

export default function HoverBrandLogo() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const activeBrand = brands.find((b) => b.id === hoveredId);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 px-4 py-12">
      {/* Text */}
      <div className="text-center">
        <p className="mb-2 text-sm text-muted-foreground/70">Built with</p>
        <div className="relative h-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={hoveredId ?? "default"}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-lg font-medium text-foreground"
            >
              {activeBrand?.name ?? "modern technologies"}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Icon grid */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {brands.map((brand) => {
          const { id, name } = brand;
          const isActive = hoveredId === id;
          const isDimmed = hoveredId !== null && !isActive;
          return (
            <button
              key={id}
              aria-label={name}
              className={[
                "flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl border p-3 transition-all duration-300",
                isActive
                  ? "border-foreground/20 bg-foreground/5 dark:border-white/30 dark:bg-white/10"
                  : "border-border/40 hover:border-foreground/15 dark:border-border/30 dark:hover:border-foreground/20",
                isDimmed ? "opacity-30" : "opacity-70 hover:opacity-100",
              ].join(" ")}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {"type" in brand && brand.type === "component" ? (
                <brand.component className="h-6 w-6" />
              ) : (
                <>
                  <BrandLogo
                    src={(brand as { logo: string }).logo}
                    alt={name}
                    className="h-6 w-6 dark:hidden"
                  />
                  <BrandLogo
                    src={(brand as { logoDark: string }).logoDark}
                    alt={name}
                    className="hidden h-6 w-6 dark:block"
                  />
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
