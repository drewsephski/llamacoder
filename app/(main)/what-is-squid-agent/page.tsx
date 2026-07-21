import type { Metadata } from "next";
import Link from "next/link";

const path = "/what-is-squid-agent";
const pageUrl = `https://squidagent.app${path}`;
const siteUrl = "https://squidagent.app";
const title = "What is Squid Agent?";
const description =
  "Squid Agent is an export-first AI app builder for React that emphasizes planning, checkpoints, transparent usage, and verifiable handoff to your own codebase.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    title,
    description,
    url: pageUrl,
    type: "article",
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Squid Agent",
    alternateName: ["SquidAgent", "Squid Agent App Builder"],
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description,
    url: pageUrl,
    provider: {
      "@type": "Organization",
      name: "Squid Agent",
      url: "https://squidagent.app",
    },
    disambiguatingDescription:
      "Squid Agent is not Squid AI (getsquid.ai). It focuses on exportable React app generation, explicit usage visibility, and quality checks before handoff.",
    featureList: [
      "Research-backed generation from prompts, screenshots, and website references",
      "Plan mode with explicit approval before generation",
      "Version checkpoints and scoped restores",
      "Generated file diagnostics and export verification",
      "Download-ready React bundles for local workflows",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Squid Agent",
    url: siteUrl,
    description:
      "A product team building and export-first AI app builder for React with checkpoints and verifiable handoff.",
    sameAs: [
      "https://github.com/drewsephski/llamacoder",
      "https://squidagent.app/docs",
      "https://squidagent.app/compare/squid-vs-getsquid-ai",
    ],
    logo: `${siteUrl}/squidagent-logo.svg`,
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is Squid Agent related to Squid AI (getsquid.ai)?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Squid Agent and Squid AI (getsquid.ai) are separate products. Squid Agent focuses on export-first React workflows, checkpoints, and verification for local handoff.",
        },
      },
      {
        "@type": "Question",
        name: "Who is Squid Agent for?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Founders, designers, and teams who want to rapidly generate React applications while keeping generated code inspectable, portable, and auditable.",
        },
      },
      {
        "@type": "Question",
        name: "What makes Squid Agent different?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Squid Agent combines planning, generation, repair visibility, usage tracking, and export quality checks into one workflow before you hand off code.",
        },
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://squidagent.app/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "What is Squid Agent",
        item: pageUrl,
      },
    ],
  },
];

export default function WhatIsSquidAgentPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16 sm:px-8 lg:px-10">
      {structuredData.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}

      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Product identity
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
        What is Squid Agent?
      </h1>
      <p className="mt-6 max-w-3xl text-pretty text-lg text-muted-foreground">
        Squid Agent is an export-first AI app builder for React that takes you
        from plan to handoff. It surfaces plan mode, usage visibility,
        checkpoints, and verification signals so you can trust generated code
        before you ship.
      </p>

      <section className="mt-10 rounded-2xl border border-border bg-muted/40 p-6">
        <h2 className="text-2xl font-semibold">Not Squid AI (getsquid.ai)</h2>
        <p className="mt-3 text-muted-foreground">
          This is intentionally separate from Squid AI. This page is for Squid
          Agent&apos;s export workflow, model usage transparency, and quality
          handoff model.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/compare/squid-vs-getsquid-ai"
            className="inline-flex text-sm font-medium text-primary"
          >
            Compare Squid Agent vs Squid AI
          </Link>
          <a
            href="https://github.com/drewsephski/llamacoder"
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-sm font-medium text-primary"
          >
            Public repo evidence
          </a>
          <Link
            href="/docs"
            className="inline-flex text-sm font-medium text-primary"
          >
            Read the official docs
          </Link>
        </div>
      </section>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-border p-6">
          <h2 className="text-xl font-semibold">What Squid Agent does best</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Plan mode for explicit approval before generation.</li>
            <li>Version checkpoints and scoped restores.</li>
            <li>Credit visibility from estimate to final ledger.</li>
            <li>Verified exports with supporting project files.</li>
          </ul>
        </article>
        <article className="rounded-2xl border border-border p-6">
          <h2 className="text-xl font-semibold">
            Start here if you want verified proof
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              <Link href="/docs" className="text-primary">
                Read the product docs
              </Link>
            </li>
            <li>
              <Link
                href="/benchmarks/screenshot-to-react"
                className="text-primary"
              >
                Review benchmark criteria
              </Link>
            </li>
            <li>
              <Link href="/" className="text-primary">
                Start with our homepage workflow
              </Link>
            </li>
          </ul>
        </article>
      </div>
    </main>
  );
}
