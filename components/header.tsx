"use client";

import { memo, useEffect, useState } from "react";

import Link from "next/link";
import { AnimatedThemeToggleButton } from "@/components/ui/animated-theme-toggle-button";
import { authClient } from "@/lib/auth-client";
import { MenuIcon, XIcon, Zap, Loader2, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { PricingModal } from "@/components/pricing-modal";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onHelpClick?: () => void;
}

function Header({ onHelpClick }: HeaderProps) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  useEffect(() => {
    authClient.getSession()
      .then((result) => {
        if (result.data) {
          setSession(result.data);
          // Fetch credits for authenticated users
          fetchCredits();
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/user/credits");
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
        setHasSubscription(data.hasActiveSubscription);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please sign in to subscribe");
          return;
        }
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  return (
    <header className="relative mx-auto flex w-full shrink-0 items-center justify-between px-4 py-4 sm:py-6">
      <Link href="/" className="min-w-0 flex flex-row items-center gap-3">
        <img
          src="/squidcoder-logo.svg"
          alt="Squid Coder"
          className="h-9 object-contain"
        />
        {!session && !loading && (
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Guest
          </span>
        )}
      </Link>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-3 lg:gap-4">
        {loading ? (
          <span className="text-sm text-muted-foreground">Loading…</span>
        ) : session ? (
          <>
            {/* Credits / Upgrade Button */}
            {hasSubscription ? (
              <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>{credits ?? 0} credits</span>
              </div>
            ) : (
              <Button
                onClick={() => setShowPricingModal(true)}
                size="sm"
              >
                <Zap className="h-4 w-4" />
                Upgrade
              </Button>
            )}
            <Button asChild variant="ghost" size="sm" className="text-foreground hover:text-white hover:bg-accent">
              <Link href="/dashboard">
                Dashboard 
              </Link>
            </Button>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="text-foreground hover:text-white hover:bg-accent"
            >
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => setShowPricingModal(true)}
              variant="ghost"
              size="sm"
              className="text-foreground hover:text-white hover:bg-accent"
            >
              Pricing
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-foreground hover:text-white hover:bg-accent">
              <Link href="/sign-in">
                Sign In
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/sign-up">
                Sign Up
              </Link>
            </Button>
          </>
        )}
        <AnimatedThemeToggleButton variant="horizontal" />
        <Button
          onClick={onHelpClick}
          variant="ghost"
          size="icon"
          className="size-8"
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
        className="size-10 md:hidden"
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
          <div className="absolute right-0 top-0 h-full w-full max-w-[280px] overflow-y-auto border-l border-border bg-background p-5 shadow-xl">
            <div className="flex flex-col gap-4 pt-12">
              {loading ? (
                <span className="text-sm text-muted-foreground">Loading…</span>
              ) : session ? (
                <>
                  {/* Mobile Credits / Upgrade */}
                  {hasSubscription ? (
                    <div className="flex items-center gap-2 rounded-md bg-muted px-4 py-2 text-sm text-muted-foreground">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>{credits ?? 0} credits</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setShowPricingModal(true);
                        setMobileMenuOpen(false);
                      }}
                      size="sm"
                      className="justify-start"
                    >
                      <Zap className="h-4 w-4" />
                      Upgrade
                    </Button>
                  )}
                    <Button asChild variant="default" onClick={() => setMobileMenuOpen(false)} className="justify-start">
                    <Link href="/dashboard">
                      Dashboard
                    </Link>
                  </Button>
                  <Button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    variant="default"
                    className="justify-start"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setShowPricingModal(true);
                      setMobileMenuOpen(false);
                    }}
                    variant="default"
                    className="justify-start"
                  >
                    Pricing
                  </Button>
                  <Button asChild variant="default" onClick={() => setMobileMenuOpen(false)} className="justify-start">
                    <Link href="/sign-in">
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild variant="default" onClick={() => setMobileMenuOpen(false)} className="justify-start">
                    <Link href="/sign-up">
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
              <div className="pt-4 border-t border-border">
                <AnimatedThemeToggleButton variant="horizontal" />
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
      />
    </header>
  );
}

export default memo(Header);
