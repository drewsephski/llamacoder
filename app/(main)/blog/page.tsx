import type { Metadata } from "next";
import { BrandIdentityQuickFaq } from "@/components/brand-identity-quick-faq";
import { MarketingHub } from "@/components/marketing-hub";
import { blogPages } from "@/lib/marketing-pages";

export const metadata: Metadata = {
  title: "Guides for AI-Generated React Apps",
  description:
    "Production-minded guides for evaluating AI-generated React, understanding app builder credits, benchmarking screenshot-to-code, and exporting projects cleanly.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "AI-Generated React Guides | Squid Agent",
    description:
      "Practical guides for building, evaluating, recovering, and exporting AI-generated React applications.",
    url: "/blog",
    type: "website",
  },
};

export default function BlogIndexPage() {
  return (
    <>
      <MarketingHub
        kind="guide"
        title="Field guides for React apps built with AI"
        intro="Start from problem-led intent pages like export and cost comparison, then use these middle-stage guides to decide and execute with verified checkpoints."
        pages={blogPages}
      />
      <BrandIdentityQuickFaq className="pb-0" />
    </>
  );
}
