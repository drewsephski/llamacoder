/* eslint-disable @next/next/no-img-element */
"use client";

import Fieldset from "@/components/fieldset";
import ArrowRightIcon from "@/components/icons/arrow-right";
import LightningBoltIcon from "@/components/icons/lightning-bolt";
import Spinner from "@/components/spinner";
import bgImg from "@/public/halo.png";
import * as Select from "@radix-ui/react-select";
import assert from "assert";
import {
  CheckIcon,
  ChevronDownIcon,
  Coins,
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
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle } from "lucide-react";
import {
  useUserCredits,
  useUserSession,
  useCanCreateProject,
  useCreateChat,
} from "@/lib/queries";
import { getModelCreditCost } from "@/lib/billing";

export default function Home() {
  const { setStreamPromise } = use(Context);
  const router = useRouter();

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
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);

  const { data: session } = useUserSession();
  const { data: creditsData } = useUserCredits();
  const { data: eligibility } = useCanCreateProject();
  const createChatMutation = useCreateChat();

  const isAuthenticated = !!session;
  const hasActiveSubscription = creditsData?.hasActiveSubscription ?? false;
  const userCredits = creditsData?.credits ?? 0;
  const canUsePaidModels = isAuthenticated && hasActiveSubscription;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
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
      if (!response.ok) throw new Error(data.error || "Failed to scrape URL");
      setScreenshotData(data.screenshotData);
      setScreenshotUrl(urlInput);
      setUrlInput("");
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
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .font-display { font-family: 'Instrument Serif', Georgia, serif; }
        .font-sans-dm { font-family: 'DM Sans', system-ui, sans-serif; }

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
          padding: 1px 6px;
          border-radius: 4px;
          background: rgba(245,158,11,0.12);
          color: #b45309;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.02em;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .dark .pro-badge { background: rgba(245,158,11,0.15); color: #fbbf24; }
      `}</style>

      <div className="font-sans-dm relative flex min-h-dvh w-full flex-col overflow-x-hidden">
        {/* Background layer */}
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

        <div className="isolate flex min-h-dvh flex-col">
          <Header onHelpClick={() => setShowHelpPanel(true)} />

          <div className="mt-16 flex flex-1 flex-col items-center px-4 sm:mt-20 lg:mt-24">
            {/* Hero text */}
            <div className="flex flex-col items-center gap-4 lg:gap-5">
              <div className="animate-fade-up">
                <span className="info-pill">AI-powered code generation</span>
              </div>

              <h1 className="animate-fade-up-1 text-center font-display tracking-tight text-foreground">
                <span className="block text-[2.6rem] leading-[1.08] sm:text-5xl md:text-6xl lg:text-[4.5rem]">
                  Turn ideas
                </span>
                <span className="shimmer-text mt-0.5 block text-[2.6rem] leading-[1.08] sm:text-5xl md:text-6xl lg:text-[4.5rem]">
                  into apps
                </span>
              </h1>

              <p className="animate-fade-up-2 max-w-sm text-center text-[15px] leading-relaxed text-muted-foreground/75 sm:text-base">
                Describe what you want to build. <br />
                <span className="text-foreground/60">
                  We&apos;ll generate the code.
                </span>
              </p>
            </div>

            {/* Main form */}
            <form
              className="animate-fade-up-3 relative w-full max-w-2xl pt-8 lg:pt-12"
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
                      const cost =
                        eligibility.modelCost ||
                        getModelCreditCost(currentModel);
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
                      });

                    const streamPromise = fetch(
                      "/api/get-next-completion-stream-promise",
                      {
                        method: "POST",
                        body: JSON.stringify({
                          messageId: lastMessageId,
                          model,
                        }),
                      },
                    ).then((res) => {
                      if (!res.body) throw new Error("No body on response");
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
                {/* Compose box */}
                <div className="compose-box w-full">
                  <div className="compose-box-inner relative w-full pb-14 shadow-lg shadow-black/5 sm:pb-11">
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
                      className="min-h-[90px] resize-none border-0 bg-transparent px-4 pt-4 text-[15px] leading-relaxed placeholder:text-muted-foreground/40 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
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
                      <div className="flex items-center gap-1">
                        {/* Model selector */}
                        <Select.Root
                          name="model"
                          value={model}
                          onValueChange={handleModelChange}
                        >
                          <Select.Trigger className="select-trigger-custom">
                            <Select.Value aria-label={model}>
                              <span className="flex items-center gap-1.5">
                                {selectedModel?.label}
                                {selectedModel?.paid && (
                                  <span className="pro-badge">PRO</span>
                                )}
                              </span>
                            </Select.Value>
                            <Select.Icon>
                              <ChevronDownIcon className="size-3 opacity-50" />
                            </Select.Icon>
                          </Select.Trigger>
                          <Select.Portal>
                            <Select.Content className="min-w-[240px] overflow-hidden rounded-xl bg-popover shadow-xl ring-1 ring-border/60 dark:bg-popover">
                              <Select.Viewport className="p-1.5">
                                {MODELS.map((m) => {
                                  const isLocked = m.paid && !canUsePaidModels;
                                  const creditCost = getModelCreditCost(
                                    m.value,
                                  );
                                  return (
                                    <Select.Item
                                      key={m.value}
                                      value={m.value}
                                      disabled={isLocked}
                                      onClick={() => {
                                        if (isLocked) setShowPricingModal(true);
                                      }}
                                      className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground ${isLocked ? "opacity-50" : ""}`}
                                    >
                                      <div className="flex items-center gap-2">
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
                                          <span className="pro-badge">PRO</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`inline-flex items-center gap-1 text-[11px] font-medium tabular-nums ${
                                            m.free
                                              ? "text-emerald-500 dark:text-emerald-400"
                                              : creditCost >= 6
                                                ? "text-amber-500 dark:text-amber-400"
                                                : "text-muted-foreground/70"
                                          }`}
                                        >
                                          {creditCost}{" "}
                                          <Coins className="size-3" />
                                        </span>
                                        <Select.ItemIndicator>
                                          <CheckIcon className="size-3.5 text-primary" />
                                        </Select.ItemIndicator>
                                      </div>
                                    </Select.Item>
                                  );
                                })}
                              </Select.Viewport>
                              <Select.Arrow />
                            </Select.Content>
                          </Select.Portal>
                        </Select.Root>

                        <div className="toolbar-divider mx-1" />

                        {/* Quality selector */}
                        <Select.Root
                          name="quality"
                          value={quality}
                          onValueChange={setQuality}
                        >
                          <Select.Trigger className="select-trigger-custom">
                            <Select.Value aria-label={quality}>
                              <span className="max-sm:hidden">
                                {quality === "low" ? (
                                  <span className="flex items-center gap-1.5">
                                    <LightningBoltIcon className="size-3 text-amber-500" />
                                    Faster
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5">
                                    <Sparkles className="size-3 text-blue-500" />
                                    Smarter
                                  </span>
                                )}
                              </span>
                              <span className="sm:hidden">
                                <LightningBoltIcon className="size-3.5" />
                              </span>
                            </Select.Value>
                            <Select.Icon>
                              <ChevronDownIcon className="size-3 opacity-50" />
                            </Select.Icon>
                          </Select.Trigger>
                          <Select.Portal>
                            <Select.Content className="overflow-hidden rounded-xl bg-popover shadow-xl ring-1 ring-border/60 dark:bg-popover">
                              <Select.Viewport className="p-1.5">
                                {qualityOptions.map((q) => (
                                  <Select.Item
                                    key={q.value}
                                    value={q.value}
                                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                                  >
                                    <Select.ItemText>{q.label}</Select.ItemText>
                                    <Select.ItemIndicator>
                                      <CheckIcon className="size-3.5 text-primary" />
                                    </Select.ItemIndicator>
                                  </Select.Item>
                                ))}
                              </Select.Viewport>
                              <Select.Arrow />
                            </Select.Content>
                          </Select.Portal>
                        </Select.Root>

                        <div className="toolbar-divider mx-1" />

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
                            className="size-4 invert transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-105"
                          />
                        </Spinner>
                      </Button>
                    </div>

                    {/* Loading overlay */}
                    {(isPending || isScrapingUrl) && (
                      <LoadingMessage
                        isHighQuality={quality === "high"}
                        screenshotUrl={screenshotUrl}
                        isScrapingUrl={isScrapingUrl}
                      />
                    )}
                  </div>
                </div>

                {/* Suggested prompts */}
                <div className="mt-5 flex w-full flex-wrap justify-center gap-2">
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
                <div className="mb-10 mt-8 sm:mb-14">
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
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm shadow-blue-500/30 transition-all hover:scale-105 hover:bg-blue-600 active:scale-95"
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

export const runtime = "edge";
export const maxDuration = 60;
