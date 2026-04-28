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
import { CheckIcon, ChevronDownIcon, Info, Link2, Sparkles } from "lucide-react";
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
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHoveringRing, setIsHoveringRing] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [credits, setCredits] = useState(0);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    // Check auth status on mount
    checkAuthStatus();
  }, []);

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
    const selectedModel = MODELS.find(m => m.value === newModel);
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
      toast.error(error.message || "Failed to capture website. Please check the URL and try again.");
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
    <div className="relative flex h-screen flex-col overflow-hidden">
      <div 
        ref={ringRef}
        className="absolute inset-0 flex justify-center"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative max-h-[953px] w-full max-w-[1200px]">
          <Image
            src={bgImg}
            alt=""
            className={`object-cover object-top mix-blend-screen transition-all duration-500 ease-out ${
              isHoveringRing ? 'scale-[1.02] opacity-100 dark:opacity-30' : 'scale-100 opacity-90 dark:opacity-20'
            }`}
            priority
          />
          {isHoveringRing && (
            <div 
              className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle 300px at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.15) 0%, transparent 70%)`,
              }}
            />
          )}
        </div>
      </div>

      <div className="isolate flex h-full flex-col">
        <Header />

        <div className="mt-10 flex flex-1 flex-col items-center px-4 lg:mt-16">
          <div className="mt-4 flex flex-col items-center gap-4 lg:mt-8 lg:gap-5">
            <h1 className="font-display text-center text-6xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-7xl lg:text-8xl">
              Turn your{" "}
              <span className="font-medium text-blue-500 dark:text-blue-400">
                idea
              </span>
              <br className="hidden md:block" />{" "}
              into an{" "}
              <span className="font-medium text-blue-500 dark:text-blue-400">
                app
              </span>
            </h1>
            <p className="max-w-md text-center text-base text-muted-foreground md:text-lg">
              Describe what you want.
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
                  const checkResponse = await fetch("/api/user/can-create-project");
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
                  const { prompt, model, quality } = Object.fromEntries(formData);

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
              <div className="relative flex w-full max-w-2xl rounded-xl border border-border bg-background dark:bg-card pb-10">
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
                  <div className="relative">
                    <div className="p-3">
                      <p className="invisible w-full whitespace-pre-wrap">
                        {textareaResizePrompt}
                      </p>
                    </div>
                    <textarea
                      ref={textareaRef}
                      placeholder="Build me a budgeting app..."
                      required
                      name="prompt"
                      rows={2}
                      className="peer absolute inset-0 w-full resize-none bg-transparent px-4 py-3 placeholder-gray-500 focus-visible:outline-none disabled:opacity-50"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onPaste={(e) => {
                        // Clean up pasted text
                        e.preventDefault();
                        const pastedText = e.clipboardData.getData("text");

                        // Normalize line endings and clean up whitespace
                        const cleanedText = pastedText
                          .replace(/\r\n/g, "\n") // Convert Windows line endings
                          .replace(/\r/g, "\n") // Convert old Mac line endings
                          .replace(/\n{3,}/g, "\n\n") // Max 2 consecutive newlines
                          .trim(); // Remove leading/trailing whitespace

                        // Insert the cleaned text at cursor position
                        const textarea = e.target as HTMLTextAreaElement;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const newValue =
                          prompt.slice(0, start) +
                          cleanedText +
                          prompt.slice(end);

                        setPrompt(newValue);

                        // Set cursor position after the pasted text
                        setTimeout(() => {
                          if (textareaRef.current) {
                            textareaRef.current.selectionStart =
                              start + cleanedText.length;
                            textareaRef.current.selectionEnd =
                              start + cleanedText.length;
                          }
                        }, 0);
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
                  </div>
                </div>
                <div className="absolute bottom-2 left-3 right-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Select.Root
                      name="model"
                      value={model}
                      onValueChange={handleModelChange}
                    >
                      <Select.Trigger className="inline-flex items-center gap-1 rounded-md p-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/80 dark:hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
                        <Select.Value aria-label={model}>
                          <span className="flex items-center gap-1.5">
                            {selectedModel?.label}
                          </span>
                        </Select.Value>
                        <Select.Icon>
                          <ChevronDownIcon className="size-3" />
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="overflow-hidden rounded-md bg-popover shadow ring-1 ring-border dark:bg-popover dark:ring-border">
                          <Select.Viewport className="space-y-1 p-2">
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
                                  className={`flex cursor-pointer items-center justify-between rounded-md p-2 text-sm data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[highlighted]:outline-none dark:data-[highlighted]:bg-accent/50 ${isLocked ? 'opacity-70' : ''}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Select.ItemText className={`inline-flex items-center gap-2 ${m.free ? 'text-green-600 dark:text-green-400 font-medium' : isLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
                                      {m.label}
                                    </Select.ItemText>
                                    {isLocked && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
                                        Pro
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {isLocked ? (
                                      <span className="text-xs text-muted-foreground">Subscribe to unlock</span>
                                    ) : null}
                                    <Select.ItemIndicator>
                                      <CheckIcon className="size-3 text-primary" />
                                    </Select.ItemIndicator>
                                  </div>
                                </Select.Item>
                              );
                            })}
                            {!canUsePaidModels && (
                              <div className="mt-2 pt-2 border-t border-border">
                                <button
                                  onClick={() => setShowPricingModal(true)}
                                  className="w-full text-left p-2 rounded-md bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-800/50 transition-colors"
                                >
                                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                                    Unlock {MODELS.filter(m => m.paid).length}+ premium models
                                  </p>
                                  <p className="text-[10px] text-amber-600/80 dark:text-amber-500/60 mt-0.5">
                                    Starting at $9/month
                                  </p>
                                </button>
                              </div>
                            )}
                          </Select.Viewport>
                          <Select.ScrollDownButton />
                          <Select.Arrow />
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>

                    <div className="h-4 w-px bg-border max-sm:hidden" />

                    <Select.Root
                      name="quality"
                      value={quality}
                      onValueChange={setQuality}
                    >
                      <Select.Trigger className="inline-flex items-center gap-1 rounded p-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/80 dark:hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
                        <Select.Value aria-label={quality}>
                          <span className="max-sm:hidden">
                            {quality === "low"
                              ? "Faster"
                              : "Smarter"}
                          </span>
                          <span className="sm:hidden">
                            <LightningBoltIcon className="size-3" />
                          </span>
                        </Select.Value>
                        <Select.Icon>
                          <ChevronDownIcon className="size-3" />
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="overflow-hidden rounded-md bg-popover shadow ring-1 ring-border dark:bg-popover dark:ring-border">
                          <Select.Viewport className="space-y-1 p-2">
                            {qualityOptions.map((q) => (
                              <Select.Item
                                key={q.value}
                                value={q.value}
                                className="flex cursor-pointer items-center gap-1 rounded-md p-1 text-sm data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[highlighted]:outline-none dark:data-[highlighted]:bg-accent/50"
                              >
                                <Select.ItemText className="inline-flex items-center gap-2 text-muted-foreground">
                                  {q.label}
                                </Select.ItemText>
                                <Select.ItemIndicator>
                                  <CheckIcon className="size-3 text-primary" />
                                </Select.ItemIndicator>
                              </Select.Item>
                            ))}
                          </Select.Viewport>
                          <Select.ScrollDownButton />
                          <Select.Arrow />
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                    <div className="h-4 w-px bg-border max-sm:hidden" />
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="screenshot"
                        className="flex cursor-pointer gap-2 text-sm text-muted-foreground hover:underline"
                      >
                        <div className="flex size-6 items-center justify-center rounded bg-foreground hover:bg-foreground/80 dark:bg-background dark:hover:bg-muted">
                          <UploadIcon className="size-4" />
                        </div>
                        <div className="flex items-center justify-center transition hover:text-foreground">
                          Attach
                        </div>
                      </label>
                      <input
                        // name="screenshot"
                        id="screenshot"
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                        ref={fileInputRef}
                      />
                      {/* Info tooltip for supported formats */}
                      <div className="group relative hidden sm:block">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded-lg bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg ring-1 ring-border opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-50">
                          <p className="font-medium mb-1">Supported formats:</p>
                          <p className="text-muted-foreground">PNG, JPEG, WebP</p>
                          <p className="mt-1 text-muted-foreground">Upload a screenshot to convert it into code</p>
                          {/* Arrow pointing down */}
                          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-popover" />
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="relative flex has-[:disabled]:opacity-50">
                    <LoadingButton
                      type="submit"
                      disabled={screenshotLoading || prompt.length === 0 || isCheckingEligibility}
                    >
                      <Spinner loading={isCheckingEligibility}>
                        Build
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

              <div className="mt-4 flex w-full flex-wrap justify-between gap-2.5">
                {SUGGESTED_PROMPTS.map((v) => (
                  <Button
                    key={v.title}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setPrompt(v.description);
                      // Refocus the textarea after setting the prompt
                      setTimeout(() => {
                        textareaRef.current?.focus();
                        // Position cursor at the end
                        if (textareaRef.current) {
                          textareaRef.current.selectionStart =
                            textareaRef.current.value.length;
                          textareaRef.current.selectionEnd =
                            textareaRef.current.value.length;
                        }
                      }, 0);
                    }}
                    className="text-xs"
                  >
                    {v.title}
                  </Button>
                ))}
              </div>

              {/* URL Input Section - Clean external option */}
              <div className="mt-6 flex items-center justify-center gap-2">
                <div className="h-px w-12 bg-gradient-to-r from-transparent via-border to-border" />
                <span className="text-sm text-muted-foreground">or</span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent via-border to-border" />
              </div>

              <div className="mt-3 mb-12 flex items-center justify-center">
                <div
                  className={`
                    group relative flex items-center gap-2 overflow-hidden rounded-xl border px-3 py-2 transition-all duration-300
                    ${urlInput.trim()
                      ? 'border-blue-500/40 bg-blue-500/5'
                      : 'border-border/40 bg-muted/30 hover:border-border/60 hover:bg-muted/50'
                    }
                    ${isScrapingUrl ? 'border-blue-400/50 bg-blue-500/10' : ''}
                    focus-within:border-blue-500/50 focus-within:bg-background
                  `}
                >
                  <div className={`
                    flex size-8 items-center justify-center rounded-lg transition-colors
                    ${isScrapingUrl
                      ? 'bg-blue-500/20 text-blue-500'
                      : urlInput.trim()
                        ? 'bg-blue-500/15 text-blue-500'
                        : 'bg-muted text-muted-foreground group-hover:text-foreground'
                    }
                  `}>
                    {isScrapingUrl ? (
                      <Sparkles className="size-4 animate-spin" />
                    ) : (
                      <Link2 className="size-4" />
                    )}
                  </div>
                  <Input
                    type="url"
                    placeholder="Build from a URL..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && urlInput.trim()) {
                        e.preventDefault();
                        handleUrlScrape();
                      }
                    }}
                    disabled={isScrapingUrl}
                    className="w-48 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 border-none focus:border-none focus-visible:border-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed sm:w-64"
                  />
                  {urlInput.trim() && !isScrapingUrl && (
                    <button
                      type="button"
                      onClick={handleUrlScrape}
                      className="flex size-7 items-center justify-center rounded-md bg-blue-500 text-white transition-all hover:bg-blue-600 hover:scale-105 active:scale-95"
                    >
                      <ArrowRightIcon className="size-3" />
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
    </div>
  );
}

const Footer = memo(() => {
  return (
    <footer className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-full flex flex-col items-center justify-between px-5 text-center sm:flex-row sm:pt-2">
      <div>
        <div className="font-medium">
          Built with{" "}
          <span className="font-semibold text-blue-600">Squid Coder</span>
          .
        </div>
      </div>
      <div className="flex items-center gap-4 pb-4 sm:pb-0">
        <Link href="https://x.com/drewsepeczi" className="group p-2 rounded-md hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="X (Twitter)">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 fill-slate-500 group-hover:fill-slate-700"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.7465 16L6.8829 10.2473L2.04622 16H0L5.97508 8.89534L0 0H5.25355L8.8949 5.42183L13.4573 0H15.5036L9.80578 6.77562L16 16H10.7465ZM13.0252 14.3782H11.6475L2.92988 1.62182H4.30767L7.79916 6.72957L8.40293 7.6159L13.0252 14.3782Z"
              fill="#71717a"
            />
          </svg>
        </Link>
        <Link
          href="https://github.com/drewsephski"
          className="group p-2 rounded-md hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="GitHub"
        >
          <svg
            aria-hidden="true"
            className="h-6 w-6 fill-slate-500 group-hover:fill-slate-700"
          >
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
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
    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background px-1 py-3 md:px-3 dark:bg-card">
      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <span className="animate-pulse text-balance text-center text-sm md:text-base">
          {isScrapingUrl
            ? "Capturing website screenshot..."
            : isHighQuality
              ? `Coming up with project plan, may take 15 seconds...`
              : screenshotUrl
                ? "Analyzing your screenshot..."
                : `Creating your app...`}
        </span>

        <Spinner />
      </div>
    </div>
  );
}

export const runtime = "edge";
export const maxDuration = 60;
