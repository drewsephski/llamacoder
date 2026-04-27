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
import { CheckIcon, ChevronDownIcon } from "lucide-react";
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
import { MODELS, SUGGESTED_PROMPTS } from "@/lib/constants";
import HoverBrandLogo from "@/components/ui/hover-brand-logo";
import { PricingModal } from "@/components/pricing-modal";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function Home() {
  const { setStreamPromise } = use(Context);
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(
    MODELS[0].value,
  );
  const [quality, setQuality] = useState("low");
  const [screenshotUrl, setScreenshotUrl] = useState<string | undefined>(
    undefined,
  );
  const [screenshotLoading, setScreenshotLoading] = useState(false);
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
  }, []);

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
      { value: "low", label: "Low quality [faster]" },
      { value: "high", label: "High quality [slower]" },
    ],
    [],
  );
  const handleScreenshotUpload = async (event: any) => {
    if (prompt.length === 0) setPrompt("Build this");
    setQuality("low");
    setScreenshotLoading(true);
    let file = event.target.files[0];
    const { url } = await uploadToS3(file);
    setScreenshotUrl(url);
    setScreenshotLoading(false);
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
          <h1 className="mt-4 text-center text-7xl font-bold leading-none tracking-tight text-foreground md:text-8xl lg:text-9xl lg:mt-8">
            Turn your <span className="text-blue-500">idea</span>
            <br className="hidden md:block" /> into an{" "}
            <span className="text-blue-500">app</span>
          </h1>

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
                  {screenshotUrl && (
                    <div
                      className={`${isPending ? "invisible" : ""} relative mx-3 mt-3`}
                    >
                      <div className="rounded-xl">
                        <img
                          alt="screenshot"
                          src={screenshotUrl}
                          className="group relative mb-2 h-16 w-[68px] rounded object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        id="x-circle-icon"
                        className="absolute -right-3 -top-4 left-14 z-10 size-5 rounded-full bg-background text-foreground hover:text-muted-foreground dark:bg-card"
                        onClick={() => {
                          setScreenshotUrl(undefined);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
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
                      onValueChange={setModel}
                    >
                      <Select.Trigger className="inline-flex items-center gap-1 rounded-md p-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/80 dark:hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
                        <Select.Value aria-label={model}>
                          <span>{selectedModel?.label}</span>
                        </Select.Value>
                        <Select.Icon>
                          <ChevronDownIcon className="size-3" />
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="overflow-hidden rounded-md bg-popover shadow ring-1 ring-border dark:bg-popover dark:ring-border">
                          <Select.Viewport className="space-y-1 p-2">
                            {MODELS.map((m) => (
                              <Select.Item
                                key={m.value}
                                value={m.value}
                                className="flex cursor-pointer items-center gap-1 rounded-md p-1 text-sm data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[highlighted]:outline-none dark:data-[highlighted]:bg-accent/50"
                              >
                                <Select.ItemText className="inline-flex items-center gap-2 text-muted-foreground">
                                  {m.label}
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

                    <Select.Root
                      name="quality"
                      value={quality}
                      onValueChange={setQuality}
                    >
                      <Select.Trigger className="inline-flex items-center gap-1 rounded p-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/80 dark:hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
                        <Select.Value aria-label={quality}>
                          <span className="max-sm:hidden">
                            {quality === "low"
                              ? "Low quality [faster]"
                              : "High quality [slower]"}
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
                    <div>
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
                    </div>
                  </div>

                  <div className="relative flex has-[:disabled]:opacity-50">
                    <div className="pointer-events-none absolute inset-0 -bottom-[1px] rounded bg-blue-500" />

                    <LoadingButton
                      className="relative inline-flex size-6 items-center justify-center rounded bg-blue-500 font-medium text-white shadow-lg outline-blue-300 hover:bg-blue-500/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-90"
                      type="submit"
                      disabled={screenshotLoading || prompt.length === 0 || isCheckingEligibility}
                    >
                      <Spinner loading={isCheckingEligibility}>
                        <ArrowRightIcon />
                      </Spinner>
                    </LoadingButton>
                  </div>
                </div>

                {isPending && (
                  <LoadingMessage
                    isHighQuality={quality === "high"}
                    screenshotUrl={screenshotUrl}
                  />
                )}
              </div>
              <div className="mt-4 flex w-full flex-wrap justify-between gap-2.5 mb-12">
                {SUGGESTED_PROMPTS.map((v) => (
                  <button
                    key={v.title}
                    type="button"
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
                    className="rounded bg-muted px-3 py-2 text-xs tracking-[0%] transition-colors hover:bg-muted/80 dark:hover:bg-muted/70 min-h-[44px] sm:min-h-[36px]"
                  >
                    {v.title}
                  </button>
                ))}
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
        remainingCredits={credits}
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
}: {
  isHighQuality: boolean;
  screenshotUrl: string | undefined;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background px-1 py-3 md:px-3 dark:bg-card">
      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <span className="animate-pulse text-balance text-center text-sm md:text-base">
          {isHighQuality
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
