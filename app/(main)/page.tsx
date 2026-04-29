/* eslint-disable @next/next/no-img-element */
"use client";

import Fieldset from "@/components/fieldset";
import ArrowRightIcon from "@/components/icons/arrow-right";
import LightningBoltIcon from "@/components/icons/lightning-bolt";
import LoadingButton from "@/components/loading-button";
import Spinner from "@/components/spinner";
import bgImg from "@/public/halo.png";
import * as Select from "@radix-ui/react-select";
import assert from "assert";
import {
  CheckIcon,
  ChevronDownIcon,
  Info,
  Link2,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  use,
  useState,
  useRef,
  useTransition,
  useEffect,
  useMemo,
  memo,
} from "react";

import { Context } from "./providers";
import Header from "@/components/header";
import { useS3Upload } from "next-s3-upload";
import UploadIcon from "@/components/icons/upload-icon";
import { MODELS, SUGGESTED_PROMPTS, FREE_MODEL } from "@/lib/constants";
import HoverBrandLogo from "@/components/ui/hover-brand-logo";
import { PricingModal } from "@/components/pricing-modal";
import { OnboardingModal } from "@/components/onboarding-modal";
import { HelpPanel } from "@/components/help-panel";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle } from "lucide-react";

export default function Home() {
  const { setStreamPromise } = use(Context);
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(FREE_MODEL);
  const [quality, setQuality] = useState("low");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [screenshotUrl, setScreenshotUrl] = useState<string | undefined>(
    undefined,
  );
  const [screenshotData, setScreenshotData] = useState<string | undefined>(
    undefined,
  );
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
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
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [credits, setCredits] = useState(0);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    checkAuthStatus();
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setShowOnboardingModal(true);
    }
  }, []);

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

  const checkAuthStatus = async () => {
    try {
      const session = await authClient.getSession();
      if (session.data) {
        setIsAuthenticated(true);
        // Fetch user subscription/credits info
        const response = await fetch("/api/user/credits");
        if (response.ok) {
          const data = await response.json();
          setHasActiveSubscription(data.hasActiveSubscription);
          setUserCredits(data.credits);
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    }
  };

  const canUsePaidModels = isAuthenticated && hasActiveSubscription;

  const handleModelChange = (newModel: string) => {
    const selectedModel = MODELS.find((m) => m.value === newModel);
    if (selectedModel?.paid && !canUsePaidModels) {
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

  const { uploadToS3 } = useS3Upload();

  const selectedModel = useMemo(
    () => MODELS.find((m) => m.value === model),
    [model],
  );

  const qualityOptions = useMemo(
    () => [
      { value: "low", label: "Faster" },
      { value: "high", label: "Smarter" },
    ],
    [],
  );
  const handleScreenshotUpload = async (event: any) => {
    if (prompt.length === 0) setPrompt("Build this");
    setQuality("low");
    setScreenshotLoading(true);
    let file = event.target.files[0];
    // Convert file to base64 for server-side processing
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setScreenshotData(base64);
    };
    reader.readAsDataURL(file);
    const { url } = await uploadToS3(file);
    setScreenshotUrl(url);
    setScreenshotLoading(false);
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

      if (!response.ok) {
        throw new Error(data.error || "Failed to scrape URL");
      }

      setScreenshotData(data.screenshotData);
      setScreenshotUrl(urlInput); // Store the URL as reference
      setUrlInput(""); // Clear input after successful scrape
      toast.success("Website captured successfully!");
    } catch (error: any) {
      console.error("URL scraping error:", error);
      toast.error(
        error.message ||
          "Failed to capture website. Please check the URL and try again.",
      );
    } finally {
      setIsScrapingUrl(false);
      setScreenshotLoading(false);
    }
  };

  const clearScreenshot = () => {
    setScreenshotUrl(undefined);
    setScreenshotData(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const textareaResizePrompt = useMemo(
    () =>
      prompt
        .split("\n")
        .map((text) => (text === "" ? "a" : text))
        .join("\n"),
    [prompt],
  );

  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-x-hidden">
      <div
        ref={ringRef}
        className="absolute inset-0 flex justify-center overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative max-h-[953px] w-full">
          <Image
            src={bgImg}
            alt=""
            className={`object-cover object-top mix-blend-screen transition-all duration-700 ease-out ${
              isHoveringRing
                ? "scale-[1.01] opacity-70 dark:opacity-15"
                : "scale-100 opacity-60 dark:opacity-10"
            }`}
            priority
          />
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-500"
            style={{
              background: isHoveringRing
                ? `radial-gradient(circle 400px at ${smoothMousePosition.x}% ${smoothMousePosition.y}%, rgba(59, 130, 246, 0.08) 0%, transparent 60%),
                   radial-gradient(circle 200px at ${smoothMousePosition.x}% ${smoothMousePosition.y}%, rgba(99, 102, 241, 0.12) 0%, transparent 50%)`
                : "none",
              opacity: isHoveringRing ? 1 : 0,
            }}
          />
        </div>
      </div>

      <div className="isolate flex min-h-dvh flex-col">
        <Header onHelpClick={() => setShowHelpPanel(true)} />

        <div className="mt-16 flex flex-1 flex-col items-center px-4 sm:mt-20 lg:mt-24">
          <div className="flex flex-col items-center gap-5 lg:gap-6">
            <h1 className="text-center font-display font-medium tracking-tight text-foreground">
              <span className="block text-4xl leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl">
                Turn ideas
              </span>
              <span className="mt-1 block text-4xl leading-[1.1] text-blue-500 dark:text-blue-400 sm:text-5xl md:text-6xl lg:text-7xl">
                into apps
              </span>
            </h1>
            <p className="max-w-md text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
              Describe what you want to build. <br />
              We&apos;ll generate the code.
            </p>
          </div>

          <form
            className="relative w-full max-w-2xl pt-6 lg:pt-12"
            action={async (formData) => {
              // Check eligibility before creating
              setIsCheckingEligibility(true);
              try {
                const session = await authClient.getSession();

                // Only check for authenticated users
                if (session.data) {
                  const checkResponse = await fetch(
                    "/api/user/can-create-project",
                  );
                  if (checkResponse.ok) {
                    const eligibility = await checkResponse.json();

                    if (!eligibility.canCreate) {
                      // User has existing projects but no credits
                      setCredits(eligibility.credits);
                      setShowPricingModal(true);
                      setIsCheckingEligibility(false);
                      return;
                    }
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

                  const response = await fetch("/api/create-chat", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      prompt,
                      model,
                      quality,
                      screenshotUrl,
                      screenshotData,
                    }),
                  });

                  if (!response.ok) {
                    throw new Error("Failed to create chat");
                  }

                  const { chatId, lastMessageId } = await response.json();

                  const streamPromise = fetch(
                    "/api/get-next-completion-stream-promise",
                    {
                      method: "POST",
                      body: JSON.stringify({ messageId: lastMessageId, model }),
                    },
                  ).then((res) => {
                    if (!res.body) {
                      throw new Error("No body on response");
                    }
                    return res.body;
                  });

                  startTransition(() => {
                    setStreamPromise(streamPromise);
                    router.push(`/chats/${chatId}`);
                  });
                } catch (error: any) {
                  toast.error(error.message || "Failed to create project");
                }
              });
            }}
          >
            <Fieldset>
              <div className="group relative flex w-full max-w-2xl rounded-2xl pb-14 shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-500 focus-within:border-blue-500/40 focus-within:shadow-blue-500/20 hover:border-blue-500/30 hover:border-b-blue-500 hover:border-r-blue-500 hover:shadow-xl hover:shadow-blue-500/10 dark:bg-card/80 sm:pb-10">
                <div className="w-full">
                  {screenshotLoading && (
                    <div className="relative mx-3 mt-3">
                      <div className="rounded-xl">
                        <div className="group mb-2 flex h-16 w-[68px] animate-pulse items-center justify-center rounded bg-muted dark:bg-muted/50">
                          <Spinner />
                        </div>
                      </div>
                    </div>
                  )}
                  {(screenshotUrl || screenshotData) && (
                    <div
                      className={`${isPending ? "invisible" : ""} relative mx-3 mt-3`}
                    >
                      <div className="rounded-xl">
                        {screenshotData ? (
                          <img
                            alt="screenshot"
                            src={screenshotData}
                            className="group relative mb-2 h-16 w-[68px] rounded object-cover"
                          />
                        ) : (
                          <img
                            alt="screenshot"
                            src={screenshotUrl}
                            className="group relative mb-2 h-16 w-[68px] rounded object-cover"
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        id="x-circle-icon"
                        className="absolute -right-3 -top-4 left-14 z-10 size-5 rounded-full bg-background text-foreground hover:text-muted-foreground dark:bg-card"
                        onClick={clearScreenshot}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                  <Textarea
                    ref={textareaRef}
                    placeholder="Build me a budgeting app..."
                    required
                    name="prompt"
                    className="mb-4 min-h-[80px] resize-none border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                </div>
                <div className="absolute bottom-2 left-3 right-3 flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap">
                  <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
                    <Select.Root
                      name="model"
                      value={model}
                      onValueChange={handleModelChange}
                    >
                      <Select.Trigger className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/50">
                        <Select.Value aria-label={model}>
                          <span className="flex items-center gap-1.5">
                            {selectedModel?.label}
                            {selectedModel?.paid && (
                              <span className="rounded bg-amber-100 px-1 py-0 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                Pro
                              </span>
                            )}
                          </span>
                        </Select.Value>
                        <Select.Icon>
                          <ChevronDownIcon className="size-3.5 opacity-60" />
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="min-w-[180px] overflow-hidden rounded-lg bg-popover shadow-lg ring-1 ring-border dark:bg-popover dark:ring-border">
                          <Select.Viewport className="p-1">
                            {MODELS.map((m) => {
                              const isLocked = m.paid && !canUsePaidModels;
                              return (
                                <Select.Item
                                  key={m.value}
                                  value={m.value}
                                  disabled={isLocked}
                                  onClick={() => {
                                    if (isLocked) {
                                      setShowPricingModal(true);
                                    }
                                  }}
                                  className={`flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground ${isLocked ? "opacity-60" : ""}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Select.ItemText
                                      className={`${m.free ? "font-medium text-green-600 dark:text-green-400" : isLocked ? "text-muted-foreground" : "text-foreground"}`}
                                    >
                                      {m.label}
                                    </Select.ItemText>
                                    {isLocked && (
                                      <span className="rounded bg-muted px-1 py-0 text-[10px] font-medium text-muted-foreground">
                                        Pro
                                      </span>
                                    )}
                                  </div>
                                  <Select.ItemIndicator>
                                    <CheckIcon className="size-3.5 text-primary" />
                                  </Select.ItemIndicator>
                                </Select.Item>
                              );
                            })}
                          </Select.Viewport>
                          <Select.ScrollDownButton />
                          <Select.Arrow />
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>

                    <div className="h-4 w-px bg-border/50 max-sm:hidden" />

                    <Select.Root
                      name="quality"
                      value={quality}
                      onValueChange={setQuality}
                    >
                      <Select.Trigger className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/50">
                        <Select.Value aria-label={quality}>
                          <span className="max-sm:hidden">
                            {quality === "low" ? "Faster" : "Smarter"}
                          </span>
                          <span className="sm:hidden">
                            <LightningBoltIcon className="size-3.5" />
                          </span>
                        </Select.Value>
                        <Select.Icon>
                          <ChevronDownIcon className="size-3.5 opacity-60" />
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="overflow-hidden rounded-lg bg-popover shadow-lg ring-1 ring-border dark:bg-popover dark:ring-border">
                          <Select.Viewport className="space-y-0.5 p-1.5">
                            {qualityOptions.map((q) => (
                              <Select.Item
                                key={q.value}
                                value={q.value}
                                className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[highlighted]:ring-1 data-[highlighted]:ring-ring/30"
                              >
                                <Select.ItemText className="inline-flex items-center gap-2 text-muted-foreground">
                                  {q.label}
                                </Select.ItemText>
                                <Select.ItemIndicator>
                                  <CheckIcon className="size-3.5 text-primary" />
                                </Select.ItemIndicator>
                              </Select.Item>
                            ))}
                          </Select.Viewport>
                          <Select.ScrollDownButton />
                          <Select.Arrow />
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                    <div className="h-4 w-px bg-border/50 max-sm:hidden" />
                    <div className="flex items-center gap-1">
                      <label
                        htmlFor="screenshot"
                        className="group flex cursor-pointer items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Attach screenshot"
                      >
                        <UploadIcon className="size-4" />
                      </label>
                      <input
                        id="screenshot"
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                        ref={fileInputRef}
                      />
                      {/* Info tooltip for supported formats */}
                      <div className="relative hidden sm:block">
                        <Info className="peer h-3.5 w-3.5 cursor-help text-muted-foreground/60 transition-colors hover:text-muted-foreground" />
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 rounded-lg bg-popover px-3 py-2 text-xs text-popover-foreground opacity-0 shadow-lg ring-1 ring-border transition-opacity peer-hover:opacity-100">
                          <p className="mb-1 font-medium">Supported formats:</p>
                          <p className="text-muted-foreground">
                            PNG, JPEG, WebP
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            Upload a screenshot to convert it into code
                          </p>
                          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-popover" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex has-[:disabled]:opacity-50">
                    <LoadingButton
                      type="submit"
                      disabled={
                        screenshotLoading ||
                        prompt.length === 0 ||
                        isCheckingEligibility
                      }
                      className="group transition-transform duration-200"
                    >
                      Build
                      <Spinner loading={isCheckingEligibility}>
                        <img
                          src="/image.png"
                          alt="Build"
                          className="size-4 invert transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-105"
                        />
                      </Spinner>
                    </LoadingButton>
                  </div>
                </div>

                {(isPending || isScrapingUrl) && (
                  <LoadingMessage
                    isHighQuality={quality === "high"}
                    screenshotUrl={screenshotUrl}
                    isScrapingUrl={isScrapingUrl}
                  />
                )}
              </div>

              <div className="mt-6 flex w-full flex-wrap justify-center gap-2">
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
                    className="group inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background/40 px-3 py-1.5 text-[13px] text-muted-foreground/80 transition-all duration-200 hover:border-blue-500/30 hover:bg-blue-50/30 hover:text-foreground dark:hover:bg-blue-950/20"
                  >
                    {v.title}
                  </button>
                ))}
              </div>

              {/* URL Input Section */}
              <div className="mt-6 text-center">
                <span className="text-sm text-muted-foreground/70">
                  or paste a URL
                </span>
              </div>

              <div className="mb-12 mt-3 flex w-full items-center justify-center sm:mb-16">
                <div
                  className={`group relative flex w-full max-w-md items-center gap-3 overflow-hidden rounded-xl border px-4 py-3 transition-all duration-300 ${
                    urlInput.trim()
                      ? "border-blue-500/40 bg-blue-50/30 dark:border-blue-500/30 dark:bg-blue-950/15"
                      : "border-border/50 bg-background/60 hover:border-border/80"
                  } ${isScrapingUrl ? "border-blue-500/50 bg-blue-50/40 dark:bg-blue-900/20" : ""} focus-within:border-blue-500/50 focus-within:bg-blue-50/20 dark:focus-within:bg-blue-950/10`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isScrapingUrl || urlInput.trim()
                        ? "bg-blue-500 text-white"
                        : "bg-muted/70 text-muted-foreground group-hover:bg-muted"
                    } `}
                  >
                    {isScrapingUrl ? (
                      <Sparkles className="size-4" />
                    ) : (
                      <Link2 className="size-4" />
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
                    className="w-full border-none text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed"
                  />
                  {urlInput.trim() && !isScrapingUrl && (
                    <button
                      type="button"
                      onClick={handleUrlScrape}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white transition-all hover:scale-105 hover:bg-blue-600 active:scale-95"
                    >
                      <ArrowRightIcon className="size-3.5" />
                    </button>
                  )}
                  {isScrapingUrl && (
                    <Spinner className="size-4 text-blue-500" />
                  )}
                </div>
              </div>
            </Fieldset>
          </form>
        </div>

        <HoverBrandLogo />

        <Footer />
      </div>

      <PricingModal
        open={showPricingModal}
        onOpenChange={setShowPricingModal}
        remainingCredits={userCredits}
        isAuthenticated={isAuthenticated}
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
  );
}

const Footer = memo(() => {
  return (
    <footer className="mt-auto flex w-full flex-col items-center justify-between gap-4 px-6 pb-6 pt-6 text-center sm:flex-row sm:gap-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">Squid Coder</span>
        <span className="text-border">·</span>
        <span>Turn ideas into apps</span>
      </div>
      <div className="flex items-center gap-1">
        <Link
          href="https://x.com/drewsepeczi"
          className="group flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="X (Twitter)"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
            <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
          </svg>
        </Link>
        <Link
          href="https://github.com/drewsephski"
          className="group flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="GitHub"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
          </svg>
        </Link>
      </div>
    </footer>
  );
});

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
    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/95 px-4 backdrop-blur-sm dark:bg-card/95">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
          <Spinner className="text-blue-500" />
        </div>
        <span className="text-balance text-center text-sm font-medium text-muted-foreground">
          {isScrapingUrl
            ? "Capturing website screenshot..."
            : isHighQuality
              ? "Planning project structure..."
              : screenshotUrl
                ? "Analyzing your screenshot..."
                : "Building your app..."}
        </span>
      </div>
    </div>
  );
}

export const runtime = "edge";
export const maxDuration = 60;
