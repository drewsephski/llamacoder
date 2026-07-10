import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CircleAlert, Lightbulb, Sparkles } from "lucide-react";
import type { MDXComponents } from "mdx/types";
import { Prompt } from "@/components/docs/prompt-block";
import { cn } from "@/lib/utils";

function Callout({
  children,
  title,
  type = "info",
}: {
  children: ReactNode;
  title?: string;
  type?: "info" | "tip" | "warn";
}) {
  const Icon =
    type === "warn" ? CircleAlert : type === "tip" ? Lightbulb : Sparkles;

  return (
    <aside
      className={cn(
        "not-prose my-7 grid grid-cols-[auto_1fr] gap-3 rounded-xl border p-4 text-sm leading-6",
        type === "warn"
          ? "border-amber-500/30 bg-amber-500/10"
          : type === "tip"
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-primary/25 bg-primary/[0.07]",
      )}
    >
      <Icon className="mt-0.5 size-5 text-primary" />
      <div>
        {title ? (
          <p className="mb-1 font-semibold text-foreground">{title}</p>
        ) : null}
        <div className="text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_p+p]:mt-2">
          {children}
        </div>
      </div>
    </aside>
  );
}

function Cards({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">{children}</div>
  );
}

function Card({
  description,
  href,
  title,
}: {
  description: string;
  href: string;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-36 flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <span className="mt-auto flex items-center gap-1 pt-5 text-sm font-medium text-primary">
        Read guide
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function MdxLink({ href = "", ...props }: ComponentPropsWithoutRef<"a">) {
  if (href.startsWith("/")) return <Link href={href} {...props} />;
  return <a href={href} target="_blank" rel="noreferrer" {...props} />;
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    h2: ({ className, ...props }) => (
      <h2 className={cn("scroll-mt-24", className)} {...props} />
    ),
    h3: ({ className, ...props }) => (
      <h3 className={cn("scroll-mt-24", className)} {...props} />
    ),
    a: MdxLink,
    Callout,
    Cards,
    Card,
    Prompt,
    ...components,
  };
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
