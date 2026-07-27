import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DocsProvider } from "@/components/docs/docs-provider";
import { DocsShell } from "@/components/docs/docs-shell";
import { buildDocsNavigation } from "@/lib/docs/navigation";
import { docsSource } from "@/lib/docs/source";
import { createPageMetadata } from "@/lib/seo";

const docsMetadata = createPageMetadata({
  title: "Squid Agent Documentation",
  description:
    "Learn how to build, refine, inspect, and export React apps with Squid Agent using practical guides, example apps, and reusable prompts.",
  path: "/docs",
  keywords: ["AI app builder documentation", "Squid Agent docs"],
});

export const metadata: Metadata = {
  ...docsMetadata,
  title: {
    default: "Documentation",
    template: "%s | Squid Agent",
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
