import type { Metadata } from "next";

export const SITE_URL = "https://squidagent.app";
export const SITE_NAME = "Squid Agent";
export const CONTENT_REVIEW_DATE = "2026-07-10";

type MarketingSection = {
  title: string;
  body: string;
  points?: string[];
};

type MarketingTable = {
  caption: string;
  description?: string;
  columns: string[];
  rows: string[][];
};

type MarketingLink = {
  href: string;
  label: string;
  description: string;
  external?: boolean;
};

export type MarketingPage = {
  kind: "comparison" | "guide" | "benchmark";
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  summary: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  sections: MarketingSection[];
  table?: MarketingTable;
  workflow?: Array<{
    title: string;
    body: string;
  }>;
  evidence?: Array<{
    label: string;
    title: string;
    body: string;
    points?: string[];
  }>;
  codeExample?: {
    title: string;
    body: string;
    filename: string;
    code: string;
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  sources?: MarketingLink[];
  internalLinks: MarketingLink[];
  cta: string;
};

const sharedComparisonLinks: MarketingLink[] = [
  {
    href: "/blog/how-to-evaluate-ai-generated-react-code",
    label: "Evaluate generated React code",
    description:
      "Use a practical code, accessibility, recovery, and export checklist.",
  },
  {
    href: "/benchmarks/screenshot-to-react",
    label: "Run a screenshot-to-React benchmark",
    description: "Score tools on more than the first visual preview.",
  },
];

type MarketingPageSeed = Omit<MarketingPage, "internalLinks"> & {
  internalLinks?: MarketingLink[];
};

export const marketingLandingPaths = [
  "/axon",
  "/axion-studio",
  "/cozypaws",
  "/design-rocket-certificates",
  "/forma",
  "/jack",
  "/mindloop",
  "/mentality",
  "/prisma",
  "/questly",
  "/rivr",
  "/sentinel",
  "/skyelite",
  "/terraelix",
  "/velorah",
  "/launch",
  "/gallery",
  "/example",
];

export const marketingDemoLinks: MarketingLink[] = [
  {
    href: "/axon",
    label: "Axon landing page",
    description: "Explore an automation-heavy editorial demo.",
  },
  {
    href: "/axion-studio",
    label: "Axion Studio landing page",
    description: "Review a full-case campaign landing page built with Squid.",
  },
  {
    href: "/cozypaws",
    label: "CozyPaws case study",
    description: "Inspect a warm-commerce-style storefront with interactive sections.",
  },
  {
    href: "/sentinel",
    label: "Sentinel AI case study",
    description: "See a high-contrast technical product landing surface.",
  },
  {
    href: "/example",
    label: "Public workspace example",
    description: "Open an unlisted public demo and review the generated output path.",
  },
];

const useCasePageLinks: MarketingLink[] = [
  {
    href: "/compare/squid-vs-lovable",
    label: "Compare with Lovable",
    description: "Decision criteria for managed full-stack workflows.",
  },
  {
    href: "/compare/squid-vs-bolt",
    label: "Compare with Bolt.new",
    description: "Decision criteria for preview-heavy full-stack generation.",
  },
  {
    href: "/compare/squid-vs-v0",
    label: "Compare with v0",
    description: "Decision criteria for framework-first builder workflows.",
  },
  {
    href: "/compare/squid-vs-getsquid-ai",
    label: "Compare with Squid AI (getsquid.ai)",
    description:
      "Clarify ownership, deliverables, and export behavior between the two similar names.",
  },
  {
    href: "/compare/squid-vs-lovable-for-startups",
    label: "Squid vs Lovable for startups",
    description: "A startup-oriented fit comparison with ownership and speed.",
  },
  {
    href: "/compare/squid-vs-bolt-for-agencies",
    label: "Squid vs Bolt.new for agencies",
    description: "A production-velocity comparison for agency handoff.",
  },
  {
    href: "/compare/squid-vs-v0-for-design-led-teams",
    label: "Squid vs v0 for design-led teams",
    description: "Framework and export fit for design-first delivery.",
  },
];

const getCompareLink = (href: string) =>
  useCasePageLinks.find((link) => link.href === href);

const preferredUseCaseLinksBySlug: Record<string, string[]> = {
  "squid-vs-lovable": [
    "/compare/squid-vs-v0",
    "/compare/squid-vs-bolt",
    "/compare/squid-vs-bolt-for-agencies",
  ],
  "squid-vs-bolt": [
    "/compare/squid-vs-lovable",
    "/compare/squid-vs-v0",
    "/compare/squid-vs-bolt-for-agencies",
  ],
  "squid-vs-v0": [
    "/compare/squid-vs-lovable",
    "/compare/squid-vs-bolt",
    "/compare/squid-vs-v0-for-design-led-teams",
  ],
  "squid-vs-getsquid-ai": [
    "/compare/squid-vs-bolt",
    "/compare/squid-vs-lovable",
    "/compare/squid-vs-v0",
  ],
  "squid-vs-bolt-for-agencies": [
    "/compare/squid-vs-bolt",
    "/compare/squid-vs-lovable-for-startups",
    "/compare/squid-vs-v0-for-design-led-teams",
  ],
  "squid-vs-lovable-for-startups": [
    "/compare/squid-vs-lovable",
    "/compare/squid-vs-bolt-for-agencies",
    "/compare/squid-vs-v0-for-design-led-teams",
  ],
  "squid-vs-v0-for-design-led-teams": [
    "/compare/squid-vs-v0",
    "/compare/squid-vs-lovable-for-startups",
    "/compare/squid-vs-bolt-for-agencies",
  ],
  "how-to-evaluate-ai-generated-react-code": [
    "/compare/squid-vs-bolt",
    "/compare/squid-vs-lovable",
    "/compare/squid-vs-v0",
  ],
  "screenshot-to-react-is-table-stakes": [
    "/compare/squid-vs-lovable",
    "/compare/squid-vs-bolt",
    "/compare/squid-vs-v0",
  ],
  "ai-coding-tool-comparison-with-credits": [
    "/compare/squid-vs-lovable",
    "/compare/squid-vs-bolt",
    "/compare/squid-vs-v0",
  ],
  "export-react-app-from-ai": [
    "/compare/squid-vs-lovable",
    "/compare/squid-vs-v0",
    "/compare/squid-vs-bolt",
  ],
  "from-screenshot-to-production-react": [
    "/compare/squid-vs-v0",
    "/compare/squid-vs-bolt",
    "/compare/squid-vs-lovable",
  ],
  "how-we-verify-code": [
    "/compare/squid-vs-v0",
    "/compare/squid-vs-bolt",
    "/compare/squid-vs-lovable",
  ],
  "what-to-check-after-ai-generation": [
    "/compare/squid-vs-bolt",
    "/compare/squid-vs-lovable",
    "/compare/squid-vs-v0",
  ],
};

const getPreferredUseCaseLinks = (page: MarketingPageSeed) => {
  const hrefs = preferredUseCaseLinksBySlug[page.slug];
  if (!hrefs) return [];

  return hrefs
    .map((href) => getCompareLink(href))
    .filter((link): link is MarketingLink => Boolean(link));
};

function uniqueByHref(links: MarketingLink[]): MarketingLink[] {
  const seen = new Set<string>();
  const result: MarketingLink[] = [];

  for (const link of links) {
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    result.push(link);
  }

  return result;
}

function enrichInternalLinks(
  page: MarketingPageSeed,
  kind: MarketingPage["kind"],
): MarketingPage {
  const links = uniqueByHref(page.internalLinks ?? []);
  const isUseCase = (href: string) => href.startsWith("/compare/");
  const demoSet = new Set(marketingDemoLinks.map((link) => link.href));
  const fallbackUseCases = useCasePageLinks;
  const preferredUseCases = getPreferredUseCaseLinks(page);
  const requiredUseCaseCount = kind === "benchmark" ? 0 : 2;
  const requiredDemoCount = kind === "benchmark" ? 0 : 1;

  let useCaseCount = links.filter((link) => isUseCase(link.href)).length;
  let demoCount = links.filter((link) => demoSet.has(link.href)).length;
  const enriched = [...links];

  for (const link of [...preferredUseCases, ...fallbackUseCases]) {
    if (useCaseCount >= requiredUseCaseCount) break;
    if (!isUseCase(link.href)) continue;
    if (enriched.some((item) => item.href === link.href)) continue;
    enriched.push(link);
    useCaseCount += 1;
  }

  if (demoCount < requiredDemoCount) {
    for (const link of marketingDemoLinks) {
      if (demoCount >= requiredDemoCount) break;
      if (enriched.some((item) => item.href === link.href)) continue;
      enriched.push(link);
      demoCount += 1;
    }
  }

  return { ...page, internalLinks: uniqueByHref(enriched) } as MarketingPage;
}

export function withMinimumInternalLinks(
  page: MarketingPageSeed,
  kind: MarketingPage["kind"] = page.kind,
): MarketingPage {
  return enrichInternalLinks(page, kind);
}

const comparisonPagesSeed: MarketingPageSeed[] = [
  {
    kind: "comparison",
    slug: "squid-vs-lovable",
    title: "Squid vs Lovable (2026): React Export, Credits, and Recovery",
    description:
      "An evidence-led Squid vs Lovable comparison covering React code export, GitHub sync, credits, version history, quality checks, and the best fit for each tool.",
    h1: "Squid vs Lovable",
    intro:
      "Both tools can create and export React applications. The meaningful difference is the workflow around each generation: what you see before spending, what gets checked, how recovery works, and what leaves the platform with your code.",
    summary:
      "Choose Lovable when managed full-stack infrastructure, built-in cloud features, and a broad product-building environment matter most. Choose Squid when you want an export-first React workflow with a model-specific credit estimate, visible generation diagnostics, checkpoint-style recovery, and a verified ZIP assembled for local development.",
    publishedAt: "2026-07-08",
    updatedAt: CONTENT_REVIEW_DATE,
    readingTime: "8 min read",
    table: {
      caption: "Squid and Lovable at a glance",
      description:
        "Capabilities change quickly. This table reflects public documentation reviewed July 10, 2026 and Squid's current implementation.",
      columns: ["Decision factor", "Squid Agent", "Lovable"],
      rows: [
        [
          "Best fit",
          "Export-first React apps with explicit generation and export evidence",
          "Full-stack product building with managed cloud services and integrations",
        ],
        [
          "Code portability",
          "Verified ZIP with source, package files, README, manifest, quality report, and deploy configs",
          "Full project ZIP download plus GitHub sync for standard Vite + React projects",
        ],
        [
          "Build usage",
          "Model-specific credit estimate before generation, then estimate-versus-actual ledger",
          "Workspace credits for messages; Plan mode uses one credit per message",
        ],
        [
          "Recovery",
          "Assistant outputs are checkpoints; restore creates another checkpoint without rewriting history",
          "Project history supports previewing and reverting to earlier versions",
        ],
        [
          "Quality evidence",
          "Visible import, file, protected-path, and accessibility diagnostics plus export verification",
          "Agent and preview workflow; teams should still validate exported code against their own acceptance tests",
        ],
      ],
    },
    workflow: [
      {
        title: "Define the same acceptance criteria",
        body: "Give both tools the same prompt, screenshots, responsive requirements, interaction states, and export expectations. A vague prompt only measures how each product fills in missing requirements.",
      },
      {
        title: "Record spend before and after",
        body: "In Squid, record the shown model estimate and the final ledger entry. In Lovable, record the build credits used and keep separate cloud or deployed-AI usage out of the comparison.",
      },
      {
        title: "Introduce one controlled regression",
        body: "Ask for a narrow follow-up edit, inspect unrelated files, then restore an earlier version. The goal is to measure edit containment and recovery—not just initial generation speed.",
      },
      {
        title: "Export and run locally",
        body: "Download both projects, install from a clean directory, run the documented commands, and test the same routes and interactions outside each builder's preview.",
      },
    ],
    sections: [
      {
        title: "The outdated comparison is 'export versus lock-in'",
        body: "Lovable supports full-project ZIP downloads and GitHub synchronization, and its documentation describes standard Vite + React projects that can run outside Lovable. Squid also treats portability as foundational, but differentiates through the evidence packed around the export: a file manifest, generated-code quality report, bundle verification report, run instructions, and starter deployment configuration.",
      },
      {
        title: "The sharper question is what arrives with the code",
        body: "A source archive is necessary, but it does not prove the app installs cleanly or explain what the generator checked. Squid assembles missing runtime support files, infers dependencies used by generated source, creates package and toolchain configuration, and checks the final bundle before download.",
        points: [
          "Generated source and required shared UI support files",
          "Vite, TypeScript, Tailwind, and package configuration",
          "README, manifest, code-quality report, and export-verification report",
          "Starter routing configuration for Vercel, Netlify, and Cloudflare Workers",
        ],
      },
      {
        title: "Credit visibility is not a one-number comparison",
        body: "Lovable separates workspace credits used while building from usage-based balances for its cloud hosting and in-app AI. Squid's current builder shows the selected model's expected credit requirement before generation, reserves that amount, then records the estimate, actual charge, and refund after a successful result. Buyers should compare the whole cost path, not only monthly plan labels.",
      },
      {
        title: "Both products have recovery; the semantics differ",
        body: "Lovable lets users inspect history, preview older states, and revert. Squid stores assistant results as code checkpoints and restores an old version by creating a new assistant checkpoint. That preserves the path back to both the old and current states instead of silently replacing the latest record.",
      },
      {
        title: "Where Lovable is the stronger fit",
        body: "Lovable is compelling when a team wants an integrated full-stack environment with managed cloud, authentication, database, payments, publishing, and collaboration. Squid is narrower by design today: it is strongest for front-end React applications where export clarity, generation accounting, and an inspectable artifact matter more than an all-in-one managed backend.",
      },
    ],
    evidence: [
      {
        label: "Inspect",
        title: "Open the exported package",
        body: "Do not stop at the presence of a download button. Check whether the archive contains the dependencies, scripts, framework configuration, environment guidance, and support files required to run.",
      },
      {
        label: "Measure",
        title: "Use one acceptance script",
        body: "Install, build, open key routes, submit forms, test mobile navigation, and restore a version using the same sequence in both tools.",
      },
      {
        label: "Separate",
        title: "Distinguish build and runtime cost",
        body: "Builder messages, model usage, hosting, database, and deployed AI can be different billing systems. Compare them separately before calculating a monthly total.",
      },
      {
        label: "Verify",
        title: "Read current official docs",
        body: "Plans and product capabilities change frequently. Follow the sources below before making a purchasing decision.",
      },
    ],
    faqs: [
      {
        question: "Can Lovable export a complete project?",
        answer:
          "Yes. Lovable's current documentation describes full-project ZIP downloads and GitHub synchronization. Its cloud ownership guide says projects use standard Vite + React and can be self-hosted.",
      },
      {
        question: "Does Lovable have version history?",
        answer:
          "Yes. Lovable documents project history, previews of older versions, and revert workflows. Squid's difference is that restoring creates a new code checkpoint while retaining the surrounding history.",
      },
      {
        question: "How are Squid and Lovable credits different?",
        answer:
          "Squid presents a model-specific build estimate and records estimate, actual charge, and refund in its usage ledger. Lovable uses workspace credits for building and separate usage balances for its cloud and in-app AI services.",
      },
      {
        question: "Which is better for a full-stack SaaS product?",
        answer:
          "Lovable currently offers a broader managed full-stack environment. Squid is a better fit when the immediate goal is an exportable React front end with explicit generation and export evidence.",
      },
      {
        question: "How should I test both tools fairly?",
        answer:
          "Use the same prompt and screenshots, record build usage, make one narrow follow-up edit, restore a version, export, install locally, and run the same functional and responsive checks.",
      },
    ],
    sources: [
      {
        href: "https://docs.lovable.dev/features/code-mode",
        label: "Lovable code mode",
        description:
          "Official documentation for browsing, editing, and downloading project code.",
        external: true,
      },
      {
        href: "https://docs.lovable.dev/integrations/github",
        label: "Lovable GitHub integration",
        description: "Official export, sync, and repository behavior.",
        external: true,
      },
      {
        href: "https://docs.lovable.dev/introduction/faq",
        label: "Lovable project history FAQ",
        description:
          "Official answers for code export, history, and revert behavior.",
        external: true,
      },
      {
        href: "https://docs.lovable.dev/features/workspace-admin-settings",
        label: "Lovable billing and usage",
        description:
          "Official explanation of workspace credits and separate cloud balances.",
        external: true,
      },
    ],
    internalLinks: sharedComparisonLinks,
    cta: "Build an exportable React app",
  },
  {
    kind: "comparison",
    slug: "squid-vs-bolt",
    title: "Squid vs Bolt.new (2026): Tokens, Export, and Version History",
    description:
      "Compare Squid and Bolt.new on token or credit visibility, React project export, GitHub, version history, quality evidence, and deployment workflow.",
    h1: "Squid vs Bolt.new",
    intro:
      "Bolt and Squid both generate applications in the browser and let users take code elsewhere. The practical choice comes down to product breadth, usage accounting, recovery semantics, and how much evidence accompanies the final export.",
    summary:
      "Choose Bolt for a broad full-stack building environment, integrated hosting, and GitHub-centered workflows. Choose Squid for focused React generation with a model-specific estimate before the run, estimate-versus-actual usage records, checkpoint recovery, and a self-describing verified export bundle.",
    publishedAt: "2026-07-08",
    updatedAt: CONTENT_REVIEW_DATE,
    readingTime: "8 min read",
    table: {
      caption: "Squid and Bolt.new at a glance",
      description:
        "Based on official Bolt documentation reviewed July 10, 2026 and Squid's current product implementation.",
      columns: ["Decision factor", "Squid Agent", "Bolt.new"],
      rows: [
        [
          "Best fit",
          "Export-first React front ends",
          "Full-stack browser builds with integrated cloud services",
        ],
        [
          "Usage unit",
          "Model-based generation credits",
          "Tokens used while reading, thinking, building, and syncing context",
        ],
        [
          "Before-build signal",
          "Expected credit requirement shown before generation",
          "Token balance and optional per-message usage visibility",
        ],
        [
          "Recovery",
          "Assistant checkpoints and non-destructive restore",
          "Visual Version History with preview, labels, bookmarks, and restore",
        ],
        [
          "Source exit",
          "Verified ZIP with manifest, diagnostics, and deploy configs",
          "Project ZIP download and GitHub integration",
        ],
      ],
    },
    workflow: [
      {
        title: "Start from an identical brief",
        body: "Fix the prompt, screenshots, routes, data states, and responsive acceptance criteria before either tool generates code.",
      },
      {
        title: "Capture the usage signal",
        body: "Record Squid's estimate and final ledger entry. In Bolt, enable token display where available and record the total change in balance for the same workflow.",
      },
      {
        title: "Test context growth",
        body: "Repeat a narrow edit after the project grows. Bolt notes that reading and syncing more project context can consume more tokens, so measure early and later iterations separately.",
      },
      {
        title: "Restore, export, and build",
        body: "Restore an older state, download or sync the project, then install and build it from a clean local directory.",
      },
    ],
    sections: [
      {
        title: "Bolt does not rely on platform lock-in",
        body: "Bolt supports project download, GitHub integration, and publishing outside Bolt. Its documentation explicitly positions GitHub as a path for working beyond the browser builder. Squid's differentiation is therefore not basic access to files; it is the consistency and verification metadata wrapped around a React export.",
      },
      {
        title: "Tokens and credits answer different questions",
        body: "Bolt usage is token-based. Its documentation explains that tokens are used when the system reads, thinks, builds, and processes project context, and that larger projects may use more with each message. Squid maps selected models to an expected credit hold and later records actual cost and any returned credits. Buyers should compare predictability and observability rather than treating tokens and credits as directly equivalent.",
      },
      {
        title: "Recovery is a strength in both products",
        body: "Bolt's visual Version History can browse, preview, label, bookmark, and restore saved versions. Squid keeps code-bearing assistant responses as checkpoints and turns a restore into a new checkpoint. The latter makes the recovery event part of the visible project timeline.",
      },
      {
        title: "Export verification is Squid's sharpest distinction",
        body: "Squid validates internal import paths, flags accessible-name issues, checks protected paths, assembles missing run support, and verifies the final archive. The export includes machine-readable reports so a developer can see what passed and what still needs review.",
        points: [
          "Source-level diagnostics before export",
          "Bundle-level checks for entry points, scripts, and deployment files",
          "Human-readable README plus machine-readable manifest",
          "No claim that generation replaces a production security review",
        ],
      },
      {
        title: "Where Bolt is the stronger fit",
        body: "Bolt is broader when teams want browser-native full-stack development, integrated databases and hosting, GitHub collaboration, and a large ecosystem around deployment. Squid is deliberately more focused on the path from prompt or screenshot to a portable React front end.",
      },
    ],
    evidence: [
      {
        label: "Usage",
        title: "Measure a complete task",
        body: "Include planning, generation, repair, and the final edit. Measuring only the first prompt hides the cost of reaching an acceptable result.",
      },
      {
        label: "Context",
        title: "Repeat after the project grows",
        body: "Token-based systems can spend more reading larger projects. Run the same narrow edit early and late in the benchmark.",
      },
      {
        label: "Recovery",
        title: "Restore under pressure",
        body: "Break one route intentionally, preview an older state, restore it, and confirm the working state is preserved in history.",
      },
      {
        label: "Portability",
        title: "Build without the preview",
        body: "A fair export test begins after the ZIP or Git repository leaves the hosted builder.",
      },
    ],
    faqs: [
      {
        question: "Can Bolt.new export a project?",
        answer:
          "Yes. Bolt documents both project ZIP downloads and GitHub integration, including workflows for working and publishing outside Bolt.",
      },
      {
        question: "Does Bolt.new have version history?",
        answer:
          "Yes. Bolt's current documentation describes a visual Version History with preview and restore, plus labels and bookmarks for backups.",
      },
      {
        question: "Why can Bolt token use grow with a project?",
        answer:
          "Bolt says tokens are used to read, understand, and synchronize project files as well as to generate code. More context can therefore increase usage per interaction.",
      },
      {
        question: "What does Squid show that is different?",
        answer:
          "Squid shows the selected model's expected build requirement, then records estimate, actual charge, refund, phase, and status in an account usage ledger.",
      },
      {
        question: "Which product has the broader full-stack platform?",
        answer:
          "Bolt currently has the broader integrated full-stack and cloud workflow. Squid is focused on exportable React front ends and verification evidence.",
      },
    ],
    sources: [
      {
        href: "https://support.bolt.new/building/using-bolt/rollback-backup",
        label: "Bolt backups and project export",
        description:
          "Official Version History, download, and restore guidance.",
        external: true,
      },
      {
        href: "https://support.bolt.new/integrations/git",
        label: "Bolt GitHub integration",
        description: "Official GitHub and external publishing workflow.",
        external: true,
      },
      {
        href: "https://support.bolt.new/faqs/account-and-subscription/tokens",
        label: "Bolt token guide",
        description: "Official token usage, rollover, and balance behavior.",
        external: true,
      },
      {
        href: "https://support.bolt.new/best-practices/maximizing-token-efficiency",
        label: "Bolt token efficiency",
        description: "Official explanation of context and token consumption.",
        external: true,
      },
    ],
    internalLinks: sharedComparisonLinks,
    cta: "Start with visible generation cost",
  },
  {
    kind: "comparison",
    slug: "squid-vs-v0",
    title: "Squid vs v0 (2026): React Apps, Code Export, and Quality Checks",
    description:
      "Compare Squid and v0 by Vercel for React app generation, code export, Git workflows, recovery, credit visibility, and generated-code verification.",
    h1: "Squid vs v0 by Vercel",
    intro:
      "v0 has grown far beyond isolated UI snippets, while Squid focuses on complete exportable React applications. The useful comparison is now ecosystem fit, artifact shape, cost visibility, and the checks that happen between generation and download.",
    summary:
      "Choose v0 for a broad AI pair-programming workflow, strong Next.js and Vercel alignment, full-stack generation, and bidirectional Git integration. Choose Squid for a simpler export-first React workflow with checkpoint recovery, model-based credit estimates, generated-file diagnostics, and a verified Vite bundle.",
    publishedAt: "2026-07-08",
    updatedAt: CONTENT_REVIEW_DATE,
    readingTime: "7 min read",
    table: {
      caption: "Squid and v0 at a glance",
      description:
        "Based on public v0 documentation reviewed July 10, 2026 and Squid's current implementation.",
      columns: ["Decision factor", "Squid Agent", "v0"],
      rows: [
        [
          "Best fit",
          "Portable Vite + React front ends",
          "Modern web and full-stack apps with strong Vercel integration",
        ],
        [
          "Project output",
          "Complete multi-file React app required by the generation contract",
          "Components through full-stack applications and executable code blocks",
        ],
        [
          "Code workflow",
          "Direct verified ZIP export",
          "Code export, in-product editing, and bidirectional Git integration",
        ],
        [
          "Recovery model",
          "Versioned assistant checkpoints with non-destructive restore",
          "Chat history and Git-centered code collaboration",
        ],
        [
          "Verification evidence",
          "Visible generated-file and export-bundle reports",
          "Preview, execution, and platform workflow; validate exported output for your target environment",
        ],
      ],
    },
    workflow: [
      {
        title: "Choose the target runtime first",
        body: "Use the same functional brief, but specify whether the desired artifact is a portable Vite SPA or a Next.js application so framework differences do not distort the result.",
      },
      {
        title: "Inspect the complete file graph",
        body: "Count source files, resolve every internal import, inspect package scripts, and locate framework-specific runtime assumptions.",
      },
      {
        title: "Make and reverse a narrow edit",
        body: "Change one visible element, verify unrelated code remains stable, then return to the earlier working state using the product's native workflow.",
      },
      {
        title: "Run outside the product",
        body: "Export or sync the code, install dependencies from scratch, build for production, and test the same routes in a clean environment.",
      },
    ],
    sections: [
      {
        title: "v0 is no longer only a component generator",
        body: "v0's official documentation describes full-stack applications, code execution, in-product editing, export into existing codebases, and bidirectional Git integration. Squid should not be evaluated against the older idea of v0 as a UI-snippet tool; the current distinction is focus and workflow.",
      },
      {
        title: "Framework choice shapes the comparison",
        body: "v0 benefits from deep alignment with the Next.js, shadcn/ui, and Vercel ecosystem. Squid generates Vite + React applications that are intentionally straightforward to run as static or client-rendered front ends across several hosts. Teams should choose the artifact that matches their intended architecture instead of treating framework output as a neutral detail.",
      },
      {
        title: "Squid makes its generation contract explicit",
        body: "The main Squid path requires a complete multi-file React + TypeScript app, checks internal import resolution and export style, and refuses incomplete output. The UI then exposes a quality report and the export pipeline adds another verification layer around the runnable bundle.",
      },
      {
        title: "Git integration and a verified ZIP serve different teams",
        body: "v0's bidirectional Git workflow is attractive when a repository is already the center of collaboration. Squid's self-describing ZIP is useful when a founder or designer wants a clear handoff artifact without configuring Git first. A mature engineering team may reasonably prefer Git; a fast transfer may benefit from the packaged export.",
      },
      {
        title: "Where v0 is the stronger fit",
        body: "v0 is the stronger choice for teams already standardized on Vercel and Next.js, for deeper full-stack work, or when Git-based collaboration is a primary requirement. Squid is stronger when the desired outcome is a portable React front end with a compact trust trail from estimate to diagnostics to export.",
      },
    ],
    evidence: [
      {
        label: "Runtime",
        title: "Name the framework",
        body: "Compare output against the architecture you actually plan to operate. Vite and Next.js solve overlapping but not identical deployment problems.",
      },
      {
        label: "Graph",
        title: "Resolve every import",
        body: "A polished preview can hide missing files or mismatched default and named exports. Check the source graph directly.",
      },
      {
        label: "Handoff",
        title: "Test Git and ZIP paths",
        body: "Decide whether your real handoff is repository collaboration or a downloadable artifact, then benchmark that exact path.",
      },
      {
        label: "Safety",
        title: "Run production checks",
        body: "Neither product's preview replaces dependency, accessibility, security, and production-build validation.",
      },
    ],
    faqs: [
      {
        question: "Can v0 build full-stack applications?",
        answer:
          "Yes. v0's current FAQ describes both components and full-stack applications with authentication, databases, and external integrations.",
      },
      {
        question: "Can v0 export and sync code?",
        answer:
          "Yes. v0 documents code export, in-product editing, and bidirectional Git integration.",
      },
      {
        question: "Is Squid only for screenshots?",
        answer:
          "No. Squid accepts text prompts, screenshots, and website references, then generates complete multi-file React applications.",
      },
      {
        question: "Why does Squid export Vite instead of Next.js?",
        answer:
          "Squid's current export targets a portable client-rendered React project with a lightweight build setup and starter configuration for multiple hosts.",
      },
      {
        question: "Which tool is better for a Vercel-first team?",
        answer:
          "v0 is usually the more natural fit for a Vercel- and Next.js-centered stack. Squid is more compelling when portable Vite + React output and explicit export reports are the priority.",
      },
    ],
    sources: [
      {
        href: "https://v0.dev/docs/faqs",
        label: "v0 official FAQ",
        description:
          "Official scope, export, Git, editing, and ownership answers.",
        external: true,
      },
      {
        href: "https://v0.dev/docs",
        label: "v0 documentation",
        description: "Current product documentation and workflow guidance.",
        external: true,
      },
    ],
    internalLinks: sharedComparisonLinks,
    cta: "Generate a React app you can inspect",
  },
  {
    kind: "comparison",
    slug: "squid-vs-getsquid-ai",
    title:
      "Squid vs Squid AI (getsquid.ai): exportability, ownership, and workflow",
    description:
      "A practical comparison between Squid Agent and Squid AI (getsquid.ai) focused on cost visibility, ownership, revision behavior, and export-ready output.",
    h1: "Squid vs Squid AI (getsquid.ai)",
    intro:
      "These two names are similar, so teams often use them interchangeably by accident. This comparison separates the practical decision criteria: what you receive, how much ownership stays yours, and how transparent the build and cost signals are.",
    summary:
      "Squid Agent is strongest when teams need an export-first React workflow with explicit checkpoints, visible usage signals, and verification artifacts. Squid AI (getsquid.ai) emphasizes rapid UI generation workflows and chatbot-style composition, making it useful for fast ideation where your first concern is a working prototype.",
    publishedAt: "2026-07-21",
    updatedAt: CONTENT_REVIEW_DATE,
    readingTime: "6 min read",
    table: {
      caption: "Squid and Squid AI at a glance",
      description:
        "The most useful distinction is less brand similarity and more delivery outcome.",
      columns: ["Decision factor", "Squid Agent", "Squid AI (getsquid.ai)"],
      rows: [
        [
          "Primary outcome",
          "Exportable React code package with quality and recovery metadata",
          "Rapid conversational generation and design iteration support",
        ],
        [
          "Cost signal",
          "Model estimate before generation and post-run usage ledger",
          "Prompt- and session-based usage model, depending on plan and context",
        ],
        [
          "Revision behavior",
          "Checkpointed restores and visible scoped file recovery options",
          "Fast follow-up loop within chat-like interactions",
        ],
        [
          "Deployment path",
          "Verified archive with manifests, deployment starters, and quality report",
          "Flexible export paths for follow-up iteration and handoff workflows",
        ],
        [
          "Ownership framing",
          "Explicit portable output and source inspection as default",
          "Generated output suitable for prototype and further shaping",
        ],
      ],
    },
    workflow: [
      {
        title: "Clarify the end-of-day handoff format",
        body: "Before generating, define whether your acceptance condition is a local repository-ready archive, a quick prototype, or a prototype to be heavily rewritten.",
      },
      {
        title: "Track budget expectations separately",
        body: "Capture Squid Agent's expected credit hold and post-run ledger first. Then compare the full cost for equivalent context and revision count on Squid AI.",
      },
      {
        title: "Test a constrained revision",
        body: "Run the same narrow edit in both tools and compare how it impacts unrelated routes, dependency integrity, and reviewability.",
      },
      {
        title: "Export and verify outside the builder",
        body: "For both tools, run a clean-room local check for installs, builds, key interactions, and evidence artifacts before production handoff.",
      },
    ],
    sections: [
      {
        title: "Why this comparison is high-signal",
        body: "Brand-level naming similarity can hide strategy differences. Teams should choose based on delivery outputs, not only prompt velocity. The strongest signal is whether the workflow produces a portable artifact that survives outside the hosted environment.",
      },
      {
        title: "Choose by ownership, not by marketing language",
        body: "Ask whether each output is designed to become a maintainable local project. Explicit checkpoints, manifest details, and verification artifacts are the practical markers of ownership maturity in production work.",
      },
      {
        title: "Cost visibility as a trust signal",
        body: "A visible estimate before build and a complete ledger after completion helps teams protect budget confidence. Hidden or opaque cost models increase planning risk during iterative projects.",
      },
      {
        title: "Revision quality beats first draft speed",
        body: "Fast first drafts are helpful; controllable and low-risk revisions determine delivery confidence. Compare rollback behavior, restore semantics, and whether unintended files change during narrow edits.",
      },
      {
        title: "Where this fits best",
        body: "Use Squid Agent when export integrity, checkpoint history, and explicit verification are central to your process. Use alternatives when your immediate goal is quick prototyping and your team already has a mature external handoff process.",
      },
    ],
    evidence: [
      {
        label: "Naming",
        title: "Avoid false category matches",
        body: "Treat brand similarity as a keyword edge case. Use explicit phrases like 'Squid Agent' and 'getsquid.ai' in your own comparison and marketing content.",
      },
      {
        label: "Delivery",
        title: "Verify artifact contents",
        body: "Check what each tool delivers after export: dependency graph, install instructions, deployment settings, and any run-time warnings.",
      },
      {
        label: "Recovery",
        title: "Compare scoped edits",
        body: "Use identical narrow edits and measure whether unrelated sections are stable after each regeneration or patch pass.",
      },
      {
        label: "Cost",
        title: "Record equivalent attempts",
        body: "Compare the cost of the same brief under the same constraints, including retries and required follow-up edits.",
      },
    ],
    faqs: [
      {
        question: "Is Squid Agent a replacement for Squid AI (getsquid.ai)?",
        answer:
          "They overlap in AI-assisted app-building goals, but the product signals are different. This guide focuses on Squid Agent's export, checkpoint, and verification posture for production handoff.",
      },
      {
        question: "Which is better for first-run prototypes?",
        answer:
          "For fast prototypes, Squid AI (getsquid.ai) workflows can be productive. For a handoff-first strategy with explicit artifact validation, Squid Agent is usually a stronger choice.",
      },
      {
        question: "Does Squid Agent support local handoff?",
        answer:
          "Yes. Squid Agent is designed to produce portable React artifacts with supporting metadata and setup guidance.",
      },
      {
        question: "How should I compare cost when brands are similar?",
        answer:
          "Use the same prompt, scope one constrained follow-up edit, and compare estimate/actual spend plus the cost of revisions needed for an acceptable result.",
      },
      {
        question: "Can I still evaluate both tools fairly on mobile?",
        answer:
          "Yes. A fair test includes responsive checks, accessibility checks, and revision stability across at least one major breakpoint.",
      },
    ],
    sources: [
      {
        href: "https://getsquid.ai",
        label: "getsquid.ai home",
        description: "Official Squid AI product site.",
        external: true,
      },
      {
        href: "https://squidagent.ai/features",
        label: "Squid Agent features",
        description: "Product capabilities and workflow documentation for Squid Agent.",
        external: true,
      },
    ],
    internalLinks: sharedComparisonLinks,
    cta: "Compare ownership and handoff posture",
  },
  {
    kind: "comparison",
    slug: "squid-vs-bolt-for-agencies",
    title:
      "Squid vs Bolt.new for agencies (2026): Deliverables, reviews, and recovery",
      description:
        "A practical benchmark for Squid vs Bolt.new: brief handling, review loops, restoreability, deployment handoff, and cost signaling in one decision frame.",
    h1: "Squid vs Bolt.new for agencies",
    intro:
      "Agencies care about stable handoff artifacts and predictable revision loops more than single-shot previews. The meaningful question is which workflow preserves review traceability, makes rollback simple, and keeps exports deployable on the first pass.",
    summary:
      "Bolt is useful when teams need broad full-stack capabilities and a single environment for implementation, but Squid is strongest when agencies need an explicit export package with verifiable checkpoints, clear cost signaling, and fast, scoped edit iteration.",
    publishedAt: "2026-07-15",
    updatedAt: CONTENT_REVIEW_DATE,
    readingTime: "8 min read",
    table: {
      caption: "Agency workflow trade-offs",
      description:
        "Used to compare how each system supports review, revision, and handoff requirements in production work.",
      columns: ["Dimension", "Squid Agent", "Bolt.new"],
      rows: [
        [
          "Best fit",
          "Rapid React app generation with verifiable export and checkpoints",
          "Browser-first full-stack delivery with broader platform tooling",
        ],
        [
          "Stakeholder review",
          "Prompt-to-checklist clarity before build and structured revision traces",
          "Project history with visual restore flow and preview snapshots",
        ],
        [
          "Cost signal",
          "Model-based estimate before run plus tracked estimate-versus-actual",
          "Token growth visible by message context and project state",
        ],
        [
          "Recovery semantics",
          "Code checkpoints that preserve history while creating a restore version",
          "Version history bookmarks and restoration inside product editor",
        ],
        [
          "Delivery outputs",
          "Verified ZIP with manifest, diagnostics, and starter deployment files",
          "Project export and GitHub workflows with external repository handoff",
        ],
      ],
    },
    workflow: [
      {
        title: "Start from a client-ready brief",
        body: "Use the same prompt for both tools with explicit approval criteria: brand tone, component reuse, responsive states, delivery deadlines, and what must be editable after launch.",
      },
      {
        title: "Collect cost expectations",
        body: "Capture Squid's expected credit hold before generation and Bolt's token balance behavior at the same workflow stage.",
      },
      {
        title: "Drive a constrained revision",
        body: "Request a narrow change after each tool's first draft to compare revision control and unaffected surface preservation.",
      },
      {
        title: "Export, verify, and hand off",
        body: "Download each project to a clean environment, run checks, and verify that client-ready instructions, scripts, and deployment settings are present before shipping.",
      },
    ],
    sections: [
      {
        title: "Agency handoff is often more important than first paint",
        body: "Agency teams frequently evaluate generators by how reliably they get from draft to sign-off to deployment. Bolt and Squid both generate quickly, but Squid's extra emphasis is around evidentiary output around generation and checkpointed versioning that aligns with review workflows.",
      },
      {
        title: "Predictable spending is part of project planning",
        body: "Client estimates assume stable cost profiles. Squid publishes an expected estimate up front and records the final ledger, while Bolt's token cost can drift as project context grows. This shifts how you plan budgets in longer agency engagements.",
      },
      {
        title: "Recovery behavior changes how fast agencies iterate",
        body: "For agencies, a bad revision is not the end of the project; it's a normal part of delivery. Squid keeps restore as a non-destructive checkpoint event so a clean path to previous state is visible and auditable. Bolt's history restoration is also strong; teams should inspect how it interacts with their internal release process.",
      },
      {
        title: "Where Bolt can still be the better fit",
        body: "If your team needs Bolt-centric full-stack ecosystems, integrated hosting, and established Bolt-specific editor collaboration, it may be the right primary platform. Squid is strongest when the primary decision is a highly portable React output with a strong verification layer around export.",
      },
      {
        title: "Match the tool to your client governance model",
        body: "When review windows, client sign-off cadence, and predictable checkpoints are contractual, Squid's explicit restore and artifact reporting is usually easier to govern; Bolt is stronger if your team is already embedded in its deployment workflows.",
      },
    ],
    faqs: [
      {
        question: "Is Squid suitable for white-label or client-facing deliverables?",
        answer:
          "Yes. Squid's verified export output is intended for external handoff with documentation, so teams can deliver clean artifacts to client environments with explicit checks and checkpoints.",
      },
      {
        question: "How does Squid compare on revision complexity for agencies?",
        answer:
          "Squid treats each generation as a code checkpoint and records restores explicitly. In practice this can reduce the friction of handling narrow client revisions without rewriting broader context.",
      },
      {
        question: "Can I still use Git after using Squid?",
        answer:
          "Yes. Squid exports full project artifacts with Vite configuration and dependency metadata so your team can move into Git workflows after export.",
      },
      {
        question: "How should I compare costs for a long build?",
        answer:
          "Track expected credits before work, then track ledger entries after saves and recovery steps. Then measure cost per accepted result, not per request.",
      },
      {
        question: "Which tool is better for early-phase discovery with clients?",
        answer:
          "For fast exploration and a complete export check, Squid is often cleaner when teams need explicit artifacts. For full-stack depth and broad native tooling, Bolt remains stronger.",
      },
    ],
    sources: [
      {
        href: "https://support.bolt.new/building/using-bolt/rollback-backup",
        label: "Bolt rollback and backups",
        description:
          "Official guidance for restore behavior and version history in Bolt's environment.",
        external: true,
      },
      {
        href: "https://support.bolt.new/integrations/git",
        label: "Bolt Git integration",
        description:
          "Official path for moving work from Bolt into external Git-based pipelines.",
        external: true,
      },
      {
        href: "https://support.bolt.new/faqs/account-and-subscription/tokens",
        label: "Bolt token model",
        description:
          "Official usage behavior and token accounting guidance.",
        external: true,
      },
    ],
    cta: "Review an agency delivery path",
  },
  {
    kind: "comparison",
    slug: "squid-vs-lovable-for-startups",
    title:
      "Squid vs Lovable for startups (2026): shipping speed and ownership trade-offs",
    description:
      "A startup lens on Squid and Lovable focused on build confidence, cost visibility, iteration control, and clean ownership of generated code.",
    h1: "Squid vs Lovable for startups",
    intro:
      "Startups often move quickly, then spend more fixing drift. The practical comparison is not only about generation quality, but how each tool supports reliable checkpoints, spend clarity, and code that can be owned outside the platform.",
    summary:
      "Lovable can be strong for teams building with managed backend blocks and team collaboration, while Squid favors teams needing a clear, portable React front-end plus explicit cost and verification signals.",
    publishedAt: "2026-07-15",
    updatedAt: CONTENT_REVIEW_DATE,
    readingTime: "8 min read",
    table: {
      caption: "Startup delivery lens",
      description:
        "A side-by-side summary for teams balancing launch speed and product ownership.",
      columns: ["Dimension", "Squid Agent", "Lovable"],
      rows: [
        [
          "Startup fit",
          "Fast front-end shipping and portable handoff to your repository",
          "End-to-end app production with broader managed modules",
        ],
        [
          "Cost visibility",
          "Expected credits shown before generation and ledger details after",
          "Workspace credits for actions with separate cloud balance details",
        ],
        [
          "Recovery model",
          "Checkpoint restore as a new code state with history preserved",
          "Version history inspection and restore in product workflow",
        ],
        [
          "Ownership handoff",
          "Verified archive with manifest, diagnostics, and deployment starters",
          "Project ZIP plus GitHub integration for repository-based handoff",
        ],
        [
          "Revisions",
          "Scoped post-approval edits can be measured against acceptance criteria",
          "Revisions inside managed UI with context-aware state restoration",
        ],
      ],
    },
    workflow: [
      {
        title: "Define startup milestones",
        body: "Use identical milestones for both tools: initial feature set, key interaction points, and minimum production requirements.",
      },
      {
        title: "Benchmark costs through the same milestones",
        body: "Track model estimate, reserved usage, actual spend, repairs, and the number of iterations required per milestone.",
      },
      {
        title: "Stress test revisions",
        body: "Add one narrow request at each milestone and ensure unrelated sections remain stable.",
      },
      {
        title: "Finalize and export",
        body: "Export from a clean directory, run checks, and confirm that startup deployment scripts, env docs, and scripts are present.",
      },
    ],
    sections: [
      {
        title: "Speed should include reliability under change",
        body: "Startups often optimize for velocity, but first-run code quality without resilient revision flow is false speed. Measure the number and impact of follow-up edits before deciding.",
      },
      {
        title: "Choose your ownership boundary early",
        body: "With an early startup team, cloud convenience can hide integration debt. Squid emphasizes explicit export artifacts to make ownership transparent before you depend on external preview assumptions.",
      },
      {
        title: "Use cost metrics that match startup finance models",
        body: "A model estimate and final usage ledger give cleaner runway modeling than a single platform credit count. Track all failed and repaired runs before converting to a monthly burn target.",
      },
      {
        title: "Where Lovable can still be the better choice",
        body: "Lovable may be preferable if your startup needs its managed modules and team-native flow as a primary productivity layer. Squid is better aligned when portability and verifiable export are central from day one.",
      },
      {
        title: "Align tooling with your runway goals",
        body: "Use the same set of acceptance checks for both products. If your team’s runway is constrained, Squid’s explicit spend telemetry helps prevent silent cost drift during pivots and feature spikes.",
      },
    ],
    faqs: [
      {
        question: "Do startup teams need a fully managed backend first?",
        answer:
          "Some do. If backend complexity is high from launch, Lovable's managed integrations may reduce setup time. If the priority is a clean React front-end and predictable export, Squid is often stronger.",
      },
      {
        question: "Which gives better budget visibility for small teams?",
        answer:
          "Squid's pre-run estimate plus post-run ledger and refund behavior is useful when startups are monitoring month-by-month burn and user demand spikes.",
      },
      {
        question: "Can startups restore risky edits safely?",
        answer:
          "Yes. Squid checkpoint restore keeps an auditable timeline of changes. This helps during rapid pivots where version confidence matters more than final polish at first run.",
      },
      {
        question: "Which tool is better for long-term ownership?",
        answer:
          "Both support export and external workflows. Squid explicitly wraps the exported package with checks and project files that support long-term maintenance.",
      },
    ],
    sources: [
      {
        href: "https://docs.lovable.dev/features/code-mode",
        label: "Lovable code mode",
        description: "Official capabilities and export references for project portability.",
        external: true,
      },
      {
        href: "https://docs.lovable.dev/features/workspace-admin-settings",
        label: "Lovable billing settings",
        description: "Workspace credit and usage context for operational planning.",
        external: true,
      },
      {
        href: "https://docs.lovable.dev/features/github",
        label: "Lovable GitHub support",
        description: "Official repository sync and integration details.",
        external: true,
      },
    ],
    cta: "Run a startup-oriented comparison",
  },
  {
    kind: "comparison",
    slug: "squid-vs-v0-for-design-led-teams",
    title:
      "Squid vs v0 for design-led teams (2026): tokens, handoff, and design system consistency",
    description:
      "A design leadership view of Squid and v0 for teams that need visual polish, componentized handoff, and disciplined ownership across preview-to-production workflows.",
    h1: "Squid vs v0 for design-led teams",
    intro:
      "Design-led teams need predictable token, design system, and export behavior more than platform breadth. This comparison focuses on whether each tool preserves design intent while creating a reusable, inspectable codebase.",
    summary:
      "v0 remains strong in Next.js and Vercel-aligned creative workflows. Squid is a stronger bet when teams need explicit export verification, model-cost transparency, and a portable React artifact with an evidence bundle.",
    publishedAt: "2026-07-15",
    updatedAt: CONTENT_REVIEW_DATE,
    readingTime: "7 min read",
    table: {
      caption: "Design-led decision summary",
      description:
        "A practical lens for design teams balancing fidelity, edit control, and deployment handoff.",
      columns: ["Dimension", "Squid Agent", "v0"],
      rows: [
        [
          "Design system alignment",
          "Framework output plus verification on imports and component boundaries",
          "Strong Vite-friendly and Next.js ecosystem patterns via Vercel alignment",
        ],
        [
          "Iteration speed",
          "Scoped edits with checkpoint visibility",
          "Full-stack generation with broad context and follow-up edits",
        ],
        [
          "Cost signal",
          "Model-specific credit estimate before generation and post-build ledger",
          "Token-aware behavior tied to context and runtime complexity",
        ],
        [
          "Handoff readiness",
          "Verified archive with manifest, checks, and deployment starters",
          "Export and bidirectional Git workflows for external code integration",
        ],
        [
          "Recovery for revisions",
          "Restore via checkpoint history without dropping continuity",
          "Version and chat history-based recovery with visual previews",
        ],
      ],
    },
    workflow: [
      {
        title: "Define design system constraints",
        body: "Publish the reusable pattern map: spacing scale, typography, color tokens, interaction states, and breakpoints before generation.",
      },
      {
        title: "Measure first-pass fidelity",
        body: "Capture source reference quality and inspect whether each design intent category appears in generated component structure.",
      },
  {
    title: "Test narrow revisions",
    body: "Request one constrained design change and verify component reuse remains stable.",
  },
      {
        title: "Export and validate",
        body: "Run clean-room local checks and confirm artifact contents before a team handoff.",
      },
    ],
    sections: [
      {
        title: "Design fidelity depends on structure, not only visuals",
        body: "The first render can look close while internal structure drifts. Teams should compare component reuse, semantic HTML, and state boundaries before selecting a tool.",
      },
      {
        title: "Token-based budgets are hard to predict for evolving context",
        body: "v0's token model and Squid's model-credit model answer different planning questions. If your team works in narrow predictable prompts, either can work; if projects expand across many assets, the difference becomes material.",
      },
      {
        title: "Handoff shape should match your deployment pattern",
        body: "v0 is very strong when your stack already revolves around Next.js. Squid is strong when team leadership values portable, verified Vite bundles with explicit manifest and run checks.",
      },
      {
        title: "Design-led value is recovery-safe iteration",
        body: "When a stakeholder requests a narrow copy or spacing adjustment, a good workflow should confine changes. Compare restore and diff behavior just as aggressively as visual output.",
      },
      {
        title: "Choose review checkpoints before visual polish",
        body: "Design teams should lock review cadence, export cadence, and rollback checks before generation begins. If checkpoints are unclear, visual polish wins early while long-term maintainability suffers.",
      },
    ],
    faqs: [
      {
        question: "Can Squid handle design-driven prompts reliably?",
        answer:
          "Yes, when the brief explicitly defines component and state intent. The key is providing enough structure in the prompt and checking the resulting component boundaries.",
      },
      {
        question: "Which is easier for a design-team review loop?",
        answer:
          "If your review loop is primarily in Vercel + Next ecosystems, v0 is natural. If your team wants explicit export checks and checkpoints first, Squid can be easier to audit.",
      },
      {
        question: "Do design-led teams benefit from checkpoints?",
        answer:
          "Yes. Checkpoints reduce the cost of stakeholder revisions by making rollback precise and auditable.",
      },
      {
        question: "What should we check after either tool completes?",
        answer:
          "Install in a clean environment, run lint/type checks/build, verify interactions at all target widths, and inspect diff scope for follow-up edits.",
      },
    ],
    sources: [
      {
        href: "https://v0.dev/docs/faqs",
        label: "v0 official FAQ",
        description: "Scope, integration, and export-related behavior from v0 documentation.",
        external: true,
      },
      {
        href: "https://v0.dev/docs/docs/",
        label: "v0 documentation",
        description: "Official product behavior and workflow guidance.",
        external: true,
      },
    ],
    cta: "Compare for design-led teams",
  },
];

export const comparisonPages = comparisonPagesSeed.map((page) =>
  withMinimumInternalLinks(page, "comparison"),
);

const blogPagesSeed: MarketingPageSeed[] = [
  {
    kind: "guide",
    slug: "why-ai-app-builders-burn-credits",
    title: "Why AI App Builders Burn Credits—and How to Measure Real Cost",
    description:
      "Learn why AI app builder usage becomes unpredictable and how to compare planning, generation, context, retries, repairs, and successful output fairly.",
    h1: "Why AI app builders burn credits",
    intro:
      "The visible prompt is only one part of generation cost. Context reading, planning, code output, automated validation, retries, and repair can all affect what a useful result consumes.",
    summary:
      "Measure the cost of reaching an accepted, saved, locally runnable result—not the price of one prompt. Separate builder usage from hosting and runtime AI, record failed attempts, and require a ledger that explains estimates, actual charges, and refunds.",
    publishedAt: "2026-07-08",
    updatedAt: CONTENT_REVIEW_DATE,
    readingTime: "9 min read",
    sections: [
      {
        title: "One prompt can trigger several kinds of work",
        body: "An app builder may analyze a screenshot, plan file structure, read existing source, generate multiple files, validate imports, start a preview, inspect errors, and attempt repair. Products account for that work differently, so a message count rarely describes the true cost.",
      },
      {
        title: "Project context gets more expensive as the app grows",
        body: "Follow-up edits require the model to understand existing files. Some products charge by tokens processed; others map models and generation sizes into credits. In both cases, a five-word edit can cost more late in a project because the relevant context is larger.",
      },
      {
        title: "Failed work needs an explicit policy",
        body: "Ask when the product considers a generation chargeable: request start, model completion, preview success, or persisted code. Also ask what happens if the stream fails, code cannot be parsed, validation fails, the browser closes, or the server crashes after reserving usage.",
      },
      {
        title: "Automated repair can create hidden spend",
        body: "Repair is valuable when it converts a broken result into a working one. It becomes frustrating when a product silently spends another user-visible unit correcting its own invalid imports or missing files. The policy should say whether repair is included, separately authorized, or charged.",
      },
      {
        title: "A useful ledger tells the story",
        body: "For every accepted generation, capture the model, phase, estimate, actual cost, refund, status, project, and timestamp. For failed generations, preserve enough evidence to show why no final result was charged or why a reservation was released.",
      },
      {
        title: "Benchmark cost per accepted outcome",
        body: "Run the same brief through each tool until it passes the same acceptance checks. Divide total usage by accepted results and report the number of manual interventions. That is more decision-useful than comparing plan allowances in isolation.",
      },
    ],
    table: {
      caption: "A practical cost-accounting checklist",
      columns: ["Stage", "What to record", "Why it matters"],
      rows: [
        [
          "Before generation",
          "Model, displayed estimate, balance",
          "Establishes informed consent",
        ],
        [
          "During generation",
          "Retries, repair passes, interruptions",
          "Reveals hidden work",
        ],
        [
          "After persistence",
          "Actual charge, refund, saved version",
          "Connects spend to durable output",
        ],
        [
          "After export",
          "Install and build result",
          "Confirms the paid result is portable",
        ],
      ],
    },
    evidence: [
      {
        label: "Rule 01",
        title: "Count outcomes, not prompts",
        body: "A cheap prompt that produces unusable output is not a cheaper workflow.",
      },
      {
        label: "Rule 02",
        title: "Separate cost systems",
        body: "Builder usage, hosting, database, storage, and in-app AI should be reported independently.",
      },
      {
        label: "Rule 03",
        title: "Test recovery",
        body: "A failed stream or abandoned browser tab should not strand reserved usage indefinitely.",
      },
      {
        label: "Rule 04",
        title: "Keep evidence",
        body: "Screenshots, ledger rows, exported files, and build logs make a comparison reproducible.",
      },
    ],
    faqs: [
      {
        question: "Why can a small edit use many tokens?",
        answer:
          "The model may need to reread a large project and produce enough context to preserve existing behavior. Input context can outweigh the visible size of the request.",
      },
      {
        question: "Should an AI builder charge for failed generations?",
        answer:
          "Policies vary, but buyers should demand a clear definition of success and an auditable recovery path for reserved usage when no durable result is saved.",
      },
      {
        question: "Are automated repairs always free in Squid?",
        answer:
          "Squid's current preview-repair path is marked as non-chargeable. User-requested follow-up edits are normal generations and can use credits.",
      },
      {
        question: "What is the best cost metric?",
        answer:
          "Total builder usage per accepted, saved, locally runnable result, with retries and manual interventions reported alongside it.",
      },
    ],
    internalLinks: [
      {
        href: "/compare",
        label: "Compare AI app builders",
        description:
          "See current, evidence-led comparisons with Lovable, Bolt, and v0.",
      },
      {
        href: "/blog/how-to-evaluate-ai-generated-react-code",
        label: "Evaluate generated React code",
        description:
          "Pair cost evidence with a technical acceptance checklist.",
      },
    ],
    cta: "See a generation estimate first",
  },
  {
    kind: "guide",
    slug: "how-to-evaluate-ai-generated-react-code",
    title: "How to Evaluate AI-Generated React Code: A 2026 Checklist",
    description:
      "A production-minded checklist for AI-generated React apps covering structure, imports, TypeScript, accessibility, responsiveness, state, security, recovery, and export.",
    h1: "How to evaluate AI-generated React code",
    intro:
      "A good preview is evidence of visual output, not evidence of a maintainable application. Review the source, interactions, failure states, recovery path, and exported project before accepting generated React code.",
    summary:
      "Require a coherent file graph, resolved imports, meaningful TypeScript, accessible controls, responsive behavior, predictable state, explicit environment boundaries, reversible edits, and a clean local production build.",
    publishedAt: "2026-07-08",
    updatedAt: CONTENT_REVIEW_DATE,
    readingTime: "11 min read",
    sections: [
      {
        title: "1. Start with the file graph",
        body: "Find the real entry point, route ownership, shared UI primitives, feature modules, hooks, utilities, and data boundaries. Every internal import must resolve to a real file, and default versus named imports must match the corresponding export.",
      },
      {
        title: "2. Read types at trust boundaries",
        body: "Generated TypeScript should validate external data instead of sprinkling broad any types through fetch responses, forms, storage, and environment values. Check that optional and error states are represented rather than asserted away.",
      },
      {
        title: "3. Exercise interactions, not screenshots",
        body: "Click every primary action, submit empty and valid forms, open and close overlays, change filters, navigate with the keyboard, refresh on nested routes, and verify loading, empty, success, and failure states.",
      },
      {
        title: "4. Audit accessibility in the rendered UI",
        body: "Inputs need names, icon-only buttons need accessible labels, dialogs need focus management, headings need a meaningful outline, color cannot be the only signal, and motion should respect reduced-motion preferences.",
      },
      {
        title: "5. Check responsive composition",
        body: "Test narrow phones, tablets, small laptops, and wide desktops. Look for horizontal overflow, clipped controls, unreadable tables, touch targets that collapse, and fixed panels that trap content below the fold.",
      },
      {
        title: "6. Review security and environment assumptions",
        body: "Search for embedded secrets, client-side authorization decisions, unsafe HTML, unvalidated URLs, permissive redirects, direct database credentials, and dependencies or APIs that only work inside the builder preview.",
      },
      {
        title: "7. Make one narrow edit",
        body: "Ask the builder to change a single element or behavior. Then diff the project. A trustworthy edit should preserve unrelated copy, state, routes, and styling instead of regenerating the entire application.",
      },
      {
        title: "8. Export and build from clean state",
        body: "Move the result outside the builder. Install with the documented package manager, run type checking and linting, build for production, start the output, and repeat critical interactions without preview-only infrastructure.",
      },
    ],
    table: {
      caption: "Minimum acceptance matrix",
      columns: ["Area", "Pass condition", "Common failure"],
      rows: [
        [
          "Imports",
          "Every local path resolves and export styles match",
          "Missing files or default/named mismatch",
        ],
        [
          "Types",
          "External input is parsed and app state is explicit",
          "Broad any or unchecked JSON",
        ],
        [
          "Accessibility",
          "Named controls, keyboard flow, visible focus",
          "Clickable icons with no label",
        ],
        [
          "Responsive",
          "No clipped content at supported widths",
          "Desktop-only fixed dimensions",
        ],
        [
          "Export",
          "Clean install, typecheck, build, and run",
          "Preview-only dependency or config",
        ],
      ],
    },
    codeExample: {
      title: "Make import resolution a mechanical check",
      body: "Generated applications often look correct until a local import points to a file that was never returned. A quality gate should reject that output before handoff.",
      filename: "quality-check.ts",
      code: 'const unresolved = imports.filter((path) => !generatedPaths.has(path));\n\nif (unresolved.length > 0) {\n  throw new Error(`Missing generated files: ${unresolved.join(", ")}`);\n}',
    },
    faqs: [
      {
        question: "What should I check first in generated React code?",
        answer:
          "Start with the entry point and internal import graph. If files are missing or exports do not match imports, the rest of the review cannot be trusted.",
      },
      {
        question: "Is a successful preview enough?",
        answer:
          "No. A preview may include hidden platform files, cached dependencies, or runtime behavior that the exported project does not reproduce.",
      },
      {
        question: "Should generated code have zero accessibility warnings?",
        answer:
          "Treat automated warnings as a baseline. Passing mechanical checks still requires keyboard, screen-reader, contrast, focus, and interaction review.",
      },
      {
        question: "How do I test whether edits are safe?",
        answer:
          "Request one narrow change, diff every file, run the acceptance suite, and verify unrelated UI and behavior remain unchanged.",
      },
      {
        question: "What must an export include?",
        answer:
          "Source, package metadata, lockfile or package-manager guidance, build configuration, environment documentation, run instructions, and any framework support files the preview supplied implicitly.",
      },
    ],
    internalLinks: [
      {
        href: "/benchmarks/screenshot-to-react",
        label: "Screenshot-to-React benchmark",
        description: "Turn this checklist into a reproducible scoring rubric.",
      },
      {
        href: "/blog/export-react-app-from-ai",
        label: "Export a generated React app",
        description: "Follow the clean-room handoff workflow step by step.",
      },
    ],
    cta: "Generate and inspect a React app",
  },
  {
    kind: "guide",
    slug: "screenshot-to-react-is-table-stakes",
    title: "Screenshot-to-React Is Table Stakes: What to Measure in 2026",
    description:
      "Screenshot-to-React tools should be measured on visual fidelity, responsive inference, interaction quality, edit stability, recovery, cost, and export—not screenshots alone.",
    h1: "Screenshot-to-React is table stakes",
    intro:
      "Converting pixels into JSX is only the opening move. The harder product work begins when the design must respond, behave, survive edits, build locally, and remain understandable to the next developer.",
    summary:
      "Measure screenshot tools across seven dimensions: visual fidelity, responsive inference, semantic structure, interaction completeness, edit containment, recovery, and export readiness. A single desktop screenshot score misses most of the risk.",
    publishedAt: "2026-07-08",
    updatedAt: CONTENT_REVIEW_DATE,
    readingTime: "8 min read",
    sections: [
      {
        title: "Pixels do not reveal the component model",
        body: "A screenshot cannot tell the generator which elements repeat, what belongs in shared layout, which states are interactive, or where data boundaries live. The output must infer a component system without overfitting every visible rectangle into one-off markup.",
      },
      {
        title: "Responsive behavior is an inference problem",
        body: "One desktop image does not specify mobile navigation, table overflow, card stacking, touch targets, text wrapping, image crops, or which secondary content should move below the fold. A benchmark must score at several widths.",
      },
      {
        title: "Interaction completion separates demos from apps",
        body: "Buttons, filters, forms, tabs, dialogs, and menus should have meaningful state and feedback. Static approximations can win a visual screenshot while failing the user's actual task.",
      },
      {
        title: "Edit stability exposes brittle generation",
        body: "After the initial match, request a precise change. If the generator rewrites unrelated sections or loses previous responsive behavior, the project is expensive to iterate even if the first frame looked excellent.",
      },
      {
        title: "Export is where hidden assumptions surface",
        body: "The final project should install and build without the builder's cached dependencies, injected files, private preview APIs, or undocumented environment. That clean-room test is part of visual tool evaluation, not an unrelated engineering concern.",
      },
      {
        title: "Publish the evidence, not only the score",
        body: "Keep the input image, exact prompt, viewport captures, generated files, diagnostics, edit diff, usage record, export contents, and local build result. Reproducible evidence makes benchmark updates possible when products change.",
      },
    ],
    table: {
      caption: "The seven-part screenshot-to-React score",
      columns: ["Dimension", "Weight", "What earns full credit"],
      rows: [
        [
          "Visual fidelity",
          "20%",
          "Accurate hierarchy, typography, spacing, color, and imagery",
        ],
        [
          "Responsive inference",
          "15%",
          "Intentional behavior across phone, tablet, and desktop",
        ],
        [
          "Semantic structure",
          "15%",
          "Useful components and correct document semantics",
        ],
        [
          "Interaction quality",
          "15%",
          "Complete states, feedback, and keyboard behavior",
        ],
        ["Edit containment", "10%", "Narrow changes preserve unrelated output"],
        [
          "Recovery",
          "10%",
          "Earlier working state can be restored predictably",
        ],
        [
          "Export readiness",
          "15%",
          "Clean local install, typecheck, build, and run",
        ],
      ],
    },
    faqs: [
      {
        question: "What is a good screenshot-to-code accuracy score?",
        answer:
          "There is no universal threshold. Define weighted acceptance criteria for your product, use repeatable viewports, and publish the evidence behind the score.",
      },
      {
        question: "How many screen sizes should I test?",
        answer:
          "At minimum use a narrow phone, tablet or small laptop, and the source desktop width. Add any width where the design changes navigation or layout mode.",
      },
      {
        question: "Should visual fidelity have the highest weight?",
        answer:
          "It should be important, but not dominant enough to hide broken interactions, brittle edits, or an export that cannot run.",
      },
      {
        question: "How does Squid use screenshots?",
        answer:
          "Squid analyzes uploaded screenshots or captured website references, combines that context with the prompt, and generates a complete multi-file React application.",
      },
    ],
    internalLinks: [
      {
        href: "/benchmarks/screenshot-to-react",
        label: "Use the full benchmark rubric",
        description:
          "Get scoring levels, evidence requirements, and a repeatable test protocol.",
      },
      {
        href: "/blog/export-react-app-from-ai",
        label: "Go from screenshot to production React",
        description:
          "Turn the visual reference into explicit product and engineering requirements.",
      },
    ],
    cta: "Turn a screenshot into inspectable React",
  },
  {
    kind: "guide",
    slug: "how-to-export-ai-generated-react-app",
    title: "How to Export an AI-Generated React App Without Surprises",
    description:
      "A step-by-step guide to exporting AI-generated React code, validating the bundle, installing locally, building for production, and preparing a clean handoff.",
    h1: "How to export an AI-generated React app",
    intro:
      "Downloading source is the beginning of an export, not the end. A reliable handoff reproduces the runtime, explains dependencies, documents environment needs, and proves the project builds outside the generator.",
    summary:
      "Freeze a known-good version, export source plus configuration, inspect the manifest, install in a clean directory, run type and production checks, test routes, document environment values, and commit the verified artifact before further work.",
    publishedAt: CONTENT_REVIEW_DATE,
    updatedAt: CONTENT_REVIEW_DATE,
    readingTime: "10 min read",
    sections: [
      {
        title: "1. Freeze the version you are exporting",
        body: "Finish the acceptance pass before download and record the exact version or checkpoint. Do not export while an automated repair, streaming generation, or follow-up edit is still in progress.",
      },
      {
        title: "2. Inventory the archive",
        body: "Confirm the bundle includes every source file, entry point, package metadata, framework configuration, styles, public assets, shared UI support, environment guidance, and deployment files the preview relied on.",
      },
      {
        title: "3. Read the manifest and diagnostics",
        body: "A manifest should distinguish generated source from assembled support files and identify the intended package and app name. Diagnostics should report unresolved imports, protected paths, accessibility warnings, and bundle-level failures.",
      },
      {
        title: "4. Install from a clean directory",
        body: "Extract outside any existing monorepo so undeclared workspace dependencies cannot mask problems. Use the documented package manager, preserve its lockfile when provided, and note any peer-dependency or postinstall failures.",
      },
      {
        title: "5. Run mechanical checks",
        body: "Typecheck, lint, test where available, and create a production build. Start the built output and test direct navigation to nested routes, asset paths, environment failures, and browser refresh behavior.",
      },
      {
        title: "6. Replace preview-only infrastructure",
        body: "Identify builder-specific APIs, authentication, databases, storage, serverless functions, analytics, and environment values. Decide what moves with the project and what requires an external migration.",
      },
      {
        title: "7. Create the first repository checkpoint",
        body: "Once the clean export passes, initialize or connect the real repository and commit the untouched verified artifact. That baseline makes every subsequent product change reviewable.",
      },
    ],
    table: {
      caption: "Export bundle essentials",
      columns: ["Artifact", "Purpose", "Failure if missing"],
      rows: [
        [
          "Source files",
          "Application behavior and UI",
          "The preview cannot be reproduced",
        ],
        [
          "package.json",
          "Dependencies and scripts",
          "Install and build are undefined",
        ],
        [
          "Build configuration",
          "Framework and CSS pipeline",
          "Local output differs from preview",
        ],
        [
          "Environment guide",
          "External services and secrets",
          "Runtime fails after deployment",
        ],
        [
          "Manifest and report",
          "Traceability and known issues",
          "Handoff begins without evidence",
        ],
      ],
    },
    faqs: [
      {
        question: "Is downloading a ZIP enough to own the code?",
        answer:
          "It gives you source possession, but practical ownership also requires the dependencies, configuration, environment information, and rights needed to build and operate it.",
      },
      {
        question: "Why test in a clean directory?",
        answer:
          "Existing monorepo packages, global tools, caches, and environment variables can make an incomplete export appear healthy.",
      },
      {
        question: "What does Squid include in a full export?",
        answer:
          "Squid currently assembles source and UI support files, package and build configuration, a README, manifest, quality and verification reports, and starter configs for Vercel, Netlify, and Cloudflare Workers.",
      },
      {
        question: "Should I commit the export before editing it?",
        answer:
          "Yes. An untouched verified baseline makes later changes auditable and provides a reliable recovery point.",
      },
    ],
    internalLinks: [
      {
        href: "/blog/how-we-verify-code",
        label: "Review the code before export",
        description: "Use the production-minded React acceptance checklist.",
      },
      {
        href: "/compare",
        label: "Compare export workflows",
        description:
          "See how Squid, Lovable, Bolt, and v0 currently handle code portability.",
      },
    ],
    cta: "Create a verified React export",
  },
  {
    kind: "guide",
    slug: "from-screenshot-to-production-react",
    title: "From Screenshot to Production React: A Practical Workflow",
    description:
      "Turn a visual reference into explicit React requirements, responsive behavior, components, interactions, accessibility, validation, and a production-ready handoff.",
    h1: "From screenshot to production React",
    intro:
      "A screenshot is a valuable design constraint, but it is incomplete product documentation. The fastest reliable workflow converts visual evidence into explicit layout, behavior, content, state, and acceptance rules before asking AI to code.",
    summary:
      "Extract the design system, define responsive transformations and states, map components and data, generate against a clear contract, verify one viewport at a time, test narrow edits, and finish with a clean export build.",
    publishedAt: CONTENT_REVIEW_DATE,
    updatedAt: CONTENT_REVIEW_DATE,
    readingTime: "9 min read",
    sections: [
      {
        title: "Extract what the screenshot actually proves",
        body: "Record viewport size, visible copy, hierarchy, spacing, alignment, typography, colors, borders, shadows, imagery, icons, and controls. Separate observed facts from assumptions about behavior or responsive design.",
      },
      {
        title: "Write responsive transformations",
        body: "For each major region, state what happens on smaller screens: wrap, stack, scroll, collapse, hide, reorder, resize, or switch navigation mode. Do not leave the generator to infer every breakpoint from a desktop image.",
      },
      {
        title: "Define states the image cannot show",
        body: "List loading, empty, error, success, hover, focus, selected, disabled, open, and validation states. Add the actual user task for every visible control so the generated app does more than resemble the reference.",
      },
      {
        title: "Map components and ownership",
        body: "Identify the app shell, navigation, major feature regions, repeated component families, data boundaries, and responsive layout owners. Prefer a small number of reusable patterns over copied markup for every visual block.",
      },
      {
        title: "Generate with an acceptance contract",
        body: "Require complete files, resolved imports, explicit state, accessible controls, the intended framework, and no placeholder behavior for primary actions. Include the reference image and the extracted rules in the same request.",
      },
      {
        title: "Verify in slices",
        body: "Compare the first viewport at the source size, fix type and spacing drift, then move down the page. Repeat at mobile width and exercise interactions before judging the overall match.",
      },
      {
        title: "Finish with change and export tests",
        body: "Request one small visual change, inspect the diff, restore the prior version, export the project, and run it from a clean directory. That sequence tests whether the result is maintainable, not merely attractive.",
      },
    ],
    table: {
      caption: "Screenshot extraction worksheet",
      columns: ["Layer", "Capture", "Turn into"],
      rows: [
        [
          "Visual",
          "Type, color, spacing, imagery",
          "Design tokens and component variants",
        ],
        [
          "Layout",
          "Grid, alignment, density, framing",
          "Container and responsive rules",
        ],
        [
          "Behavior",
          "Controls and implied actions",
          "States, events, and feedback",
        ],
        ["Content", "Visible copy and data", "Structured content model"],
        [
          "Quality",
          "Ambiguities and risks",
          "Acceptance tests and open questions",
        ],
      ],
    },
    faqs: [
      {
        question: "Can AI infer mobile design from a desktop screenshot?",
        answer:
          "It can make plausible choices, but explicit responsive transformations produce more consistent and testable results.",
      },
      {
        question: "Should I generate the whole page at once?",
        answer:
          "Generate a complete architecture, then verify and refine in coherent sections or viewports so visual drift is caught early.",
      },
      {
        question: "How do I avoid one giant React component?",
        answer:
          "Name the component families and ownership boundaries in the brief, and require separate complete files with resolved imports.",
      },
      {
        question: "What is the final acceptance test?",
        answer:
          "The project should match at target viewports, complete core interactions, survive a narrow edit and restore, and build from a clean export.",
      },
    ],
    internalLinks: [
      {
        href: "/benchmarks/screenshot-to-react",
        label: "Score the result",
        description: "Use the weighted screenshot-to-React benchmark.",
      },
      {
        href: "/blog/how-to-export-ai-generated-react-app",
        label: "Complete the handoff",
        description: "Validate and export the generated application cleanly.",
      },
    ],
    cta: "Build from a screenshot",
  },
  {
    kind: "guide",
    slug: "ai-coding-tool-comparison-with-credits",
    title:
      "AI Coding Tool Comparison with Credits: Decision Framework for Product Teams",
    description:
      "A practical framework for comparing AI coding tools by expected spend, actual cost, revision strategy, portability, and acceptance quality.",
    h1: "AI coding tool comparison with credits",
    intro:
      "Credits and token behavior matter when your team is choosing between AI tools for long-lived projects. Compare on accepted output quality, visible spend signals, and repeatable recovery.",
    summary:
      "Use the same acceptance tests across tools: local build quality, revision safety, version rollback behavior, post-export portability, and published usage evidence.",
    publishedAt: "2026-07-16",
    updatedAt: CONTENT_REVIEW_DATE,
    readingTime: "9 min read",
    sections: [
      {
        title: "Spend comparisons should be outcome-based",
        body: "A single generation call is not the real unit. Count costs against an accepted, locally runnable result that passed your release-level checks.",
      },
      {
        title: "Demand clear before-run visibility",
        body: "Tools that show expected usage before execution reduce surprises and make leadership-level forecasting possible before a project starts.",
      },
      {
        title: "Compare what gets charged on retries",
        body: "A retry or repair may change the actual cost profile significantly, so compare first successful acceptance, failed attempts, and reserve-release behavior.",
      },
      {
        title: "Separate generation spend from infrastructure spend",
        body: "Hosting, runtime, APIs, and external CI remain separate line items. Keep credit comparisons narrowly scoped to generator outcomes.",
      },
      {
        title: "Check portability and governance together",
        body: "A strong comparison includes whether the tool helps you export clean checkpoints, verify diffs, and preserve team-ready audit trails.",
      },
    ],
    table: {
      caption: "Credit comparison checklist",
      columns: ["Question", "Best practice", "Why it matters"],
      rows: [
        [
          "What is shown before generation?",
          "Expected usage plus clear unit model",
          "Supports intentional plan sign-off",
        ],
        [
          "How are retries handled?",
          "Transparent reserve and refund behavior",
          "Prevents budget drift under iteration",
        ],
        [
          "What is the rollback story?",
          "Checkpoint-safe restore with preserved history",
          "Protects delivery confidence",
        ],
      ],
    },
    faqs: [
      {
        question: "Should I compare token tools to credit tools directly?",
        answer:
          "Only when normalized to accepted outcomes. Compare units only as a secondary view.",
      },
      {
        question: "Can previews hide true total project cost?",
        answer:
          "Yes. Track post-export deployment and runtime separately from generator spend.",
      },
      {
        question: "What indicates a trustworthy pricing signal?",
        answer:
          "Displayed estimate, actual charge, and refund policy on save/resolve events.",
      },
      {
        question: "Can governance still work with a credit model?",
        answer:
          "Yes, when checkpoints, usage evidence, and rollback controls are part of your internal release process, not just dashboard summaries.",
      },
    ],
    cta: "Compare tools with the acceptance ledger",
  },
  {
    kind: "guide",
    slug: "export-react-app-from-ai",
    title: "Export React App from AI: What to verify before handoff",
    description:
      "A practical exit checklist for AI-generated React projects, from version freeze to local verification and deployment readiness.",
    h1: "Export React app from AI",
    intro:
      "Exporting is the final handoff point for real ownership. The real question is whether the output stays runnable and reviewable after it leaves the generator.",
    summary:
      "Use version freeze, manifest review, clean-folder installs, build checks, and diff discipline to protect team ownership and preserve deployment confidence.",
    publishedAt: "2026-07-16",
    updatedAt: CONTENT_REVIEW_DATE,
    readingTime: "8 min read",
    sections: [
      {
        title: "Freeze the version that passed acceptance",
        body: "Complete your acceptance checks before export and capture the exact checkpoint, prompt revision, and model details with it.",
      },
      {
        title: "Inspect export inventory",
        body: "Check for source files, package manifest, scripts, runtime configuration, environment guidance, and diagnostics.",
      },
      {
        title: "Move outside the builder quickly",
        body: "Use a clean directory and avoid existing dependency caches that can hide missing outputs.",
      },
      {
        title: "Run baseline commands",
        body: "Install, typecheck, lint, and build before merging with your team codebase. Then run core interaction checks.",
      },
      {
        title: "Create a recovery baseline",
        body: "Commit a no-edit baseline commit after verification so every later modification is auditable.",
      },
    ],
    table: {
      caption: "Export verification steps",
      columns: ["Step", "What to verify", "Pass condition"],
      rows: [
        [
          "Version",
          "Checkpoint identity and prompt context",
          "Captured and immutable",
        ],
        [
          "Install",
          "Dependencies and package scripts",
          "Stable install in clean directory",
        ],
        [
          "Runtime",
          "Build and route functionality",
          "Successful local run and interactions",
        ],
      ],
    },
    faqs: [
      {
        question: "Do we need a clean directory?",
        answer: "Yes. It prevents hidden workspace dependencies from masking real missing outputs.",
      },
      {
        question: "Can export be considered complete without diagnostic files?",
        answer:
          "For production planning, include diagnostics and manifest data that explain what passed and what changed.",
      },
      {
        question: "What should an exported app include for teams?",
        answer:
          "Source, package config, scripts, README, environment notes, and clear evidence files are minimum.",
      },
      {
        question: "How do I preserve approval history after export?",
        answer:
          "Store acceptance evidence and the exact checkpoint metadata with the exported artifact so downstream teams can verify who approved the delivered baseline.",
      },
    ],
    internalLinks: [
      {
        href: "/blog/how-we-verify-code",
        label: "How we verify generated code",
        description:
          "Align export checks with the verification workflow before final handoff.",
      },
      {
        href: "/benchmarks/screenshot-to-react",
        label: "Benchmark export portability",
        description:
          "Use the benchmark rubric to validate how export quality survives clean-room checks.",
      },
      {
        href: "/compare/squid-vs-lovable",
        label: "Compare Squid and Lovable export workflows",
        description:
          "Check portability, restoration options, and ownership handoff before committing.",
      },
    ],
    cta: "Create a verified export baseline",
  },
  {
    kind: "guide",
    slug: "how-we-verify-code",
    title: "How We Verify Code: Squid’s Evidence-first Review Process",
    description:
      "A transparent walkthrough of Squid's verification layers from entry checks to accessibility and export readiness.",
    h1: "How we verify code",
    intro:
      "Verification is a sequence, not a single pass. Squid validates file graphs, runtime behavior, interactions, and portability as part of the delivery story.",
    summary:
      "Follow this process to know what has passed, what still needs review, where risk remains, and what to test locally before shipping so every release has a defendable evidence trail.",
    publishedAt: "2026-07-16",
    updatedAt: CONTENT_REVIEW_DATE,
    readingTime: "7 min read",
    sections: [
      {
        title: "Source graph checks",
        body: "Resolved imports, complete file sets, and consistent exports are validated before acceptance claims.",
      },
      {
        title: "Runtime and accessibility checks",
        body: "Automated verification covers build-level issues and accessibility basics so teams can catch obvious regressions early.",
      },
      {
        title: "Diff-aware verification",
        body: "Diff scope should be readable and explainable to humans before the next milestone is accepted.",
      },
      {
        title: "Review after each focused edit",
        body: "Narrow edits are verified against unchanged areas so you can maintain local and product stability.",
      },
      {
        title: "Post-export checks",
        body: "A local clean install/build and manual interaction pass confirm that verification survives outside preview mode.",
      },
    ],
    faqs: [
      {
        question: "What is the difference between pass and warning?",
        answer:
          "Warnings are often recoverable. A passed check means the project met explicit acceptance criteria.",
      },
      {
        question: "How long should verification take for each project?",
        answer:
          "As fast as your baseline checks but strict enough to prevent silent regressions before shipping.",
      },
      {
        question: "Can verification replace human QA?",
        answer:
          "No. It reduces risk and clarifies failure points, but human review is still needed for business logic and edge behavior.",
      },
      {
        question: "How often should verification artifacts be refreshed?",
        answer:
          "Refresh them after each significant edit, framework update, and dependency change so the evidence remains tied to the current running code.",
      },
    ],
    internalLinks: [
      {
        href: "/blog/what-to-check-after-ai-generation",
        label: "Post-generation acceptance checklist",
        description:
          "Run a practical handoff checklist before promoting an exported project.",
      },
      {
        href: "/benchmarks/screenshot-to-react",
        label: "Run the reproducible benchmark",
        description:
          "Validate verification outcomes against an objective, repeatable scoring protocol.",
      },
      {
        href: "/compare/squid-vs-v0",
        label: "Compare Squid and v0 verification paths",
        description:
          "Review how checkpoints, recovery, and export readiness differ between tools.",
      },
    ],
    cta: "Run plan-mode verification",
  },
  {
    kind: "guide",
    slug: "what-to-check-after-ai-generation",
    title: "What to Check After AI Generation: A Practical Receipt",
    description:
      "A post-generation runbook for accepted outputs, revisions, and safe continuation.",
    h1: "What to check after AI generation",
    intro:
      "You should not move forward until you can replay the output outside the builder and confirm baseline behavior, accessibility, and business logic.",
    summary:
      "This guide gives a quick acceptance list that covers file integrity, interaction completeness, recovery confidence, and export quality.",
    publishedAt: CONTENT_REVIEW_DATE,
    updatedAt: CONTENT_REVIEW_DATE,
    readingTime: "7 min read",
    sections: [
      {
        title: "Checkpoint and recovery first",
        body: "Verify the generation checkpoint is saved, labeled, and recoverable before making new edits.",
      },
      {
        title: "Run local validation",
        body: "Install from exported files in clean context and run your normal build/test commands.",
      },
      {
        title: "Exercise all critical interactions",
        body: "Test navigation, form submission, filtering, and error states at intended viewport sizes.",
      },
      {
        title: "Review diffs after each edit",
        body: "A narrow change should not rewrite unrelated components, styling, or routes.",
      },
      {
        title: "Document any deviations before handoff",
        body: "Record every unresolved deviation in a short handoff note so your team can budget follow-up work and avoid hidden assumptions in the repository transfer.",
      },
    ],
    table: {
      caption: "AI-generation handoff checklist",
      columns: ["Area", "Required check", "Failure symptom"],
      rows: [
        [
          "Files",
          "No unresolved imports",
          "Build errors in local preview",
        ],
      [
        "Checks",
        "Typecheck/build pass",
        "Runtime mismatch outside preview",
      ],
        [
          "Diffs",
          "Unrelated files remain stable",
          "Unintended side effects",
        ],
      ],
    },
    faqs: [
      {
        question: "How soon should checks run?",
        answer: "Immediately after a checkpoint is accepted and before any additional user-facing edits.",
      },
      {
        question: "What is the minimum confidence bar before handoff?",
        answer:
          "A clean install/build, stable interactions at target paths, and a documented checklist score.",
      },
      {
        question: "Do we need to check export artifacts?",
        answer:
          "Yes. Export artifacts are the true proof of ownership once work leaves the builder.",
      },
      {
        question: "When should we document unresolved issues?",
        answer:
          "Document them immediately after each verification loop so handoff stays aligned to known risk and owners know what still requires follow-up.",
      },
    ],
    internalLinks: [
      {
        href: "/blog/how-we-verify-code",
        label: "How we verify code",
        description:
          "Connect this checklist to Squid&apos;s layered verification workflow.",
      },
      {
        href: "/blog/export-react-app-from-ai",
        label: "Export and verify a React app",
        description:
          "Use the same acceptance tests before sharing or committing an artifact.",
      },
      {
        href: "/benchmarks/screenshot-to-react",
        label: "Run the benchmark checklist",
        description:
          "Apply the same evidence-first protocol before each release handoff.",
      },
      {
        href: "/compare/squid-vs-bolt",
        label: "Compare Squid and Bolt revision workflows",
        description:
          "Evaluate how checkpoints, rollback, and export stability compare in practice.",
      },
    ],
    cta: "Run the post-generation checklist",
  },
];

export const blogPages = blogPagesSeed.map((page) =>
  withMinimumInternalLinks(page, "guide"),
);

export const benchmarkPage: MarketingPage = {
  kind: "benchmark",
  slug: "screenshot-to-react",
  title: "Screenshot-to-React Benchmark: A Reproducible 2026 Rubric",
  description:
    "A transparent screenshot-to-React benchmark rubric for visual fidelity, responsive behavior, semantics, interaction quality, edit stability, recovery, usage, and export readiness.",
  h1: "Screenshot-to-React benchmark",
  intro:
    "This benchmark measures whether a tool can turn the same visual reference and requirements into a React application that looks right, behaves correctly, survives edits, and runs outside the builder.",
  summary:
    "Use fixed inputs, three viewports, a shared acceptance script, a controlled edit, a recovery test, and a clean-room export. Publish every artifact needed to reproduce the score.",
  publishedAt: "2026-07-08",
  updatedAt: CONTENT_REVIEW_DATE,
  readingTime: "12 min read",
  sections: [
    {
      title: "Test protocol",
      body: "Use the same account tier where possible, start from a new project, provide the same prompt and reference, prohibit manual code edits before initial scoring, and stop the first phase only when the product claims the generation is complete.",
    },
    {
      title: "Viewport protocol",
      body: "Capture the source desktop width plus a 390px phone and a 768px tablet or small laptop. Score both fidelity to known evidence and the quality of inferred responsive behavior.",
    },
    {
      title: "Interaction protocol",
      body: "Define five to ten concrete tasks from the reference: navigation, menu state, forms, filters, tabs, dialogs, or primary calls to action. Test keyboard access and visible feedback as part of the same task.",
    },
    {
      title: "Controlled edit protocol",
      body: "Request one bounded visual change and one bounded behavior change. Diff every generated file and subtract points for unrelated copy, styling, component, or state changes.",
    },
    {
      title: "Recovery protocol",
      body: "Introduce a reproducible regression, locate the last good version, restore it using the native product workflow, and confirm both the UI and project history remain coherent.",
    },
    {
      title: "Export protocol",
      body: "Download or sync the project into a clean environment, install with the documented package manager, run type checking and linting if configured, build for production, and repeat the core interaction script.",
    },
    {
      title: "Evidence package",
      body: "Publish the reference image, exact prompt, settings, timestamps, usage screenshots, desktop and mobile captures, generated source, edit diff, recovery recording, export inventory, and local build log.",
    },
  ],
  table: {
    caption: "100-point benchmark rubric",
    description:
      "Score every category from 0 to its maximum and attach direct evidence for each deduction.",
    columns: ["Category", "Points", "Full-credit standard"],
    rows: [
      [
        "Desktop visual fidelity",
        "15",
        "Hierarchy, spacing, typography, color, imagery, and detail match",
      ],
      [
        "Responsive inference",
        "15",
        "Intentional phone and tablet composition without overflow",
      ],
      [
        "Semantic structure",
        "10",
        "Meaningful HTML and maintainable component boundaries",
      ],
      [
        "Interaction completeness",
        "15",
        "Core tasks work with loading, error, and success feedback",
      ],
      [
        "Accessibility",
        "10",
        "Named controls, keyboard path, focus, headings, and contrast",
      ],
      [
        "Edit containment",
        "10",
        "Bounded changes preserve unrelated files and behavior",
      ],
      [
        "Recovery",
        "10",
        "Known-good version restores predictably without history loss",
      ],
      [
        "Export readiness",
        "10",
        "Clean install, build, start, routes, and assets outside preview",
      ],
      [
        "Usage transparency",
        "5",
        "Cost before and after the accepted outcome can be explained",
      ],
    ],
  },
  workflow: [
    {
      title: "Prepare",
      body: "Normalize the prompt, screenshot, product requirements, target framework, viewports, and tasks.",
    },
    {
      title: "Generate",
      body: "Run from a clean project and record settings, time, usage, and interventions.",
    },
    {
      title: "Score",
      body: "Apply the rubric at all viewports and complete the interaction script.",
    },
    {
      title: "Stress",
      body: "Perform the controlled edits and recovery scenario.",
    },
    {
      title: "Export",
      body: "Build and run the artifact in a clean environment, then publish the evidence package.",
    },
  ],
  evidence: [
    {
      label: "0 points",
      title: "Missing or unusable",
      body: "The requirement is absent, broken, or cannot be evaluated from the supplied artifact.",
    },
    {
      label: "1/3 credit",
      title: "Recognizable but fragile",
      body: "The direction is visible, but important details, states, or widths fail.",
    },
    {
      label: "2/3 credit",
      title: "Functional with clear gaps",
      body: "The requirement works but has material fidelity, quality, or maintainability issues.",
    },
    {
      label: "Full credit",
      title: "Production-credible",
      body: "The result meets the documented acceptance standard with reproducible evidence.",
    },
  ],
  faqs: [
    {
      question: "Is this benchmark affiliated with Lovable, Bolt, or v0?",
      answer:
        "No. It is a Squid-authored methodology designed to make cross-tool evaluation more reproducible. Product capabilities should be verified against current official documentation.",
    },
    {
      question: "Why is visual fidelity only 15 points?",
      answer:
        "The benchmark separates desktop resemblance from responsive behavior, accessibility, interactions, edit stability, recovery, and export. Together, design quality still represents a large share of the score.",
    },
    {
      question: "Can I change the category weights?",
      answer:
        "Yes. Publish your weights before running the tools and explain why they match your product risk. Do not change them after seeing results.",
    },
    {
      question: "How many runs should I perform?",
      answer:
        "Use at least three independent runs per tool for directional conclusions. Report the median and the range because model output is non-deterministic.",
    },
    {
      question: "Does a local build prove production readiness?",
      answer:
        "No. It is a minimum portability check. Security, performance, browser coverage, data migration, observability, and operational review still remain.",
    },
  ],
  internalLinks: [
    {
      href: "/blog/screenshot-to-react-is-table-stakes",
      label: "Why the rubric goes beyond pixels",
      description:
        "Understand the product risks hidden by a single screenshot score.",
    },
    {
      href: "/blog/how-to-evaluate-ai-generated-react-code",
      label: "Use the React review checklist",
      description: "Inspect the generated source and runtime in detail.",
    },
    {
      href: "/compare",
      label: "Review current tool comparisons",
      description: "Compare ownership, usage, recovery, and export workflows.",
    },
  ],
  cta: "Run the benchmark with Squid",
};

export const marketingPaths = [
  "/compare",
  "/blog",
  "/benchmarks",
  ...comparisonPages.map((page) => `/compare/${page.slug}`),
  ...blogPages.map((page) => `/blog/${page.slug}`),
  `/benchmarks/${benchmarkPage.slug}`,
];

export function getMarketingStarterPrompt(starter: string | null): string | null {
  if (!starter) return null;

  const cleanStarter = starter.trim();
  if (!cleanStarter) return null;

  const normalizedStarter = cleanStarter.toLowerCase();

  const compareMatch = normalizedStarter.match(/^compare-(.+)$/);
  if (compareMatch) {
    const slug = compareMatch[1];
    const match = comparisonPages.find((page) => page.slug === slug);
    if (match) {
      return `Compare ${match.h1} using Squid's full verification workflow.`;
    }
  }

  const guideMatch = normalizedStarter.match(/^blog-(.+)$/);
  if (guideMatch) {
    const slug = guideMatch[1];
    const match = blogPages.find((page) => page.slug === slug);
    if (match) {
      return `Explore ${match.h1} and apply this workflow in Squid.`;
    }
  }

  const benchmarkMatch = normalizedStarter.match(/^benchmark-(.+)$/);
  if (benchmarkMatch) {
    const slug = benchmarkMatch[1];
    if (benchmarkPage.slug === slug) {
      return `${benchmarkPage.h1} is your next evaluation benchmark.`;
    }
  }

  return null;
}

export function getMarketingPath(page: MarketingPage) {
  if (page.kind === "comparison") return `/compare/${page.slug}`;
  if (page.kind === "guide") return `/blog/${page.slug}`;
  return `/benchmarks/${page.slug}`;
}

export function marketingMetadata(page: MarketingPage): Metadata {
  const path = getMarketingPath(page);
  const keywords = [
    "AI app builder",
    "React app generator",
    "exportable React code",
    page.h1,
    ...(page.kind === "comparison"
      ? ["AI app builder comparison", "AI coding tool comparison"]
      : page.kind === "benchmark"
        ? ["screenshot to React benchmark", "AI code benchmark"]
        : ["AI generated React", "React code quality"]),
  ];

  return {
    title: page.title,
    description: page.description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${SITE_URL}${path}`,
      type: "article",
      siteName: SITE_NAME,
      publishedTime: page.publishedAt,
      modifiedTime: page.updatedAt,
      authors: [SITE_NAME],
      images: [
        {
          url: "/api/og?card=site&v=2",
          width: 1200,
          height: 630,
          alt: `${page.h1} — ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: ["/api/og?card=site&v=2"],
    },
  };
}

export function marketingStructuredData(page: MarketingPage) {
  const path = getMarketingPath(page);
  const url = `${SITE_URL}${path}`;
  const sectionName =
    page.kind === "comparison"
      ? "Comparisons"
      : page.kind === "guide"
        ? "Guides"
        : "Benchmarks";
  const sectionPath =
    page.kind === "comparison"
      ? "/compare"
      : page.kind === "guide"
        ? "/blog"
        : "/benchmarks";

  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.h1,
      description: page.description,
      datePublished: page.publishedAt,
      dateModified: page.updatedAt,
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/squidagent-logo.svg`,
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: sectionName,
          item: `${SITE_URL}${sectionPath}`,
        },
        { "@type": "ListItem", position: 3, name: page.h1, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];
}
