/* eslint-disable @next/next/no-img-element */
"use client";

import Fieldset from "@/components/fieldset";
import ArrowRightIcon from "@/components/icons/arrow-right";
import Spinner from "@/components/spinner";
import * as Select from "@radix-ui/react-select";
import assert from "assert";
import {
  Box,
  CheckIcon,
  ChevronDownIcon,
  Code2,
  Coins,
  ExternalLink,
  Info,
  Lightbulb,
  Link2,
  MapIcon,
  MessageSquare,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlausible } from "next-plausible";
import {
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  useState,
  useRef,
  useTransition,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
} from "react";

import Header from "@/components/header";
import UploadIcon from "@/components/icons/upload-icon";
import { DEFAULT_MODEL, MODELS, SUGGESTED_PROMPTS } from "@/lib/constants";
import HoverBrandLogo from "@/components/ui/hover-brand-logo";
import { PricingModal } from "@/features/billing/components/pricing-modal";
import { CreditsLoadError } from "@/features/billing/components/credits-load-error";
import { HelpPanel } from "@/components/help-panel";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUserCredits, useUserSession, useCreateChat } from "@/lib/queries";
import { getMarketingStarterPrompt } from "@/lib/marketing-pages";
import {
  FREE_PROJECT_LIMIT,
  canTierUseModel,
  getModelCreditHoldCost,
  getModelCreditRange,
} from "@/lib/billing/config";
import { fetchCompletionStream } from "@/features/generation/client/completion-stream";
import { useGenerationHandoff } from "@/features/generation/client/generation-handoff-context";
import { getErrorMessage } from "@/features/shared/errors";
import type { CreateProjectRequest } from "@/features/projects/contracts";
import {
  clearPendingProject,
  readPendingProject,
  savePendingProject,
} from "@/lib/pending-project";
import { ApiSelectionDialog } from "@/features/integrations/components/api-selection-dialog";
import { PromptBuilderModal } from "@/features/prompt-builder";
import {
  PromptTemplateEditor,
  createInitialTemplateValues,
} from "@/components/prompt-template-editor";
import {
  PORTFOLIO_PROMPT_TEMPLATE,
  PROMPT_TEMPLATES,
  isPromptTemplateReady,
  type PromptTemplate,
  type PromptTemplateValues,
} from "@/lib/prompt-templates";
import { AiBuilderFeatureComparison } from "@/components/ai-builder-feature-comparison";
import {
  ShowcaseProjectCard,
  type ProjectCapability,
} from "@/components/homepage/showcase-project-card";
import { ProductWorkflowDemo } from "@/components/homepage/product-workflow-demo";
import { HomepageScrollStatement } from "@/components/homepage/scroll-statement";
import { uploadScreenshot } from "@/lib/s3-upload-client";

const ACCEPTED_SCREENSHOT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);
const MAX_SCREENSHOT_FILE_SIZE_BYTES = 6 * 1024 * 1024;

type BuiltWithSquidProject = {
  name: string;
  href: string;
  remixHref?: string;
  description: string;
  category: string;
  creatorName?: string;
  imageSrc?: string;
  imageAlt?: string;
  capabilities?: readonly ProjectCapability[];
};

const BUILT_WITH_SQUID_PROJECTS: readonly BuiltWithSquidProject[] = [
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
    capabilities: ["Responsive", "Database", "API"],
  },
  {
    name: "Phoenix Design Lab",
    href: "https://phoenixdev.agency/demo",
    description:
      "A cinematic agency landing page with a red editorial art direction and bold one-screen positioning.",
    category: "Design agency",
    imageSrc: "/showcase/phoenix-design-lab.webp",
    imageAlt: "Phoenix Design Lab homepage generated with Squid",
    capabilities: ["Responsive"],
  },
  {
    name: "PortfolioOS",
    href: "https://portfolios.chat",
    description:
      "An AI-native professional identity site where portfolios answer questions in real time.",
    category: "AI portfolio builder",
    imageSrc: "/showcase/portfolio-os.webp",
    imageAlt: "PortfolioOS homepage generated with Squid",
    capabilities: ["Responsive", "Auth", "API"],
  },
  {
    name: "Slotflow",
    href: "https://slotflow.fit",
    description:
      "A scheduling surface for coordinating group availability without spreadsheet back-and-forth.",
    category: "Event coordination",
    imageSrc: "/showcase/slotflow.webp",
    imageAlt: "Slotflow homepage generated with Squid",
    capabilities: ["Responsive", "Database", "Auth"],
  },
];

type HomepageLandingPage = {
  name: string;
  href: string;
  category: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  capabilities?: readonly ProjectCapability[];
};

const HOMEPAGE_LANDING_PAGES: readonly HomepageLandingPage[] = [
  {
    name: "Axon",
    href: "/axon",
    category: "Automation platform",
    description:
      "A bright, editorial landing page for digital workers that quietly run routine browser workflows.",
    imageSrc: "/showcase/axon-hero.png",
    imageAlt:
      "Axon landing page hero showing digital workers for mundane workflows",
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
  },
  {
    name: "Mindloop",
    href: "/mindloop",
    category: "Content studio",
    description:
      "A luminous editorial space for meaningful ideas, thoughtful updates, and a shared journey toward depth.",
    imageSrc: "/showcase/mindloop-hero.png",
    imageAlt: "Mindloop landing page hero with an inspired editorial landscape",
  },
  {
    name: "CozyPaws",
    href: "/cozypaws",
    category: "Pet marketplace",
    description:
      "A warm, playful storefront that makes discovering happy-making products for pets feel effortless.",
    imageSrc: "/showcase/cozypaws-hero.png",
    imageAlt: "CozyPaws landing page hero with pets and a product marketplace",
  },
  {
    name: "Sentinel AI",
    href: "/sentinel",
    category: "Security systems",
    description:
      "A high-contrast security landing page pairing zero-trust systems with a precise, technical visual language.",
    imageSrc: "/showcase/sentinel-hero.png",
    imageAlt: "Sentinel AI landing page hero for enterprise security systems",
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
  },
  {
    name: "Forma",
    href: "/forma",
    category: "Product studio",
    description:
      "A concise studio landing page with motion-led visuals and a direct project intake surface.",
    imageSrc: "/showcase/forma-hero.png",
    imageAlt: "Forma landing page hero for a digital product studio",
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
  },
  {
    name: "Mentality",
    href: "/mentality",
    category: "Wellbeing resources",
    description:
      "A calm mental wellbeing resource page with expressive editorial typography and a guided question entry point.",
    imageSrc: "/showcase/mentality-hero.png",
    imageAlt: "Mentality landing page hero for mental wellbeing resources",
  },
  {
    name: "Questly",
    href: "/questly",
    category: "AI search content",
    description:
      "A content strategy landing page for shipping articles that answer customer questions and earn AI citations.",
    imageSrc: "/showcase/questly-hero.png",
    imageAlt: "Questly landing page hero for AI search content strategy",
  },
  {
    name: "RIVR",
    href: "/rivr",
    category: "Asset liquidity",
    description:
      "A cinematic finance landing page for smart vaults, staking, NFTs, and fluid asset streams.",
    imageSrc: "/showcase/rivr-hero.png",
    imageAlt: "RIVR landing page hero for fluid asset streams",
  },
  {
    name: "SkyElite",
    href: "/skyelite",
    category: "Private aviation",
    description:
      "A premium private aviation landing page positioning jet access as refined and attainable.",
    imageSrc: "/showcase/skyelite-hero.png",
    imageAlt: "SkyElite landing page hero for premium private jets",
  },
  {
    name: "Drew",
    href: "/jack",
    category: "3D creator portfolio",
    description:
      "A dark, motion-led portfolio for a 3D creator who turns striking visual systems into unforgettable projects.",
    imageSrc: "/showcase/drew-hero.png",
    imageAlt: "Drew 3D creator portfolio landing page",
  },
];

const landingPageCapabilities: Partial<
  Record<string, readonly ProjectCapability[]>
> = {
  "/axon": ["Responsive", "API"],
  "/velorah": ["Responsive"],
  "/mindloop": ["Responsive", "Database"],
  "/cozypaws": ["Responsive", "Stripe"],
  "/sentinel": ["Responsive", "Auth", "API"],
  "/axion-studio": ["Responsive"],
  "/design-rocket-certificates": ["Responsive"],
  "/forma": ["Responsive", "API"],
  "/terraelix": ["Responsive", "Stripe"],
  "/mentality": ["Responsive", "Database"],
  "/questly": ["Responsive", "API"],
  "/rivr": ["Responsive", "Auth", "API"],
  "/skyelite": ["Responsive"],
  "/jack": ["Responsive"],
};

type HeroPopoutImage = {
  src: string;
  alt: string;
  title: string;
  prompt: string;
};

const homepageFaq = [
  {
    question: "Is Squid Agent related to Squid AI (getsquid.ai)?",
    answer:
      "No. Squid Agent is a separate brand and workflow. Squid Agent is optimized for exportable React applications with explicit checkpoints, usage visibility, and quality verification.",
  },
  {
    question: "What is Squid Agent?",
    answer:
      "Squid Agent is an AI app builder that takes a project from research and planning through generation, iteration, verification, and shipping. It keeps the sources, decisions, React code, quality results, versions, integrations, and credit use visible throughout the process.",
  },
  {
    question: "Who is Squid Agent for?",
    answer:
      "Squid Agent is built for founders, builders, designers, and product teams who want to prototype full React apps quickly while keeping the generated code inspectable, editable, and portable.",
  },
  {
    question: "Can Squid Agent research current documentation and APIs?",
    answer:
      "Yes. Squid Agent can search the live web for current documentation, API references, package guidance, recommendations, and time-sensitive facts. You can see when research is happening and inspect the supporting sources instead of relying on hidden or stale model knowledge.",
  },
  {
    question: "What does Plan mode do?",
    answer:
      "Plan mode asks a compact set of consequential questions, turns your answers into a structured product specification, and presents the plan for review. You can revise it, resolve open decisions, and explicitly approve it before code generation starts.",
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
      "Choose APIs before a build, then connect supported services with project-scoped credentials, separate development and production settings, and health checks. Public browser-safe APIs can work directly; services that require secrets stay behind an explicit server and setup boundary rather than being presented as falsely complete.",
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

const homepageNarrativeBlocks = [
  {
    stage: "01",
    label: "Define",
    side: "left",
    question: "Define",
    body: "Squid interviews you and converts an ambiguous idea into a structured product plan.",
  },
  {
    stage: "02",
    label: "Build",
    side: "right",
    question: "Build",
    body: "Multiple agents generate the interface, application logic, assets, and integrations.",
  },
  {
    stage: "03",
    label: "Verify and ship",
    side: "left",
    question: "Verify and ship",
    body: "Squid renders, tests, repairs, and prepares the project for deployment.",
  },
] as const;

const homepageOwnershipCopy = {
  title: "Your app never disappears inside a proprietary editor.",
  body: "Inspect every file, connect your own services, export the code, or deploy it wherever you choose.",
} as const;

const homepageFlowSteps = [
  {
    label: "Idea",
    title: "Describe what you want",
    detail:
      "Use a prompt, screenshot, or URL. Squid turns rough intent into a buildable brief.",
    artifacts: ["Prompt captured", "Goal clarified", "Build brief ready"],
    icon: Lightbulb,
  },
  {
    label: "Research",
    title: "Research the real world",
    detail:
      "Sources, APIs, and constraints become visible context before the first line of code.",
    artifacts: ["Sources collected", "API fit checked", "Constraints surfaced"],
    icon: Search,
  },
  {
    label: "Plan",
    title: "See the plan before the build",
    detail:
      "Review consequential choices and steer the architecture while changes are still cheap.",
    artifacts: ["Architecture mapped", "Tradeoffs exposed", "Plan approved"],
    icon: MapIcon,
  },
  {
    label: "Build",
    title: "Generate a working app",
    detail:
      "The interface, logic, and files arrive together in an inspectable workspace.",
    artifacts: ["React files created", "Preview running", "Source inspectable"],
    icon: Code2,
  },
  {
    label: "Refine",
    title: "Refine in conversation",
    detail:
      "Ask for changes in plain language while Squid preserves the parts that already work.",
    artifacts: ["Request understood", "Change scoped", "Version saved"],
    icon: MessageSquare,
  },
  {
    label: "Verify",
    title: "Verify before release",
    detail:
      "Quality checks and repair loops show what passed, what changed, and what still needs attention.",
    artifacts: ["Checks executed", "Repairs attempted", "Report visible"],
    icon: ShieldCheck,
  },
  {
    label: "Ship",
    title: "Ship the whole project",
    detail:
      "Deploy when ready, export every file, and keep a transparent record of how it was built.",
    artifacts: ["Bundle portable", "Deployment ready", "History preserved"],
    icon: Rocket,
  },
] as const;

/** Open left→right rail for the 7-step Idea→Ship journey. */
const HOMEPAGE_FLOW_VIEWBOX = { width: 720, height: 140 } as const;
const homepageFlowRailPoints = [
  { x: 48, y: 78 },
  { x: 152, y: 46 },
  { x: 256, y: 78 },
  { x: 360, y: 46 },
  { x: 464, y: 78 },
  { x: 568, y: 46 },
  { x: 672, y: 78 },
] as const;

const homepageFlowRailPath = homepageFlowRailPoints
  .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
  .join(" ");
const homepageFlowSegmentLengths = homepageFlowRailPoints
  .slice(0, -1)
  .map((point, index) => {
    const nextPoint = homepageFlowRailPoints[index + 1];
    return Math.hypot(nextPoint.x - point.x, nextPoint.y - point.y);
  });
const homepageFlowTotalLength = homepageFlowSegmentLengths.reduce(
  (total, length) => total + length,
  0,
);
const homepageFlowRailProgress = (() => {
  let traveled = 0;

  return homepageFlowRailPoints.map((_, index) => {
    if (index > 0) traveled += homepageFlowSegmentLengths[index - 1];
    return (traveled / homepageFlowTotalLength) * 100;
  });
})();

function getHomepageFlowPosition(progress: number) {
  let remainingDistance =
    (Math.min(Math.max(progress, 0), 100) / 100) * homepageFlowTotalLength;

  for (let index = 0; index < homepageFlowSegmentLengths.length; index += 1) {
    const segmentLength = homepageFlowSegmentLengths[index];
    const start = homepageFlowRailPoints[index];
    const end = homepageFlowRailPoints[index + 1];

    if (remainingDistance <= segmentLength) {
      const segmentProgress = remainingDistance / segmentLength;
      return {
        x: start.x + (end.x - start.x) * segmentProgress,
        y: start.y + (end.y - start.y) * segmentProgress,
      };
    }

    remainingDistance -= segmentLength;
  }

  return homepageFlowRailPoints.at(-1)!;
}

function getHomepageFlowPartialPath(progress: number) {
  const targetDistance =
    (Math.min(Math.max(progress, 0), 100) / 100) * homepageFlowTotalLength;
  const pathParts = [
    `M${homepageFlowRailPoints[0].x} ${homepageFlowRailPoints[0].y}`,
  ];
  let traveled = 0;

  for (let index = 0; index < homepageFlowSegmentLengths.length; index += 1) {
    const segmentLength = homepageFlowSegmentLengths[index];
    const nextPoint = homepageFlowRailPoints[index + 1];

    if (traveled + segmentLength <= targetDistance) {
      pathParts.push(`L${nextPoint.x} ${nextPoint.y}`);
      traveled += segmentLength;
      continue;
    }

    const start = homepageFlowRailPoints[index];
    const segmentProgress = Math.max(
      0,
      (targetDistance - traveled) / segmentLength,
    );
    pathParts.push(
      `L${start.x + (nextPoint.x - start.x) * segmentProgress} ${start.y + (nextPoint.y - start.y) * segmentProgress}`,
    );
    break;
  }

  return pathParts.join(" ");
}

const homepageStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://squidagent.app/#organization",
      name: "Squid Agent",
      url: "https://squidagent.app/",
      logo: "https://squidagent.app/squidagent-logo-512.png",
      sameAs: [
        "https://www.instagram.com/drew.sepeczi",
        "https://github.com/drewsephski",
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://squidagent.app/#software",
      name: "Squid Agent",
      alternateName: ["SquidAgent", "Squid Agent App Builder"],
      disambiguatingDescription:
        "Squid Agent is not Squid AI (getsquid.ai). It is an AI app builder focused on exportable React applications with plan mode, checkpoints, usage visibility, and verification before handoff.",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      url: "https://squidagent.app/",
      image: "https://squidagent.app/api/og?card=site&v=3",
      description:
        "AI app builder that researches, plans, generates, verifies, and ships portable React applications from prompts, screenshots, and website references.",
      creator: {
        "@id": "https://squidagent.app/#organization",
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        category: "Free starter plan",
      },
      featureList: [
        "Prompt-to-React app generation",
        "Screenshot-to-code generation",
        "Website reference capture",
        "Live web research for current documentation and APIs",
        "Guided Plan mode with explicit approval before code generation",
        "Source-aware follow-up and selected-element editing",
        "Static and runtime quality verification",
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
      "@type": "WebSite",
      "@id": "https://squidagent.app/#website",
      name: "Squid Agent",
      url: "https://squidagent.app/",
      inLanguage: "en-US",
      publisher: {
        "@id": "https://squidagent.app/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://squidagent.app/?search={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://squidagent.app/#faq",
      mainEntity: homepageFaq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Unable to read image file."));
    };
    reader.onerror = () => {
      reject(new Error("Unable to read image file."));
    };
    reader.readAsDataURL(file);
  });
}

type HeroPopoutSlot = {
  top: number;
  left: number;
  rotate: number;
  scale: number;
  entryX: number;
  entryY: number;
  driftX: number;
  driftY: number;
  duration: number;
  zIndex: number;
};

type HeroPopout = {
  id: string;
  src: string;
  alt: string;
  title: string;
  prompt: string;
  top: number;
  left: number;
  rotate: number;
  scale: number;
  entryX: number;
  entryY: number;
  driftX: number;
  driftY: number;
  duration: number;
  zIndex: number;
  slotIndex: number;
};

type HeroPopoutExclusionZone = {
  top: number;
  left: number;
  bottom: number;
  right: number;
};

const HERO_POPOUT_MAX_ACTIVE = 6;
const HERO_POPOUT_EXCLUSION_PADDING_PX = 28;
const HERO_POPOUT_ROW_TOLERANCE_PERCENT = 6;
const HERO_POPOUT_MIN_VERTICAL_GAP_PERCENT = 11;

const HERO_POPOUT_SLOTS: readonly HeroPopoutSlot[] = [
  {
    top: 14,
    left: 12,
    rotate: -7,
    scale: 0.96,
    entryX: -28,
    entryY: 20,
    driftX: -6,
    driftY: -10,
    duration: 3.4,
    zIndex: 2,
  },
  {
    top: 28,
    left: 88,
    rotate: 6,
    scale: 1.03,
    entryX: 26,
    entryY: 16,
    driftX: 8,
    driftY: -8,
    duration: 3.7,
    zIndex: 3,
  },
  {
    top: 42,
    left: 14,
    rotate: -4,
    scale: 0.98,
    entryX: -22,
    entryY: 14,
    driftX: -4,
    driftY: -12,
    duration: 3.2,
    zIndex: 2,
  },
  {
    top: 56,
    left: 86,
    rotate: 5,
    scale: 1.01,
    entryX: 24,
    entryY: 12,
    driftX: 6,
    driftY: -9,
    duration: 3.6,
    zIndex: 4,
  },
  {
    top: 70,
    left: 12,
    rotate: -5,
    scale: 0.95,
    entryX: -26,
    entryY: 18,
    driftX: -8,
    driftY: -11,
    duration: 3.5,
    zIndex: 2,
  },
  {
    top: 84,
    left: 88,
    rotate: 7,
    scale: 1.04,
    entryX: 28,
    entryY: 16,
    driftX: 10,
    driftY: -13,
    duration: 3.8,
    zIndex: 3,
  },
];

function randomInRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

function getHeroPopoutCardSize(layerWidth: number) {
  const width = Math.min(196, Math.max(120, layerWidth * 0.16));
  const height = width * (9 / 16);
  return { width, height };
}

function measureHeroPopoutExclusionZones(
  layer: HTMLElement,
  shell: HTMLElement,
): HeroPopoutExclusionZone[] {
  const layerRect = layer.getBoundingClientRect();
  if (layerRect.width <= 0 || layerRect.height <= 0) return [];

  const zoneNames = ["copy", "compose", "clone"] as const;

  return zoneNames.flatMap((name) => {
    const element = shell.querySelector<HTMLElement>(
      `[data-hero-popout-exclude="${name}"]`,
    );
    if (!element) return [];

    const rect = element.getBoundingClientRect();

    return [
      {
        top: clampPercent(
          ((rect.top - layerRect.top - HERO_POPOUT_EXCLUSION_PADDING_PX) /
            layerRect.height) *
            100,
        ),
        bottom: clampPercent(
          ((rect.bottom - layerRect.top + HERO_POPOUT_EXCLUSION_PADDING_PX) /
            layerRect.height) *
            100,
        ),
        left: clampPercent(
          ((rect.left - layerRect.left - HERO_POPOUT_EXCLUSION_PADDING_PX) /
            layerRect.width) *
            100,
        ),
        right: clampPercent(
          ((rect.right - layerRect.left + HERO_POPOUT_EXCLUSION_PADDING_PX) /
            layerRect.width) *
            100,
        ),
      },
    ];
  });
}

function isInHeroEdgeClipZone(top: number, left: number) {
  return top < 12 || top > 88 || left < 12 || left > 88;
}

function heroPopoutOverlapsExclusionZone(
  top: number,
  left: number,
  cardWidth: number,
  cardHeight: number,
  layerWidth: number,
  layerHeight: number,
  zone: HeroPopoutExclusionZone,
) {
  const halfWidthPercent = (cardWidth / layerWidth) * 50;
  const halfHeightPercent = (cardHeight / layerHeight) * 50;

  const popoutTop = top - halfHeightPercent;
  const popoutBottom = top + halfHeightPercent;
  const popoutLeft = left - halfWidthPercent;
  const popoutRight = left + halfWidthPercent;

  return !(
    popoutRight < zone.left ||
    popoutLeft > zone.right ||
    popoutBottom < zone.top ||
    popoutTop > zone.bottom
  );
}

function heroPopoutOverlapsAnyExclusionZone(
  top: number,
  left: number,
  cardWidth: number,
  cardHeight: number,
  layerWidth: number,
  layerHeight: number,
  zones: HeroPopoutExclusionZone[],
) {
  return zones.some((zone) =>
    heroPopoutOverlapsExclusionZone(
      top,
      left,
      cardWidth,
      cardHeight,
      layerWidth,
      layerHeight,
      zone,
    ),
  );
}

function getFallbackHeroPopoutExclusionZones(): HeroPopoutExclusionZone[] {
  return [
    { top: 6, bottom: 36, left: 12, right: 88 },
    { top: 28, bottom: 76, left: 8, right: 92 },
    { top: 68, bottom: 96, left: 14, right: 86 },
  ];
}

function heroPopoutWouldFormRow(
  top: number,
  activePopouts: readonly Pick<HeroPopout, "top">[],
) {
  return activePopouts.some(
    (popout) => Math.abs(popout.top - top) <= HERO_POPOUT_ROW_TOLERANCE_PERCENT,
  );
}

function heroPopoutIsTooCloseVertically(
  top: number,
  activePopouts: readonly Pick<HeroPopout, "top">[],
) {
  return activePopouts.some(
    (popout) =>
      Math.abs(popout.top - top) < HERO_POPOUT_MIN_VERTICAL_GAP_PERCENT,
  );
}

function isHeroPopoutSlotValid(
  slot: HeroPopoutSlot,
  cardWidth: number,
  cardHeight: number,
  layerWidth: number,
  layerHeight: number,
  exclusionZones: HeroPopoutExclusionZone[],
  activePopouts: readonly HeroPopout[],
) {
  if (
    isInHeroEdgeClipZone(slot.top, slot.left) ||
    heroPopoutOverlapsAnyExclusionZone(
      slot.top,
      slot.left,
      cardWidth,
      cardHeight,
      layerWidth,
      layerHeight,
      exclusionZones,
    ) ||
    heroPopoutWouldFormRow(slot.top, activePopouts) ||
    heroPopoutIsTooCloseVertically(slot.top, activePopouts)
  ) {
    return false;
  }

  return true;
}

function pickHeroPopoutSlot(
  layerWidth: number,
  layerHeight: number,
  exclusionZones: HeroPopoutExclusionZone[],
  activePopouts: readonly HeroPopout[],
  startSlotIndex: number,
): { slot: HeroPopoutSlot; slotIndex: number } | null {
  const { width: cardWidth, height: cardHeight } =
    getHeroPopoutCardSize(layerWidth);
  const zones =
    exclusionZones.length > 0
      ? exclusionZones
      : getFallbackHeroPopoutExclusionZones();

  for (let offset = 0; offset < HERO_POPOUT_SLOTS.length; offset += 1) {
    const slotIndex = (startSlotIndex + offset) % HERO_POPOUT_SLOTS.length;
    const slot = HERO_POPOUT_SLOTS[slotIndex];
    if (!slot) continue;

    if (
      isHeroPopoutSlotValid(
        slot,
        cardWidth,
        cardHeight,
        layerWidth,
        layerHeight,
        zones,
        activePopouts,
      )
    ) {
      return { slot, slotIndex };
    }
  }

  return null;
}

function buildHeroPopoutFromSlot(
  slot: HeroPopoutSlot,
  slotIndex: number,
  showcase: HeroPopoutImage,
): HeroPopout {
  const horizontalJitter = randomInRange(-1.8, 1.8);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    src: showcase.src,
    alt: showcase.alt,
    title: showcase.title,
    prompt: showcase.prompt,
    top: slot.top,
    left: clampPercent(slot.left + horizontalJitter),
    rotate: slot.rotate + randomInRange(-1.5, 1.5),
    scale: slot.scale + randomInRange(-0.02, 0.02),
    entryX: slot.entryX,
    entryY: slot.entryY + randomInRange(-3, 3),
    driftX: slot.driftX + randomInRange(-2, 2),
    driftY: slot.driftY + randomInRange(-2, 2),
    duration: slot.duration + randomInRange(-0.15, 0.2),
    zIndex: slot.zIndex,
    slotIndex,
  };
}

function getHeroPopoutSpawnDelayMs(slotIndex: number) {
  const rhythm = 760 + (slotIndex % HERO_POPOUT_SLOTS.length) * 140;
  return rhythm + randomInRange(120, 420);
}

function HeroPopoutCard({
  popout,
  onRemove,
  onSelectPrompt,
}: {
  popout: HeroPopout;
  onRemove: (id: string) => void;
  onSelectPrompt: (prompt: string, title: string) => void;
}) {
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (popout.prompt.trim().length === 0) return;
    onSelectPrompt(popout.prompt, popout.title);
  }

  return (
    <button
      type="button"
      className="hero-popout"
      style={
        {
          top: `${popout.top}%`,
          left: `${popout.left}%`,
          zIndex: popout.zIndex,
          animationDuration: `${popout.duration}s`,
          "--popout-rotate": `${popout.rotate}deg`,
          "--popout-scale": popout.scale,
          "--popout-entry-x": `${popout.entryX}px`,
          "--popout-entry-y": `${popout.entryY}px`,
          "--popout-drift-x": `${popout.driftX}px`,
          "--popout-drift-y": `${popout.driftY}px`,
        } as React.CSSProperties
      }
      aria-label={`Use the prompt from ${popout.title}`}
      onClick={handleClick}
      onAnimationEnd={(event) => {
        if (event.animationName !== "heroPopoutLife") return;
        onRemove(popout.id);
      }}
    >
      <div className="hero-popout-image-wrap">
        <Image
          src={popout.src}
          alt=""
          fill
          unoptimized
          sizes="196px"
          draggable={false}
          className="hero-popout-image"
        />
      </div>
    </button>
  );
}

function HeroPopoutShowcases({
  onSelectPrompt,
}: {
  onSelectPrompt: (prompt: string, title: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const layerRef = useRef<HTMLDivElement>(null);
  const exclusionZonesRef = useRef<HeroPopoutExclusionZone[]>([]);
  const showcaseImagesRef = useRef<HeroPopoutImage[]>([]);
  const slotIndexRef = useRef(0);
  const imageIndexRef = useRef(0);
  const [popouts, setPopouts] = useState<HeroPopout[]>([]);
  const [showcaseImagesReady, setShowcaseImagesReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/gallery?withThumbnails=true")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load gallery previews.");
        }
        return response.json() as Promise<{ images?: HeroPopoutImage[] }>;
      })
      .then((data) => {
        if (cancelled) return;

        showcaseImagesRef.current = (data.images ?? []).filter(
          (image): image is HeroPopoutImage =>
            typeof image.src === "string" &&
            image.src.length > 0 &&
            typeof image.alt === "string" &&
            typeof image.title === "string" &&
            typeof image.prompt === "string" &&
            image.prompt.trim().length > 0,
        );
        setShowcaseImagesReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        showcaseImagesRef.current = [];
        setShowcaseImagesReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    const shell = layer?.closest<HTMLElement>('[data-testid="hero-shell"]');
    if (!layer || !shell) return;

    const syncExclusionZones = () => {
      exclusionZonesRef.current = measureHeroPopoutExclusionZones(layer, shell);
    };

    syncExclusionZones();

    const resizeObserver = new ResizeObserver(syncExclusionZones);
    resizeObserver.observe(shell);
    resizeObserver.observe(layer);
    window.addEventListener("resize", syncExclusionZones);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncExclusionZones);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion || !showcaseImagesReady) return;
    if (showcaseImagesRef.current.length === 0) return;

    let cancelled = false;
    let spawnTimeoutId: number | undefined;

    const queuePopout = () => {
      if (cancelled) return;

      const layer = layerRef.current;
      if (!layer) {
        spawnTimeoutId = window.setTimeout(queuePopout, 400);
        return;
      }

      const layerRect = layer.getBoundingClientRect();
      if (layerRect.width <= 0 || layerRect.height <= 0) {
        spawnTimeoutId = window.setTimeout(queuePopout, 400);
        return;
      }

      if (showcaseImagesRef.current.length === 0) {
        spawnTimeoutId = window.setTimeout(queuePopout, 400);
        return;
      }

      let delayForNextSpawn = getHeroPopoutSpawnDelayMs(slotIndexRef.current);

      setPopouts((current) => {
        if (current.length >= HERO_POPOUT_MAX_ACTIVE) {
          delayForNextSpawn = randomInRange(680, 980);
          return current;
        }

        const slotSelection = pickHeroPopoutSlot(
          layerRect.width,
          layerRect.height,
          exclusionZonesRef.current,
          current,
          slotIndexRef.current,
        );
        if (!slotSelection) {
          delayForNextSpawn = randomInRange(520, 860);
          return current;
        }

        const showcase =
          showcaseImagesRef.current[
            imageIndexRef.current % showcaseImagesRef.current.length
          ];
        if (!showcase) return current;

        slotIndexRef.current =
          (slotSelection.slotIndex + 1) % HERO_POPOUT_SLOTS.length;
        imageIndexRef.current += 1;
        delayForNextSpawn = getHeroPopoutSpawnDelayMs(slotSelection.slotIndex);

        const popout = buildHeroPopoutFromSlot(
          slotSelection.slot,
          slotSelection.slotIndex,
          showcase,
        );

        return [...current, popout];
      });

      spawnTimeoutId = window.setTimeout(queuePopout, delayForNextSpawn);
    };

    queuePopout();

    return () => {
      cancelled = true;
      if (spawnTimeoutId !== undefined) {
        window.clearTimeout(spawnTimeoutId);
      }
    };
  }, [reduceMotion, showcaseImagesReady]);

  const handleRemovePopout = useCallback((id: string) => {
    setPopouts((current) => current.filter((item) => item.id !== id));
  }, []);

  if (reduceMotion) return null;

  return (
    <div ref={layerRef} className="hero-popout-layer">
      {popouts.map((popout) => (
        <HeroPopoutCard
          key={popout.id}
          popout={popout}
          onRemove={handleRemovePopout}
          onSelectPrompt={onSelectPrompt}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const { setStreamPromise } = useGenerationHandoff();
  const router = useRouter();
  const plausible = usePlausible();

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [quality, setQuality] = useState("low");
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>([]);
  const [screenshotUrl, setScreenshotUrl] = useState<string | undefined>(
    undefined,
  );
  const [screenshotData, setScreenshotData] = useState<string | undefined>(
    undefined,
  );
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
  const [isModelSelectOpen, setIsModelSelectOpen] = useState(false);
  const modelSelectScrollRef = useRef({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isPending, startTransition] = useTransition();
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const [showPromptBuilder, setShowPromptBuilder] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<PromptTemplate | null>(
    null,
  );
  const [templateValues, setTemplateValues] = useState<PromptTemplateValues>(
    () => createInitialTemplateValues(PORTFOLIO_PROMPT_TEMPLATE),
  );
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const promptStartedAtRef = useRef<number | null>(null);
  const activationParamsHandledRef = useRef(false);
  const pendingProjectResumeRef = useRef(false);

  const { data: session } = useUserSession();
  const {
    data: creditsData,
    isError: creditsError,
    refetch: refetchCredits,
  } = useUserCredits();
  const createChatMutation = useCreateChat();

  const isAuthenticated = !!session;
  const currentTier = creditsError ? null : (creditsData?.tier ?? "free");
  const hasPurchasedCredits = creditsError
    ? false
    : (creditsData?.hasPurchasedCredits ?? false);
  const userCredits = creditsError ? 0 : (creditsData?.credits ?? 0);
  const canUseModel = useCallback(
    (modelId: string) =>
      isAuthenticated &&
      !creditsError &&
      currentTier !== null &&
      canTierUseModel(currentTier, modelId, { hasPurchasedCredits }),
    [currentTier, creditsError, hasPurchasedCredits, isAuthenticated],
  );

  const showProjectLimitPricing = (limit = FREE_PROJECT_LIMIT) => {
    toast.error(`You've used all ${limit} free projects.`, {
      description: "View pricing to keep building.",
      action: {
        label: "View pricing",
        onClick: () => setShowPricingModal(true),
      },
    });
    setShowPricingModal(true);
  };

  const verifyCanCreateProject = useCallback(
    async (modelId: string) => {
      try {
        const checkResponse = await fetch(
          `/api/user/can-create-project?model=${encodeURIComponent(modelId)}`,
        );

        if (!checkResponse.ok) {
          toast.error(
            "Unable to verify account eligibility. Please try again.",
          );
          return false;
        }

        const eligibility = await checkResponse.json();
        if (!eligibility.canCreate) {
          if (eligibility.error === "PROJECT_LIMIT_REACHED") {
            showProjectLimitPricing(
              eligibility.projectLimit ?? FREE_PROJECT_LIMIT,
            );
            return false;
          }

          const cost = eligibility.modelCost || getModelCreditHoldCost(modelId);
          toast.error(
            `This model costs ${cost} credit${cost === 1 ? "" : "s"}. You have ${eligibility.credits}. Buy more credits to continue.`,
          );
          setShowPricingModal(true);
          return false;
        }

        return true;
      } catch (error) {
        console.error("Error checking eligibility:", error);
        toast.error("Unable to verify account eligibility. Please try again.");
        return false;
      }
    },
    [setShowPricingModal],
  );

  const createProjectAndGoToChat = useCallback(
    async (input: CreateProjectRequest) => {
      const canCreate = await verifyCanCreateProject(input.model);
      if (!canCreate) {
        return false;
      }

      const { chatId, lastMessageId } =
        await createChatMutation.mutateAsync(input);

      plausible("Project Created", {
        props: {
          source: "homepage",
          planMode: input.quality === "high",
          hasScreenshot: Boolean(input.screenshotData || input.screenshotUrl),
          timeToFirstPromptMs: promptStartedAtRef.current
            ? Date.now() - promptStartedAtRef.current
            : 0,
        },
      });

      const streamPromise = fetchCompletionStream({
        messageId: lastMessageId,
        model: input.model,
        screenshotData: input.screenshotData,
      });

      startTransition(() => {
        setStreamPromise(streamPromise);
        router.push(`/chats/${chatId}`);
      });

      return true;
    },
    [
      createChatMutation,
      plausible,
      router,
      setStreamPromise,
      verifyCanCreateProject,
    ],
  );
  const createProjectAndGoToChatRef = useRef(createProjectAndGoToChat);
  createProjectAndGoToChatRef.current = createProjectAndGoToChat;

  useEffect(() => {
    if (!session || pendingProjectResumeRef.current) return;

    const pendingProject = readPendingProject();
    if (!pendingProject) return;

    pendingProjectResumeRef.current = true;

    void (async () => {
      try {
        const created =
          await createProjectAndGoToChatRef.current(pendingProject);
        if (created) {
          clearPendingProject();
        }
      } catch (error) {
        clearPendingProject();
        toast.error(getErrorMessage(error, "Failed to create project"));
      } finally {
        pendingProjectResumeRef.current = false;
      }
    })();
  }, [session]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (activationParamsHandledRef.current) return;
    activationParamsHandledRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const starter = params.get("starter");
    const importScreenshot = params.get("import") === "screenshot";
    const promptFromQuery = params.get("prompt");
    const planMode = params.get("plan");
    const shouldEnablePlanMode = (() => {
      if (!planMode) return false;
      return ["1", "true", "high", "on", "yes"].includes(
        planMode.toLowerCase(),
      );
    })();

    if (shouldEnablePlanMode) {
      setQuality("high");
    }

    if (promptFromQuery?.trim()) {
      setPrompt(promptFromQuery.trim());
      promptStartedAtRef.current ??= Date.now();
    } else if (starter) {
      const suggested = SUGGESTED_PROMPTS.find(
        (item) => item.title.toLowerCase().replace(/\s+/g, "-") === starter,
      );

      if (suggested) {
        setPrompt(suggested.description);
        promptStartedAtRef.current ??= Date.now();
        plausible("Activation Starter Selected", {
          props: { source: "dashboard", starter: suggested.title },
        });
      } else {
        const marketingPrompt = getMarketingStarterPrompt(starter);
        if (marketingPrompt) {
          setPrompt(marketingPrompt);
          promptStartedAtRef.current ??= Date.now();
        }
      }
    }
    if (importScreenshot) {
      window.requestAnimationFrame(() => fileInputRef.current?.click());
      plausible("Screenshot Import Opened", { props: { source: "dashboard" } });
    }
    if (params.get("onboarding") === "1") {
      setShowOnboardingWizard(true);
    }
  }, [plausible]);

  const setStarterPrompt = useCallback(
    (value: string, title: string) => {
      setActiveTemplate(null);
      setPrompt(value);
      promptStartedAtRef.current ??= Date.now();
      plausible("Activation Starter Selected", {
        props: { source: "homepage", starter: title },
      });
      window.requestAnimationFrame(() => {
        textareaRef.current?.focus();
        if (textareaRef.current) {
          const end = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(end, end);
        }
      });
    },
    [plausible],
  );

  const handleGalleryPromptSelect = useCallback(
    (value: string, title: string) => {
      setActiveTemplate(null);
      setPrompt(value);
      promptStartedAtRef.current ??= Date.now();
      plausible("Gallery Prompt Selected", {
        props: { source: "homepage_hero_popout", title },
      });
      window.requestAnimationFrame(() => {
        textareaRef.current?.focus();
        if (textareaRef.current) {
          const end = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(end, end);
        }
      });
    },
    [plausible],
  );

  const handleTemplateCompiledPrompt = useCallback((compiled: string) => {
    setPrompt(compiled);
  }, []);

  const activateTemplate = useCallback(
    (template: PromptTemplate) => {
      setActiveTemplate(template);
      setTemplateValues(createInitialTemplateValues(template));
      promptStartedAtRef.current ??= Date.now();
      plausible("Prompt Template Selected", {
        props: { source: "homepage", template: template.id },
      });
    },
    [plausible],
  );

  const handleExitTemplate = useCallback(() => {
    // Keep the compiled prompt so freeform can edit/submit immediately.
    setActiveTemplate(null);
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  const handleModelChange = (newModel: string) => {
    if (!canUseModel(newModel)) {
      setShowPricingModal(true);
      return;
    }
    setModel(newModel);
  };

  const selectedModel = useMemo(
    () => MODELS.find((m) => m.value === model),
    [model],
  );
  const currentModelOption = useMemo(() => {
    if (selectedModel) return selectedModel;

    const currentModelValue = model.trim();
    if (!currentModelValue) return null;

    return {
      label: model.split("/").pop() || model,
      value: model,
      paid: true,
      free: false,
      featured: false,
      group: "paid" as const,
      summary: "Previously selected model.",
      reasoning: { supported: false, mandatory: false } as const,
    };
  }, [model, selectedModel]);

  const visibleSelectorModels = useMemo(() => {
    if (
      !currentModelOption ||
      MODELS.some((modelOption) => modelOption.value === model)
    ) {
      return MODELS;
    }

    return [...MODELS, currentModelOption];
  }, [currentModelOption, model]);

  const modelOptionsByGroup = useMemo(
    () => ({
      free: visibleSelectorModels.filter(
        (modelOption) => modelOption.group === "free",
      ),
      paid: visibleSelectorModels.filter(
        (modelOption) => modelOption.group === "paid",
      ),
      premium: visibleSelectorModels.filter(
        (modelOption) => modelOption.group === "premium",
      ),
    }),
    [visibleSelectorModels],
  );

  const getCreditBadgeClass = (group: (typeof MODELS)[number]["group"]) => {
    if (group === "free") return "text-emerald-500 dark:text-emerald-400";
    if (group === "premium") return "text-amber-500 dark:text-yellow-400";
    return "text-blue-500 dark:text-blue-400";
  };

  const restoreModelSelectScroll = useCallback(() => {
    const { x, y } = modelSelectScrollRef.current;
    window.scrollTo(x, y);
    document.documentElement.scrollTop = y;
    document.body.scrollTop = y;
  }, []);

  useLayoutEffect(() => {
    if (!isModelSelectOpen) return;

    let secondFrame: number | undefined;
    const firstFrame = window.requestAnimationFrame(() => {
      restoreModelSelectScroll();
      secondFrame = window.requestAnimationFrame(restoreModelSelectScroll);
    });
    const interval = window.setInterval(restoreModelSelectScroll, 25);
    const timeout = window.setTimeout(() => {
      restoreModelSelectScroll();
      window.clearInterval(interval);
    }, 350);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) {
        window.cancelAnimationFrame(secondFrame);
      }
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [isModelSelectOpen, restoreModelSelectScroll]);

  const handleModelSelectOpenChange = (open: boolean) => {
    if (open) {
      modelSelectScrollRef.current = {
        x: window.scrollX,
        y: window.scrollY,
      };
    }

    setIsModelSelectOpen(open);

    if (!open) {
      window.requestAnimationFrame(() => {
        restoreModelSelectScroll();
      });
    }
  };

  const handleScreenshotUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_SCREENSHOT_TYPES.has(file.type)) {
      toast.error("Please upload a PNG, JPEG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_SCREENSHOT_FILE_SIZE_BYTES) {
      toast.error("Please upload an image under 6 MB.");
      event.target.value = "";
      return;
    }

    if (prompt.length === 0) setPrompt("Build this");
    setQuality("low");
    setScreenshotLoading(true);
    setScreenshotUrl(undefined);
    setScreenshotData(undefined);

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setScreenshotData(dataUrl);
      setScreenshotLoading(false);

      if (!isAuthenticated) return;

      uploadScreenshot(file)
        .then(({ url }) => {
          setScreenshotUrl(url);
        })
        .catch((error) => {
          console.warn("Screenshot S3 upload failed:", error);
        });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to read image file."));
      setScreenshotLoading(false);
      event.target.value = "";
    }
  };

  const handleUrlScrape = async () => {
    if (!urlInput.trim()) return;
    if (prompt.length === 0) setPrompt(`Build me a website like ${urlInput}`);
    setQuality("low");
    setIsScrapingUrl(true);
    setScreenshotLoading(true);
    try {
      const response = await fetch("/api/scrape-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to scrape URL");
      setScreenshotData(data.screenshotData);
      setScreenshotUrl(urlInput);
      setUrlInput("");
      toast.success("Website captured successfully!");
    } catch (error: unknown) {
      console.error("URL scraping error:", error);
      toast.error(
        getErrorMessage(
          error,
          "Failed to capture website. Please check the URL and try again.",
        ),
      );
    } finally {
      setIsScrapingUrl(false);
      setScreenshotLoading(false);
    }
  };

  const clearScreenshot = () => {
    setScreenshotUrl(undefined);
    setScreenshotData(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homepageStructuredData).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
      <style>{`
        .font-display {
          font-family: 'Aeonik', var(--font-dm-sans), 'DM Sans', system-ui, sans-serif;
          font-weight: 700;
          letter-spacing: -0.045em;
        }
        .font-sans-dm { font-family: var(--font-dm-sans), 'DM Sans', system-ui, sans-serif; }
        .font-mono-jb { font-family: ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, monospace; }
        body[data-scroll-locked] { margin-right: 0 !important; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,98,255,0); }
          50% { box-shadow: 0 0 0 6px rgba(0,98,255,0.06); }
        }
        @keyframes floatDot {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.4; }
          50% { transform: translateY(-8px) scale(1.1); opacity: 0.7; }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(0,98,255,0.2); }
          50% { border-color: rgba(0,98,255,0.5); }
        }
        .animate-fade-up { animation: fadeUp 0.75s cubic-bezier(0.32, 0.72, 0, 1) both; }
        .animate-fade-up-1 { animation: fadeUp 0.75s cubic-bezier(0.32, 0.72, 0, 1) 0.06s both; }
        .animate-fade-up-2 { animation: fadeUp 0.75s cubic-bezier(0.32, 0.72, 0, 1) 0.14s both; }
        .animate-fade-up-3 { animation: fadeUp 0.75s cubic-bezier(0.32, 0.72, 0, 1) 0.24s both; }
        .animate-fade-up-4 { animation: fadeUp 0.75s cubic-bezier(0.32, 0.72, 0, 1) 0.34s both; }
        .animate-fade-in { animation: fadeIn 0.9s cubic-bezier(0.32, 0.72, 0, 1) both 0.45s; }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-up,
          .animate-fade-up-1,
          .animate-fade-up-2,
          .animate-fade-up-3,
          .animate-fade-up-4,
          .animate-fade-in {
            animation: none;
            opacity: 1;
            transform: none;
          }
          .hero-popout {
            animation: none;
            opacity: 0;
          }
        }

        .hero-shell {
          position: relative;
          isolation: isolate;
          overflow: hidden;
        }

        .hero-stage {
          position: relative;
          display: flex;
          flex: 1;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          min-height: min(calc(100dvh - 4.5rem), 820px);
          padding: 2.5rem 1.25rem 2.75rem;
        }
        @media (min-width: 640px) {
          .hero-stage {
            min-height: min(calc(100dvh - 5.25rem), 860px);
            padding: 3.5rem 1.5rem 3.75rem;
          }
        }
        @media (min-width: 1024px) {
          .hero-stage {
            padding-top: 4.75rem;
            padding-bottom: 5rem;
          }
        }

        .hero-popout-layer {
          pointer-events: none;
          position: absolute;
          inset: 0;
          z-index: 2;
          overflow: visible;
        }
        .hero-popout {
          position: absolute;
          width: clamp(120px, 16vw, 196px);
          aspect-ratio: 16 / 9;
          transform: translate(-50%, -50%);
          border-radius: 14px;
          border: 1px solid hsl(var(--border) / 0.8);
          background: hsl(var(--muted) / 0.35);
          box-shadow:
            0 16px 40px -22px rgba(15, 23, 42, 0.38),
            0 0 0 1px hsl(var(--background));
          overflow: hidden;
          line-height: 0;
          pointer-events: auto;
          cursor: pointer;
          padding: 0;
          animation: heroPopoutLife 3.6s cubic-bezier(0.32, 0.72, 0, 1) forwards;
          will-change: transform, opacity;
          transition:
            box-shadow 180ms ease,
            border-color 180ms ease;
        }
        .hero-popout:hover,
        .hero-popout:focus-visible {
          z-index: 4;
          border-color: hsl(var(--primary) / 0.45);
          box-shadow:
            0 20px 44px -18px rgba(15, 23, 42, 0.42),
            0 0 0 1px hsl(var(--primary) / 0.18);
        }
        .dark .hero-popout {
          box-shadow:
            0 18px 44px -20px rgba(0, 0, 0, 0.72),
            0 0 0 1px hsl(var(--border) / 0.45);
        }
        .dark .hero-popout:hover,
        .dark .hero-popout:focus-visible {
          box-shadow:
            0 22px 48px -16px rgba(0, 0, 0, 0.82),
            0 0 0 1px hsl(var(--primary) / 0.28);
        }
        .hero-popout-image-wrap {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: inherit;
        }
        .hero-popout-image {
          display: block;
          pointer-events: none;
          object-fit: cover;
          object-position: top center;
        }
        @keyframes heroPopoutLife {
          0% {
            opacity: 0;
            filter: blur(6px);
            transform:
              translate(-50%, -50%)
              translate(var(--popout-entry-x, 0px), var(--popout-entry-y, 16px))
              scale(calc(0.76 * var(--popout-scale, 1)))
              rotate(calc(var(--popout-rotate, 0deg) - 5deg));
          }
          10% {
            opacity: 0;
            filter: blur(4px);
          }
          18% {
            opacity: 0.98;
            filter: blur(0);
            transform:
              translate(-50%, -50%)
              translate(0, 0)
              scale(var(--popout-scale, 1))
              rotate(var(--popout-rotate, 0deg));
          }
          68% {
            opacity: 0.98;
            filter: blur(0);
            transform:
              translate(-50%, -50%)
              translate(
                calc(var(--popout-drift-x, 0px) * 0.55),
                var(--popout-drift-y, -8px)
              )
              scale(calc(1.06 * var(--popout-scale, 1)))
              rotate(calc(var(--popout-rotate, 0deg) + 1.5deg));
          }
          100% {
            opacity: 0;
            filter: blur(3px);
            transform:
              translate(-50%, -50%)
              translate(var(--popout-drift-x, 0px), calc(var(--popout-drift-y, -8px) - 12px))
              scale(calc(0.84 * var(--popout-scale, 1)))
              rotate(calc(var(--popout-rotate, 0deg) - 2deg));
          }
        }

        .hero-copy {
          position: relative;
          z-index: 3;
          display: flex;
          width: 100%;
          max-width: 42rem;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1rem;
          padding-top: clamp(1rem, 4vh, 2.5rem);
        }
        @media (min-width: 640px) {
          .hero-copy { gap: 1.15rem; }
        }

        .hero-brand {
          display: block;
          font-family: 'Aeonik', var(--font-dm-sans), 'DM Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: clamp(2.85rem, 8.5vw, 4.75rem);
          line-height: 0.9;
          letter-spacing: -0.06em;
          color: hsl(var(--foreground));
          text-wrap: balance;
        }

        .hero-headline {
          display: block;
          margin-top: 0.15rem;
          font-family: 'Aeonik', var(--font-dm-sans), 'DM Sans', system-ui, sans-serif;
          font-weight: 500;
          font-size: clamp(1.45rem, 3.8vw, 2.15rem);
          line-height: 1.15;
          letter-spacing: -0.035em;
          color: hsl(var(--foreground) / 0.9);
          text-wrap: balance;
        }
        .hero-headline em {
          font-style: italic;
          font-weight: 500;
          color: #0062FF;
        }
        .dark .hero-headline em { color: #0CA8FF; }

        .hero-support {
          max-width: 38ch;
          margin-inline: auto;
          font-size: 0.95rem;
          line-height: 1.6;
          letter-spacing: -0.011em;
          color: hsl(var(--muted-foreground) / 0.82);
          text-wrap: pretty;
        }
        @media (min-width: 640px) {
          .hero-support {
            font-size: 1.0625rem;
            line-height: 1.65;
          }
        }

        .starter-rail {
          display: flex;
          width: 100%;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 0.3rem 0.1rem;
          margin-top: 1.25rem;
        }
        @media (min-width: 640px) {
          .starter-rail { margin-top: 1.5rem; }
        }

        .starter-link {
          display: inline-flex;
          align-items: center;
          padding: 0.45rem 0.8rem;
          border-radius: 999px;
          border: 0;
          background: transparent;
          color: hsl(var(--muted-foreground) / 0.92);
          font-family: var(--font-dm-sans), 'DM Sans', system-ui, sans-serif;
          font-size: 12.5px;
          font-weight: 500;
          letter-spacing: -0.01em;
          cursor: pointer;
          transition:
            color 0.25s cubic-bezier(0.32, 0.72, 0, 1),
            background-color 0.25s cubic-bezier(0.32, 0.72, 0, 1),
            transform 0.25s cubic-bezier(0.32, 0.72, 0, 1),
            box-shadow 0.25s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .starter-link:hover {
          color: hsl(var(--foreground));
          background: hsl(var(--muted) / 0.6);
          transform: translateY(-1px);
        }
        .starter-link:active { transform: translateY(0) scale(0.98); }
        .starter-link:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px hsl(var(--background)), 0 0 0 4px rgba(0,98,255,0.55);
        }
        .starter-link.is-active {
          color: #0062FF;
          background: rgba(0,98,255,0.08);
          box-shadow: inset 0 0 0 1px rgba(0,98,255,0.18);
        }
        .dark .starter-link.is-active {
          color: #0CA8FF;
          background: rgba(12,168,255,0.1);
          box-shadow: inset 0 0 0 1px rgba(12,168,255,0.22);
        }
        .starter-sep {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: hsl(var(--border) / 0.9);
          flex-shrink: 0;
        }

        .compose-shell {
          position: relative;
          z-index: 3;
          width: 100%;
          max-width: 42rem;
          border-radius: 24px;
          padding: 5px;
          background:
            linear-gradient(160deg, hsl(var(--border) / 0.55), hsl(var(--border) / 0.15) 45%, hsl(var(--border) / 0.4));
          box-shadow:
            0 1px 0 hsl(var(--background) / 0.65) inset,
            0 28px 60px -36px rgba(0, 98, 255, 0.28),
            0 14px 36px -20px rgba(15, 23, 42, 0.2);
        }
        .dark .compose-shell {
          background:
            linear-gradient(160deg, hsl(var(--border) / 0.7), hsl(var(--border) / 0.2) 45%, hsl(var(--border) / 0.45));
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.04) inset,
            0 28px 60px -32px rgba(0, 98, 255, 0.35),
            0 14px 36px -18px rgba(0, 0, 0, 0.55);
        }

        .compose-box {
          position: relative;
          border-radius: 19px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .compose-box::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 20px;
          padding: 1px;
          background: linear-gradient(135deg, transparent 0%, rgba(0,98,255,0.18) 50%, transparent 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .compose-box:focus-within::before { opacity: 1; }

        .compose-box-inner {
          background: hsl(var(--background) / 0.9);
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid hsl(var(--border) / 0.45);
          border-radius: 19px;
          transition:
            border-color 0.25s ease,
            box-shadow 0.25s ease,
            min-height 0.28s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .compose-box-inner:focus-within {
          border-color: rgba(0,98,255,0.4);
          box-shadow:
            0 0 0 3px rgba(0,98,255,0.05),
            inset 0 1px 0 rgba(255,255,255,0.35);
        }
        .compose-box-inner:hover:not(:focus-within) {
          border-color: hsl(var(--border) / 0.75);
        }

        .dark .compose-box-inner {
          background: hsl(var(--card) / 0.82);
        }
        .dark .compose-box-inner:focus-within {
          box-shadow:
            0 0 0 3px rgba(0,98,255,0.08),
            inset 0 1px 0 rgba(255,255,255,0.06);
        }

        .toolbar-divider {
          width: 1px;
          height: 16px;
          background: hsl(var(--border) / 0.6);
        }

        .compose-prompt-slot {
          min-height: 118px;
          transition: min-height 0.28s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @media (min-width: 640px) {
          .compose-prompt-slot {
            min-height: 90px;
          }
        }
        .compose-prompt-slot.is-template {
          min-height: 220px;
        }
        .compose-prompt-enter {
          animation: compose-prompt-enter 0.28s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes compose-prompt-enter {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .template-editor {
          padding: 14px 16px 10px;
        }
        .template-editor-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }
        .template-editor-heading {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          min-width: 0;
        }
        .template-editor-icon {
          display: flex;
          height: 28px;
          width: 28px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(0,98,255,0.1);
          color: #0062FF;
        }
        .dark .template-editor-icon {
          color: #0CA8FF;
        }
        .template-editor-title {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: hsl(var(--foreground));
        }
        .template-editor-description {
          margin-top: 2px;
          font-size: 12px;
          line-height: 1.45;
          color: hsl(var(--muted-foreground) / 0.85);
        }
        .template-editor-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .template-research-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border-radius: 999px;
          border: 1px solid rgba(0,98,255,0.22);
          background: rgba(0,98,255,0.06);
          padding: 4px 9px;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: #0062FF;
        }
        .dark .template-research-badge {
          color: #0CA8FF;
        }
        .template-exit-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border-radius: 999px;
          border: 1px solid hsl(var(--border) / 0.65);
          background: hsl(var(--background) / 0.7);
          padding: 4px 9px;
          font-size: 11px;
          color: hsl(var(--muted-foreground));
          transition: all 0.18s ease;
        }
        .template-exit-btn:hover {
          color: hsl(var(--foreground));
          border-color: hsl(var(--border));
        }
        .template-editor-body {
          font-size: 15px;
          line-height: 1.85;
          color: hsl(var(--foreground) / 0.92);
          padding-top: 4px;
        }
        .template-editor-text {
          white-space: pre-wrap;
        }
        .template-field {
          position: relative;
          display: inline-flex;
          align-items: baseline;
          max-width: 100%;
          margin: 0;
          padding-bottom: 2px;
          vertical-align: baseline;
          transition: padding-bottom 0.28s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .template-field.is-focused,
        .template-field.has-value {
          padding-bottom: 18px;
        }
        .template-field-measure {
          position: absolute;
          top: 0;
          left: 0;
          z-index: -1;
          visibility: hidden;
          white-space: pre;
          font: inherit;
          font-weight: 400;
          padding: 0 4px 2px;
          pointer-events: none;
        }
        .template-field.has-value .template-field-measure {
          font-weight: 500;
        }
        .template-field.is-url .template-field-measure {
          font-size: 14px;
          font-weight: 400;
        }
        .template-field-input {
          display: inline-block;
          box-sizing: border-box;
          min-width: 4ch;
          max-width: min(100%, 52ch);
          width: 8ch;
          vertical-align: baseline;
          border: 0;
          border-bottom: 1.5px dashed rgba(0,98,255,0.35);
          background: rgba(0,98,255,0.05);
          padding: 0 4px 2px;
          margin: 0;
          font: inherit;
          line-height: inherit;
          color: hsl(var(--foreground));
          outline: none;
          border-radius: 6px 6px 0 0;
          field-sizing: content;
          transition:
            background-color 0.22s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.22s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.22s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .template-field.is-url .template-field-input {
          max-width: min(100%, 56ch);
          font-size: 14px;
        }
        .template-field-input::placeholder {
          color: hsl(var(--muted-foreground) / 0.55);
        }
        .template-field.is-focused .template-field-input,
        .template-field-input:focus {
          border-bottom-style: solid;
          border-bottom-color: rgba(0,98,255,0.75);
          background: rgba(0,98,255,0.1);
          box-shadow: 0 0 0 3px rgba(0,98,255,0.08);
        }
        .template-field.has-value .template-field-input {
          border-bottom-color: rgba(0,98,255,0.55);
          background: rgba(0,98,255,0.07);
          font-weight: 500;
        }
        .template-field-punct {
          display: inline;
          margin: 0;
          padding: 0;
          color: inherit;
          white-space: nowrap;
        }
        .template-field.has-trailing-punct .template-field-input {
          border-bottom-right-radius: 0;
          margin-right: 0;
        }
        .template-field-mirror {
          display: inline;
          border-bottom: 1.5px solid rgba(0,98,255,0.28);
          padding: 0 2px 1px;
          margin: 0;
          font-weight: 500;
          color: hsl(var(--foreground));
          white-space: nowrap;
        }
        .template-field-mirror.has-trailing-punct {
          padding-right: 0;
        }
        .template-field-caption {
          position: absolute;
          left: 0;
          bottom: 1px;
          z-index: 2;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #0062FF;
          background: hsl(var(--background) / 0.92);
          border: 1px solid rgba(0,98,255,0.18);
          border-radius: 5px;
          padding: 2px 6px;
          white-space: nowrap;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0, 98, 255, 0.08);
          opacity: 0;
          transform: translateY(6px) scale(0.98);
          transition:
            opacity 0.22s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.22s ease;
        }
        .template-field-caption.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .dark .template-field-caption {
          color: #0CA8FF;
          background: hsl(var(--card) / 0.95);
        }
        .template-editor-footer {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 14px;
          padding-top: 10px;
          border-top: 1px solid hsl(var(--border) / 0.45);
        }
        .template-field-hints {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 14px;
        }
        .template-field-hint {
          font-size: 11px;
          line-height: 1.4;
          color: hsl(var(--muted-foreground) / 0.8);
        }
        .template-field-hint strong {
          color: hsl(var(--foreground) / 0.75);
          font-weight: 600;
        }
        .template-status {
          font-size: 11px;
          font-weight: 500;
        }
        .template-status.is-pending {
          color: hsl(var(--muted-foreground) / 0.75);
        }
        .template-status.is-ready {
          color: #0062FF;
        }
        .dark .template-status.is-ready {
          color: #0CA8FF;
        }

        .url-strip {
          border-radius: 16px;
          border: 1px solid hsl(var(--border) / 0.45);
          background: hsl(var(--background) / 0.55);
          backdrop-filter: blur(12px);
          transition:
            border-color 0.25s cubic-bezier(0.32, 0.72, 0, 1),
            box-shadow 0.25s cubic-bezier(0.32, 0.72, 0, 1),
            background-color 0.25s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .url-strip:focus-within {
          border-color: rgba(0,98,255,0.35);
          box-shadow: 0 0 0 3px rgba(0,98,255,0.05);
        }

        .build-btn {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          font-family: var(--font-dm-sans), 'DM Sans', system-ui, sans-serif;
          font-weight: 500;
          letter-spacing: -0.01em;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .build-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%);
          pointer-events: none;
        }
        .build-btn:hover:not(:disabled) {
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 6px 20px rgba(0,98,255,0.3);
        }
        .build-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.99);
        }

        .select-trigger-custom {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 450;
          color: hsl(var(--muted-foreground));
          font-family: var(--font-dm-sans), 'DM Sans', system-ui, sans-serif;
          transition: all 0.15s ease;
          cursor: pointer;
          letter-spacing: -0.01em;
        }
        .select-trigger-custom:hover {
          background: hsl(var(--muted) / 0.7);
          color: hsl(var(--foreground));
        }

        .stat-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #22c55e;
          animation: floatDot 2.4s ease-in-out infinite;
          box-shadow: 0 0 6px rgba(34,197,94,0.5);
        }

        .screenshot-thumb {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
          transition: transform 0.2s ease;
        }
        .screenshot-thumb:hover { transform: scale(1.03); }

        .or-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          color: hsl(var(--muted-foreground) / 0.55);
          font-size: 12px;
          font-family: var(--font-dm-sans), 'DM Sans', system-ui, sans-serif;
          letter-spacing: -0.01em;
          font-weight: 500;
        }
        .or-divider::before, .or-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: hsl(var(--border) / 0.4);
        }

        .upload-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .upload-btn:hover {
          background: hsl(var(--muted) / 0.7);
          color: hsl(var(--foreground));
        }

        .pro-badge {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 1px 5px 1px 3px;
          border-radius: 5px;
          background: linear-gradient(120deg, rgba(0,98,255,0.16), rgba(12,168,255,0.14));
          border: 1px solid rgba(0,98,255,0.25);
          color: #0062FF;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.03em;
          font-family: var(--font-dm-sans), 'DM Sans', system-ui, sans-serif;
        }
        .dark .pro-badge { background: linear-gradient(120deg, rgba(0,98,255,0.22), rgba(12,168,255,0.18)); color: #93c5fd; border-color: rgba(12,168,255,0.3); }
        .premium-badge {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 1px 5px 1px 3px;
          border-radius: 5px;
          background: linear-gradient(120deg, rgba(245,158,11,0.18), rgba(250,204,21,0.18));
          border: 1px solid rgba(245,158,11,0.32);
          color: #b45309;
          font-size: 9px;
          font-weight: 650;
          letter-spacing: 0.03em;
          font-family: var(--font-dm-sans), 'DM Sans', system-ui, sans-serif;
        }
        .dark .premium-badge { background: linear-gradient(120deg, rgba(245,158,11,0.24), rgba(250,204,21,0.18)); color: #facc15; border-color: rgba(250,204,21,0.34); }

        /* ---------- Premium model selector ---------- */
        .model-trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px 4px 7px;
          border-radius: 9px;
          border: 1px solid transparent;
          background: hsl(var(--muted) / 0.45);
          font-family: var(--font-dm-sans), 'DM Sans', system-ui, sans-serif;
          transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .model-trigger:hover {
          background: hsl(var(--muted) / 0.75);
          border-color: hsl(var(--border) / 0.7);
        }
        .model-trigger[data-state="open"] {
          background: hsl(var(--background));
          border-color: rgba(0,98,255,0.35);
          box-shadow: 0 0 0 3px rgba(0,98,255,0.07);
        }
        .model-status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 2px rgba(34,197,94,0.18);
          flex-shrink: 0;
        }
        .model-trigger-label {
          font-size: 11.5px;
          font-weight: 500;
          color: hsl(var(--foreground));
          max-width: 88px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .model-select-content {
          border-radius: 12px;
          overflow: hidden;
          background: hsl(var(--popover));
          box-shadow: 0 16px 36px -14px rgba(0,0,0,0.28), 0 3px 12px rgba(0,0,0,0.06);
          border: 1px solid hsl(var(--border) / 0.6);
          transform-origin: var(--radix-select-content-transform-origin);
          animation: selectContentIn 0.16s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
        }
        .model-select-content[data-state="closed"] {
          animation: selectContentOut 0.12s ease-in;
        }
        .model-select-header {
          padding: 8px 10px 7px;
          border-bottom: 1px solid hsl(var(--border) / 0.5);
          background: linear-gradient(180deg, rgba(0,98,255,0.05), transparent);
        }
        .model-select-header-title {
          font-family: var(--font-dm-sans), 'DM Sans', system-ui, sans-serif;
          font-size: 11.5px;
          font-weight: 600;
          color: hsl(var(--foreground));
        }
        .model-select-header-sub {
          font-family: var(--font-dm-sans), 'DM Sans', system-ui, sans-serif;
          font-size: 9.5px;
          color: hsl(var(--muted-foreground));
          margin-top: 0;
        }

        .model-item {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 6px 8px 6px 7px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          line-height: 1.2;
          transition: background 0.14s ease;
        }
        .model-item[data-highlighted] {
          background: linear-gradient(90deg, rgba(0,98,255,0.08), rgba(12,168,255,0.03));
          outline: none;
        }

        @keyframes selectContentIn {
          from { opacity: 0; transform: translateY(4px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes selectContentOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(4px) scale(0.98); }
        }
        .model-item[data-disabled] {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .model-item-tier-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .model-item-tier-dot.is-free {
          background: #22c55e;
          box-shadow: 0 0 0 2px rgba(34,197,94,0.14);
        }
        .model-item-tier-dot.is-pro {
          background: linear-gradient(135deg, #0062FF, #0CA8FF);
          box-shadow: 0 0 0 2px rgba(0,98,255,0.14);
        }
        .model-item-tier-dot.is-premium {
          background: linear-gradient(135deg, #f59e0b, #facc15);
          box-shadow: 0 0 0 2px rgba(245,158,11,0.18);
        }
        .model-credit-pill {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 1px 5px;
          border-radius: 99px;
          font-size: 9.5px;
          font-weight: 600;
          font-family: ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
          background: hsl(var(--muted) / 0.6);
        }

        /* ---------- Plan mode toggle ---------- */
        .plan-mode-toggle {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 7px 9px;
          border: 1px solid transparent;
          border-radius: 8px;
          background: hsl(var(--muted) / 0.5);
          font-family: var(--font-dm-sans), 'DM Sans', system-ui, sans-serif;
          font-size: 12.5px;
          font-weight: 500;
          letter-spacing: -0.01em;
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          white-space: nowrap;
        }
        .plan-mode-toggle:hover {
          color: hsl(var(--foreground));
        }
        .plan-mode-toggle.is-active {
          color: #0062FF;
          border-color: rgb(0 98 255 / 0.22);
          background: rgb(0 98 255 / 0.08);
          box-shadow: 0 0 0 1px rgb(0 98 255 / 0.04);
        }
        .dark .plan-mode-toggle.is-active {
          color: #0CA8FF;
        }

        @media (max-width: 639px) {
          .select-trigger-custom {
            min-height: 34px;
            padding: 6px 8px;
          }

          .upload-btn {
            width: 34px;
            height: 34px;
          }

          .build-btn {
            min-height: 42px;
            min-width: 88px;
          }

          .model-trigger-label { max-width: 60px; }
        }

        /* ---------- Research-to-ship workflow ---------- */
        .workflow-rail {
          overflow: visible;
          background: none;
        }
        .workflow-rail-path {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
          pointer-events: none;
        }
        .workflow-rail-line,
        .workflow-rail-glow {
          fill: none;
          vector-effect: non-scaling-stroke;
        }
        .workflow-rail-line {
          stroke: hsl(var(--border));
          stroke-width: 1;
        }
        .workflow-rail-glow {
          stroke: rgba(0, 98, 255, 0.1);
          stroke-width: 12;
          filter: blur(5px);
        }
        .workflow-beam-path {
          fill: none;
          stroke: rgba(186, 230, 253, 1);
          stroke-width: 2.8;
          stroke-linecap: round;
          vector-effect: non-scaling-stroke;
          filter:
            drop-shadow(0 0 3px rgba(255, 255, 255, 0.8))
            drop-shadow(0 0 8px rgba(12, 168, 255, 0.95))
            drop-shadow(0 0 22px rgba(0, 98, 255, 0.55));
          opacity: 0;
          pointer-events: none;
          will-change: stroke-width, opacity;
        }
        .workflow-beam-path-glow {
          fill: none;
          stroke: rgba(0, 98, 255, 0.5);
          stroke-width: 12;
          stroke-linecap: round;
          vector-effect: non-scaling-stroke;
          filter: blur(6px) drop-shadow(0 0 28px rgba(0, 98, 255, 0.5));
          opacity: 0;
          pointer-events: none;
          will-change: stroke-width, opacity;
        }
        .workflow-beam {
          --beam-energy: 0;
          --beam-position: 0%;
          --beam-offset-x: 0px;
          --beam-angle: 0deg;
          position: absolute;
          left: calc(50% + var(--beam-offset-x));
          top: var(--beam-position);
          z-index: 2;
          width: 3.5px;
          height: clamp(58px, 8vh, 92px);
          transform: translate(-50%, -50%) rotate(var(--beam-angle)) scaleY(calc(1 + var(--beam-energy) * 0.55));
          transform-origin: center;
          border-radius: 999px;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 98, 255, 0.35) 22%,
            rgba(0, 98, 255, 0.92) 62%,
            rgba(12, 168, 255, 1) 80%,
            rgba(219, 234, 254, 0.98) 90%,
            transparent 100%
          );
          filter: drop-shadow(0 0 6px rgba(0, 98, 255, 0.95));
          opacity: 0;
          pointer-events: none;
          will-change: top, left, transform, opacity;
        }
        .workflow-beam::before {
          content: '';
          position: absolute;
          inset: 8% 50%;
          width: 28px;
          transform: translateX(-50%);
          border-radius: 999px;
          background: inherit;
          filter: blur(12px);
          opacity: calc(0.35 + var(--beam-energy) * 0.55);
        }
        .workflow-beam::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 82%;
          width: 8px;
          height: 8px;
          transform: translate(-50%, -50%);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.98);
          box-shadow:
            0 0 6px rgba(255, 255, 255, 0.95),
            0 0 16px rgba(12, 168, 255, 0.95),
            0 0 34px rgba(0, 98, 255, 0.8);
        }
        .workflow-beam[data-direction='up'] {
          background: linear-gradient(
            to top,
            transparent 0%,
            rgba(0, 98, 255, 0.35) 22%,
            rgba(0, 98, 255, 0.92) 62%,
            rgba(12, 168, 255, 1) 80%,
            rgba(219, 234, 254, 0.98) 90%,
            transparent 100%
          );
        }
        .workflow-beam[data-direction='up']::after {
          top: 18%;
        }
        .workflow-card {
          transition:
            translate 280ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 280ms ease,
            background-color 280ms ease,
            box-shadow 280ms ease;
        }
        .workflow-card-check {
          transition:
            background-color 240ms ease,
            box-shadow 240ms ease,
            color 240ms ease;
        }
        .workflow-node {
          transition:
            translate 260ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 260ms ease,
            box-shadow 260ms ease;
        }
        .workflow-node[data-zigzag-side='left'] {
          translate: -16px 0;
        }
        .workflow-node[data-zigzag-side='right'] {
          translate: 16px 0;
        }

        @media (hover: hover) and (pointer: fine) {
          .workflow-card:hover {
            translate: 0 -3px;
            border-color: rgba(0, 98, 255, 0.24);
            background-color: hsl(var(--background) / 0.92);
            box-shadow:
              0 24px 58px -38px rgba(0, 0, 0, 0.72),
              0 0 0 1px rgba(0, 98, 255, 0.035),
              0 10px 36px -28px rgba(0, 98, 255, 0.42);
          }
          .workflow-card:hover .workflow-card-check {
            background-color: rgba(0, 98, 255, 0.16);
            box-shadow: 0 0 14px rgba(0, 98, 255, 0.18);
          }
          .workflow-step:hover .workflow-node {
            border-color: rgba(0, 98, 255, 0.48);
            box-shadow:
              0 0 0 6px hsl(var(--background)),
              0 0 32px rgba(0, 98, 255, 0.35);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .workflow-beam,
          .workflow-beam-path,
          .workflow-beam-path-glow {
            opacity: 0.45 !important;
          }
          .workflow-card,
          .workflow-card-check,
          .workflow-node {
            transition: none;
          }
          .workflow-card:hover {
            translate: none;
          }
        }

        /* ---------- Interactive product workflow (Idea → Ship rail) ---------- */
        .flow-rail-track,
        .flow-rail-progress,
        .flow-rail-trace {
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          vector-effect: non-scaling-stroke;
        }
        .flow-rail-track {
          stroke: hsl(var(--border));
          stroke-width: 1.5;
        }
        .flow-rail-trace {
          stroke: rgb(59 130 246 / 0.28);
          stroke-width: 1.5;
          stroke-dasharray: 10 8;
          stroke-dashoffset: 54;
          animation: flow-rail-trace 2.4s linear infinite;
        }
        .flow-rail-progress {
          stroke: rgb(59 130 246);
          stroke-width: 2.75;
        }
        .flow-rail-progress-glow {
          fill: none;
          stroke: rgb(59 130 246 / 0.18);
          stroke-width: 10;
          stroke-linecap: round;
          stroke-linejoin: round;
          vector-effect: non-scaling-stroke;
        }
        .flow-rail-marker {
          fill: rgb(255 255 255);
          stroke: rgb(59 130 246);
          stroke-width: 3;
          filter: drop-shadow(0 0 10px rgb(59 130 246 / 0.9));
        }
        .flow-rail-pulse {
          fill: rgb(59 130 246 / 0.14);
          stroke: rgb(59 130 246 / 0.28);
          stroke-width: 1;
          animation: flow-rail-pulse 2.2s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .flow-node {
          position: absolute;
          transform: translate(-50%, -50%);
        }
        .flow-node[data-active="true"] .flow-node-ring {
          animation: flow-node-pulse 3.2s ease-in-out infinite;
        }
        .flow-node[data-complete="true"] .flow-node-dot {
          background: rgb(59 130 246);
          color: white;
          border-color: rgb(59 130 246);
        }
        .flow-active-card {
          animation: flow-card-enter 360ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .flow-artifact {
          opacity: 0;
          animation: flow-artifact-enter 320ms ease forwards;
        }
        @keyframes flow-card-enter {
          from { opacity: 0.45; transform: translateY(7px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes flow-artifact-enter {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes flow-rail-trace {
          to { stroke-dashoffset: 0; }
        }
        @keyframes flow-rail-pulse {
          0%, 100% { opacity: 0.45; transform: scale(0.82); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes flow-node-pulse {
          0%, 72%, 100% { box-shadow: 0 0 0 0 rgb(59 130 246 / 0); }
          18%, 36% { box-shadow: 0 0 0 8px rgb(59 130 246 / 0.12); }
        }
        @media (max-width: 767px) {
          .flow-node,
          .flow-node:nth-child(n) {
            position: static;
            transform: none;
          }
          .flow-stage {
            min-height: auto;
            overflow: visible;
          }
          .flow-nodes {
            scrollbar-width: none;
          }
          .flow-nodes::-webkit-scrollbar {
            display: none;
          }
          .flow-rail-trace {
            animation: none;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .flow-active-card { animation: none; }
          .flow-rail-marker,
          .flow-rail-pulse,
          .flow-rail-trace,
          .flow-node[data-active="true"] .flow-node-ring { animation: none; }
          .flow-artifact { opacity: 1; animation: none; }
        }

        .showcase-rail {
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .showcase-rail::-webkit-scrollbar {
          display: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .showcase-capabilities {
            opacity: 1;
            transform: none;
          }
          .showcase-preview-hint {
            opacity: 0;
          }
        }
      `}</style>

      <div className="font-sans-dm relative flex min-h-svh w-full flex-col overflow-x-clip">
        <Header onHelpClick={() => setShowHelpPanel(true)} />

        <div className="hero-shell" data-testid="hero-shell">
          <div className="hero-stage" data-testid="hero-stage">
            <HeroPopoutShowcases onSelectPrompt={handleGalleryPromptSelect} />
            {/* Hero copy */}
            <div className="hero-copy" data-hero-popout-exclude="copy">
              <h1 className="animate-fade-up">
                <span className="hero-brand">Squid</span>
                <span className="hero-headline">
                  Build React apps you <em>own</em>.
                </span>
              </h1>

              <p className="hero-support animate-fade-up-1">
                Research the live web, approve the plan, then generate verified
                code you can export.
              </p>
            </div>

            {/* Main form */}
            <form
              id="builder"
              data-hero-popout-exclude="compose"
              className="animate-fade-up-2 relative z-[3] w-full max-w-2xl pt-8 sm:pt-10 lg:pt-12"
              action={async (formData) => {
                setIsCheckingEligibility(true);
                const currentModel = (formData.get("model") as string) || model;
                const submittedPrompt = prompt.trim();
                const formQuality = formData.get("quality");
                const submittedQuality =
                  formQuality === "high" ? "high" : "low";

                try {
                  // Require authentication before allowing chat creation
                  const session = await authClient.getSession();
                  if (!session.data) {
                    if (!submittedPrompt) {
                      toast.error("Enter a prompt before creating an account");
                      return;
                    }

                    savePendingProject({
                      prompt: submittedPrompt,
                      model: currentModel,
                      quality: submittedQuality,
                      screenshotData,
                      screenshotUrl,
                      providerIds: selectedProviderIds,
                    });
                    toast.info("Create an account to start building");
                    router.push(
                      `/sign-up?callbackUrl=${encodeURIComponent("/")}`,
                    );
                    return;
                  }

                  assert.ok(submittedPrompt.length > 0);
                  assert.ok(typeof currentModel === "string");
                  assert.ok(
                    submittedQuality === "high" || submittedQuality === "low",
                  );

                  const created = await createProjectAndGoToChat({
                    prompt: submittedPrompt,
                    model: currentModel,
                    quality: submittedQuality,
                    screenshotUrl,
                    screenshotData,
                    providerIds: selectedProviderIds,
                  });
                  if (created) {
                    clearPendingProject();
                  }
                } catch (error: unknown) {
                  const message = getErrorMessage(
                    error,
                    "Failed to create project",
                  );
                  if (message.includes("free projects")) {
                    showProjectLimitPricing();
                    return;
                  }
                  toast.error(message);
                } finally {
                  setIsCheckingEligibility(false);
                }
              }}
            >
              <Fieldset className="min-w-0">
                {isAuthenticated && creditsError && (
                  <CreditsLoadError
                    className="mb-3"
                    onRetryAction={() => void refetchCredits()}
                  />
                )}
                {/* Compose box */}
                <div className="compose-shell">
                  <div className="compose-box w-full">
                    <div className="compose-box-inner relative w-full pb-16 sm:pb-11">
                      {/* Screenshot preview */}
                      {screenshotLoading && (
                        <div className="mx-3 mt-3">
                          <div className="flex h-[52px] w-[60px] animate-pulse items-center justify-center rounded-xl bg-muted/60">
                            <Spinner />
                          </div>
                        </div>
                      )}
                      {(screenshotUrl || screenshotData) &&
                        !screenshotLoading && (
                          <div
                            className={`${isPending ? "invisible" : ""} relative mx-3 mt-3 inline-block`}
                          >
                            <div className="screenshot-thumb">
                              <img
                                alt="screenshot"
                                src={screenshotData ?? screenshotUrl}
                                className="h-[52px] w-[60px] object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-background text-muted-foreground shadow ring-1 ring-border/50 transition-colors hover:text-foreground dark:bg-card"
                              onClick={clearScreenshot}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="size-3.5"
                              >
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                              </svg>
                            </button>
                          </div>
                        )}

                      {/* Prompt input */}
                      <div
                        className={`compose-prompt-slot ${activeTemplate ? "is-template" : ""}`}
                      >
                        {activeTemplate ? (
                          <div
                            key={activeTemplate.id}
                            className="compose-prompt-enter"
                          >
                            <PromptTemplateEditor
                              template={activeTemplate}
                              values={templateValues}
                              onValuesChange={setTemplateValues}
                              onCompiledPromptChange={
                                handleTemplateCompiledPrompt
                              }
                              onExitTemplate={handleExitTemplate}
                            />
                          </div>
                        ) : (
                          <div key="freeform" className="compose-prompt-enter">
                            <Textarea
                              ref={textareaRef}
                              placeholder="Build me a budgeting app..."
                              required
                              name="prompt"
                              className="min-h-[118px] resize-none border-0 bg-transparent px-4 pt-4 text-base leading-relaxed placeholder:text-muted-foreground/40 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:min-h-[90px] sm:text-[15px]"
                              value={prompt}
                              onChange={(e) => {
                                if (
                                  e.target.value &&
                                  promptStartedAtRef.current === null
                                ) {
                                  promptStartedAtRef.current = Date.now();
                                  plausible("Prompt Started", {
                                    props: {
                                      source: "homepage",
                                      method: "typing",
                                    },
                                  });
                                }
                                setPrompt(e.target.value);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                  event.preventDefault();
                                  const target = event.target;
                                  if (!(target instanceof HTMLTextAreaElement))
                                    return;
                                  target.closest("form")?.requestSubmit();
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Toolbar */}
                      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 px-3 pb-3 pt-1">
                        {/* Left controls */}
                        <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
                          {/* Model selector: premium trigger */}
                          <Select.Root
                            name="model"
                            open={isModelSelectOpen}
                            value={model}
                            onOpenChange={handleModelSelectOpenChange}
                            onValueChange={handleModelChange}
                          >
                            <Select.Trigger className="model-trigger">
                              <span className="model-status-dot" />
                              <Select.Value aria-label={model}>
                                <span className="flex min-w-0 items-center gap-1.5">
                                  <span className="model-trigger-label">
                                    {currentModelOption?.label ??
                                      "Select model"}
                                  </span>
                                  {currentModelOption?.paid && (
                                    <span
                                      className={
                                        currentModelOption.group === "premium"
                                          ? "premium-badge"
                                          : "pro-badge"
                                      }
                                    >
                                      <Sparkles className="size-2.5" />
                                      {currentModelOption.group === "premium"
                                        ? "PREMIUM"
                                        : "PRO"}
                                    </span>
                                  )}
                                </span>
                              </Select.Value>
                              <Select.Icon>
                                <ChevronDownIcon className="size-3 opacity-50" />
                              </Select.Icon>
                            </Select.Trigger>
                            <Select.Portal>
                              <Select.Content
                                position="popper"
                                side="top"
                                align="start"
                                sideOffset={8}
                                collisionPadding={12}
                                className="model-select-content max-w-[calc(100vw-1.5rem)] sm:min-w-[226px]"
                              >
                                <div className="model-select-header">
                                  <div className="model-select-header-title">
                                    Choose a model
                                  </div>
                                  <div className="model-select-header-sub">
                                    Swap any time - cost updates instantly
                                  </div>
                                </div>
                                <Select.Viewport className="p-1">
                                  {[
                                    ...(modelOptionsByGroup.free.length > 0
                                      ? [
                                          {
                                            label: "Starter Models",
                                            models: modelOptionsByGroup.free,
                                          },
                                        ]
                                      : []),
                                    ...(modelOptionsByGroup.paid.length > 0
                                      ? [
                                          {
                                            label:
                                              "Efficient & Advanced Models",
                                            models: modelOptionsByGroup.paid,
                                          },
                                        ]
                                      : []),
                                    ...(modelOptionsByGroup.premium.length > 0
                                      ? [
                                          {
                                            label: "Premium Models",
                                            models: modelOptionsByGroup.premium,
                                          },
                                        ]
                                      : []),
                                  ].map((group) => (
                                    <Select.Group key={group.label}>
                                      <Select.Label className="px-2 pb-0.5 pt-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                                        {group.label}
                                      </Select.Label>
                                      {group.models.map((m) => {
                                        const isLocked = !canUseModel(m.value);
                                        const creditRange = getModelCreditRange(
                                          m.value,
                                        );
                                        const creditLabel =
                                          creditRange.min === creditRange.max
                                            ? `${creditRange.min}`
                                            : `from ${creditRange.min}`;
                                        const creditBadgeClass =
                                          getCreditBadgeClass(m.group);
                                        const tierDotClass =
                                          m.group === "premium"
                                            ? "is-premium"
                                            : m.group === "free"
                                              ? "is-free"
                                              : "is-pro";

                                        return (
                                          <Select.Item
                                            key={m.value}
                                            value={m.value}
                                            disabled={isLocked}
                                            onClick={() => {
                                              if (isLocked)
                                                setShowPricingModal(true);
                                            }}
                                            onFocus={restoreModelSelectScroll}
                                            className={`model-item ${isLocked ? "opacity-50" : ""}`}
                                          >
                                            <div className="flex min-w-0 items-center gap-2">
                                              <span
                                                className={`model-item-tier-dot ${tierDotClass}`}
                                              />
                                              <Select.ItemText
                                                className={
                                                  m.free
                                                    ? "font-medium text-emerald-600 dark:text-emerald-400"
                                                    : "text-foreground"
                                                }
                                              >
                                                {m.label}
                                              </Select.ItemText>
                                              {isLocked && (
                                                <span
                                                  className={
                                                    m.group === "premium"
                                                      ? "premium-badge"
                                                      : "pro-badge"
                                                  }
                                                >
                                                  <Sparkles className="size-2" />
                                                  {m.group === "premium"
                                                    ? "PREMIUM"
                                                    : "PRO"}
                                                </span>
                                              )}
                                            </div>
                                            <div className="flex flex-shrink-0 items-center gap-2">
                                              <span
                                                className={`model-credit-pill ${creditBadgeClass}`}
                                              >
                                                {creditLabel}
                                                <Coins
                                                  className={`size-2 ${creditBadgeClass}`}
                                                />
                                              </span>
                                              <Select.ItemIndicator>
                                                <CheckIcon className="size-3.5 text-primary" />
                                              </Select.ItemIndicator>
                                            </div>
                                          </Select.Item>
                                        );
                                      })}
                                    </Select.Group>
                                  ))}
                                </Select.Viewport>
                                <Select.Arrow />
                              </Select.Content>
                            </Select.Portal>
                          </Select.Root>

                          <div className="toolbar-divider mx-0.5 sm:mx-1" />

                          <ApiSelectionDialog
                            selectedProviderIds={selectedProviderIds}
                            onSelectionChange={setSelectedProviderIds}
                          />

                          <div className="toolbar-divider mx-0.5 sm:mx-1" />

                          {/* Plan mode */}
                          <input type="hidden" name="quality" value={quality} />
                          <button
                            type="button"
                            onClick={() =>
                              setQuality((current) =>
                                current === "high" ? "low" : "high",
                              )
                            }
                            aria-pressed={quality === "high"}
                            aria-label={
                              quality === "high"
                                ? "Plan first mode enabled"
                                : "Build fast mode enabled"
                            }
                            title={
                              quality === "high"
                                ? "Ask clarifying questions and approve a plan before code generation (recommended)"
                                : "Skip planning and generate code immediately"
                            }
                            className={`plan-mode-toggle ${quality === "high" ? "is-active" : ""}`}
                          >
                            <Sparkles className="size-3" aria-hidden="true" />
                            <span className="hidden sm:inline">
                              {quality === "high" ? "Plan first" : "Build fast"}
                            </span>
                          </button>

                          <div className="toolbar-divider mx-0.5 sm:mx-1" />

                          {/* Prompt Builder */}
                          <button
                            type="button"
                            onClick={() => setShowPromptBuilder(true)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                            title="Enhance your prompt with AI"
                          >
                            <span className="hidden sm:inline">Enhance</span>
                          </button>

                          <div className="toolbar-divider mx-0.5 sm:mx-1" />

                          {/* Upload */}
                          <div className="flex items-center gap-0.5">
                            <label
                              htmlFor="screenshot"
                              className="upload-btn"
                              title="Attach image"
                            >
                              <UploadIcon className="size-[15px]" />
                            </label>
                            <input
                              id="screenshot"
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              onChange={handleScreenshotUpload}
                              className="hidden"
                              ref={fileInputRef}
                            />
                            <div className="relative hidden sm:block">
                              <Info className="peer h-3 w-3 cursor-help text-muted-foreground/40 transition-colors hover:text-muted-foreground/70" />
                              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-44 -translate-x-1/2 rounded-xl bg-popover px-3 py-2.5 text-xs text-popover-foreground opacity-0 shadow-xl ring-1 ring-border/50 transition-opacity peer-hover:opacity-100">
                                <p className="mb-1 font-semibold">
                                  Supported formats
                                </p>
                                <p className="text-muted-foreground">
                                  PNG, JPEG, WebP
                                </p>
                                <p className="mt-1 text-muted-foreground/70">
                                  Upload a screenshot to recreate it in code
                                </p>
                                <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-popover" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Submit button */}
                        <Button
                          type="submit"
                          disabled={
                            screenshotLoading ||
                            prompt.length === 0 ||
                            (activeTemplate !== null &&
                              !isPromptTemplateReady(
                                activeTemplate,
                                templateValues,
                              )) ||
                            isCheckingEligibility ||
                            isPending
                          }
                          className="build-btn group"
                        >
                          Build
                          <Spinner loading={isCheckingEligibility || isPending}>
                            <img
                              src="/image.png"
                              alt="Build"
                              className="size-4 invert transition-transform duration-200 group-hover:translate-x-0.5"
                            />
                          </Spinner>
                        </Button>
                      </div>

                      {/* Loading overlay */}
                      {(isPending || isScrapingUrl) && (
                        <LoadingMessage
                          isHighQuality={quality === "high"}
                          screenshotUrl={screenshotUrl ?? screenshotData}
                          isScrapingUrl={isScrapingUrl}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggested prompts */}
                <div className="starter-rail">
                  {PROMPT_TEMPLATES.map((template, index) => (
                    <div key={template.id} className="contents">
                      {index > 0 ? (
                        <span className="starter-sep" aria-hidden="true" />
                      ) : null}
                      <button
                        type="button"
                        onClick={() => activateTemplate(template)}
                        className={`starter-link ${activeTemplate?.id === template.id ? "is-active" : ""}`}
                        aria-pressed={activeTemplate?.id === template.id}
                      >
                        {template.shortLabel}
                      </button>
                    </div>
                  ))}
                  {SUGGESTED_PROMPTS.map((v) => (
                    <div key={v.title} className="contents">
                      <span className="starter-sep" aria-hidden="true" />
                      <button
                        type="button"
                        onClick={() => {
                          setStarterPrompt(v.description, v.title);
                        }}
                        className="starter-link"
                      >
                        {v.title}
                      </button>
                    </div>
                  ))}
                </div>
                {/* URL section */}
                <div
                  className="relative z-[3] mb-4 mt-8 sm:mb-10 sm:mt-10"
                  data-hero-popout-exclude="clone"
                >
                  <div className="or-divider mb-4">or clone a site</div>

                  <div className="flex justify-center">
                    <div
                      className={`url-strip group flex w-full max-w-[420px] items-center gap-3 px-4 py-2.5 ${
                        urlInput.trim()
                          ? "border-blue-500/35 bg-blue-50/20 dark:border-blue-500/25 dark:bg-blue-950/10"
                          : ""
                      } ${isScrapingUrl ? "border-blue-500/40" : ""}`}
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-[background-color,color,box-shadow] duration-200 ${
                          isScrapingUrl || urlInput.trim()
                            ? "bg-blue-500 text-white shadow-sm shadow-blue-500/30"
                            : "bg-muted/70 text-muted-foreground/70"
                        }`}
                      >
                        {isScrapingUrl ? (
                          <Spinner className="size-3.5" />
                        ) : (
                          <Link2 className="size-3.5" />
                        )}
                      </div>
                      <Input
                        type="url"
                        placeholder="https://example.com"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && urlInput.trim()) {
                            e.preventDefault();
                            handleUrlScrape();
                          }
                        }}
                        disabled={isScrapingUrl}
                        className="w-full border-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed"
                      />
                      {urlInput.trim() && !isScrapingUrl && (
                        <button
                          type="button"
                          onClick={handleUrlScrape}
                          aria-label="Clone website"
                          className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm shadow-blue-500/30 transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                        >
                          <ArrowRightIcon className="size-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Fieldset>
            </form>
          </div>
        </div>

        <ProductWorkflowDemo />
        <HomepageScrollStatement />
        <HomepageAnswerSection />
        <HomepageLandingPagesSection />
        <AiBuilderFeatureComparison variant="homepage" />
        <BuiltWithSquidSection />
        <HomepageFaqSection />
        <HoverBrandLogo />

        <HomepageFlowSection />
        <Footer showPageLinks />

        <PricingModal
          open={showPricingModal}
          onOpenChange={setShowPricingModal}
          remainingCredits={userCredits}
          isAuthenticated={isAuthenticated}
          currentTier={currentTier ?? "free"}
        />
        <HelpPanel
          isOpen={showHelpPanel}
          onClose={() => setShowHelpPanel(false)}
        />
        <OnboardingWizard
          isOpen={showOnboardingWizard}
          onClose={() => setShowOnboardingWizard(false)}
          onComplete={() => {
            window.requestAnimationFrame(() => {
              textareaRef.current?.focus();
            });
          }}
        />
        <PromptBuilderModal
          open={showPromptBuilder}
          onOpenChange={setShowPromptBuilder}
          onUsePrompt={(enhanced) => {
            setPrompt(enhanced);
            if (textareaRef.current) {
              textareaRef.current.focus();
            }
          }}
        />
      </div>
    </>
  );
}

function HomepageAnswerSection() {
  const workflowSectionRef = useRef<HTMLElement>(null);
  const workflowBeamRef = useRef<HTMLDivElement>(null);
  const workflowBeamPathRef = useRef<SVGPathElement>(null);
  const workflowBeamGlowPathRef = useRef<SVGPathElement>(null);
  const workflowBeamMaskRef = useRef<SVGRectElement>(null);
  const lastScrollY = useMotionValue(0);
  const velocity = useMotionValue(0);
  const directionRef = useRef<"up" | "down">("down");
  const reduceMotion = useReducedMotion();
  const momentumTarget = useMotionValue(0);
  const momentumSpring = useSpring(momentumTarget, {
    stiffness: 260,
    damping: 28,
    mass: 0.55,
    restDelta: 0.04,
    restSpeed: 0.04,
  });

  const { scrollY } = useScroll();
  const { scrollYProgress } = useScroll({
    target: workflowSectionRef,
    offset: ["start end", "end start"],
  });

  const zigzagPoints = useMemo(
    () =>
      [
        { progress: 0, offset: 0 },
        { progress: 0.2, offset: -18 },
        { progress: 0.5, offset: 18 },
        { progress: 0.8, offset: -18 },
        { progress: 1, offset: 0 },
      ] as const,
    [],
  );

  const getPathMetrics = useCallback(
    (progress: number, railHeight: number) => {
      const segmentIndex = zigzagPoints.findIndex(
        (point) => point.progress >= progress,
      );
      const nextIndex = Math.max(segmentIndex, 1);
      const start = zigzagPoints[nextIndex - 1];
      const end = zigzagPoints[nextIndex] ?? zigzagPoints.at(-1)!;
      const segmentProgress = Math.min(
        Math.max(
          (progress - start.progress) /
            Math.max(end.progress - start.progress, 0.001),
          0,
        ),
        1,
      );
      const offset =
        start.offset + (end.offset - start.offset) * segmentProgress;
      const angle =
        (-Math.atan2(
          end.offset - start.offset,
          railHeight * Math.max(end.progress - start.progress, 0.001),
        ) *
          180) /
        Math.PI;

      return { offset, angle };
    },
    [zigzagPoints],
  );

  const paintBeam = useCallback(
    (sectionProgress: number) => {
      const beam = workflowBeamRef.current;
      const beamPath = workflowBeamPathRef.current;
      const beamGlowPath = workflowBeamGlowPathRef.current;
      const beamMask = workflowBeamMaskRef.current;
      const rail = beam?.parentElement;
      if (!beam || !beamPath || !beamGlowPath || !beamMask || !rail) return;

      const railRect = rail.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const isCenteredOnRail =
        railRect.top <= viewportCenter && railRect.bottom >= viewportCenter;

      const railProgress = Math.min(
        Math.max(
          (viewportCenter - railRect.top) / Math.max(railRect.height, 1),
          0,
        ),
        1,
      );
      const momentumOffset = momentumSpring.get();
      const beamProgress = Math.min(
        Math.max(
          railProgress + momentumOffset / Math.max(railRect.height, 1),
          0,
        ),
        1,
      );

      const currentVelocity = velocity.get();
      const energy = reduceMotion
        ? 0.35
        : Math.min(Math.abs(currentVelocity) / 38, 1);
      const pathMetrics = getPathMetrics(beamProgress, railRect.height);
      const beamLength = reduceMotion ? 14 : 11 + energy * 9;
      const visible = reduceMotion
        ? sectionProgress > 0.12 && sectionProgress < 0.92
        : isCenteredOnRail;
      const beamOpacity = visible ? `${0.62 + energy * 0.35}` : "0";
      const glowOpacity = visible ? `${0.34 + energy * 0.4}` : "0";
      const currentDirection = directionRef.current;

      beam.style.setProperty("--beam-position", `${beamProgress * 100}%`);
      beam.style.setProperty(
        "--beam-offset-x",
        `${pathMetrics.offset.toFixed(3)}px`,
      );
      beam.style.setProperty(
        "--beam-angle",
        `${pathMetrics.angle.toFixed(3)}deg`,
      );
      beam.style.setProperty("--beam-energy", energy.toFixed(3));
      beam.style.opacity = beamOpacity;
      beam.dataset.direction = currentDirection;
      beamMask.setAttribute(
        "y",
        `${(beamProgress * 100 - beamLength / 2).toFixed(3)}`,
      );
      beamMask.setAttribute("height", beamLength.toFixed(3));
      beamMask.setAttribute(
        "fill",
        `url(#workflow-beam-mask-gradient-${currentDirection})`,
      );
      beamPath.style.strokeWidth = `${(2.6 + energy * 2.2).toFixed(3)}px`;
      beamPath.style.opacity = beamOpacity;
      beamGlowPath.style.strokeWidth = `${(11 + energy * 6).toFixed(3)}px`;
      beamGlowPath.style.opacity = glowOpacity;
    },
    [getPathMetrics, momentumSpring, reduceMotion, velocity],
  );

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (reduceMotion) return;

    const previous = lastScrollY.get();
    const delta = latest - previous;
    lastScrollY.set(latest);

    if (Math.abs(delta) > 0.5) {
      directionRef.current = delta < 0 ? "up" : "down";
    }

    const nextVelocity = Math.min(
      Math.max(velocity.get() * 0.72 + delta * 0.38, -80),
      80,
    );
    velocity.set(nextVelocity);
    momentumTarget.set(Math.min(Math.max(nextVelocity * 0.26, -20), 20));
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    velocity.set(velocity.get() * 0.88);
    if (Math.abs(velocity.get()) < 0.4) {
      momentumTarget.set(0);
    }
    paintBeam(latest);
  });

  useMotionValueEvent(momentumSpring, "change", () => {
    paintBeam(scrollYProgress.get());
  });

  useEffect(() => {
    lastScrollY.set(scrollY.get());
    paintBeam(scrollYProgress.get());
  }, [lastScrollY, paintBeam, scrollY, scrollYProgress]);

  return (
    <section
      ref={workflowSectionRef}
      aria-labelledby="squid-agent-overview"
      className="relative z-10 w-full px-4 pb-16 pt-2 sm:px-6 sm:pb-24 sm:pt-4"
    >
      <div className="mx-auto w-full max-w-6xl border-y border-border/60 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="squid-agent-overview"
            className="font-display text-4xl leading-[1.02] tracking-tight text-foreground sm:text-5xl"
          >
            The first prompt is only the beginning.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Squid turns your idea into a plan, builds the system, verifies it in
            a real runtime, and keeps iterating until it works.
          </p>
        </div>

        <div className="relative mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)] md:gap-x-6 md:gap-y-10">
          <div className="workflow-rail pointer-events-none absolute left-1/2 top-3 hidden h-[calc(100%-1.5rem)] w-12 -translate-x-1/2 md:block">
            <svg
              className="workflow-rail-path"
              viewBox="0 0 48 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="workflow-beam-mask-gradient-down"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0" stopColor="white" stopOpacity="0" />
                  <stop offset="0.28" stopColor="white" stopOpacity="0.18" />
                  <stop offset="0.72" stopColor="white" stopOpacity="1" />
                  <stop offset="1" stopColor="white" stopOpacity="0" />
                </linearGradient>
                <linearGradient
                  id="workflow-beam-mask-gradient-up"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0" stopColor="white" stopOpacity="0" />
                  <stop offset="0.28" stopColor="white" stopOpacity="1" />
                  <stop offset="0.72" stopColor="white" stopOpacity="0.18" />
                  <stop offset="1" stopColor="white" stopOpacity="0" />
                </linearGradient>
                <mask
                  id="workflow-beam-mask"
                  x="-20"
                  y="-20"
                  width="88"
                  height="140"
                  maskUnits="userSpaceOnUse"
                  maskContentUnits="userSpaceOnUse"
                >
                  <rect
                    ref={workflowBeamMaskRef}
                    x="-20"
                    y="0"
                    width="88"
                    height="10"
                    fill="url(#workflow-beam-mask-gradient-down)"
                  />
                </mask>
              </defs>
              <path
                className="workflow-rail-glow"
                d="M24 0 L8 20 L40 50 L8 80 L24 100"
              />
              <path
                className="workflow-rail-line"
                d="M24 0 L8 20 L40 50 L8 80 L24 100"
              />
              <path
                ref={workflowBeamGlowPathRef}
                className="workflow-beam-path-glow"
                d="M24 0 L8 20 L40 50 L8 80 L24 100"
                mask="url(#workflow-beam-mask)"
              />
              <path
                ref={workflowBeamPathRef}
                className="workflow-beam-path"
                d="M24 0 L8 20 L40 50 L8 80 L24 100"
                mask="url(#workflow-beam-mask)"
              />
            </svg>
            <div
              ref={workflowBeamRef}
              className="workflow-beam"
              aria-hidden="true"
            />
          </div>
          {homepageNarrativeBlocks.map((block, index) => {
            const isLeft = block.side === "left";

            return (
              <div
                key={block.question}
                className="workflow-step grid gap-4 md:contents"
              >
                {isLeft ? (
                  <HomepageNarrativeArticle
                    block={block}
                    className="md:col-start-1"
                  />
                ) : (
                  <div className="hidden md:col-start-1 md:block" />
                )}

                <div className="relative hidden items-center justify-center md:col-start-2 md:flex">
                  <span
                    className="workflow-node relative z-10 flex size-5 items-center justify-center rounded-full border border-blue-500/30 bg-background shadow-[0_0_0_6px_hsl(var(--background)),0_0_28px_rgba(59,130,246,0.22)]"
                    data-zigzag-side={index % 2 === 0 ? "left" : "right"}
                  >
                    <span className="size-1.5 rounded-full bg-blue-500" />
                  </span>
                </div>

                {isLeft ? (
                  <div className="hidden md:col-start-3 md:block" />
                ) : (
                  <HomepageNarrativeArticle
                    block={block}
                    className="md:col-start-3 md:translate-y-8"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-20 max-w-3xl rounded-[28px] border border-blue-500/15 bg-blue-500/[0.035] p-6 text-center sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0062FF] dark:text-[#0CA8FF]">
            Code ownership
          </p>
          <h3 className="mt-4 font-display text-2xl leading-tight tracking-tight text-foreground sm:text-3xl">
            {homepageOwnershipCopy.title}
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            {homepageOwnershipCopy.body}
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/example"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            See a demo
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function HomepageNarrativeArticle({
  block,
  className = "",
}: {
  block: (typeof homepageNarrativeBlocks)[number];
  className?: string;
}) {
  return (
    <article
      className={`workflow-card relative rounded-[24px] border border-border/70 bg-background/80 p-5 shadow-[0_18px_48px_-34px_rgba(0,0,0,0.55)] backdrop-blur sm:p-6 ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-[12px] font-semibold text-[#0062FF] dark:text-[#0CA8FF]">
          {block.stage} — {block.label}
        </p>
        <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
      </div>
      <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-normal text-foreground">
        {block.question}
      </h3>
      <p className="mt-3 text-base leading-7 text-muted-foreground">
        {block.body}
      </p>
    </article>
  );
}

function HomepageFlowSection() {
  const [activeStep, setActiveStep] = useState(0);
  const railProgressRef = useRef(0);
  const railAnimationFrameRef = useRef<number | null>(null);
  const [railAnimation, setRailAnimation] = useState<{
    progress: number;
    x: number;
    y: number;
  }>({
    progress: 0,
    x: homepageFlowRailPoints[0].x,
    y: homepageFlowRailPoints[0].y,
  });
  const step = homepageFlowSteps[activeStep];
  const ActiveIcon = step.icon;
  const goToStep = (index: number) => {
    setActiveStep(
      (index + homepageFlowSteps.length) % homepageFlowSteps.length,
    );
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timeout = window.setTimeout(() => {
      setActiveStep(
        (currentStep) => (currentStep + 1) % homepageFlowSteps.length,
      );
    }, 4200);

    return () => window.clearTimeout(timeout);
  }, [activeStep]);

  useEffect(() => {
    if (railAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(railAnimationFrameRef.current);
    }

    const startProgress = railProgressRef.current;
    const targetProgress = homepageFlowRailProgress[activeStep];
    const progressDelta = targetProgress - startProgress;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const updateRail = (progress: number) => {
      const point = getHomepageFlowPosition(progress);
      railProgressRef.current = progress;
      setRailAnimation({ progress, x: point.x, y: point.y });
    };

    if (reducedMotion || Math.abs(progressDelta) < 0.01) {
      updateRail(targetProgress);
      return;
    }

    const startedAt = performance.now();
    const duration = Math.min(900, 360 + Math.abs(progressDelta) * 6);
    const animateRail = (now: number) => {
      const elapsed = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      updateRail(startProgress + progressDelta * eased);

      if (elapsed < 1) {
        railAnimationFrameRef.current =
          window.requestAnimationFrame(animateRail);
      } else {
        railAnimationFrameRef.current = null;
      }
    };

    railAnimationFrameRef.current = window.requestAnimationFrame(animateRail);

    return () => {
      if (railAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(railAnimationFrameRef.current);
        railAnimationFrameRef.current = null;
      }
    };
  }, [activeStep]);

  return (
    <section
      aria-labelledby="squid-agent-stages"
      className="relative z-10 w-full px-4 pb-16 pt-4 sm:px-6 sm:pb-24 sm:pt-6"
    >
      <div className="mx-auto w-full max-w-6xl border-t border-border/60 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="squid-agent-stages"
            className="font-display text-4xl leading-[1.02] tracking-tight text-foreground sm:text-5xl"
          >
            Your idea keeps moving. <br /> You stay in control.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Move from a rough idea to a shipped app without losing the context,
            decisions, or code along the way. Select a stage to see what Squid
            handles and where you stay in control.
          </p>
        </div>

        <div className="flow-stage relative mx-auto mt-10 max-w-5xl overflow-visible px-2 sm:mt-12 sm:px-4">
          <div className="relative mx-auto hidden w-full pb-11 md:block">
            <div
              className="relative w-full"
              style={{
                aspectRatio: `${HOMEPAGE_FLOW_VIEWBOX.width} / ${HOMEPAGE_FLOW_VIEWBOX.height}`,
              }}
            >
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                viewBox={`0 0 ${HOMEPAGE_FLOW_VIEWBOX.width} ${HOMEPAGE_FLOW_VIEWBOX.height}`}
                preserveAspectRatio="none"
                role="img"
                aria-label={`Workflow progress: step ${activeStep + 1} of ${homepageFlowSteps.length}`}
              >
                <path className="flow-rail-track" d={homepageFlowRailPath} />
                <path className="flow-rail-trace" d={homepageFlowRailPath} />
                <path
                  className="flow-rail-progress-glow"
                  d={getHomepageFlowPartialPath(railAnimation.progress)}
                />
                <path
                  className="flow-rail-progress"
                  d={getHomepageFlowPartialPath(railAnimation.progress)}
                />
                <circle
                  className="flow-rail-pulse"
                  cx={railAnimation.x}
                  cy={railAnimation.y}
                  r="14"
                />
                <circle
                  className="flow-rail-marker"
                  cx={railAnimation.x}
                  cy={railAnimation.y}
                  r="4.5"
                />
              </svg>

              <nav
                className="flow-nodes absolute inset-0"
                aria-label="Build stages"
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    goToStep(activeStep + 1);
                  }
                  if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    goToStep(activeStep - 1);
                  }
                }}
              >
                {homepageFlowSteps.map((flowStep, index) => {
                  const isActive = index === activeStep;
                  const isComplete = index < activeStep;
                  const stepNumber = String(index + 1).padStart(2, "0");
                  const point = homepageFlowRailPoints[index];

                  return (
                    <button
                      key={flowStep.label}
                      type="button"
                      className="flow-node group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      data-active={isActive}
                      data-complete={isComplete}
                      aria-pressed={isActive}
                      aria-label={`${flowStep.label}, step ${index + 1} of ${homepageFlowSteps.length}`}
                      onClick={() => setActiveStep(index)}
                      style={{
                        left: `${(point.x / HOMEPAGE_FLOW_VIEWBOX.width) * 100}%`,
                        top: `${(point.y / HOMEPAGE_FLOW_VIEWBOX.height) * 100}%`,
                      }}
                    >
                      <span
                        className={`flow-node-ring flex size-11 items-center justify-center rounded-full border bg-background/95 shadow-sm backdrop-blur transition-[border-color,background-color,box-shadow,color] ${
                          isActive
                            ? "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/25"
                            : isComplete
                              ? "border-blue-500/40 text-blue-500"
                              : "border-border/80 text-muted-foreground group-hover:border-blue-500/40 group-hover:text-foreground"
                        }`}
                      >
                        <span className="flow-node-dot flex size-8 items-center justify-center rounded-full border border-transparent text-[11px] font-semibold tracking-wide">
                          {stepNumber}
                        </span>
                      </span>
                      <span
                        className={`absolute left-1/2 top-[calc(100%+10px)] w-max max-w-[4.75rem] -translate-x-1/2 text-center text-[11px] font-medium leading-tight transition-colors ${
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        {flowStep.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <nav
            className="flow-nodes mb-5 flex max-w-full flex-wrap justify-center gap-2 md:hidden"
            aria-label="Build stages"
          >
            {homepageFlowSteps.map((flowStep, index) => {
              const StepIcon = flowStep.icon;
              return (
                <button
                  key={flowStep.label}
                  type="button"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border/70 bg-background/95 px-2.5 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur transition-[color,border-color,background-color,box-shadow] hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 data-[active=true]:border-blue-500/30 data-[active=true]:bg-blue-500 data-[active=true]:text-white data-[active=true]:shadow-md data-[active=true]:shadow-blue-500/20"
                  data-active={index === activeStep}
                  aria-pressed={index === activeStep}
                  onClick={() => setActiveStep(index)}
                >
                  <StepIcon className="size-4" aria-hidden="true" />
                  {flowStep.label}
                </button>
              );
            })}
          </nav>

          <article
            key={activeStep}
            className="flow-active-card relative z-[2] mx-auto mt-6 flex min-h-[260px] w-full max-w-xl flex-col items-center justify-center rounded-[26px] border border-border/70 bg-background/90 p-6 text-center shadow-[0_28px_80px_-46px_rgba(0,0,0,0.7)] backdrop-blur sm:mt-8 sm:min-h-[280px] sm:p-8"
            aria-live="polite"
          >
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold tracking-[0.14em] text-[#0062FF] dark:text-[#0CA8FF]">
                {String(activeStep + 1).padStart(2, "0")} /{" "}
                {String(homepageFlowSteps.length).padStart(2, "0")}
              </span>
              <span className="h-px w-8 bg-gradient-to-r from-blue-500/50 to-transparent" />
              <span className="flex size-10 items-center justify-center rounded-full bg-[#0062FF] text-white shadow-lg shadow-blue-500/25">
                <ActiveIcon className="size-5" aria-hidden="true" />
              </span>
            </div>
            <h3 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
              {step.title}
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              {step.detail}
            </p>
            <div
              className="mt-5 flex flex-wrap justify-center gap-2"
              aria-label={`${step.label} outputs`}
            >
              {step.artifacts.map((artifact, index) => (
                <span
                  key={artifact}
                  className="flow-artifact inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-2.5 py-1 text-xs text-foreground"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <CheckIcon
                    className="size-3 text-blue-500"
                    aria-hidden="true"
                  />
                  {artifact}
                </span>
              ))}
            </div>
          </article>
        </div>

        <div className="mt-5 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 text-sm text-muted-foreground sm:flex sm:flex-wrap sm:justify-center">
          <button
            type="button"
            onClick={() => goToStep(activeStep - 1)}
            className="col-start-1 row-start-1 inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-[border-color,background-color,box-shadow] hover:border-blue-500/40 hover:bg-blue-500/10 hover:shadow-[0_0_20px_-8px_rgba(59,130,246,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Previous workflow step"
          >
            <ChevronDownIcon className="size-4 rotate-90" />
          </button>
          <span className="col-start-2 row-start-1 flex min-w-0 items-center justify-center gap-3">
            <span className="whitespace-nowrap">
              Step {activeStep + 1} of {homepageFlowSteps.length}
            </span>
            <span aria-hidden="true">→</span>
          </span>
          <span className="col-span-3 row-start-2 inline-flex items-center gap-2 justify-self-center rounded-full bg-blue-500/10 px-3 py-1.5 font-medium text-foreground">
            <Box className="size-4 text-blue-500" aria-hidden="true" />
            Every artifact is yours
          </span>
          <button
            type="button"
            onClick={() => goToStep(activeStep + 1)}
            className="col-start-3 row-start-1 inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-[border-color,background-color,box-shadow] hover:border-blue-500/40 hover:bg-blue-500/10 hover:shadow-[0_0_20px_-8px_rgba(59,130,246,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Next workflow step"
          >
            <ChevronDownIcon className="size-4 -rotate-90" />
          </button>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/example"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition-[background-color,box-shadow] hover:bg-blue-600 hover:shadow-md hover:shadow-blue-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:w-auto"
          >
            Explore the full workflow
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
function HomepageFaqSection() {
  const firstColumnFaqCount = Math.ceil(homepageFaq.length / 2);
  const [leftOpenItem, setLeftOpenItem] = useState<number | null>(null);
  const [rightOpenItem, setRightOpenItem] = useState<number | null>(null);

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
          <div className="grid gap-4">
            {homepageFaq.slice(0, firstColumnFaqCount).map((item, index) => (
              <HomepageFaqAccordionCard
                key={item.question}
                faq={item}
                id={`squid-agent-faq-left-${index}`}
                isOpen={leftOpenItem === index}
                onToggle={() =>
                  setLeftOpenItem(leftOpenItem === index ? null : index)
                }
              />
            ))}
          </div>
          <div className="grid gap-4">
            {homepageFaq.slice(firstColumnFaqCount).map((item, index) => {
              const globalIndex = firstColumnFaqCount + index;

              return (
                <HomepageFaqAccordionCard
                  key={item.question}
                  faq={item}
                  id={`squid-agent-faq-right-${globalIndex}`}
                  isOpen={rightOpenItem === globalIndex}
                  onToggle={() =>
                    setRightOpenItem(
                      rightOpenItem === globalIndex ? null : globalIndex,
                    )
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function HomepageFaqAccordionCard({
  faq,
  id,
  isOpen,
  onToggle,
}: {
  faq: (typeof homepageFaq)[number];
  id: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="rounded-[22px] border border-border/70 bg-background/80 p-5 shadow-[0_16px_42px_-34px_rgba(0,0,0,0.55)] backdrop-blur">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={id}
        className="flex w-full items-start justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <h3 className="text-lg font-semibold leading-snug tracking-normal text-foreground">
          {faq.question}
        </h3>
        <ChevronDownIcon
          className={`mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <div
        id={id}
        className="grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-in-out"
        style={{
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div
          className="min-h-0 transition-opacity duration-300"
          style={{ opacity: isOpen ? 1 : 0 }}
        >
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {faq.answer}
          </p>
        </div>
      </div>
    </article>
  );
}

function BuiltWithSquidSection() {
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
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>

        <div className="showcase-rail -mx-4 mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:gap-y-12 lg:overflow-visible lg:px-0 lg:pb-0">
          {BUILT_WITH_SQUID_PROJECTS.map((project) => (
            <figure
              key={project.href}
              className="group w-[min(85vw,22rem)] min-w-0 shrink-0 snap-center border-t border-border/70 pt-4 lg:col-span-6 lg:w-auto"
            >
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`View ${project.name}`}
                className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4"
              >
                <div className="showcase-preview relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-muted/40">
                  {project.imageSrc ? (
                    <Image
                      src={project.imageSrc}
                      alt={
                        project.imageAlt ??
                        `${project.name} project preview built with Squid`
                      }
                      fill
                      sizes="(min-width: 1024px) 58vw, 85vw"
                      className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03] motion-reduce:transition-none"
                    />
                  ) : (
                    <p className="px-6 text-center text-sm text-muted-foreground">
                      Preview unavailable
                    </p>
                  )}
                  {(project.capabilities ?? ["Responsive"]).length > 0 ? (
                    <div
                      className="showcase-capabilities pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-1 flex-wrap gap-1.5 p-3 opacity-0 transition-[opacity,transform] duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100"
                      aria-label={`${project.name} capabilities`}
                    >
                      {(project.capabilities ?? ["Responsive"]).map(
                        (capability) => (
                          <span
                            key={capability}
                            className="rounded-full border border-blue-500/25 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-700 backdrop-blur-sm dark:text-blue-300"
                          >
                            {capability}
                          </span>
                        ),
                      )}
                    </div>
                  ) : null}
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
                  {project.creatorName && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Shared by {project.creatorName}
                    </p>
                  )}
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
                  {project.remixHref && (
                    <a
                      href={project.remixHref}
                      target="_blank"
                      rel="noreferrer"
                      className="text-foreground/70 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      Remix
                    </a>
                  )}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function LoadingMessage({
  isHighQuality,
  screenshotUrl,
  isScrapingUrl,
}: {
  isHighQuality: boolean;
  screenshotUrl: string | undefined;
  isScrapingUrl?: boolean;
}) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[20px] bg-background dark:bg-card">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
          <Spinner className="size-5 text-blue-500" />
        </div>
        <p className="text-center text-[15px] font-semibold text-foreground">
          {isScrapingUrl
            ? "Capturing website…"
            : isHighQuality
              ? "Planning project structure…"
              : screenshotUrl
                ? "Analyzing screenshot…"
                : "Building your app…"}
        </p>
      </div>
    </div>
  );
}

function HomepageLandingPagesSection() {
  const landingCaseStudyHref = `/?plan=1&prompt=${encodeURIComponent("Build your version in 90 seconds: choose audience, style, key interactions, and success criteria before generating a verified React landing page.")}&source=${encodeURIComponent("/example")}`;

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

        <div className="showcase-rail -mx-4 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
          {HOMEPAGE_LANDING_PAGES.map((landing) => (
            <ShowcaseProjectCard
              key={landing.href}
              name={landing.name}
              href={landing.href}
              category={landing.category}
              description={landing.description}
              imageSrc={landing.imageSrc}
              imageAlt={landing.imageAlt}
              capabilities={
                landing.capabilities ??
                landingPageCapabilities[landing.href] ?? ["Responsive"]
              }
              layout="rail"
            />
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-5 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Start with a clear goal, turn on plan mode, and move into generation
            with checkpoints for restore and export.
          </p>
          <Button asChild size="lg" className="whitespace-nowrap rounded-xl">
            <Link href={landingCaseStudyHref}>
              Build your version in 90 seconds
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export const runtime = "edge";
export const maxDuration = 60;
