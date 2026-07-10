import type { Metadata } from "next";
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
    <MarketingHub
      kind="guide"
      title="Field guides for React apps built with AI"
      intro="Move from an impressive first preview to code you can inspect, test, recover, export, and hand to another developer with confidence."
      pages={blogPages}
    />
  );
}
