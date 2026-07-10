import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MarketingArticle } from "@/components/marketing-article";
import { blogPages, marketingMetadata } from "@/lib/marketing-pages";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = blogPages.find((candidate) => candidate.slug === slug);
  return page ? marketingMetadata(page) : {};
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params;
  const page = blogPages.find((candidate) => candidate.slug === slug);
  if (!page) notFound();

  return <MarketingArticle page={page} />;
}
