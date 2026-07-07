"use client";

import { memo, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { AnimatedThemeToggleButton } from "@/components/ui/animated-theme-toggle-button";
import { MenuIcon, XIcon, Zap, HelpCircle } from "lucide-react";
import { PricingModal } from "@/components/pricing-modal";
import { Button } from "@/components/ui/button";
import { useUserCredits, useUserSession } from "@/lib/queries";
import { authClient } from "@/lib/auth-client";

interface HeaderProps {
  onHelpClick?: () => void;
}

type PricingTab = "plans" | "credits";

function Header({ onHelpClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricingInitialTab, setPricingInitialTab] =
    useState<PricingTab>("plans");

  const { data: session, isLoading: sessionLoading } = useUserSession();
  const { data: creditsData, isLoading: creditsLoading } = useUserCredits();

  const credits = creditsData?.credits ?? null;
  const hasSubscription = creditsData?.hasActiveSubscription ?? false;
  const currentTier = creditsData?.tier ?? "free";
  const loading = sessionLoading || creditsLoading;

  const openPricingModal = (tab: PricingTab = "plans") => {
    setPricingInitialTab(tab);
    setShowPricingModal(true);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-40 mx-auto flex w-full shrink-0 items-center justify-between bg-background/80 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/65 sm:py-6 md:relative md:bg-transparent md:backdrop-blur-none">
      <Link
        href="/"
        className="group flex min-w-0 flex-row items-center gap-3 transition-opacity hover:opacity-90"
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 scale-[1.3] rounded-full bg-blue-500/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
          <Image
            src="/squidagent-logo.svg"
            alt="Squid Agent"
            width={36}
            height={36}
            className="ease-[cubic-bezier(0.34,1.56,0.64,1)] relative z-10 h-9 object-contain transition-transform duration-500 group-hover:-rotate-1 group-hover:scale-[1.05]"
          />
        </div>

        <div className="font-sans-dm hidden flex-col justify-center sm:flex">
          <span className="text-[15px] font-bold leading-tight tracking-tighter text-foreground transition-colors group-hover:text-[#0062FF] dark:group-hover:text-[#0CA8FF]">
            Squid
          </span>
        </div>

        {!session && !loading && (
          <span className="ml-1 hidden items-center gap-1.5 rounded-full border border-[#0CA8FF]/20 bg-[#0CA8FF]/[0.08] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0095ff] sm:inline-flex">
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
      <div className="hidden items-center gap-3 md:flex lg:gap-4">
        {loading ? (
          <span className="text-sm text-muted-foreground">Loading…</span>
        ) : session ? (
          <>
            {/* Credits / Upgrade Button */}
            {hasSubscription ? (
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
              <Link href="/dashboard">Dashboard</Link>
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
        className="size-11 md:hidden"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <XIcon className="h-6 w-6" />
        ) : (
          <MenuIcon className="h-6 w-6" />
        )}
      </Button>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute inset-x-3 top-3 max-h-[calc(100svh-1.5rem)] overflow-y-auto rounded-2xl border border-border bg-background p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Image
                  src="/squidagent-logo.svg"
                  alt=""
                  width={28}
                  height={28}
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
                className="size-10"
                aria-label="Close menu"
              >
                <XIcon className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              {loading ? (
                <span className="text-sm text-muted-foreground">Loading…</span>
              ) : session ? (
                <>
                  {/* Mobile Credits / Upgrade */}
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
                    <Link href="/dashboard">Dashboard</Link>
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
                    className="size-11 text-foreground hover:bg-accent hover:text-white"
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
