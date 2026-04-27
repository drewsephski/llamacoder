"use client";

import { memo, useEffect, useState } from "react";

import Link from "next/link";
import { AnimatedThemeToggleButton } from "@/components/ui/animated-theme-toggle-button";
import { authClient } from "@/lib/auth-client";
import { MenuIcon, XIcon } from "lucide-react";

function Header() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    authClient.getSession()
      .then((result) => {
        if (result.data) {
          setSession(result.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  return (
    <header className="relative mx-auto flex w-full shrink-0 items-center justify-between px-4 py-6">
      <Link href="/" className="flex flex-row items-center gap-3">
        <img
          src="/squidcoder-logo.svg"
          alt="Squid Coder"
          className="h-9 object-contain"
        />
      </Link>
      
      {/* Desktop Navigation */}
      <div className="hidden sm:flex items-center gap-4">
        {loading ? (
          <span className="text-sm text-muted-foreground">Loading...</span>
        ) : session ? (
          <>
            <Link
              href="/dashboard"
              className="rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted min-h-[44px] flex items-center"
            >
              Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted min-h-[44px] flex items-center"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/sign-in"
              className="rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted min-h-[44px] flex items-center"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 min-h-[44px] flex items-center"
            >
              Sign Up
            </Link>
          </>
        )}
        <AnimatedThemeToggleButton variant="horizontal" />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="sm:hidden flex items-center justify-center p-2 rounded-md hover:bg-muted min-h-[44px] min-w-[44px]"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <XIcon className="h-6 w-6" />
        ) : (
          <MenuIcon className="h-6 w-6" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-[200px] bg-background border-l border-border p-6 shadow-xl">
            <div className="flex flex-col gap-4 pt-12">
              {loading ? (
                <span className="text-sm text-muted-foreground">Loading...</span>
              ) : session ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted min-h-[48px] flex items-center"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="rounded-md px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted min-h-[48px] flex items-center text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted min-h-[48px] flex items-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md bg-primary px-4 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 min-h-[48px] flex items-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
              <div className="pt-4 border-t border-border">
                <AnimatedThemeToggleButton variant="horizontal" />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default memo(Header);
