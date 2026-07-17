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

export const comparisonPages = [
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
] satisfies MarketingPage[];

export const blogPages = [
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
        href: "/blog/how-to-export-ai-generated-react-app",
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
        href: "/blog/from-screenshot-to-production-react",
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
        href: "/blog/how-to-evaluate-ai-generated-react-code",
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
] satisfies MarketingPage[];

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
