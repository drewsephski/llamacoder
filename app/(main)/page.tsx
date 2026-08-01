import Footer from "@/components/footer";
import { ProductWorkflowDemo } from "@/components/homepage/product-workflow-demo";
import { HomepageScrollStatement } from "@/components/homepage/scroll-statement";
import HoverBrandLogo from "@/components/ui/hover-brand-logo";
import { HomepageBuilderIsland } from "@/features/marketing/components/homepage-builder-island";
import {
  HomepageBuiltWithSquidSection,
  HomepageFaqSection,
  HomepageLandingPagesSection,
  HomepageResearchSection,
  HomepageVerificationSection,
} from "@/features/marketing/components/homepage-server-content";
import { homepageStructuredData } from "@/features/marketing/homepage-seo";

export default function Home() {
  return (
    <>
      {homepageStructuredData.map((data) => (
        <script
          key={data["@id"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data).replace(/</g, "\\u003c"),
          }}
        />
      ))}

      <HomepageBuilderIsland
        workflowContent={
          <>
            <ProductWorkflowDemo />
            <HomepageScrollStatement />
          </>
        }
      >
        <HomepageVerificationSection />
        <HomepageLandingPagesSection />
        <HomepageResearchSection />
        <HomepageBuiltWithSquidSection />
        <HomepageFaqSection />
        <HoverBrandLogo />
      </HomepageBuilderIsland>
      <Footer showPageLinks />
    </>
  );
}
