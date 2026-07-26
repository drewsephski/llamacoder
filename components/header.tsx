"use client";

import { memo, useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { AnimatedThemeToggleButton } from "@/components/ui/animated-theme-toggle-button";
import {
  BarChart3,
  CreditCard,
  GalleryHorizontalEnd,
  HelpCircle,
  LayoutDashboard,
  LogIn,
  LogOut,
  MenuIcon,
  UserPlus,
  Zap,
} from "lucide-react";
import { PricingModal } from "@/features/billing/components/pricing-modal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const mobileMenuItemClassName =
  "flex min-h-11 min-w-0 items-center gap-2.5 rounded-xl border border-border/75 bg-muted/35 px-3 text-sm font-semibold text-foreground shadow-sm transition-[background-color,border-color,transform] hover:border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-colors";

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
  } = useUserCredits(Boolean(session));

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

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const closeMobileMenu = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileMenuOpen(false);
    };

    desktopQuery.addEventListener("change", closeMobileMenu);
    return () => desktopQuery.removeEventListener("change", closeMobileMenu);
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
    <header className="sticky top-0 z-50 w-full shrink-0 pt-[max(0.5rem,env(safe-area-inset-top))] sm:pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="mx-auto w-full px-3 sm:px-4 md:px-6">
        <div
          data-scrolled={isScrolled}
          className={cn(
            "nav-pill mx-auto flex w-full items-center justify-between gap-2 rounded-full border bg-background/95 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.45)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 sm:gap-3",
            "ease-[cubic-bezier(0.32,0.72,0,1)] transition-[max-width,padding,box-shadow,border-color,background-color] duration-500 motion-reduce:transition-none",
            isScrolled
              ? "max-w-4xl border-border/80 px-2.5 py-1.5 shadow-[0_16px_44px_-26px_rgba(15,23,42,0.55)] sm:px-4 sm:py-2"
              : "max-w-6xl border-border/70 px-2.5 py-1.5 sm:px-5 sm:py-3",
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
                  isScrolled ? "size-7 sm:size-8" : "size-8 sm:size-9",
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

          <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-11 shrink-0 rounded-full border border-border/80 bg-foreground text-background shadow-sm hover:bg-foreground/90 hover:text-background md:hidden"
                aria-label="Open navigation"
              >
                <MenuIcon className="size-4.5" strokeWidth={2.25} />
              </Button>
            </DialogTrigger>

            <DialogContent
              className="flex w-[calc(100vw-1.5rem)] max-w-[22rem] !translate-y-0 flex-col gap-3 overflow-y-auto rounded-[1.25rem] border-border bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_24px_80px_-24px_hsl(var(--foreground)/0.45)] sm:w-[calc(100vw-1.5rem)] sm:max-w-[22rem] sm:p-3 md:hidden"
              style={{
                top: "calc(env(safe-area-inset-top) + 4.25rem)",
                maxHeight: "calc(100dvh - env(safe-area-inset-top) - 5rem)",
              }}
            >
              <div className="flex min-h-11 items-center gap-2.5 border-b border-border/80 px-1 pb-3 pr-12">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                  <Image
                    src="/squidagent-logo.svg"
                    alt=""
                    width={26}
                    height={26}
                    loading="eager"
                    className="size-6 object-contain"
                  />
                </span>
                <div className="min-w-0">
                  <DialogTitle>Navigation</DialogTitle>
                  <DialogDescription className="sr-only">
                    Navigate Squid Agent and manage your account.
                  </DialogDescription>
                  <p className="truncate text-xs text-muted-foreground">
                    {session ? "Workspace and account" : "Explore Squid Agent"}
                  </p>
                </div>
              </div>

              <nav aria-label="Primary mobile navigation">
                {loading ? (
                  <div
                    className="grid grid-cols-2 gap-2"
                    aria-label="Loading navigation"
                  >
                    <span className="h-11 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
                    <span className="h-11 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
                  </div>
                ) : session ? (
                  <div className="grid grid-cols-2 gap-2">
                    {creditsError ? (
                      <button
                        type="button"
                        onClick={() => void refetchCredits()}
                        className={cn(
                          mobileMenuItemClassName,
                          "col-span-2 text-amber-700 dark:text-amber-300",
                        )}
                      >
                        <Zap className="size-4" aria-hidden="true" />
                        Retry billing
                      </button>
                    ) : hasSubscription ? (
                      <button
                        type="button"
                        onClick={() => {
                          openPricingModal("credits");
                          setMobileMenuOpen(false);
                        }}
                        className={cn(
                          mobileMenuItemClassName,
                          "col-span-2 border-primary/20 bg-primary/10 text-primary",
                        )}
                      >
                        <Zap className="size-4" aria-hidden="true" />
                        <span>{credits ?? 0} credits</span>
                        <span className="ml-auto text-xs font-medium opacity-75">
                          Add more
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          openPricingModal("plans");
                          setMobileMenuOpen(false);
                        }}
                        className={cn(
                          mobileMenuItemClassName,
                          "col-span-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90",
                        )}
                      >
                        <Zap className="size-4" aria-hidden="true" />
                        Upgrade
                      </button>
                    )}

                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className={mobileMenuItemClassName}
                    >
                      <LayoutDashboard
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      Dashboard
                    </Link>
                    <Link
                      href="/gallery"
                      onClick={() => setMobileMenuOpen(false)}
                      className={mobileMenuItemClassName}
                    >
                      <GalleryHorizontalEnd
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      Gallery
                    </Link>
                    <Link
                      href="/dashboard/usage"
                      onClick={() => setMobileMenuOpen(false)}
                      className={mobileMenuItemClassName}
                    >
                      <BarChart3
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      Usage
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        openPricingModal("plans");
                        setMobileMenuOpen(false);
                      }}
                      className={mobileMenuItemClassName}
                    >
                      <CreditCard
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      Pricing
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/gallery"
                      onClick={() => setMobileMenuOpen(false)}
                      className={mobileMenuItemClassName}
                    >
                      <GalleryHorizontalEnd
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      Gallery
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        openPricingModal("plans");
                        setMobileMenuOpen(false);
                      }}
                      className={mobileMenuItemClassName}
                    >
                      <CreditCard
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      Pricing
                    </button>
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                      className={mobileMenuItemClassName}
                    >
                      <LogIn
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      Sign in
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        mobileMenuItemClassName,
                        "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
                      )}
                    >
                      <UserPlus className="size-4" aria-hidden="true" />
                      Sign up
                    </Link>
                  </div>
                )}
              </nav>

              <MobileResourcesList
                compact
                onNavigate={() => setMobileMenuOpen(false)}
              />

              <div className="flex items-center gap-2 border-t border-border/80 pt-3">
                <div className="flex min-h-10 flex-1 items-center justify-between rounded-xl border border-border/75 bg-muted/35 px-3 text-xs font-semibold text-muted-foreground">
                  Appearance
                  <AnimatedThemeToggleButton
                    className="!mx-0 ring-offset-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    variant="horizontal"
                    style={{ width: 44, height: 44 }}
                  />
                </div>
                <button
                  type="button"
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/75 bg-muted/35 text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  onClick={() => {
                    onHelpClick?.();
                    setMobileMenuOpen(false);
                  }}
                  aria-label="Help"
                >
                  <HelpCircle className="size-4" aria-hidden="true" />
                </button>
                {session ? (
                  <button
                    type="button"
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/75 bg-muted/35 text-muted-foreground shadow-sm transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    onClick={() => {
                      void handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    aria-label="Sign out"
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
