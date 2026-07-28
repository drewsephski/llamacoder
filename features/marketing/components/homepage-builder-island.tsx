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
  Info,
  Lightbulb,
  Link2,
  MapIcon,
  MessageSquare,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
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
import { CreditsLoadError } from "@/features/billing/components/credits-load-error";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
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
import { createInitialTemplateValues } from "@/components/prompt-template-editor";
import {
  PORTFOLIO_PROMPT_TEMPLATE,
  PROMPT_TEMPLATES,
  isPromptTemplateReady,
  type PromptTemplate,
  type PromptTemplateValues,
} from "@/lib/prompt-templates";
import { uploadScreenshot } from "@/lib/s3-upload-client";
import {
  buildGalleryHeroImageDeck,
  type GalleryHeroImage,
} from "@/features/gallery/client/hero-image-rotation";

const ApiSelectionDialog = dynamic(() =>
  import("@/features/integrations/components/api-selection-dialog").then(
    (module) => module.ApiSelectionDialog,
  ),
);

const PROMPT_TEXTAREA_MAX_HEIGHT_PX = 360;
const PROMPT_TEXTAREA_VIEWPORT_RATIO = 0.42;
const HelpPanel = dynamic(
  () => import("@/components/help-panel").then((module) => module.HelpPanel),
  { ssr: false },
);
const OnboardingWizard = dynamic(
  () =>
    import("@/components/onboarding-wizard").then(
      (module) => module.OnboardingWizard,
    ),
  { ssr: false },
);
const PricingModal = dynamic(
  () =>
    import("@/features/billing/components/pricing-modal").then(
      (module) => module.PricingModal,
    ),
  { ssr: false },
);
const PromptBuilderModal = dynamic(
  () =>
    import("@/features/prompt-builder").then(
      (module) => module.PromptBuilderModal,
    ),
  { ssr: false },
);
const PromptTemplateEditor = dynamic(
  () =>
    import("@/components/prompt-template-editor").then(
      (module) => module.PromptTemplateEditor,
    ),
  { ssr: false },
);

const ACCEPTED_SCREENSHOT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);
const MAX_SCREENSHOT_FILE_SIZE_BYTES = 6 * 1024 * 1024;
const BUILD_LAUNCH_ANIMATION_MS = 1750;

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
  showcase: GalleryHeroImage,
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
          alt={`${popout.title} app preview`}
          fill
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
  const showcaseImagesRef = useRef<GalleryHeroImage[]>([]);
  const imageDeckRef = useRef<GalleryHeroImage[]>([]);
  const lastImageSrcRef = useRef<string | null>(null);
  const slotIndexRef = useRef(0);
  const [popouts, setPopouts] = useState<HeroPopout[]>([]);
  const [showcaseImagesReady, setShowcaseImagesReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/gallery?withThumbnails=all")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load gallery previews.");
        }
        return response.json() as Promise<{ images?: GalleryHeroImage[] }>;
      })
      .then((data) => {
        if (cancelled) return;

        showcaseImagesRef.current = (data.images ?? []).filter(
          (image): image is GalleryHeroImage =>
            typeof image.src === "string" &&
            image.src.length > 0 &&
            typeof image.alt === "string" &&
            typeof image.title === "string" &&
            typeof image.prompt === "string" &&
            image.prompt.trim().length > 0,
        );
        imageDeckRef.current = [];
        lastImageSrcRef.current = null;
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

        if (imageDeckRef.current.length === 0) {
          imageDeckRef.current = buildGalleryHeroImageDeck(
            showcaseImagesRef.current,
            lastImageSrcRef.current,
          );
        }

        const showcase = imageDeckRef.current.shift();
        if (!showcase) {
          delayForNextSpawn = randomInRange(680, 980);
          return current;
        }

        slotIndexRef.current =
          (slotSelection.slotIndex + 1) % HERO_POPOUT_SLOTS.length;
        lastImageSrcRef.current = showcase.src;
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

export function HomepageBuilderIsland({
  workflowContent,
  children,
}: {
  workflowContent: React.ReactNode;
  children: React.ReactNode;
}) {
  const { setStreamPromise } = useGenerationHandoff();
  const router = useRouter();
  const plausible = usePlausible();
  const reduceMotion = useReducedMotion();

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
  const buildButtonRef = useRef<HTMLButtonElement>(null);

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
  const buildLaunchInFlightRef = useRef(false);

  const playBuildLaunchAnimation = useCallback(async () => {
    if (buildLaunchInFlightRef.current) return false;
    if (reduceMotion) return true;

    const buildButton = buildButtonRef.current;
    if (!buildButton) return true;

    buildLaunchInFlightRef.current = true;
    buildButton.classList.remove("is-launching");
    void buildButton.offsetWidth;
    buildButton.classList.add("is-launching");

    try {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, BUILD_LAUNCH_ANIMATION_MS);
      });
      return true;
    } finally {
      buildButton.classList.remove("is-launching");
      buildLaunchInFlightRef.current = false;
    }
  }, [reduceMotion]);

  const { data: session } = useUserSession();
  const {
    data: creditsData,
    isError: creditsError,
    refetch: refetchCredits,
  } = useUserCredits(Boolean(session));
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

  const resizePromptTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const minimumHeight =
      Number.parseFloat(window.getComputedStyle(textarea).minHeight) || 90;
    const maximumHeight = Math.max(
      minimumHeight,
      Math.min(
        PROMPT_TEXTAREA_MAX_HEIGHT_PX,
        window.innerHeight * PROMPT_TEXTAREA_VIEWPORT_RATIO,
      ),
    );
    const previousHeight = textarea.getBoundingClientRect().height;

    textarea.style.height = "0px";
    const contentHeight = textarea.scrollHeight;
    const nextHeight = Math.min(
      Math.max(contentHeight, minimumHeight),
      maximumHeight,
    );

    textarea.style.height = `${previousHeight}px`;
    textarea.style.overflowY =
      contentHeight > maximumHeight ? "auto" : "hidden";

    if (Math.abs(previousHeight - nextHeight) < 1) {
      textarea.style.height = `${nextHeight}px`;
      return;
    }

    void textarea.offsetHeight;
    textarea.style.height = `${nextHeight}px`;
  }, []);

  useLayoutEffect(() => {
    resizePromptTextarea();
  }, [activeTemplate, prompt, resizePromptTextarea]);

  useEffect(() => {
    window.addEventListener("resize", resizePromptTextarea);
    return () => window.removeEventListener("resize", resizePromptTextarea);
  }, [resizePromptTextarea]);

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
      <div className="font-sans-dm relative flex min-h-svh w-full flex-col overflow-x-clip">
        <Header onHelpClick={() => setShowHelpPanel(true)} />

        <main>
          <div className="hero-shell" data-testid="hero-shell">
            <div className="hero-stage" data-testid="hero-stage">
              <HeroPopoutShowcases onSelectPrompt={handleGalleryPromptSelect} />
              {/* Hero copy */}
              <div className="hero-copy" data-hero-popout-exclude="copy">
                <h1 className="animate-fade-up">
                  <span className="hero-brand">Squid Agent</span>
                  <span className="hero-headline">
                    The AI app builder for React apps you <em>own</em>.
                  </span>
                </h1>

                <p className="hero-support animate-fade-up-1">
                  Research live sources, approve the plan, then generate,
                  verify, and export production-ready React code.
                </p>
              </div>

              {/* Main form */}
              <form
                id="builder"
                data-hero-popout-exclude="compose"
                className="animate-fade-up-2 relative z-[3] w-full max-w-2xl pt-8 sm:pt-10 lg:pt-12"
                action={async (formData) => {
                  const shouldSubmit = await playBuildLaunchAnimation();
                  if (!shouldSubmit) return;

                  setIsCheckingEligibility(true);
                  const currentModel =
                    (formData.get("model") as string) || model;
                  const submittedPrompt = prompt.trim();
                  const formQuality = formData.get("quality");
                  const submittedQuality =
                    formQuality === "high" ? "high" : "low";

                  try {
                    // Require authentication before allowing chat creation
                    const session = await authClient.getSession();
                    if (!session.data) {
                      if (!submittedPrompt) {
                        toast.error(
                          "Enter a prompt before creating an account",
                        );
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
                      <div className="compose-box-inner relative w-full">
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
                                  alt="Uploaded app design reference"
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
                            <div
                              key="freeform"
                              className="compose-prompt-enter"
                            >
                              <Textarea
                                ref={textareaRef}
                                placeholder="Build me a budgeting app..."
                                required
                                name="prompt"
                                className="min-h-[118px] resize-none overflow-y-hidden border-0 bg-transparent px-4 pt-4 text-base leading-relaxed transition-[height] duration-200 ease-out placeholder:text-muted-foreground/40 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:min-h-[90px] sm:text-[15px]"
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
                                  if (
                                    event.key === "Enter" &&
                                    !event.shiftKey
                                  ) {
                                    event.preventDefault();
                                    const target = event.target;
                                    if (
                                      !(target instanceof HTMLTextAreaElement)
                                    )
                                      return;
                                    target.closest("form")?.requestSubmit();
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Toolbar */}
                        <div className="compose-toolbar">
                          {/* Left controls */}
                          <div className="compose-toolbar-leading">
                            {/* Model selector: premium trigger */}
                            <Select.Root
                              name="model"
                              open={isModelSelectOpen}
                              value={model}
                              onOpenChange={handleModelSelectOpenChange}
                              onValueChange={handleModelChange}
                            >
                              <Select.Trigger
                                aria-label="Select AI model"
                                className="model-trigger"
                              >
                                <span className="model-status-dot" />
                                <Select.Value aria-label={model} asChild>
                                  <span className="model-trigger-value flex min-w-0 items-center gap-1.5">
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
                                              models:
                                                modelOptionsByGroup.premium,
                                            },
                                          ]
                                        : []),
                                    ].map((group) => (
                                      <Select.Group key={group.label}>
                                        <Select.Label className="px-2 pb-0.5 pt-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                                          {group.label}
                                        </Select.Label>
                                        {group.models.map((m) => {
                                          const isLocked = !canUseModel(
                                            m.value,
                                          );
                                          const creditRange =
                                            getModelCreditRange(m.value);
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

                            {/* Plan mode */}
                            <input
                              type="hidden"
                              name="quality"
                              value={quality}
                            />
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
                                  ? "Plan mode enabled"
                                  : "Plan mode disabled"
                              }
                              title={
                                quality === "high"
                                  ? "Ask clarifying questions and approve a plan before code generation (recommended)"
                                  : "Skip planning and generate code immediately"
                              }
                              className={`plan-mode-toggle ${quality === "high" ? "is-active" : ""}`}
                            >
                              <Sparkles className="size-3" aria-hidden="true" />
                              <span>Plan mode</span>
                            </button>

                            <div className="toolbar-divider mx-0.5 sm:mx-1" />
                          </div>

                          <div className="compose-toolbar-actions">
                            {/* Upload */}
                            <div className="compose-upload-control flex items-center gap-0.5">
                              <label
                                htmlFor="screenshot"
                                className="upload-btn"
                                aria-label="Attach image"
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

                            {/* Submit button */}
                            <Button
                              ref={buildButtonRef}
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
                              <Spinner
                                loading={isCheckingEligibility || isPending}
                              >
                                <span
                                  className="build-launch-stage"
                                  aria-hidden="true"
                                >
                                  <ArrowRightIcon className="build-launch-arrow build-launch-arrow-trail build-launch-arrow-trail-one" />
                                  <ArrowRightIcon className="build-launch-arrow build-launch-arrow-trail build-launch-arrow-trail-two" />
                                  <ArrowRightIcon className="build-launch-arrow build-launch-arrow-main" />
                                </span>
                              </Spinner>
                            </Button>
                          </div>
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

                  <div className="compose-secondary-actions">
                    <button
                      type="button"
                      onClick={() => setShowPromptBuilder(true)}
                      className="prompt-enhance-action"
                    >
                      <WandSparkles className="size-3.5" aria-hidden="true" />
                      <span>Prompt Enhancer</span>
                    </button>
                    <ApiSelectionDialog
                      selectedProviderIds={selectedProviderIds}
                      onSelectionChange={setSelectedProviderIds}
                      standaloneTrigger
                    />
                  </div>

                  {/* Prompt starters */}
                  <div className="starter-groups" aria-label="Prompt starters">
                    <div className="starter-group">
                      <span className="starter-label">Quick starts:</span>
                      <div className="starter-rail">
                        {SUGGESTED_PROMPTS.map((v) => (
                          <button
                            key={v.title}
                            type="button"
                            onClick={() => {
                              setStarterPrompt(v.description, v.title);
                            }}
                            className="starter-link"
                          >
                            {v.title}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="starter-group">
                      <span className="starter-label">Customize:</span>
                      <div className="starter-rail">
                        {PROMPT_TEMPLATES.map((template) => (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => activateTemplate(template)}
                            className={`starter-link ${activeTemplate?.id === template.id ? "is-active" : ""}`}
                            aria-pressed={activeTemplate?.id === template.id}
                          >
                            {template.shortLabel}
                          </button>
                        ))}
                      </div>
                    </div>
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

          {workflowContent}
          <HomepageAnswerSection />
          {children}
          <HomepageFlowSection />
        </main>

        {showPricingModal ? (
          <PricingModal
            open
            onOpenChange={setShowPricingModal}
            remainingCredits={userCredits}
            isAuthenticated={isAuthenticated}
            currentTier={currentTier ?? "free"}
          />
        ) : null}
        {showHelpPanel ? (
          <HelpPanel isOpen onClose={() => setShowHelpPanel(false)} />
        ) : null}
        {showOnboardingWizard ? (
          <OnboardingWizard
            isOpen
            onClose={() => setShowOnboardingWizard(false)}
            onComplete={() => {
              window.requestAnimationFrame(() => {
                textareaRef.current?.focus();
              });
            }}
          />
        ) : null}
        {showPromptBuilder ? (
          <PromptBuilderModal
            open
            onOpenChange={setShowPromptBuilder}
            onUsePrompt={(enhanced) => {
              setPrompt(enhanced);
              if (textareaRef.current) {
                textareaRef.current.focus();
              }
            }}
          />
        ) : null}
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
                            ? "border-blue-700 bg-blue-700 text-white shadow-md shadow-blue-500/25 dark:border-blue-500 dark:bg-blue-600"
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
