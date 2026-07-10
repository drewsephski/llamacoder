/* eslint-disable @next/next/no-img-element */
"use client";

import Fieldset from "@/components/fieldset";
import ArrowRightIcon from "@/components/icons/arrow-right";
import Spinner from "@/components/spinner";
import bgImg from "@/public/halo.webp";
import * as Select from "@radix-ui/react-select";
import {
  CheckIcon,
  ChevronDownIcon,
  Coins,
  Info,
  Link2,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Header from "@/components/header";
import { useS3Upload } from "next-s3-upload";
import UploadIcon from "@/components/icons/upload-icon";
import { MODELS, SUGGESTED_PROMPTS, FREE_MODEL } from "@/lib/constants";
import { PricingModal } from "@/features/billing/components/pricing-modal";
import { OnboardingModal } from "@/components/onboarding-modal";
import { HelpPanel } from "@/components/help-panel";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProjectCreationFlow } from "@/features/projects/client/use-project-creation-flow";
import { useUserCredits } from "@/features/user/client/queries";
import { scrapeScreenshotResponseSchema } from "@/features/generation/contracts";
import { fetchJson } from "@/features/shared/client/http";
import { getErrorMessage } from "@/features/shared/errors";
import {
  FREE_PROJECT_LIMIT,
  canTierUseModel,
  getModelCreditRange,
} from "@/lib/billing/config";

const ACCEPTED_SCREENSHOT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);
const MAX_SCREENSHOT_FILE_SIZE_BYTES = 6 * 1024 * 1024;
function getCreditBadgeClass(group: (typeof MODELS)[number]["group"]) {
  if (group === "free") return "text-emerald-500 dark:text-emerald-400";
  if (group === "premium") return "text-amber-500 dark:text-yellow-400";
  return "text-blue-500 dark:text-blue-400";
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

function PointerGlow() {
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const currentRef = useRef({ x: 50, y: 50 });
  const targetRef = useRef({ x: 50, y: 50 });
  const hoveringRef = useRef(false);

  const stopAnimation = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const animate = useCallback(function runAnimation() {
    const current = currentRef.current;
    const target = targetRef.current;
    const next = {
      x: current.x + (target.x - current.x) * 0.12,
      y: current.y + (target.y - current.y) * 0.12,
    };
    const settled =
      Math.abs(target.x - next.x) < 0.05 && Math.abs(target.y - next.y) < 0.05;

    currentRef.current = settled ? target : next;
    glowRef.current?.style.setProperty(
      "background",
      `radial-gradient(circle 500px at ${currentRef.current.x}% ${currentRef.current.y}%, rgba(59, 130, 246, 0.07) 0%, transparent 65%), radial-gradient(circle 250px at ${currentRef.current.x}% ${currentRef.current.y}%, rgba(99, 102, 241, 0.09) 0%, transparent 55%)`,
    );

    frameRef.current = settled
      ? null
      : window.requestAnimationFrame(runAnimation);
  }, []);

  const scheduleAnimation = useCallback(() => {
    if (frameRef.current === null) {
      frameRef.current = window.requestAnimationFrame(animate);
    }
  }, [animate]);

  useEffect(() => stopAnimation, [stopAnimation]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex justify-center overflow-hidden"
      onPointerMove={(event) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        targetRef.current = {
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
        };
        if (!hoveringRef.current) {
          hoveringRef.current = true;
          setIsHovering(true);
        }
        scheduleAnimation();
      }}
      onPointerLeave={() => {
        hoveringRef.current = false;
        setIsHovering(false);
        stopAnimation();
      }}
    >
      <div className="relative max-h-[953px] w-full">
        <Image
          src={bgImg}
          alt=""
          aria-hidden="true"
          className={`hidden object-cover object-top transition-all duration-700 ease-out dark:block ${
            isHovering
              ? "scale-[1.005] opacity-[0.055]"
              : "scale-100 opacity-[0.035]"
          }`}
          priority
        />
        <div
          ref={glowRef}
          className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
            isHovering ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    </div>
  );
}

export function HomepageBuilder({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(FREE_MODEL);
  const [quality, setQuality] = useState("low");
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);

  const { data: session } = useSession();
  const { data: creditsData } = useUserCredits();

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

  const openPricing = useCallback(() => setShowPricingModal(true), []);
  const handleHelpClick = useCallback(() => setShowHelpPanel(true), []);
  const showProjectLimitPricing = useCallback(
    (limit = FREE_PROJECT_LIMIT) => {
      toast.error(`You've used all ${limit} free projects.`, {
        description: "View pricing to keep building.",
        action: {
          label: "View pricing",
          onClick: openPricing,
        },
      });
      openPricing();
    },
    [openPricing],
  );
  const {
    isCheckingEligibility,
    isPending,
    submit: submitProject,
  } = useProjectCreationFlow({
    isAuthenticated,
    screenshotData,
    screenshotUrl,
    onProjectLimit: showProjectLimitPricing,
    onOpenPricing: openPricing,
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setShowOnboardingModal(true);
    }
  }, []);

  const handleModelChange = (newModel: string) => {
    if (!canUseModel(newModel)) {
      setShowPricingModal(true);
      return;
    }
    setModel(newModel);
  };

  const { uploadToS3 } = useS3Upload();

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

      uploadToS3(file)
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
      const data = await fetchJson(
        "/api/scrape-screenshot",
        scrapeScreenshotResponseSchema,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlInput.trim() }),
        },
      );
      setScreenshotData(data.screenshotData);
      setScreenshotUrl(data.url);
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
        <PointerGlow />

        <div className="isolate flex min-h-svh flex-col">
          <Header onHelpClick={handleHelpClick} />

          <div className="mt-8 flex flex-1 flex-col items-center px-4 pb-4 sm:mt-20 sm:pb-0 lg:mt-24">
            {/* Hero text */}
            <div className="flex flex-col items-center gap-3 sm:gap-4 lg:gap-5">
              <div className="animate-fade-up">
                <span className="info-pill">AI-powered code generation</span>
              </div>

              <h1 className="animate-fade-up-1 text-center font-display tracking-tight text-foreground">
                <span className="block text-[2.45rem] leading-[1.04] sm:text-5xl md:text-6xl lg:text-[4.5rem]">
                  Turn ideas
                </span>
                <span className="shimmer-text mt-0.5 block text-[2.45rem] leading-[1.04] sm:text-5xl md:text-6xl lg:text-[4.5rem]">
                  into apps
                </span>
              </h1>

              <p className="animate-fade-up-2 max-w-sm text-center text-sm leading-relaxed text-muted-foreground/75 sm:text-base">
                Describe what you want to build. <br />
                <span className="text-foreground/60">
                  We&apos;ll generate the code.
                </span>
              </p>
            </div>

            {/* Main form */}
            <form
              className="animate-fade-up-3 relative w-full max-w-2xl pt-6 sm:pt-8 lg:pt-12"
              action={submitProject}
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
                              alt="Uploaded screenshot preview"
                              src={screenshotData ?? screenshotUrl}
                              width={60}
                              height={52}
                              className="h-[52px] w-[60px] object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-background text-muted-foreground shadow ring-1 ring-border/50 transition-colors hover:text-foreground dark:bg-card"
                            onClick={clearScreenshot}
                            aria-label="Remove uploaded screenshot"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="size-3.5"
                              aria-hidden="true"
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
                      aria-label="Describe the app you want to build"
                      required
                      name="prompt"
                      className="min-h-[118px] resize-none border-0 bg-transparent px-4 pt-4 text-base leading-relaxed placeholder:text-muted-foreground focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:min-h-[90px] sm:text-[15px]"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
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
                          onOpenChange={setIsModelSelectOpen}
                          onValueChange={handleModelChange}
                        >
                          <Select.Trigger
                            className="model-trigger"
                            aria-label="Choose AI model"
                          >
                            <span
                              className="model-status-dot"
                              aria-hidden="true"
                            />
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
                                    <Sparkles
                                      className="size-2.5"
                                      aria-hidden="true"
                                    />
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
                                          className={`model-item ${isLocked ? "opacity-50" : ""}`}
                                        >
                                          <div className="flex min-w-0 items-center gap-2">
                                            <span
                                              className={`model-item-tier-dot ${tierDotClass}`}
                                              aria-hidden="true"
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
                                                aria-hidden="true"
                                              />
                                            </span>
                                            <Select.ItemIndicator>
                                              <CheckIcon
                                                className="size-3.5 text-primary"
                                                aria-hidden="true"
                                              />
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
                          <span className="sm:hidden">Plan</span>
                          <span className="hidden sm:inline">Plan mode</span>
                        </button>

                        <div className="toolbar-divider mx-0.5 sm:mx-1" />

                        {/* Upload */}
                        <div className="flex items-center gap-0.5">
                          <label
                            htmlFor="screenshot"
                            className="upload-btn"
                            title="Attach image"
                            aria-label="Attach screenshot"
                          >
                            <UploadIcon
                              className="size-[15px]"
                              aria-hidden="true"
                            />
                          </label>
                          <input
                            id="screenshot"
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleScreenshotUpload}
                            aria-label="Upload screenshot"
                            className="hidden"
                            ref={fileInputRef}
                          />
                          <div className="relative hidden sm:block">
                            <Info
                              className="peer h-3 w-3 cursor-help text-muted-foreground/40 transition-colors hover:text-muted-foreground/70"
                              aria-hidden="true"
                            />
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
                            alt=""
                            width={16}
                            height={16}
                            aria-hidden="true"
                            className="size-4 invert transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-105"
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
                        setPrompt(v.description);
                        setTimeout(() => {
                          textareaRef.current?.focus();
                          if (textareaRef.current) {
                            textareaRef.current.selectionStart =
                              textareaRef.current.value.length;
                            textareaRef.current.selectionEnd =
                              textareaRef.current.value.length;
                          }
                        }, 0);
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
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
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
                        aria-label="Website URL to capture"
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
                          aria-label="Capture website URL"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm shadow-blue-500/30 transition-all hover:scale-105 hover:bg-blue-600 active:scale-95"
                        >
                          <ArrowRightIcon
                            className="size-3"
                            aria-hidden="true"
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Fieldset>
            </form>
          </div>

          {children}
        </div>

        <PricingModal
          open={showPricingModal}
          onOpenChange={setShowPricingModal}
          remainingCredits={userCredits}
          isAuthenticated={isAuthenticated}
          currentTier={currentTier}
        />
        <OnboardingModal
          isOpen={showOnboardingModal}
          onClose={() => {
            setShowOnboardingModal(false);
            localStorage.setItem("hasSeenOnboarding", "true");
          }}
        />
        <HelpPanel
          isOpen={showHelpPanel}
          onClose={() => setShowHelpPanel(false)}
        />
      </div>
    </>
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
