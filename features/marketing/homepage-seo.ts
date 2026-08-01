import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";

export const homepageFaq = [
  {
    question: "Is Squid Agent related to Squid AI (getsquid.ai)?",
    answer:
      "No. Squid Agent is a separate brand and workflow. Squid Agent is optimized for exportable React applications with explicit checkpoints, usage visibility, and quality verification.",
  },
  {
    question: "What is Squid Agent?",
    answer:
      "Squid Agent is a verified-prototype builder that turns prompts, screenshots, and website references into working React interfaces. Each revision can carry separate source, runtime, service, and export evidence so reviewers can see what passed and what still needs validation.",
  },
  {
    question: "What is a Squid Build Passport?",
    answer:
      "A Build Passport is a revision-specific evidence record. It reports source checks, preview runtime results, portable export verification, external-service readiness, and explicit limitations without collapsing those claims into one vague score.",
  },
  {
    question: "Can Squid audit an app made with another AI builder?",
    answer:
      "Yes. The free source audit accepts a public GitHub repository or exported ZIP and checks project structure, reproducible build signals, environment documentation, recognized platform coupling, and obvious client-side credential assignments. It is a static inspection and does not claim to prove production behavior.",
  },
  {
    question: "Who is Squid Agent for?",
    answer:
      "Squid Agent is built for founders, designers, builders, and product teams who want to test product ideas quickly without throwing away the generated React code.",
  },
  {
    question: "Can Squid Agent research current documentation and APIs?",
    answer:
      "Yes. Squid Agent can search the live web for current documentation, API references, package guidance, recommendations, and time-sensitive facts. You can see when research is happening and inspect the supporting sources instead of relying on hidden or stale model knowledge.",
  },
  {
    question: "What does Plan mode do?",
    answer:
      "Plan mode is optional. Turn it on when the idea is still ambiguous and you want Squid to ask consequential questions before generating. Leave it off to move directly into a prototype.",
  },
  {
    question: "Can I keep editing after the first generation?",
    answer:
      "Yes. Continue in chat to make source-aware changes, or select an element in the live preview and describe the exact edit. Squid Agent works from the current project files so a focused change does not have to replace the entire application.",
  },
  {
    question: "How does Squid Agent verify and repair a build?",
    answer:
      "Squid Agent checks files, imports, exports, dependencies, accessibility basics, API safety, and the running preview. It shows what passed, what still needs review, and what was not tested. Recoverable preview problems can be repaired automatically without charging for the repair run.",
  },
  {
    question: "Can I restore an earlier version without losing newer work?",
    answer:
      "Yes. Code-bearing responses become visible checkpoints with summaries and exact diffs. Restore a complete version or recover selected files only, so you can undo one direction without overwriting unrelated work you want to keep.",
  },
  {
    question: "How do APIs and connected services work?",
    answer:
      "Start with a prototype and connect services when the core experience is working. Public browser-safe APIs can work directly; databases, secrets, and privileged services stay behind an explicit setup boundary and are never presented as complete before they are connected.",
  },
  {
    question: "Can Squid Agent publish or export my app?",
    answer:
      "Yes. Publish verified code to a GitHub repository, deploy a Vercel preview or production build, share and remix a public project, or download a verified project bundle with React source, configuration, setup instructions, and quality reports. Your code remains portable outside Squid Agent.",
  },
  {
    question: "How does Squid Agent handle AI credits?",
    answer:
      "Squid Agent shows the model and expected credit range before generation, then records the actual charge after successful work is saved. Failed initial generations are not charged, preview repairs are free, and receipts make charges and refunds visible.",
  },
  {
    question: "Can I use the generated project outside Squid Agent?",
    answer:
      "Yes. You can export a complete project bundle or continue in your own repository with the generated source, dependency list, deployment instructions, and quality context. The handoff is intentionally designed for local or external workflows.",
  },
] as const;

export const homepageStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software`,
    name: "Squid Agent",
    alternateName: ["SquidAgent", "Squid Agent App Builder"],
    disambiguatingDescription:
      "Squid Agent is not Squid AI (getsquid.ai). It is a verified-prototype builder focused on React interfaces, revision evidence, code ownership, and trustworthy handoff.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE_URL}/`,
    image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    screenshot: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    description:
      "Verified AI prototype builder that generates, refines, checks, shares, audits, and exports portable React interfaces from prompts, screenshots, website references, and existing source archives.",
    creator: { "@id": `${SITE_URL}/#organization` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      category: "Free starter plan",
    },
    featureList: [
      "Prompt-to-React app generation",
      "Prototype-first direct generation",
      "Screenshot-to-code generation",
      "Website reference capture",
      "Live web research for current documentation and APIs",
      "Optional guided Plan mode for ambiguous ideas",
      "Source-aware follow-up and selected-element editing",
      "Static and runtime quality verification",
      "Revision-specific Build Passports",
      "Public GitHub and ZIP source audits",
      "Automatic preview repair",
      "Version diffs and selective file restore",
      "Project-scoped API and service connections",
      "GitHub publishing and Vercel deployment",
      "Public sharing and remixing",
      "Exportable source code",
      "Transparent AI credit pricing",
      "Reversible project versions",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: homepageFaq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  },
] as const;
