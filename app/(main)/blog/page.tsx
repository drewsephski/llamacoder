import { BrandIdentityQuickFaq } from "@/components/brand-identity-quick-faq";
import { MarketingHub } from "@/components/marketing-hub";
import { blogPages } from "@/lib/marketing-pages";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "AI App Builder Guides for React Apps",
  description:
    "Practical AI app builder guides for choosing tools, controlling credits, turning screenshots into React, verifying generated code, recovering versions, and exporting cleanly.",
  path: "/blog",
  keywords: ["AI app builder guides", "AI React app builder"],
});

export default function BlogIndexPage() {
  return (
    <>
      <MarketingHub
        kind="guide"
        title="AI app builder guides for React apps you can ship"
        intro="Choose the right builder, turn prompts and visual references into responsive React, control cost, verify the result, recover safely, and export a project your team can keep building."
        pages={blogPages}
      />
      <BrandIdentityQuickFaq className="pb-0" />
    </>
  );
}
