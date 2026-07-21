import type { Metadata } from "next";
import { BrandIdentityQuickFaq } from "@/components/brand-identity-quick-faq";
import { MarketingHub } from "@/components/marketing-hub";
import { comparisonPages } from "@/lib/marketing-pages";

export const metadata: Metadata = {
  title: "AI App Builder Comparisons",
  description:
    "Evidence-led 2026 comparisons of Squid Agent, Lovable, Bolt.new, and v0 covering code export, credits, version history, quality checks, and product fit.",
  alternates: { canonical: "/compare" },
  openGraph: {
    title: "AI App Builder Comparisons | Squid Agent",
    description:
      "Compare current AI app builder workflows using official sources and reproducible acceptance criteria.",
    url: "/compare",
    type: "website",
  },
};

export default function CompareIndexPage() {
  return (
    <>
      <MarketingHub
        kind="comparison"
        title="AI app builder comparisons without stale talking points"
        intro="Compare the workflows that matter after the demo: usage visibility, edit stability, recovery, source portability, local builds, and the evidence each product gives you. Start with agencies, startups, or design-led teams to match your business model."
        pages={comparisonPages}
      />
      <BrandIdentityQuickFaq className="pb-0" />
    </>
  );
}
