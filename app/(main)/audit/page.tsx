import type { Metadata } from "next";

import {
  MarketingFooter,
  MarketingHeader,
} from "@/components/marketing-chrome";
import { SourceAuditClient } from "@/features/source-audit/components/source-audit-client";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Free AI App Source Audit",
  description:
    "Audit a public GitHub repository or exported AI app ZIP for portability, project structure, environment setup, and obvious client-secret exposure.",
  alternates: { canonical: "/audit" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/audit`,
    title: "Free AI App Source Audit | Squid Agent",
    description:
      "Find out what an AI-built app is actually ready for before you migrate or hand it off.",
  },
};

export default function SourceAuditPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <MarketingHeader />
      <main id="main-content">
        <SourceAuditClient />
      </main>
      <MarketingFooter />
    </div>
  );
}
