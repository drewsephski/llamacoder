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
import { useMotionValue, useSpring } from "framer-motion";
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
import { HelpPanel } from "@/components/help-panel";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Macbook } from "@/components/ui/animated-3d-mac-book-air";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUserCredits, useUserSession, useCreateChat } from "@/lib/queries";
import {
  FREE_PROJECT_LIMIT,
  canTierUseModel,
  getModelCreditHoldCost,
  getModelCreditRange,
} from "@/lib/billing";
import { fetchCompletionStream } from "@/features/generation/client/completion-stream";
import { useGenerationHandoff } from "@/features/generation/client/generation-handoff-context";
import { getErrorMessage } from "@/features/shared/errors";
import { ApiSelectionDialog } from "@/features/integrations/components/api-selection-dialog";
import { AiBuilderFeatureComparison } from "@/components/ai-builder-feature-comparison";
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
  },
  {
    name: "Phoenix Design Lab",
    href: "https://phoenixdev.agency/demo",
    description:
      "A cinematic agency landing page with a red editorial art direction and bold one-screen positioning.",
    category: "Design agency",
    imageSrc: "/showcase/phoenix-design-lab.webp",
    imageAlt: "Phoenix Design Lab homepage generated with Squid",
  },
  {
    name: "PortfolioOS",
    href: "https://portfolios.chat",
    description:
      "An AI-native professional identity site where portfolios answer questions in real time.",
    category: "AI portfolio builder",
    imageSrc: "/showcase/portfolio-os.webp",
    imageAlt: "PortfolioOS homepage generated with Squid",
  },
  {
    name: "Slotflow",
    href: "https://slotflow.fit",
    description:
      "A scheduling surface for coordinating group availability without spreadsheet back-and-forth.",
    category: "Event coordination",
    imageSrc: "/showcase/slotflow.webp",
    imageAlt: "Slotflow homepage generated with Squid",
  },
];

type HomepageLandingPage = {
  name: string;
  href: string;
  category: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
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

const homepageFaq = [
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
] as const;

const homepageNarrativeBlocks = [
  {
    stage: "01",
    label: "Research + approve",
    side: "left",
    question: "Turn an uncertain idea into an approved product plan.",
    body: "Start with a prompt, screenshot, or website. Squid Agent researches current sources when the work depends on outside knowledge, asks only the decisions that change the build, and gives you a structured plan to revise and approve.",
    proofs: [
      "Live web research with visible sources",
      "Interactive questions and a persistent app specification",
      "Explicit approval before code generation",
    ],
  },
  {
    stage: "02",
    label: "Build + iterate",
    side: "right",
    question: "Build a real React project, then refine it in place.",
    body: "Generate a multi-file React and TypeScript application with a live preview and inspectable source. Keep iterating through chat, or select an element in the preview and request a focused change without replacing the whole project.",
    proofs: [
      "Multi-file React, TypeScript, Tailwind, and shadcn code",
      "Live preview, file tree, and source-aware follow-up edits",
      "Selected-element edits for precise visual changes",
    ],
  },
  {
    stage: "03",
    label: "Verify + recover",
    side: "left",
    question: "Know what works—and keep a safe way back.",
    body: "Squid Agent checks the generated files and running preview, discloses what still needs review, and attempts recoverable repairs. Every code-bearing response becomes a checkpoint you can compare, label, restore, or selectively recover file by file.",
    proofs: [
      "Static, accessibility, API-safety, and runtime checks",
      "Automatic preview repair with no repair charge",
      "Exact version diffs, bookmarks, and selective restore",
    ],
  },
  {
    stage: "04",
    label: "Connect + ship",
    side: "right",
    question: "Move from verified preview to code you control.",
    body: "Connect supported services with scoped credentials and health checks. Publish to GitHub, deploy a Vercel preview or production build, share a remixable project, or leave with a verified source bundle and the instructions to run it anywhere.",
    proofs: [
      "Honest API setup boundaries and connection health",
      "GitHub publishing and Vercel deployments",
      "Portable source, configuration, and quality reports",
    ],
  },
] as const;

const homepageControlPromises = [
  {
    label: "Visible by default",
    title: "See the evidence.",
    body: "Inspect research sources, approved decisions, changed files, quality results, version diffs, and the receipt for each saved generation.",
  },
  {
    label: "Predictable spend",
    title: "Know the cost.",
    body: "See the expected credit range before a run and the actual charge afterward. Failed initial generations are not charged, and preview repairs are free.",
  },
  {
    label: "Portable by design",
    title: "Own the handoff.",
    body: "Publish verified code or download the complete React project with configuration, setup guidance, deployment files, and quality reports.",
  },
] as const;

const homepageFlowSteps = [
  {
    label: "Idea",
    eyebrow: "01 · Start anywhere",
    title: "Describe what you want",
    detail:
      "Use a prompt, screenshot, or URL. Squid turns rough intent into a buildable brief.",
    artifacts: ["Prompt captured", "Goal clarified", "Build brief ready"],
    icon: Lightbulb,
  },
  {
    label: "Research",
    eyebrow: "02 · Ground the idea",
    title: "Research the real world",
    detail:
      "Sources, APIs, and constraints become visible context before the first line of code.",
    artifacts: ["Sources collected", "API fit checked", "Constraints surfaced"],
    icon: Search,
  },
  {
    label: "Plan",
    eyebrow: "03 · Approve the direction",
    title: "See the plan before the build",
    detail:
      "Review consequential choices and steer the architecture while changes are still cheap.",
    artifacts: ["Architecture mapped", "Tradeoffs exposed", "Plan approved"],
    icon: MapIcon,
  },
  {
    label: "Build",
    eyebrow: "04 · Watch it take shape",
    title: "Generate a working app",
    detail:
      "The interface, logic, and files arrive together in an inspectable workspace.",
    artifacts: ["React files created", "Preview running", "Source inspectable"],
    icon: Code2,
  },
  {
    label: "Refine",
    eyebrow: "05 · Keep the momentum",
    title: "Refine in conversation",
    detail:
      "Ask for changes in plain language while Squid preserves the parts that already work.",
    artifacts: ["Request understood", "Change scoped", "Version saved"],
    icon: MessageSquare,
  },
  {
    label: "Verify",
    eyebrow: "06 · Earn confidence",
    title: "Verify before release",
    detail:
      "Quality checks and repair loops show what passed, what changed, and what still needs attention.",
    artifacts: ["Checks executed", "Repairs attempted", "Report visible"],
    icon: ShieldCheck,
  },
  {
    label: "Ship",
    eyebrow: "07 · Own the outcome",
    title: "Ship the whole project",
    detail:
      "Deploy when ready, export every file, and keep a transparent record of how it was built.",
    artifacts: ["Bundle portable", "Deployment ready", "History preserved"],
    icon: Rocket,
  },
] as const;

const homepageFlowOrbitPoints = [
  { x: 40, y: 140 },
  { x: 112, y: 28 },
  { x: 360, y: 12 },
  { x: 608, y: 28 },
  { x: 680, y: 140 },
  { x: 608, y: 252 },
  { x: 112, y: 252 },
] as const;

const homepageFlowProgressPath = homepageFlowOrbitPoints
  .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
  .join(" ");
const homepageFlowOrbitPath = `${homepageFlowProgressPath} Z`;
const homepageFlowSegmentLengths = homepageFlowOrbitPoints
  .slice(0, -1)
  .map((point, index) => {
    const nextPoint = homepageFlowOrbitPoints[index + 1];
    return Math.hypot(nextPoint.x - point.x, nextPoint.y - point.y);
  });
const homepageFlowTotalLength = homepageFlowSegmentLengths.reduce(
  (total, length) => total + length,
  0,
);
const homepageFlowOrbitProgress = (() => {
  let traveled = 0;

  return homepageFlowOrbitPoints.map((_, index) => {
    if (index > 0) traveled += homepageFlowSegmentLengths[index - 1];
    return (traveled / homepageFlowTotalLength) * 100;
  });
})();

function getHomepageFlowPosition(progress: number) {
  let remainingDistance =
    (Math.min(Math.max(progress, 0), 100) / 100) * homepageFlowTotalLength;

  for (let index = 0; index < homepageFlowSegmentLengths.length; index += 1) {
    const segmentLength = homepageFlowSegmentLengths[index];
    const start = homepageFlowOrbitPoints[index];
    const end = homepageFlowOrbitPoints[index + 1];

    if (remainingDistance <= segmentLength) {
      const segmentProgress = remainingDistance / segmentLength;
      return {
        x: start.x + (end.x - start.x) * segmentProgress,
        y: start.y + (end.y - start.y) * segmentProgress,
      };
    }

    remainingDistance -= segmentLength;
  }

  return homepageFlowOrbitPoints.at(-1)!;
}

function getHomepageFlowPartialPath(progress: number) {
  const targetDistance =
    (Math.min(Math.max(progress, 0), 100) / 100) * homepageFlowTotalLength;
  const pathParts = [
    `M${homepageFlowOrbitPoints[0].x} ${homepageFlowOrbitPoints[0].y}`,
  ];
  let traveled = 0;

  for (let index = 0; index < homepageFlowSegmentLengths.length; index += 1) {
    const segmentLength = homepageFlowSegmentLengths[index];
    const nextPoint = homepageFlowOrbitPoints[index + 1];

    if (traveled + segmentLength <= targetDistance) {
      pathParts.push(`L${nextPoint.x} ${nextPoint.y}`);
      traveled += segmentLength;
      continue;
    }

    const start = homepageFlowOrbitPoints[index];
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
      logo: "https://squidagent.app/squidagent-logo.svg",
      sameAs: [
        "https://www.instagram.com/drew.sepeczi",
        "https://github.com/drewsephski",
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://squidagent.app/#software",
      name: "Squid Agent",
      alternateName: "Squid",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      url: "https://squidagent.app/",
      image: "https://squidagent.app/api/og?card=site&v=2",
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
      publisher: {
        "@id": "https://squidagent.app/#organization",
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
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [smoothMousePosition, setSmoothMousePosition] = useState({
    x: 50,
    y: 50,
  });
  const [isHoveringRing, setIsHoveringRing] = useState(false);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);
  const promptStartedAtRef = useRef<number | null>(null);
  const activationParamsHandledRef = useRef(false);

  const { data: session } = useUserSession();
  const { data: creditsData } = useUserCredits();
  const createChatMutation = useCreateChat();

  const isAuthenticated = !!session;
  const currentTier = creditsData?.tier ?? "free";
  const hasPurchasedCredits = creditsData?.hasPurchasedCredits ?? false;
  const userCredits = creditsData?.credits ?? 0;
  const canUseModel = useCallback(
    (modelId: string) =>
      isAuthenticated &&
      canTierUseModel(currentTier, modelId, { hasPurchasedCredits }),
    [currentTier, hasPurchasedCredits, isAuthenticated],
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
    const suggested = SUGGESTED_PROMPTS.find(
      (item) => item.title.toLowerCase().replace(/\s+/g, "-") === starter,
    );

    if (suggested) {
      setPrompt(suggested.description);
      promptStartedAtRef.current ??= Date.now();
      plausible("Activation Starter Selected", {
        props: { source: "dashboard", starter: suggested.title },
      });
    }
    if (importScreenshot) {
      window.requestAnimationFrame(() => fileInputRef.current?.click());
      plausible("Screenshot Import Opened", { props: { source: "dashboard" } });
    }
  }, [plausible]);

  const setStarterPrompt = useCallback(
    (value: string, title: string) => {
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

  useEffect(() => {
    const animate = () => {
      setSmoothMousePosition((prev) => ({
        x: prev.x + (mousePosition.x - prev.x) * 0.08,
        y: prev.y + (mousePosition.y - prev.y) * 0.08,
      }));
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mousePosition]);

  const handleModelChange = (newModel: string) => {
    if (!canUseModel(newModel)) {
      setShowPricingModal(true);
      return;
    }
    setModel(newModel);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ringRef.current) return;
    const rect = ringRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
    setIsHoveringRing(true);
  };

  const handleMouseLeave = () => {
    setIsHoveringRing(false);
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
          __html: JSON.stringify(homepageStructuredData),
        }}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap');

        .font-display { font-family: 'Instrument Serif', Georgia, serif; }
        .font-sans-dm { font-family: 'DM Sans', system-ui, sans-serif; }
        .font-mono-jb { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        body[data-scroll-locked] { margin-right: 0 !important; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
          50% { box-shadow: 0 0 0 6px rgba(59,130,246,0.06); }
        }
        @keyframes floatDot {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.4; }
          50% { transform: translateY(-8px) scale(1.1); opacity: 0.7; }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(59,130,246,0.2); }
          50% { border-color: rgba(59,130,246,0.5); }
        }
        .animate-fade-up { animation: fadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .animate-fade-up-1 { animation: fadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both; }
        .animate-fade-up-2 { animation: fadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both; }
        .animate-fade-up-3 { animation: fadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.22s both; }
        .animate-fade-up-4 { animation: fadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.32s both; }
        .animate-fade-in { animation: fadeIn 0.8s ease both 0.4s; }

        .shimmer-text {
          background: linear-gradient(
            150deg,
            hsl(var(--foreground)) 0%,
            rgba(0, 98, 255, 1) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-reverse 3s linear infinite;
        }

        .compose-box {
          position: relative;
          border-radius: 20px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .compose-box::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 21px;
          padding: 1px;
          background: linear-gradient(135deg, transparent 0%, rgba(59,130,246,0.15) 50%, transparent 100%);
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
          background: hsl(var(--background) / 0.85);
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid hsl(var(--border) / 0.6);
          border-radius: 20px;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .compose-box-inner:focus-within {
          border-color: rgba(59,130,246,0.45);
          box-shadow:
            0 0 0 3px rgba(59,130,246,0.06),
            0 8px 32px rgba(0,0,0,0.08),
            0 2px 8px rgba(59,130,246,0.06);
        }
        .compose-box-inner:hover:not(:focus-within) {
          border-color: hsl(var(--border) / 0.9);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }

        .dark .compose-box-inner {
          background: hsl(var(--card) / 0.75);
        }

        .toolbar-divider {
          width: 1px;
          height: 16px;
          background: hsl(var(--border) / 0.6);
        }

        .pill-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 99px;
          border: 1px solid hsl(var(--border) / 0.5);
          background: hsl(var(--background) / 0.5);
          font-size: 12.5px;
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-weight: 400;
          letter-spacing: -0.01em;
          backdrop-filter: blur(8px);
        }
        .pill-chip:hover {
          border-color: rgba(59,130,246,0.35);
          background: rgba(59,130,246,0.04);
          color: hsl(var(--foreground));
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(59,130,246,0.08);
        }

        .url-strip {
          border-radius: 14px;
          border: 1px solid hsl(var(--border) / 0.5);
          background: hsl(var(--background) / 0.6);
          backdrop-filter: blur(12px);
          transition: all 0.25s ease;
        }
        .url-strip:focus-within {
          border-color: rgba(59,130,246,0.4);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.05);
        }

        .build-btn {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          font-family: 'DM Sans', system-ui, sans-serif;
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
          box-shadow: 0 6px 20px rgba(59,130,246,0.3);
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
          font-family: 'DM Sans', system-ui, sans-serif;
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
          color: hsl(var(--muted-foreground) / 0.5);
          font-size: 11.5px;
          font-family: 'DM Sans', system-ui, sans-serif;
          letter-spacing: 0.04em;
          text-transform: uppercase;
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

        .info-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 99px;
          background: rgba(12,168,255,0.08);
          border: 1px solid rgba(12,168,255,0.2);
          color: #0095ff;
          font-size: 11.5px;
          font-weight: 500;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .dark .info-pill { color: #0095ff; background: rgba(12,168,255,0.06); }

        .pro-badge {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 1px 5px 1px 3px;
          border-radius: 5px;
          background: linear-gradient(120deg, rgba(59,130,246,0.16), rgba(99,102,241,0.16));
          border: 1px solid rgba(59,130,246,0.25);
          color: #2563eb;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.03em;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .dark .pro-badge { background: linear-gradient(120deg, rgba(59,130,246,0.22), rgba(99,102,241,0.22)); color: #93c5fd; border-color: rgba(59,130,246,0.3); }
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
          font-family: 'DM Sans', system-ui, sans-serif;
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
          font-family: 'DM Sans', system-ui, sans-serif;
          transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .model-trigger:hover {
          background: hsl(var(--muted) / 0.75);
          border-color: hsl(var(--border) / 0.7);
        }
        .model-trigger[data-state="open"] {
          background: hsl(var(--background));
          border-color: rgba(59,130,246,0.35);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.07);
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
          background: linear-gradient(180deg, rgba(59,130,246,0.05), transparent);
        }
        .model-select-header-title {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 11.5px;
          font-weight: 600;
          color: hsl(var(--foreground));
        }
        .model-select-header-sub {
          font-family: 'DM Sans', system-ui, sans-serif;
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
          background: linear-gradient(90deg, rgba(59,130,246,0.08), rgba(99,102,241,0.03));
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
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          box-shadow: 0 0 0 2px rgba(59,130,246,0.14);
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
          font-family: 'JetBrains Mono', ui-monospace, monospace;
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
          font-family: 'DM Sans', system-ui, sans-serif;
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
          color: rgb(59 130 246);
          border-color: rgb(59 130 246 / 0.22);
          background: rgb(59 130 246 / 0.08);
          box-shadow: 0 0 0 1px rgb(59 130 246 / 0.04);
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
          stroke: rgba(59, 130, 246, 0.08);
          stroke-width: 10;
          filter: blur(5px);
        }
        .workflow-beam-path {
          fill: none;
          stroke: rgba(191, 219, 254, 0.98);
          stroke-width: 2.4;
          stroke-linecap: round;
          vector-effect: non-scaling-stroke;
          filter:
            drop-shadow(0 0 3px rgba(255, 255, 255, 0.75))
            drop-shadow(0 0 7px rgba(96, 165, 250, 0.95))
            drop-shadow(0 0 18px rgba(59, 130, 246, 0.48));
          opacity: 0;
          pointer-events: none;
          will-change: stroke-width, opacity;
        }
        .workflow-beam-path-glow {
          fill: none;
          stroke: rgba(59, 130, 246, 0.42);
          stroke-width: 10;
          stroke-linecap: round;
          vector-effect: non-scaling-stroke;
          filter: blur(5px) drop-shadow(0 0 24px rgba(59, 130, 246, 0.42));
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
          width: 3px;
          height: clamp(52px, 7vh, 78px);
          transform: translate(-50%, -50%) rotate(var(--beam-angle)) scaleY(calc(1 + var(--beam-energy) * 0.42));
          transform-origin: center;
          border-radius: 999px;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(59, 130, 246, 0.28) 28%,
            rgba(59, 130, 246, 0.88) 68%,
            rgba(219, 234, 254, 0.98) 83%,
            transparent 100%
          );
          filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.9));
          opacity: 0;
          pointer-events: none;
          will-change: top, left, transform, opacity;
        }
        .workflow-beam::before {
          content: '';
          position: absolute;
          inset: 8% 50%;
          width: 24px;
          transform: translateX(-50%);
          border-radius: 999px;
          background: inherit;
          filter: blur(11px);
          opacity: calc(0.3 + var(--beam-energy) * 0.48);
        }
        .workflow-beam::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 82%;
          width: 7px;
          height: 7px;
          transform: translate(-50%, -50%);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.98);
          box-shadow:
            0 0 5px rgba(255, 255, 255, 0.95),
            0 0 14px rgba(147, 197, 253, 0.95),
            0 0 30px rgba(59, 130, 246, 0.72);
        }
        .workflow-beam[data-direction='up'] {
          background: linear-gradient(
            to top,
            transparent 0%,
            rgba(59, 130, 246, 0.28) 28%,
            rgba(59, 130, 246, 0.88) 68%,
            rgba(219, 234, 254, 0.98) 83%,
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
            border-color: rgba(59, 130, 246, 0.24);
            background-color: hsl(var(--background) / 0.92);
            box-shadow:
              0 24px 58px -38px rgba(0, 0, 0, 0.72),
              0 0 0 1px rgba(59, 130, 246, 0.035),
              0 10px 36px -28px rgba(59, 130, 246, 0.42);
          }
          .workflow-card:hover .workflow-card-check {
            background-color: rgba(59, 130, 246, 0.16);
            box-shadow: 0 0 14px rgba(59, 130, 246, 0.18);
          }
          .workflow-step:hover .workflow-node {
            border-color: rgba(59, 130, 246, 0.48);
            box-shadow:
              0 0 0 6px hsl(var(--background)),
              0 0 32px rgba(59, 130, 246, 0.34);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .workflow-beam,
          .workflow-beam-path,
          .workflow-beam-path-glow {
            display: none;
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

        /* ---------- Interactive product workflow ---------- */
        .flow-orbit-track,
        .flow-orbit-progress {
          fill: none;
          stroke-linejoin: round;
          vector-effect: non-scaling-stroke;
        }
        .flow-orbit-track {
          stroke: hsl(var(--border));
          stroke-width: 1.25;
        }
        .flow-orbit-progress {
          stroke: rgb(59 130 246);
          stroke-width: 2.5;
          stroke-linecap: round;
        }
        .flow-orbit-progress-glow {
          fill: none;
          stroke: rgb(59 130 246 / 0.16);
          stroke-width: 9;
          stroke-linecap: round;
          stroke-linejoin: round;
          vector-effect: non-scaling-stroke;
        }
        .flow-orbit-marker {
          fill: rgb(255 255 255);
          stroke: rgb(59 130 246);
          stroke-width: 3;
          filter: drop-shadow(0 0 8px rgb(59 130 246 / 0.95));
        }
        .flow-orbit-pulse {
          fill: rgb(59 130 246 / 0.16);
          stroke: rgb(59 130 246 / 0.26);
          stroke-width: 1;
          animation: flow-orbit-pulse 2.2s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .flow-node {
          position: absolute;
          transform: translate(-50%, -50%);
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
        @keyframes flow-orbit-pulse {
          0%, 100% { opacity: 0.48; transform: scale(0.82); }
          50% { opacity: 1; transform: scale(1.18); }
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
        }
        @media (prefers-reduced-motion: reduce) {
          .flow-active-card { animation: none; }
          .flow-orbit-marker,
          .flow-orbit-pulse { animation: none; }
          .flow-artifact { opacity: 1; animation: none; }
        }
      `}</style>

      <div className="font-sans-dm relative flex min-h-svh w-full flex-col overflow-x-clip">
        {/* Background layer */}
        <div
          ref={ringRef}
          className="absolute inset-0 flex justify-center overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative max-h-[953px] w-full">
            <Image
              src="/halo.png"
              alt="Blue halo background behind the Squid Agent app builder"
              width={2392}
              height={1992}
              className={`object-cover object-top mix-blend-screen transition-[opacity,transform] duration-700 ease-out ${
                isHoveringRing
                  ? "scale-[1.01] opacity-70 dark:opacity-15"
                  : "scale-100 opacity-55 dark:opacity-10"
              }`}
              priority
            />
            <div
              className="pointer-events-none absolute inset-0 transition-opacity duration-500"
              style={{
                background: isHoveringRing
                  ? `radial-gradient(circle 500px at ${smoothMousePosition.x}% ${smoothMousePosition.y}%, rgba(59, 130, 246, 0.07) 0%, transparent 65%),
                     radial-gradient(circle 250px at ${smoothMousePosition.x}% ${smoothMousePosition.y}%, rgba(99, 102, 241, 0.09) 0%, transparent 55%)`
                  : "none",
                opacity: isHoveringRing ? 1 : 0,
              }}
            />
          </div>
        </div>

        <div className="isolate flex min-h-svh flex-col">
          <Header onHelpClick={() => setShowHelpPanel(true)} />

          <div className="mt-8 flex flex-1 flex-col items-center px-4 pb-4 sm:mt-20 sm:pb-0 lg:mt-24">
            {/* Hero text */}
            <div className="flex w-full flex-col items-center gap-3 sm:gap-4 lg:gap-5">
              <div className="animate-fade-up">
                <span className="info-pill">
                  From idea to shipped React app
                </span>
              </div>

              <h1 className="animate-fade-up-1 w-full text-center font-display tracking-tight text-foreground">
                <span className="block text-[2.45rem] leading-[1.04] sm:text-5xl md:text-6xl lg:text-[4.5rem]">
                  Turn ideas
                </span>
                <span className="shimmer-text mt-0.5 block text-[2.45rem] leading-[1.04] sm:text-5xl md:text-6xl lg:text-[4.5rem]">
                  into apps
                </span>
              </h1>

              <p className="animate-fade-up-2 max-w-lg text-center text-sm leading-relaxed text-muted-foreground/75 sm:text-base">
                Research the web. Approve the plan. Build and ship. <br />
                <span className="text-foreground/60">
                  Ship React code you own.
                </span>
              </p>

              <ul
                className="animate-fade-up-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1 text-xs font-medium text-muted-foreground sm:gap-x-6"
                aria-label="Squid Agent product guarantees"
              >
                <li className="flex items-center gap-1.5">
                  <ShieldCheck
                    className="size-3.5 text-blue-500"
                    aria-hidden="true"
                  />
                  Verified builds
                </li>
                <li className="flex items-center gap-1.5">
                  <Box
                    className="size-3.5 text-blue-500"
                    aria-hidden="true"
                  />
                  Portable source
                </li>
                <li className="flex items-center gap-1.5">
                  <Coins
                    className="size-3.5 text-blue-500"
                    aria-hidden="true"
                  />
                  Transparent credits
                </li>
              </ul>
            </div>

            {/* Main form */}
            <form
              id="builder"
              className="animate-fade-up-3 relative w-full max-w-2xl pt-5 sm:pt-7 lg:pt-10"
              action={async (formData) => {
                setIsCheckingEligibility(true);
                const currentModel = (formData.get("model") as string) || model;

                // Require authentication before allowing chat creation
                const session = await authClient.getSession();
                if (!session.data) {
                  toast.error("Please sign in to create a project");
                  router.push("/sign-in?callbackUrl=/");
                  setIsCheckingEligibility(false);
                  return;
                }

                try {
                  const checkResponse = await fetch(
                    `/api/user/can-create-project?model=${encodeURIComponent(currentModel)}`,
                  );
                  if (checkResponse.ok) {
                    const eligibility = await checkResponse.json();
                    if (!eligibility.canCreate) {
                      if (eligibility.error === "PROJECT_LIMIT_REACHED") {
                        showProjectLimitPricing(
                          eligibility.projectLimit ?? FREE_PROJECT_LIMIT,
                        );
                        setIsCheckingEligibility(false);
                        return;
                      }

                      const cost =
                        eligibility.modelCost ||
                        getModelCreditHoldCost(currentModel);
                      toast.error(
                        `This model costs ${cost} credit${cost === 1 ? "" : "s"}. You have ${eligibility.credits}. Buy more credits to continue.`,
                      );
                      setShowPricingModal(true);
                      setIsCheckingEligibility(false);
                      return;
                    }
                  }
                } catch (error) {
                  console.error("Error checking eligibility:", error);
                }
                setIsCheckingEligibility(false);

                startTransition(async () => {
                  try {
                    const { prompt, model, quality } =
                      Object.fromEntries(formData);
                    assert.ok(typeof prompt === "string");
                    assert.ok(typeof model === "string");
                    assert.ok(quality === "high" || quality === "low");

                    const { chatId, lastMessageId } =
                      await createChatMutation.mutateAsync({
                        prompt,
                        model,
                        quality,
                        screenshotUrl,
                        screenshotData,
                        providerIds: selectedProviderIds,
                      });

                    plausible("Project Created", {
                      props: {
                        source: "homepage",
                        planMode: quality === "high",
                        hasScreenshot: Boolean(screenshotData || screenshotUrl),
                        timeToFirstPromptMs: promptStartedAtRef.current
                          ? Date.now() - promptStartedAtRef.current
                          : 0,
                      },
                    });

                    const streamPromise = fetchCompletionStream({
                      messageId: lastMessageId,
                      model,
                      screenshotData,
                    });

                    startTransition(() => {
                      setStreamPromise(streamPromise);
                      router.push(`/chats/${chatId}`);
                    });
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
                  }
                });
              }}
            >
              <Fieldset className="min-w-0">
                {/* Compose box */}
                <div className="compose-box w-full">
                  <div className="compose-box-inner relative w-full pb-16 shadow-lg shadow-black/5 sm:pb-11">
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

                    {/* Textarea */}
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
                            props: { source: "homepage", method: "typing" },
                          });
                        }
                        setPrompt(e.target.value);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          const target = event.target;
                          if (!(target instanceof HTMLTextAreaElement)) return;
                          target.closest("form")?.requestSubmit();
                        }
                      }}
                    />

                    {/* Toolbar */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 px-3 pb-3 pt-1">
                      {/* Left controls */}
                      <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
                        {/* Model selector — premium trigger */}
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
                                  {currentModelOption?.label ?? "Select model"}
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
                                  Swap any time — cost updates instantly
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
                                          label: "Efficient & Advanced Models",
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
                          aria-label="Plan mode"
                          title="Plan the project structure before building"
                          className={`plan-mode-toggle ${quality === "high" ? "is-active" : ""}`}
                        >
                          <Sparkles className="size-3" aria-hidden="true" />
                          <span className="hidden sm:inline">Plan mode</span>
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

                {/* Suggested prompts */}
                <div className="mt-4 flex w-full flex-wrap justify-center gap-2 sm:mt-5">
                  {SUGGESTED_PROMPTS.map((v) => (
                    <button
                      key={v.title}
                      type="button"
                      onClick={() => {
                        setStarterPrompt(v.description, v.title);
                      }}
                      className="pill-chip"
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
                {/* URL section */}
                <div className="mb-6 mt-6 sm:mb-14 sm:mt-8">
                  <div className="or-divider mb-5">or clone a site</div>

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

          <HomepageAnswerSection />
          <HomepageLandingPagesSection />
          <AiBuilderFeatureComparison variant="homepage" />
          <BuiltWithSquidSection />
          <HomepageFaqSection />
          <HoverBrandLogo />

          <HomepageFlowSection />
          <LandingMacbookSection />
          <Footer showPageLinks />
        </div>

        <PricingModal
          open={showPricingModal}
          onOpenChange={setShowPricingModal}
          remainingCredits={userCredits}
          isAuthenticated={isAuthenticated}
          currentTier={currentTier}
        />
        <HelpPanel
          isOpen={showHelpPanel}
          onClose={() => setShowHelpPanel(false)}
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
  const momentumTarget = useMotionValue(0);
  const momentumSpring = useSpring(momentumTarget, {
    stiffness: 240,
    damping: 26,
    mass: 0.62,
    restDelta: 0.04,
    restSpeed: 0.04,
  });

  useEffect(() => {
    const beam = workflowBeamRef.current;
    const beamPath = workflowBeamPathRef.current;
    const beamGlowPath = workflowBeamGlowPathRef.current;
    const beamMask = workflowBeamMaskRef.current;
    const rail = beam?.parentElement;
    if (!beam || !beamPath || !beamGlowPath || !beamMask || !rail) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    let animationFrame: number | null = null;
    let settleTimeout: number | null = null;
    let lastScrollY = window.scrollY;
    let velocity = 0;
    let direction: "up" | "down" = "down";
    const zigzagPoints = [
      { progress: 0, offset: 0 },
      { progress: 0.125, offset: -16 },
      { progress: 0.375, offset: 16 },
      { progress: 0.625, offset: -16 },
      { progress: 0.875, offset: 16 },
      { progress: 1, offset: 0 },
    ] as const;

    const getProgress = () => {
      const railRect = rail.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      return Math.min(
        Math.max(
          (viewportCenter - railRect.top) / Math.max(railRect.height, 1),
          0,
        ),
        1,
      );
    };

    const getPathMetrics = (progress: number, railHeight: number) => {
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
    };

    let beamProgress = getProgress();

    const animateBeam = () => {
      const railRect = rail.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const isCenteredOnRail =
        railRect.top <= viewportCenter && railRect.bottom >= viewportCenter;

      velocity *= 0.86;
      const momentumOffset = momentumSpring.get();
      beamProgress = Math.min(
        Math.max(
          getProgress() + momentumOffset / Math.max(railRect.height, 1),
          0,
        ),
        1,
      );

      const energy = Math.min(Math.abs(velocity) / 42, 1);
      const pathMetrics = getPathMetrics(beamProgress, railRect.height);
      const beamLength = 10 + energy * 7;
      const beamOpacity = isCenteredOnRail ? `${0.58 + energy * 0.3}` : "0";
      const glowOpacity = isCenteredOnRail ? `${0.3 + energy * 0.3}` : "0";
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
      beam.dataset.direction = direction;
      beamMask.setAttribute(
        "y",
        `${(beamProgress * 100 - beamLength / 2).toFixed(3)}`,
      );
      beamMask.setAttribute("height", beamLength.toFixed(3));
      beamMask.setAttribute(
        "fill",
        `url(#workflow-beam-mask-gradient-${direction})`,
      );
      beamPath.style.strokeWidth = `${(2.4 + energy * 1.8).toFixed(3)}px`;
      beamPath.style.opacity = beamOpacity;
      beamGlowPath.style.strokeWidth = `${(10 + energy * 5).toFixed(3)}px`;
      beamGlowPath.style.opacity = glowOpacity;

      if (Math.abs(velocity) > 0.08) {
        animationFrame = window.requestAnimationFrame(animateBeam);
      } else {
        animationFrame = null;
      }
    };

    const requestBeamFrame = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(animateBeam);
      }
    };

    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      const delta = nextScrollY - lastScrollY;
      lastScrollY = nextScrollY;
      if (Math.abs(delta) > 0.5) {
        direction = delta < 0 ? "up" : "down";
      }
      velocity = Math.min(Math.max(velocity + delta * 0.34, -72), 72);
      momentumTarget.set(Math.min(Math.max(velocity * 0.24, -17), 17));
      if (settleTimeout !== null) {
        window.clearTimeout(settleTimeout);
      }
      settleTimeout = window.setTimeout(() => {
        momentumTarget.set(0);
      }, 72);
      requestBeamFrame();
    };

    const handleResize = () => {
      beamProgress = getProgress();
      requestBeamFrame();
    };

    beam.dataset.direction = "down";
    beam.style.setProperty("--beam-position", `${beamProgress * 100}%`);
    const unsubscribeMomentum = momentumSpring.on("change", requestBeamFrame);
    requestBeamFrame();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      unsubscribeMomentum();
      if (settleTimeout !== null) {
        window.clearTimeout(settleTimeout);
      }
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [momentumSpring, momentumTarget]);

  return (
    <section
      ref={workflowSectionRef}
      aria-labelledby="squid-agent-overview"
      className="relative z-10 w-full px-4 pb-16 pt-4 sm:px-6 sm:pb-24 sm:pt-6"
    >
      <div className="mx-auto w-full max-w-6xl border-y border-border/60 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono-jb text-[11px] font-medium uppercase tracking-[0.16em] text-blue-500">
            One connected workflow
          </p>
          <h2
            id="squid-agent-overview"
            className="mt-4 font-display text-4xl leading-[0.98] tracking-normal text-foreground sm:text-5xl"
          >
            From uncertain idea to shipped app.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Squid Agent brings research, decisions, code, quality, recovery, and
            deployment into one inspectable workflow. You approve the
            consequential choices and own every artifact it produces.
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
                d="M24 0 L8 12.5 L40 37.5 L8 62.5 L40 87.5 L24 100"
              />
              <path
                className="workflow-rail-line"
                d="M24 0 L8 12.5 L40 37.5 L8 62.5 L40 87.5 L24 100"
              />
              <path
                ref={workflowBeamGlowPathRef}
                className="workflow-beam-path-glow"
                d="M24 0 L8 12.5 L40 37.5 L8 62.5 L40 87.5 L24 100"
                mask="url(#workflow-beam-mask)"
              />
              <path
                ref={workflowBeamPathRef}
                className="workflow-beam-path"
                d="M24 0 L8 12.5 L40 37.5 L8 62.5 L40 87.5 L24 100"
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

        <div className="mx-auto mt-20 max-w-5xl rounded-[28px] border border-blue-500/15 bg-blue-500/[0.035] p-5 sm:p-7">
          <div className="grid gap-6 md:grid-cols-3 md:gap-0">
            {homepageControlPromises.map((promise, index) => (
              <article
                key={promise.label}
                className={`px-1 md:px-6 ${index > 0 ? "border-t border-border/60 pt-6 md:border-l md:border-t-0 md:pt-0" : ""}`}
              >
                <p className="font-mono-jb text-[10px] font-medium uppercase tracking-[0.16em] text-blue-500">
                  {promise.label}
                </p>
                <h3 className="mt-3 text-lg font-semibold tracking-normal text-foreground">
                  {promise.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {promise.body}
                </p>
              </article>
            ))}
          </div>
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
        <p className="font-mono-jb text-[10px] font-medium uppercase tracking-[0.16em] text-blue-500">
          {block.stage} / {block.label}
        </p>
        <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
      </div>
      <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-normal text-foreground">
        {block.question}
      </h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {block.body}
      </p>
      <ul
        className="mt-5 grid gap-2.5"
        aria-label={`${block.label} capabilities`}
      >
        {block.proofs.map((proof) => (
          <li
            key={proof}
            className="flex items-start gap-2.5 text-sm leading-5 text-foreground/80"
          >
            <span className="workflow-card-check mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
              <CheckIcon className="size-2.5" aria-hidden="true" />
            </span>
            {proof}
          </li>
        ))}
      </ul>
    </article>
  );
}

function HomepageFlowSection() {
  const [activeStep, setActiveStep] = useState(0);
  const orbitProgressRef = useRef(0);
  const orbitAnimationFrameRef = useRef<number | null>(null);
  const [orbitAnimation, setOrbitAnimation] = useState<{
    progress: number;
    x: number;
    y: number;
  }>({
    progress: 0,
    x: homepageFlowOrbitPoints[0].x,
    y: homepageFlowOrbitPoints[0].y,
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
    if (orbitAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(orbitAnimationFrameRef.current);
    }

    const startProgress = orbitProgressRef.current;
    const targetProgress = homepageFlowOrbitProgress[activeStep];
    const progressDelta = targetProgress - startProgress;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const updateOrbit = (progress: number) => {
      const point = getHomepageFlowPosition(progress);
      orbitProgressRef.current = progress;
      setOrbitAnimation({ progress, x: point.x, y: point.y });
    };

    if (reducedMotion || Math.abs(progressDelta) < 0.01) {
      updateOrbit(targetProgress);
      return;
    }

    const startedAt = performance.now();
    const duration = Math.min(900, 360 + Math.abs(progressDelta) * 6);
    const animateOrbit = (now: number) => {
      const elapsed = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      updateOrbit(startProgress + progressDelta * eased);

      if (elapsed < 1) {
        orbitAnimationFrameRef.current =
          window.requestAnimationFrame(animateOrbit);
      } else {
        orbitAnimationFrameRef.current = null;
      }
    };

    orbitAnimationFrameRef.current = window.requestAnimationFrame(animateOrbit);

    return () => {
      if (orbitAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(orbitAnimationFrameRef.current);
        orbitAnimationFrameRef.current = null;
      }
    };
  }, [activeStep]);

  return (
    <section
      aria-labelledby="squid-agent-overview"
      className="relative z-10 w-full px-4 pb-16 pt-4 sm:px-6 sm:pb-24 sm:pt-6"
    >
      <div className="mx-auto w-full max-w-6xl border-t border-border/60 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono-jb text-[11px] font-medium uppercase tracking-[0.16em] text-blue-500">
            One connected workflow
          </p>
          <h2
            id="squid-agent-overview"
            className="mt-4 font-display text-4xl leading-[0.98] tracking-normal text-foreground sm:text-5xl"
          >
            Your idea keeps moving. You stay in control.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Move from a rough idea to a shipped app without losing the context,
            decisions, or code along the way. Select a stage to see what Squid
            handles—and where you stay in control.
          </p>
        </div>

        <div className="flow-stage relative mx-auto mt-10 min-h-[470px] max-w-5xl overflow-visible px-4 py-10 sm:mt-12 md:grid md:place-items-center md:px-12">
          <svg
            className="flow-orbit pointer-events-none absolute inset-[30px_3%_20px] hidden h-[calc(100%-50px)] w-[94%] overflow-visible md:block"
            viewBox="0 0 720 280"
            preserveAspectRatio="none"
            role="img"
            aria-label={`Workflow progress: step ${activeStep + 1} of ${homepageFlowSteps.length}`}
          >
            <path
              className="flow-orbit-track"
              pathLength="100"
              d={homepageFlowOrbitPath}
            />
            <path
              className="flow-orbit-progress-glow"
              d={getHomepageFlowPartialPath(orbitAnimation.progress)}
            />
            <path
              className="flow-orbit-progress"
              d={getHomepageFlowPartialPath(orbitAnimation.progress)}
            />
            <circle
              className="flow-orbit-pulse"
              cx={orbitAnimation.x}
              cy={orbitAnimation.y}
              r="11"
            />
            <circle
              className="flow-orbit-marker"
              cx={orbitAnimation.x}
              cy={orbitAnimation.y}
              r="4.5"
            />
          </svg>

          <nav
            className="flow-nodes relative z-10 mb-4 flex max-w-full flex-wrap justify-center gap-2 md:absolute md:inset-[30px_3%_20px] md:mb-0 md:block md:max-w-none md:overflow-visible"
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
              const StepIcon = flowStep.icon;
              return (
                <button
                  key={flowStep.label}
                  type="button"
                  className="flow-node inline-flex shrink-0 items-center gap-2 rounded-xl border border-border/70 bg-background/95 px-2.5 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur transition-[color,border-color,background-color,box-shadow] hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-foreground hover:shadow-[0_0_22px_-8px_rgba(59,130,246,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 data-[active=true]:border-blue-500/30 data-[active=true]:bg-blue-500 data-[active=true]:text-white data-[active=true]:shadow-md data-[active=true]:shadow-blue-500/20 sm:px-3 sm:text-sm"
                  data-active={index === activeStep}
                  aria-pressed={index === activeStep}
                  onClick={() => setActiveStep(index)}
                  style={{
                    left: `${(homepageFlowOrbitPoints[index].x / 720) * 100}%`,
                    top: `${(homepageFlowOrbitPoints[index].y / 280) * 100}%`,
                  }}
                >
                  <StepIcon className="size-4" aria-hidden="true" />
                  {flowStep.label}
                </button>
              );
            })}
          </nav>

          <article
            key={activeStep}
            className="flow-active-card relative z-[2] mx-auto flex min-h-[290px] w-full max-w-md flex-col items-center justify-center rounded-[26px] border border-border/70 bg-background/90 p-6 text-center shadow-[0_28px_80px_-46px_rgba(0,0,0,0.7)] backdrop-blur sm:p-8"
            aria-live="polite"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/25">
              <ActiveIcon className="size-5" aria-hidden="true" />
            </span>
            <p className="font-mono-jb mt-5 text-[10px] font-medium uppercase tracking-[0.16em] text-blue-500">
              {step.eyebrow}
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-normal text-foreground">
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
  return (
    <section
      aria-labelledby="squid-agent-faq"
      className="relative z-10 w-full px-4 pb-16 sm:px-6 sm:pb-24"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-8 border-t border-border/60 pt-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:pt-16">
        <div className="mx-auto max-w-xl text-center lg:sticky lg:top-8 lg:mx-0 lg:self-start lg:text-left">
          <p className="font-mono-jb text-[11px] font-medium uppercase tracking-[0.16em] text-blue-500">
            FAQ
          </p>
          <h2
            id="squid-agent-faq"
            className="mt-4 font-display text-4xl leading-[0.98] tracking-normal text-foreground sm:text-5xl"
          >
            Know what happens from prompt to production.
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Research, planning, iteration, quality, recovery, integrations,
            deployment, ownership, and credits—without hidden steps.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {homepageFaq.map((item) => (
            <article
              key={item.question}
              className="rounded-[22px] border border-border/70 bg-background/80 p-5 shadow-[0_16px_42px_-34px_rgba(0,0,0,0.55)] backdrop-blur"
            >
              <h3 className="text-lg font-semibold leading-snug tracking-normal text-foreground">
                {item.question}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BuiltWithSquidSection() {
  return (
    <section
      id="built-with-squid"
      className="relative z-10 w-full px-4 pb-16 pt-4 sm:px-6 sm:pb-24 sm:pt-8"
    >
      <div className="mx-auto w-full max-w-6xl border-y border-border/70 py-12 sm:py-16">
        <div className="grid gap-6 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:items-end">
          <div>
            <h2 className="max-w-2xl font-display text-4xl leading-[0.98] tracking-tight text-foreground sm:text-5xl">
              Real projects shipped from prompts.
            </h2>
          </div>
          <div className="max-w-xl">
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              Explore sites and tools built with Squid. Inspect a complete
              public workspace, remix the project, or download the source and
              continue in your own stack.
            </p>
            <Link
              href="/example"
              className="mt-4 inline-flex min-h-11 items-center gap-2 whitespace-nowrap text-sm font-medium text-blue-500 underline decoration-blue-500/30 underline-offset-4 transition-colors hover:decoration-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Open the no-signup example workspace
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-x-6 gap-y-12 lg:grid-cols-12">
          {BUILT_WITH_SQUID_PROJECTS.map((project) => (
            <figure
              key={project.href}
              className="group min-w-0 border-t border-border/70 pt-4 lg:col-span-6"
            >
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`View ${project.name}`}
                className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4"
              >
                <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-muted/40">
                  {project.imageSrc ? (
                    <Image
                      src={project.imageSrc}
                      alt={
                        project.imageAlt ??
                        `${project.name} project preview built with Squid`
                      }
                      fill
                      sizes="(min-width: 1024px) 58vw, 100vw"
                      className="object-cover object-top"
                    />
                  ) : (
                    <p className="px-6 text-center text-sm text-muted-foreground">
                      Preview unavailable
                    </p>
                  )}
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
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
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

function LandingMacbookSection() {
  return (
    <section
      aria-labelledby="macbook-example-heading"
      className="relative z-10 w-full px-4 pb-16 sm:px-6 sm:pb-24"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-8 border-t border-border/70 pt-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:pt-16">
        <div className="max-w-xl">
          <h2
            id="macbook-example-heading"
            className="font-display text-4xl leading-[0.98] tracking-tight text-foreground sm:text-5xl"
          >
            Open the build. Inspect every layer.
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            The public workspace exposes the original prompt, approved plan,
            interactive preview, generated files, and quality report without
            requiring an account or credits.
          </p>
          <Link
            href="/example"
            className="mt-6 inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl bg-blue-500 px-5 text-sm font-semibold text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Explore the live example
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>

        <div className="relative flex h-[260px] min-w-0 items-center justify-center sm:h-[320px]">
          <div className="relative h-[220px] w-full max-w-md">
            <Macbook
              className="scale-125 sm:scale-150"
              screenImageSrc="/macbook-squid-home.webp"
              screenImageAlt="Squid Agent home screen"
            />
          </div>
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
  return (
    <section
      aria-labelledby="homepage-landing-pages-heading"
      className="relative z-10 w-full px-4 pb-16 sm:px-6 sm:pb-24"
      data-testid="homepage-landing-pages"
      id="homepage-landing-pages"
    >
      <div className="mx-auto w-full max-w-6xl border-y border-border/70 py-12 sm:py-16">
        <div className="grid gap-6 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:items-end">
          <div>
            <p className="font-mono-jb text-[11px] font-medium uppercase tracking-[0.16em] text-blue-500">
              New landing pages
            </p>
            <h2
              id="homepage-landing-pages-heading"
              className="mt-4 max-w-2xl font-display text-4xl leading-[0.98] tracking-tight text-foreground sm:text-5xl"
            >
              Pages with a point of view.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Open the finished pages to experience the hero, motion, and
            responsive layout in full. Each one is a working example of how a
            visual idea becomes a real React landing page.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {HOMEPAGE_LANDING_PAGES.map((landing) => (
            <Link
              key={landing.href}
              href={landing.href}
              className="group min-w-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4"
            >
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-border/80 bg-muted/40 shadow-[0_18px_50px_-38px_rgba(0,0,0,0.7)]">
                <Image
                  src={landing.imageSrc}
                  alt={landing.imageAlt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.025]"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-80"
                  aria-hidden="true"
                />
              </div>

              <div className="pt-5">
                <p className="text-xs font-medium text-blue-500">
                  {landing.category}
                </p>
                <div className="mt-2 flex items-start justify-between gap-4">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    {landing.name}
                  </h3>
                  <span
                    className="relative mr-2 mt-1 h-5 w-14 shrink-0 text-muted-foreground transition-colors duration-300 group-hover:text-foreground motion-reduce:transition-none"
                    aria-hidden="true"
                  >
                    <span className="absolute left-0 top-1/2 h-px w-8 -translate-y-1/2 bg-current transition-[width,height] duration-300 ease-out group-hover:h-0.5 group-hover:w-12 motion-reduce:transition-none" />
                    <span className="absolute left-6 top-1/2 size-2 -translate-y-1/2 rotate-45 border-r border-t border-current transition-[left,width,height,border-width] duration-300 ease-out group-hover:left-[2.625rem] group-hover:size-2.5 group-hover:border-r-2 group-hover:border-t-2 motion-reduce:transition-none" />
                  </span>
                </div>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  {landing.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export const runtime = "edge";
export const maxDuration = 60;
