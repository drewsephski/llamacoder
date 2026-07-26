import { MarketingHub } from "@/components/marketing-hub";
import { benchmarkPage } from "@/lib/marketing-pages";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "AI App Builder Benchmarks",
  description:
    "Reproducible AI app builder benchmark methods covering screenshot-to-React fidelity, responsiveness, interactions, accessibility, recovery, export, and usage.",
  path: "/benchmarks",
  keywords: ["AI app builder benchmark", "screenshot to React benchmark"],
});

export default function BenchmarkIndexPage() {
  return (
    <MarketingHub
      kind="benchmark"
      title="Benchmarks that measure the app—not just the screenshot"
      intro="Use fixed inputs, weighted acceptance criteria, controlled edits, recovery tests, and local builds to compare AI app builders on outcomes that survive the demo."
      pages={[benchmarkPage]}
    />
  );
}
