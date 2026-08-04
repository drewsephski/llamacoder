import {
  MarketingFooter,
  MarketingHeader,
} from "@/components/marketing-chrome";
import { SourceAuditClient } from "@/features/source-audit/components/source-audit-client";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Free AI App Source Audit",
  description:
    "Audit a public GitHub repository or exported AI app ZIP for portability, project structure, environment setup, and obvious client-secret exposure.",
  path: "/audit",
});

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
