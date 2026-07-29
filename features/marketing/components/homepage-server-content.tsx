import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import { DraggableProjectRail } from "@/components/homepage/draggable-project-rail";
import { ShowcaseProjectCard } from "@/components/homepage/showcase-project-card";
import { Button } from "@/components/ui/button";
import { BorderGlow } from "@/components/ui/border-glow";
import { homepageFaq } from "@/features/marketing/homepage-seo";

const researchLinks = [
  {
    href: "/compare",
    eyebrow: "Choose a tool",
    title: "Compare AI app builders",
    description:
      "Evaluate code ownership, pricing signals, recovery, verification, and export workflows using current sources.",
  },
  {
    href: "/blog/export-react-app-from-ai",
    eyebrow: "Own the output",
    title: "Export a React app from AI",
    description:
      "Use a clean-room handoff checklist for source, dependencies, environment values, builds, and deployment files.",
  },
  {
    href: "/blog/screenshot-to-responsive-react",
    eyebrow: "Design to code",
    title: "Turn a screenshot into responsive React",
    description:
      "Translate visual intent into components, interactions, and deliberate behavior across phone, tablet, and desktop.",
  },
  {
    href: "/benchmarks/screenshot-to-react",
    eyebrow: "Measure quality",
    title: "Use the screenshot-to-React benchmark",
    description:
      "Score fidelity, responsive inference, accessibility, interactions, edit stability, recovery, and export readiness.",
  },
  {
    href: "/blog/ai-saas-mvp-builder",
    eyebrow: "Build a product",
    title: "Plan and build a SaaS MVP with AI",
    description:
      "Define product boundaries, data contracts, modules, checkpoints, acceptance tests, and the final team handoff.",
  },
  {
    href: "/blog/how-to-evaluate-ai-generated-react-code",
    eyebrow: "Review the code",
    title: "Evaluate AI-generated React",
    description:
      "Inspect the file graph, TypeScript, state, responsive behavior, accessibility, recovery path, and production build.",
  },
] as const;

const landingPages = [
  {
    name: "Axon",
    href: "/axon",
    category: "Automation platform",
    description:
      "A bright, editorial landing page for digital workers that quietly run routine browser workflows.",
    imageSrc: "/showcase/axon-hero.png",
    imageAlt:
      "Axon landing page hero showing digital workers for mundane workflows",
    capabilities: ["Responsive", "API"] as const,
  },
  {
    name: "Velorah",
    href: "/velorah",
    category: "Creative tools",
    description:
      "An atmospheric studio landing page for tools that give deep thinkers room to focus and make.",
    imageSrc: "/showcase/velorah-hero.png",
    imageAlt:
      "Velorah landing page hero with a dark underwater-inspired visual",
    capabilities: ["Responsive"] as const,
  },
  {
    name: "Mindloop",
    href: "/mindloop",
    category: "Content studio",
    description:
      "A luminous editorial space for meaningful ideas, thoughtful updates, and a shared journey toward depth.",
    imageSrc: "/showcase/mindloop-hero.png",
    imageAlt: "Mindloop landing page hero with an inspired editorial landscape",
    capabilities: ["Responsive", "Database"] as const,
  },
  {
    name: "CozyPaws",
    href: "/cozypaws",
    category: "Pet marketplace",
    description:
      "A warm, playful storefront that makes discovering happy-making products for pets feel effortless.",
    imageSrc: "/showcase/cozypaws-hero.png",
    imageAlt: "CozyPaws landing page hero with pets and a product marketplace",
    capabilities: ["Responsive", "Stripe"] as const,
  },
  {
    name: "Sentinel AI",
    href: "/sentinel",
    category: "Security systems",
    description:
      "A high-contrast security landing page pairing zero-trust systems with a precise, technical visual language.",
    imageSrc: "/showcase/sentinel-hero.png",
    imageAlt: "Sentinel AI landing page hero for enterprise security systems",
    capabilities: ["Responsive", "Auth", "API"] as const,
  },
  {
    name: "Axion Studio",
    href: "/axion-studio",
    category: "Digital studio",
    description:
      "A strategy-led agency landing page for digital experiences built around category leadership.",
    imageSrc: "/showcase/axion-studio-hero.png",
    imageAlt:
      "Axion Studio landing page hero for category-leading digital experiences",
    capabilities: ["Responsive"] as const,
  },
  {
    name: "Design Rocket Certificates",
    href: "/design-rocket-certificates",
    category: "AI education",
    description:
      "A focused course landing page for leaders learning to guide AI transformation inside their organizations.",
    imageSrc: "/showcase/design-rocket-certificates-hero.png",
    imageAlt:
      "Design Rocket Certificates landing page hero for AI transformation training",
    capabilities: ["Responsive"] as const,
  },
  {
    name: "Forma",
    href: "/forma",
    category: "Product studio",
    description:
      "A concise studio landing page with motion-led visuals and a direct project intake surface.",
    imageSrc: "/showcase/forma-hero.png",
    imageAlt: "Forma landing page hero for a digital product studio",
    capabilities: ["Responsive", "API"] as const,
  },
  {
    name: "TerraElix",
    href: "/terraelix",
    category: "Wellness supplements",
    description:
      "A vivid wellness landing page for plant-based supplements, daily balance, and clean energy.",
    imageSrc: "/showcase/terraelix-hero.png",
    imageAlt:
      "TerraElix landing page hero for plant-based wellness supplements",
    capabilities: ["Responsive", "Stripe"] as const,
  },
  {
    name: "Mentality",
    href: "/mentality",
    category: "Wellbeing resources",
    description:
      "A calm mental wellbeing resource page with expressive editorial typography and a guided question entry point.",
    imageSrc: "/showcase/mentality-hero.png",
    imageAlt: "Mentality landing page hero for mental wellbeing resources",
    capabilities: ["Responsive", "Database"] as const,
  },
  {
    name: "Questly",
    href: "/questly",
    category: "AI search content",
    description:
      "A content strategy landing page for shipping articles that answer customer questions and earn AI citations.",
    imageSrc: "/showcase/questly-hero.png",
    imageAlt: "Questly landing page hero for AI search content strategy",
    capabilities: ["Responsive", "API"] as const,
  },
  {
    name: "RIVR",
    href: "/rivr",
    category: "Asset liquidity",
    description:
      "A cinematic finance landing page for smart vaults, staking, NFTs, and fluid asset streams.",
    imageSrc: "/showcase/rivr-hero.png",
    imageAlt: "RIVR landing page hero for fluid asset streams",
    capabilities: ["Responsive", "Auth", "API"] as const,
  },
  {
    name: "SkyElite",
    href: "/skyelite",
    category: "Private aviation",
    description:
      "A premium private aviation landing page positioning jet access as refined and attainable.",
    imageSrc: "/showcase/skyelite-hero.png",
    imageAlt: "SkyElite landing page hero for premium private jets",
    capabilities: ["Responsive"] as const,
  },
  {
    name: "Drew",
    href: "/jack",
    category: "3D creator portfolio",
    description:
      "A dark, motion-led portfolio for a 3D creator who turns striking visual systems into unforgettable projects.",
    imageSrc: "/showcase/drew-hero.png",
    imageAlt: "Drew 3D creator portfolio landing page",
    capabilities: ["Responsive"] as const,
  },
] as const;

const shippedProjects = [
  {
    name: "Octagon Rankings",
    href: "/share/v2/QAsvH2LT7gY1Kf_S",
    remixHref: "/share/v2/QAsvH2LT7gY1Kf_S",
    description:
      "A live UFC rankings explorer with division navigation, fighter cards, and detailed athlete profiles.",
    category: "Sports data",
    creatorName: "Drew Sepeczi",
    imageSrc: "/showcase/octagon-rankings.png",
    imageAlt: "Octagon Rankings UFC fighter rankings app built with Squid",
    capabilities: ["Responsive", "Database", "API"] as const,
  },
  {
    name: "Phoenix Design Lab",
    href: "https://phoenixdev.agency/demo",
    description:
      "A cinematic agency landing page with a red editorial art direction and bold one-screen positioning.",
    category: "Design agency",
    imageSrc: "/showcase/phoenix-design-lab.webp",
    imageAlt: "Phoenix Design Lab homepage generated with Squid",
    capabilities: ["Responsive"] as const,
  },
  {
    name: "PortfolioOS",
    href: "https://portfolios.chat",
    description:
      "An AI-native professional identity site where portfolios answer questions in real time.",
    category: "AI portfolio builder",
    imageSrc: "/showcase/portfolio-os.webp",
    imageAlt: "PortfolioOS homepage generated with Squid",
    capabilities: ["Responsive", "Auth", "API"] as const,
  },
  {
    name: "Slotflow",
    href: "https://slotflow.fit",
    description:
      "A scheduling surface for coordinating group availability without spreadsheet back-and-forth.",
    category: "Event coordination",
    imageSrc: "/showcase/slotflow.webp",
    imageAlt: "Slotflow homepage generated with Squid",
    capabilities: ["Responsive", "Database", "Auth"] as const,
  },
] as const;

export function HomepageLandingPagesSection() {
  const buildHref = `/?plan=1&prompt=${encodeURIComponent(
    "Build your version in 90 seconds: choose audience, style, key interactions, and success criteria before generating a verified React landing page.",
  )}&source=${encodeURIComponent("/example")}`;

  return (
    <section
      aria-labelledby="homepage-landing-pages-heading"
      className="relative z-10 w-full px-4 pb-16 sm:px-6 sm:pb-24"
      data-testid="homepage-landing-pages"
      id="homepage-landing-pages"
    >
      <div className="mx-auto w-full max-w-6xl border-y border-border/70 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="homepage-landing-pages-heading"
            className="font-display text-4xl leading-[1.02] tracking-tight text-foreground sm:text-5xl"
          >
            Apps that do more than look good.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            From expressive landing pages to authenticated SaaS products, every
            project is generated as a real React codebase you can inspect, edit,
            and own.
          </p>
        </div>

        <p className="mt-10 flex items-center justify-end gap-2 text-xs font-medium text-muted-foreground md:hidden">
          Swipe to explore
          <ArrowRight className="size-4" aria-hidden="true" />
        </p>
        <DraggableProjectRail
          ariaLabel="Landing page projects"
          desktopBreakpoint={768}
          variant="landing"
        >
          {landingPages.map((landing) => (
            <ShowcaseProjectCard
              key={landing.href}
              {...landing}
              layout="rail"
            />
          ))}
        </DraggableProjectRail>

        <div className="mt-10 flex flex-col gap-5 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Start with a clear goal, turn on plan mode, and move into generation
            with checkpoints for restore and export.
          </p>
          <Button asChild size="lg" className="whitespace-nowrap rounded-xl">
            <Link href={buildHref}>Build your version in 90 seconds</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function HomepageResearchSection() {
  return (
    <section
      aria-labelledby="homepage-research-heading"
      className="relative z-10 w-full px-4 pb-16 sm:px-6 sm:pb-24"
    >
      <div className="mx-auto w-full max-w-6xl border-y border-border/70 py-12 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end">
          <div>
            <p className="font-mono-jb text-xs font-semibold uppercase tracking-[0.16em] text-[#0062FF] dark:text-[#0CA8FF]">
              Practical AI app builder guides
            </p>
            <h2
              id="homepage-research-heading"
              className="mt-4 font-display text-4xl leading-[1.02] tracking-tight text-foreground sm:text-5xl"
            >
              Choose well. Build deliberately. Ship code you can keep.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground lg:justify-self-end">
            Learn the complete AI app workflow—from selecting a builder and
            translating visual references to reviewing generated React,
            recovering versions, and exporting a production-ready project.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {researchLinks.map((item) => (
            <BorderGlow
              key={item.href}
              className="min-h-[250px]"
              edgeSensitivity={20}
              glowRadius={26}
              glowIntensity={0.68}
              coneSpread={20}
              fillOpacity={0.1}
            >
              <Link
                href={item.href}
                className="group flex h-full min-h-[250px] flex-col p-6 transition-colors hover:bg-primary/[0.035] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:p-7"
              >
                <p className="font-mono-jb text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0062FF] dark:text-[#0CA8FF]">
                  {item.eyebrow}
                </p>
                <h3 className="mt-5 text-balance text-xl font-semibold tracking-[-0.025em] text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-semibold text-[#0062FF] dark:text-[#0CA8FF]">
                  Read the guide
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </BorderGlow>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomepageBuiltWithSquidSection() {
  return (
    <section
      id="built-with-squid"
      className="relative z-10 w-full px-4 pb-16 pt-4 sm:px-6 sm:pb-24 sm:pt-8"
    >
      <div className="mx-auto w-full max-w-6xl border-y border-border/70 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-4xl leading-[1.02] tracking-tight text-foreground sm:text-5xl">
            Real projects shipped from prompts.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Explore sites and tools built with Squid. Inspect a complete public
            workspace, remix the project, or download the source and continue in
            your own stack.
          </p>
          <Link
            href="/example"
            className="mt-4 inline-flex min-h-11 items-center gap-2 whitespace-nowrap text-sm font-medium text-[#0062FF] underline decoration-blue-500/30 underline-offset-4 transition-colors hover:decoration-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-[#0CA8FF]"
          >
            Open the no-signup example workspace
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <p className="mt-10 flex items-center justify-end gap-2 text-xs font-medium text-muted-foreground lg:hidden">
          Swipe to explore
          <ArrowRight className="size-4" aria-hidden="true" />
        </p>
        <DraggableProjectRail
          ariaLabel="Projects built with Squid"
          desktopBreakpoint={1024}
          variant="shipped"
        >
          {shippedProjects.map((project) => (
            <figure
              key={project.href}
              className="group min-w-0 snap-start border-t border-border/70 pt-4 [scroll-snap-stop:always]"
            >
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`View ${project.name}`}
                className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4"
              >
                <div className="showcase-preview relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-muted/40">
                  <Image
                    src={project.imageSrc}
                    alt={project.imageAlt}
                    fill
                    draggable={false}
                    sizes="(min-width: 1024px) 58vw, 85vw"
                    className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                  <div
                    className="showcase-capabilities pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-1 flex-wrap gap-1.5 p-3 opacity-0 transition-[opacity,transform] duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100"
                    aria-label={`${project.name} capabilities`}
                  >
                    {project.capabilities.map((capability) => (
                      <span
                        key={capability}
                        className="rounded-full border border-blue-500/25 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-700 backdrop-blur-sm dark:text-blue-300"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>
              </a>

              <figcaption className="grid gap-4 pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-blue-500">
                    {project.category}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                    {project.name}
                  </h3>
                  <p className="mt-2 max-w-xl text-base leading-7 text-muted-foreground">
                    {project.description}
                  </p>
                  {"creatorName" in project && project.creatorName ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Shared by {project.creatorName}
                    </p>
                  ) : null}
                </div>
                <div className="flex min-h-11 items-center gap-4 text-sm font-medium sm:justify-end">
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    View app
                    <ExternalLink className="size-3.5" />
                  </a>
                  {"remixHref" in project && project.remixHref ? (
                    <a
                      href={project.remixHref}
                      target="_blank"
                      rel="noreferrer"
                      className="text-foreground/70 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      Remix
                    </a>
                  ) : null}
                </div>
              </figcaption>
            </figure>
          ))}
        </DraggableProjectRail>
      </div>
    </section>
  );
}

export function HomepageFaqSection() {
  const firstColumnFaqCount = Math.ceil(homepageFaq.length / 2);
  const columns = [
    homepageFaq.slice(0, firstColumnFaqCount),
    homepageFaq.slice(firstColumnFaqCount),
  ];

  return (
    <section
      aria-labelledby="squid-agent-faq"
      className="relative z-10 w-full px-4 pb-16 sm:px-6 sm:pb-24"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-8 border-t border-border/60 pt-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:pt-16">
        <div className="mx-auto max-w-xl text-center lg:sticky lg:top-8 lg:mx-0 lg:self-start lg:text-left">
          <h2
            id="squid-agent-faq"
            className="font-display text-4xl leading-[1.02] tracking-tight text-foreground sm:text-5xl"
          >
            Know what happens from prompt to production.
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Research, planning, iteration, quality, recovery, integrations,
            deployment, ownership, and credits, without hidden steps.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {columns.map((column, columnIndex) => (
            <div className="grid content-start gap-4" key={columnIndex}>
              {column.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-[22px] border border-border/70 bg-background/80 p-5 shadow-[0_16px_42px_-34px_rgba(0,0,0,0.55)] backdrop-blur"
                >
                  <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
                    <h3 className="text-lg font-semibold leading-snug tracking-normal text-foreground">
                      {faq.question}
                    </h3>
                    <span
                      className="mt-1 shrink-0 text-lg text-muted-foreground transition-transform group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
