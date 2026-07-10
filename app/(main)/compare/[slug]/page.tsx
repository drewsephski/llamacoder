import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MarketingArticle } from "@/components/marketing-article";
import { comparisonPages, marketingMetadata } from "@/lib/marketing-pages";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return comparisonPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = comparisonPages.find((candidate) => candidate.slug === slug);
  return page ? marketingMetadata(page) : {};
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const page = comparisonPages.find((candidate) => candidate.slug === slug);
  if (!page) notFound();

  return <MarketingArticle page={page} />;
}
