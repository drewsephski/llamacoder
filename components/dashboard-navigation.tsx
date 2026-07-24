"use client";

import Image from "next/image";
import Link from "next/link";
import {
  GalleryHorizontalEnd,
  LayoutDashboard,
  Menu,
  ReceiptText,
} from "lucide-react";

import { DashboardCreditsButton } from "@/components/dashboard-credits-button";
import { DashboardSignOutButton } from "@/components/dashboard-sign-out-button";
import { AnimatedThemeToggleButton } from "@/components/ui/animated-theme-toggle-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { TierKey } from "@/lib/billing/config";

type DashboardNavigationProps = {
  credits: number;
  currentPage: "Dashboard" | "Usage";
  currentTier: TierKey;
};

const accountLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/usage",
    label: "Usage",
    icon: ReceiptText,
  },
  {
    href: "/gallery",
    label: "Gallery",
    icon: GalleryHorizontalEnd,
  },
] as const;

export function DashboardNavigation({
  credits,
  currentPage,
  currentTier,
}: DashboardNavigationProps) {
  return (
    <nav
      className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75"
      aria-label="Account navigation"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Squid Agent home"
        >
          <Image
            src="/squidagent-logo.svg"
            alt=""
            width={32}
            height={32}
            priority
            className="size-8 shrink-0 object-contain"
          />
          <span className="truncate text-sm font-semibold md:hidden">
            {currentPage}
          </span>
          <span className="hidden items-center gap-2 text-sm md:flex">
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">{currentPage}</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 md:hidden">
          <DashboardCreditsButton
            credits={credits}
            currentTier={currentTier}
            compact
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-11"
                aria-label="Open account menu"
              >
                <Menu className="size-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="!left-0 !top-0 flex !h-dvh !w-screen !max-w-none !translate-x-0 !translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:rounded-none sm:p-0">
              <DialogTitle className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-4 pr-14 text-base sm:px-6">
                <Image
                  src="/squidagent-logo.svg"
                  alt=""
                  width={28}
                  height={28}
                  className="size-7"
                />
                Account
              </DialogTitle>
              <DialogDescription className="sr-only">
                Navigate your Squid Agent account and preferences.
              </DialogDescription>

              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 sm:px-6">
                <div className="mb-5 rounded-xl border border-border bg-muted/30 p-3">
                  <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Available credits
                  </p>
                  <DashboardCreditsButton
                    credits={credits}
                    currentTier={currentTier}
                    className="min-h-12 w-full justify-start"
                    showLabel
                  />
                </div>

                <div className="space-y-1">
                  {accountLinks.map((link) => {
                    const Icon = link.icon;
                    const isCurrent = link.label === currentPage;

                    return (
                      <DialogClose asChild key={link.href}>
                        <Button
                          asChild
                          variant={isCurrent ? "secondary" : "ghost"}
                          className="min-h-12 w-full justify-start gap-3 px-4 text-base"
                        >
                          <Link
                            href={link.href}
                            aria-current={isCurrent ? "page" : undefined}
                          >
                            <Icon className="size-5" />
                            {link.label}
                          </Link>
                        </Button>
                      </DialogClose>
                    );
                  })}
                </div>

                <div className="mt-auto border-t border-border pt-5">
                  <div className="mb-3 flex min-h-12 items-center justify-between rounded-xl px-4">
                    <span className="text-sm font-medium">Appearance</span>
                    <AnimatedThemeToggleButton variant="horizontal" />
                  </div>
                  <DashboardSignOutButton
                    className="min-h-12 w-full justify-start gap-3 px-4 text-base"
                    showLabel
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="hidden items-center gap-2 md:flex lg:gap-3">
          <DashboardCreditsButton credits={credits} currentTier={currentTier} />
          {accountLinks.map((link) =>
            link.label === currentPage ? null : (
              <Button asChild variant="ghost" size="sm" key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ),
          )}
          <AnimatedThemeToggleButton variant="horizontal" />
          <DashboardSignOutButton />
        </div>
      </div>
    </nav>
  );
}
