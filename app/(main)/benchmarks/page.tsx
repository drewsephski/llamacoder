import type { Metadata } from "next";
import { MarketingHub } from "@/components/marketing-hub";
import { benchmarkPage } from "@/lib/marketing-pages";

export const metadata: Metadata = {
  title: "AI App Builder Benchmarks",
  description:
    "Reproducible AI app builder benchmark methods covering screenshot-to-React fidelity, responsiveness, interactions, accessibility, recovery, export, and usage.",
  alternates: { canonical: "/benchmarks" },
  openGraph: {
    title: "AI App Builder Benchmarks | Squid Agent",
    description:
      "Transparent benchmark rubrics with fixed inputs, evidence requirements, and clean-room export testing.",
    url: "/benchmarks",
    type: "website",
  },
};

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
