import type { Metadata } from "next";
import {
  MarketingFooter,
  MarketingHeader,
} from "@/components/marketing-chrome";
import { SupabaseTechnicalWalkthrough } from "@/components/supabase-technical-walkthrough";

const path = "/supabase";
const title = "How Squid Verifies Supabase Backends";
const description =
  "A technical walkthrough of Squid's Supabase control plane: OAuth, project provisioning, explicit database approval, RLS verification, and browser-safe generated apps.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    type: "article",
    url: path,
    title: `${title} | Squid Agent`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | Squid Agent`,
    description,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: title,
  description,
  url: "https://squidagent.app/supabase",
  author: {
    "@type": "Person",
    name: "Drew Sepeczi",
  },
  publisher: {
    "@type": "Organization",
    name: "Squid Agent",
    url: "https://squidagent.app",
  },
  about: [
    "Supabase",
    "AI app builders",
    "Row Level Security",
    "OAuth",
    "database verification",
  ],
};

export default function SupabaseWalkthroughPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <SupabaseTechnicalWalkthrough />
      <MarketingFooter />
    </div>
  );
}
