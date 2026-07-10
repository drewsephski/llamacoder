import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DocsProvider } from "@/components/docs/docs-provider";
import { DocsShell } from "@/components/docs/docs-shell";
import { buildDocsNavigation } from "@/lib/docs/navigation";
import { docsSource } from "@/lib/docs/source";

export const metadata: Metadata = {
  title: {
    default: "Documentation",
    template: "%s | Squid Agent Docs",
  },
  description:
    "Learn how to build, refine, inspect, and export React apps with Squid Agent using practical guides, example apps, and reusable prompts.",
  alternates: {
    canonical: "/docs",
  },
};

export default function DocsLayout({ children }: { children: ReactNode }) {
  const sections = buildDocsNavigation(docsSource.getPageTree());

  return (
    <DocsProvider>
      <DocsShell sections={sections}>{children}</DocsShell>
    </DocsProvider>
  );
}
