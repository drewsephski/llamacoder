import type { Metadata } from "next";

export const SITE_URL = "https://squidagent.app";
export const SITE_NAME = "Squid";

export type MarketingPage = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: Array<{
    title: string;
    body: string;
    points?: string[];
  }>;
  cta: string;
};

export const comparisonPages = [
  {
    slug: "squid-vs-lovable",
    title: "Squid vs Lovable: Exportable React Code With Transparent Credits",
    description:
      "Compare Squid and Lovable on ownership, credit transparency, rollback, export quality, and generated React code checks.",
    h1: "Squid vs Lovable",
    intro:
      "Lovable is strong for fast MVP creation. Squid is built for teams who want clean React code they can export, audit, restore, and keep.",
    sections: [
      {
        title: "Ownership",
        body: "Squid treats download as a core workflow, not a fallback. Generated apps include source files, a manifest, run instructions, and a quality report so the work can leave the platform.",
        points: [
          "Exportable React files",
          "Generated file manifest",
          "Local install and run instructions",
        ],
      },
      {
        title: "Cost Clarity",
        body: "Squid shows the model, estimated credits, and remaining balance before generation. Failed initial generations and internal repair passes are not charged.",
      },
      {
        title: "Reversible Edits",
        body: "Every assistant result is saved as a checkpoint. Restoring an older version creates a new version instead of mutating history.",
      },
    ],
    cta: "Build an exportable React app",
  },
  {
    slug: "squid-vs-bolt",
    title: "Squid vs Bolt: Transparent Credits and Reversible React Builds",
    description:
      "A practical comparison of Squid and Bolt for buyers who care about predictable credits, source ownership, rollback, and quality checks.",
    h1: "Squid vs Bolt",
    intro:
      "Bolt is optimized for fast browser-based building. Squid focuses on making each generation inspectable, reversible, and exportable.",
    sections: [
      {
        title: "Before You Spend",
        body: "Squid makes the credit cost visible before you run generation, then records usage in a ledger after successful persistence.",
      },
      {
        title: "After AI Changes Code",
        body: "Squid keeps prior versions available and highlights quality diagnostics so teams can trust what changed before they export.",
      },
      {
        title: "Leaving The Platform",
        body: "Squid exports source files with project metadata and deployment config examples for Vercel, Netlify, and Cloudflare Pages.",
      },
    ],
    cta: "Start with transparent credits",
  },
  {
    slug: "squid-vs-v0",
    title: "Squid vs v0: React App Generation Without Platform Lock-In",
    description:
      "Compare Squid and v0 for exportable React apps, rollback, visible quality checks, and ownership-first AI generation.",
    h1: "Squid vs v0",
    intro:
      "v0 is excellent at component and UI generation. Squid aims at full app ownership: generated files, reversible checkpoints, and export artifacts from day one.",
    sections: [
      {
        title: "Full App Context",
        body: "Squid asks for complete multi-file React apps and validates that generated internal imports resolve before presenting the output.",
      },
      {
        title: "Trust Surface",
        body: "The quality report gives a quick read on files generated, imports resolved, protected paths, and warnings left.",
      },
      {
        title: "No Hidden Repair Drain",
        body: "Internal repair attempts are explicit in product policy and are not charged as separate generations.",
      },
    ],
    cta: "Generate an app you can keep",
  },
] satisfies MarketingPage[];

export const blogPages = [
  {
    slug: "why-ai-app-builders-burn-credits",
    title: "Why AI App Builders Burn Credits Fixing Their Own Mistakes",
    description:
      "Understand why credit usage can feel unpredictable in AI app builders and what transparent generation accounting should show.",
    h1: "Why AI App Builders Burn Credits",
    intro:
      "AI app generation often fails in ways users cannot see: missing imports, broken component paths, hidden repair loops, and retries that look like normal progress.",
    sections: [
      {
        title: "The Problem",
        body: "A generation can look complete while still containing unresolved imports, overwritten framework files, or preview errors. If the product charges every retry, users pay for platform cleanup.",
      },
      {
        title: "What To Demand",
        body: "Good builders should preview the cost before work starts, charge only after a successful persisted result, and make repair attempts visible.",
        points: [
          "Cost preview before generation",
          "No charge for failed initial saves",
          "Usage ledger after each successful generation",
        ],
      },
      {
        title: "Squid's Position",
        body: "Squid records successful credit usage and exposes the estimate up front. Internal repair attempts are treated as quality work, not a separate user bill.",
      },
    ],
    cta: "Try a visible credit preview",
  },
  {
    slug: "how-to-evaluate-ai-generated-react-code",
    title: "How To Evaluate AI-Generated React Code",
    description:
      "A practical checklist for evaluating generated React apps: file structure, imports, accessibility, rollback, and export quality.",
    h1: "How To Evaluate AI-Generated React Code",
    intro:
      "Generated React code should be judged by whether a developer can inspect it, run it, edit it, and recover from bad changes.",
    sections: [
      {
        title: "Start With Structure",
        body: "Look for a clear App.tsx entry point, supporting source files, and imports that point to files that actually exist.",
      },
      {
        title: "Check Interaction Quality",
        body: "Buttons need labels, forms need accessible names, and generated UI should avoid mystery controls that only work in the AI preview.",
      },
      {
        title: "Inspect The Exit Path",
        body: "A serious AI builder should export package metadata, run instructions, a manifest, and a quality report alongside source files.",
      },
    ],
    cta: "Build and inspect a React app",
  },
  {
    slug: "screenshot-to-react-is-table-stakes",
    title: "Screenshot To React Is Table Stakes",
    description:
      "Why screenshot-to-code is no longer enough, and why ownership, rollback, quality checks, and export matter after generation.",
    h1: "Screenshot To React Is Table Stakes",
    intro:
      "Screenshots are useful input, but the buying decision happens after generation: can you trust, recover, and keep the result?",
    sections: [
      {
        title: "The Real Differentiator",
        body: "Most modern AI builders can take visual input. Fewer prove what happened to the code, what it cost, and how to leave with a working artifact.",
      },
      {
        title: "Post-Generation Trust",
        body: "Teams need visible diagnostics, reversible versions, and export bundles that make ownership practical.",
      },
      {
        title: "A Better Benchmark",
        body: "Judge screenshot-to-code tools on import resolution, edit recoverability, export completeness, and transparent charging, not only first visual match.",
      },
    ],
    cta: "Move past screenshot-to-code",
  },
] satisfies MarketingPage[];

export const benchmarkPage: MarketingPage = {
  slug: "screenshot-to-react",
  title: "Screenshot-To-React Benchmark Criteria",
  description:
    "A repeatable benchmark framework for screenshot-to-React tools covering visual match, code quality, rollback, export, and credit behavior.",
  h1: "Screenshot-To-React Benchmark",
  intro:
    "A useful benchmark should measure more than visual similarity. It should show whether the generated React app is understandable, reversible, exportable, and fair to run.",
  sections: [
    {
      title: "Scoring Criteria",
      body: "Score each tool against the same prompt, input screenshot, and acceptance checklist.",
      points: [
        "Visual fidelity to the screenshot",
        "Resolved internal imports",
        "Accessible controls and labels",
        "Rollback or checkpoint support",
        "Export bundle completeness",
        "Credit behavior for failures and repairs",
      ],
    },
    {
      title: "Evidence To Publish",
      body: "Publish generated files, diagnostics, screenshots, export contents, and the exact credit cost shown before generation.",
    },
    {
      title: "Why This Matters",
      body: "The first preview can be impressive while the artifact is hard to own. A benchmark should make ownership and maintainability visible.",
    },
  ],
  cta: "Run the benchmark in Squid",
};

export const marketingPaths = [
  ...comparisonPages.map((page) => `/compare/${page.slug}`),
  ...blogPages.map((page) => `/blog/${page.slug}`),
  `/benchmarks/${benchmarkPage.slug}`,
];

export function marketingMetadata(page: MarketingPage): Metadata {
  const path = comparisonPages.some((candidate) => candidate.slug === page.slug)
    ? `/compare/${page.slug}`
    : blogPages.some((candidate) => candidate.slug === page.slug)
      ? `/blog/${page.slug}`
      : `/benchmarks/${page.slug}`;

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${SITE_URL}${path}`,
      type: "article",
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
    },
  };
}
