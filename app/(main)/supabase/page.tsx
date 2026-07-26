import {
  MarketingFooter,
  MarketingHeader,
} from "@/components/marketing-chrome";
import { SupabaseTechnicalWalkthrough } from "@/components/supabase-technical-walkthrough";
import { SITE_URL, createPageMetadata } from "@/lib/seo";

const path = "/supabase";
const title = "How Squid Verifies Supabase Backends";
const description =
  "A technical walkthrough of Squid's Supabase control plane: OAuth, project provisioning, explicit database approval, RLS verification, and browser-safe generated apps.";

export const metadata = createPageMetadata({
  title,
  description,
  path,
  type: "article",
  keywords: ["Supabase AI app builder", "AI app builder with database"],
});

const structuredData = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: title,
  description,
  url: `${SITE_URL}/supabase`,
  author: {
    "@type": "Person",
    name: "Drew Sepeczi",
  },
  publisher: {
    "@type": "Organization",
    name: "Squid Agent",
    url: SITE_URL,
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
