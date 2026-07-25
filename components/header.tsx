"use client";

import { memo, useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { AnimatedThemeToggleButton } from "@/components/ui/animated-theme-toggle-button";
import { MenuIcon, XIcon, Zap, HelpCircle } from "lucide-react";
import { PricingModal } from "@/features/billing/components/pricing-modal";
import { Button } from "@/components/ui/button";
import { useUserCredits } from "@/features/user/client/queries";
import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  MobileResourcesList,
  ResourcesMenu,
} from "@/components/resources-menu";

interface HeaderProps {
  onHelpClick?: () => void;
}

type PricingTab = "plans" | "credits";

const SCROLL_COMPACT_THRESHOLD = 28;

function Header({ onHelpClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricingInitialTab, setPricingInitialTab] =
    useState<PricingTab>("plans");
  const [isScrolled, setIsScrolled] = useState(false);

  const { data: session, isPending: sessionLoading } = useSession();
  const {
    data: creditsData,
    isLoading: creditsLoading,
    isError: creditsError,
    refetch: refetchCredits,
  } = useUserCredits();

  const credits = creditsError ? null : (creditsData?.credits ?? null);
  const hasSubscription = creditsError
    ? false
    : (creditsData?.hasActiveSubscription ?? false);
  const currentTier = creditsError ? "free" : (creditsData?.tier ?? "free");
  const loading = sessionLoading || creditsLoading;

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > SCROLL_COMPACT_THRESHOLD);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openPricingModal = (tab: PricingTab = "plans") => {
    setPricingInitialTab(tab);
    setShowPricingModal(true);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full shrink-0 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="mx-auto w-full px-3 sm:px-4 md:px-6">
        <div
          data-scrolled={isScrolled}
          className={cn(
            "nav-pill bg-background/78 supports-[backdrop-filter]:bg-background/62 mx-auto flex w-full items-center justify-between gap-3 rounded-full border shadow-[0_10px_40px_-24px_rgba(15,23,42,0.45)] backdrop-blur-xl",
            "ease-[cubic-bezier(0.32,0.72,0,1)] transition-[max-width,padding,box-shadow,border-color,background-color] duration-500 motion-reduce:transition-none",
            isScrolled
              ? "max-w-4xl border-border/80 px-3 py-2 shadow-[0_16px_44px_-26px_rgba(15,23,42,0.55)] sm:px-4"
              : "max-w-6xl border-border/55 px-3.5 py-2.5 sm:px-5 sm:py-3",
          )}
        >
          <Link
            href="/"
            className="group flex min-w-0 flex-row items-center gap-2 transition-opacity hover:opacity-90 sm:gap-2.5"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 scale-[1.3] rounded-full bg-blue-500/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
              <Image
                src="/squidagent-logo.svg"
                alt="Squid Agent"
                width={36}
                height={36}
                loading="eager"
                className={cn(
                  "relative z-10 object-contain transition-[transform,width,height] duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-1 group-hover:scale-[1.05] motion-reduce:transition-none",
                  isScrolled ? "h-8 w-8" : "h-9 w-9",
                )}
              />
            </div>

            <div className="font-sans-dm hidden flex-col justify-center sm:flex">
              <span
                className={cn(
                  "font-bold leading-tight tracking-tighter text-foreground transition-[font-size,color] duration-500 group-hover:text-[#0062FF] motion-reduce:transition-none dark:group-hover:text-[#0CA8FF]",
                  isScrolled ? "text-[14px]" : "text-[15px]",
                )}
              >
                Squid
              </span>
            </div>

            {!session && !loading && !isScrolled && (
              <span className="ml-0.5 hidden items-center gap-1.5 rounded-full border border-[#0CA8FF]/20 bg-[#0CA8FF]/[0.08] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0095ff] sm:inline-flex">
                <svg
                  className="size-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
                Guest
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div
            className={cn(
              "hidden min-w-0 items-center md:flex lg:gap-3",
              isScrolled ? "gap-1.5" : "gap-2 lg:gap-4",
            )}
          >
            <ResourcesMenu className="hidden lg:block" />
            {loading ? (
              <span className="text-sm text-muted-foreground">Loading…</span>
            ) : session ? (
              <>
                {creditsError ? (
                  <Button
                    onClick={() => void refetchCredits()}
                    variant="ghost"
                    size="sm"
                    className="text-amber-700 hover:bg-amber-500/10 dark:text-amber-300"
                  >
                    Retry billing
                  </Button>
                ) : hasSubscription ? (
                  <Button
                    onClick={() => openPricingModal("credits")}
                    variant="ghost"
                    size="sm"
                    className="gap-2 bg-muted px-3 text-muted-foreground hover:bg-accent hover:text-white"
                    aria-label="Buy more credits"
                  >
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>{credits ?? 0} credits</span>
                  </Button>
                ) : (
                  <Button onClick={() => openPricingModal("plans")} size="sm">
                    <Zap className="h-4 w-4" />
                    Upgrade
                  </Button>
                )}
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-accent hover:text-white"
                >
                  <Link href="/gallery">Gallery</Link>
                </Button>
                <Button
                  onClick={() => openPricingModal("plans")}
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-accent hover:text-white"
                >
                  Pricing
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-accent hover:text-white"
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-accent hover:text-white"
                >
                  <Link href="/dashboard/usage">Usage</Link>
                </Button>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-accent hover:text-white"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-accent hover:text-white"
                >
                  <Link href="/gallery">Gallery</Link>
                </Button>
                <Button
                  onClick={() => openPricingModal("plans")}
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-accent hover:text-white"
                >
                  Pricing
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-accent hover:text-white"
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
            <AnimatedThemeToggleButton variant="horizontal" />
            <Button
              className="size-8 text-foreground hover:bg-accent hover:text-white"
              onClick={onHelpClick}
              variant="ghost"
              size="icon"
              aria-label="Help"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 rounded-full md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <XIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] max-h-[calc(100svh-max(1.5rem,env(safe-area-inset-top)))] overflow-y-auto rounded-[1.75rem] border border-border bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Image
                  src="/squidagent-logo.svg"
                  alt="Squid Agent"
                  width={28}
                  height={28}
                  loading="eager"
                  className="h-7 w-auto"
                />
                <span className="text-sm font-semibold tracking-tight">
                  Menu
                </span>
              </div>
              <Button
                onClick={() => setMobileMenuOpen(false)}
                variant="ghost"
                size="icon"
                className="size-10 rounded-full"
                aria-label="Close menu"
              >
                <XIcon className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              <MobileResourcesList
                onNavigate={() => setMobileMenuOpen(false)}
              />
              {loading ? (
                <span className="text-sm text-muted-foreground">Loading…</span>
              ) : session ? (
                <>
                  {hasSubscription ? (
                    <Button
                      onClick={() => {
                        openPricingModal("credits");
                        setMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="min-h-12 justify-start gap-2 bg-muted px-4 text-muted-foreground"
                      aria-label="Buy more credits"
                    >
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>{credits ?? 0} credits</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        openPricingModal("plans");
                        setMobileMenuOpen(false);
                      }}
                      size="sm"
                      className="min-h-12 justify-start"
                    >
                      <Zap className="h-4 w-4" />
                      Upgrade
                    </Button>
                  )}
                  <Button
                    asChild
                    variant="default"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-12 justify-start"
                  >
                    <Link href="/gallery">Gallery</Link>
                  </Button>
                  <Button
                    onClick={() => {
                      openPricingModal("plans");
                      setMobileMenuOpen(false);
                    }}
                    variant="default"
                    className="min-h-12 justify-start"
                  >
                    Pricing
                  </Button>
                  <Button
                    asChild
                    variant="default"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-12 justify-start"
                  >
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button
                    asChild
                    variant="default"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-12 justify-start"
                  >
                    <Link href="/dashboard/usage">Usage</Link>
                  </Button>
                  <Button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    variant="default"
                    className="min-h-12 justify-start"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="default"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-12 justify-start"
                  >
                    <Link href="/gallery">Gallery</Link>
                  </Button>
                  <Button
                    onClick={() => {
                      openPricingModal("plans");
                      setMobileMenuOpen(false);
                    }}
                    variant="default"
                    className="min-h-12 justify-start"
                  >
                    Pricing
                  </Button>
                  <Button
                    asChild
                    variant="default"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-12 justify-start"
                  >
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    variant="default"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-12 justify-start"
                  >
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </>
              )}
              <div className="mt-1 border-t border-border pt-3">
                <div className="flex items-center justify-between gap-3">
                  <AnimatedThemeToggleButton variant="horizontal" />
                  <Button
                    className="size-11 rounded-full text-foreground hover:bg-accent hover:text-white"
                    onClick={() => {
                      onHelpClick?.();
                      setMobileMenuOpen(false);
                    }}
                    variant="ghost"
                    size="icon"
                    aria-label="Help"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <PricingModal
        open={showPricingModal}
        onOpenChange={setShowPricingModal}
        remainingCredits={credits ?? 0}
        isAuthenticated={!!session}
        initialTab={pricingInitialTab}
        currentTier={currentTier}
      />
    </header>
  );
}

export default memo(Header);
