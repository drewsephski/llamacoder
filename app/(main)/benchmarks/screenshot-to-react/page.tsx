import type { Metadata } from "next";
import { MarketingArticle } from "@/components/marketing-article";
import { benchmarkPage, marketingMetadata } from "@/lib/marketing-pages";

export const metadata: Metadata = marketingMetadata(benchmarkPage);

export default function ScreenshotToReactBenchmarkPage() {
  return <MarketingArticle page={benchmarkPage} />;
}
