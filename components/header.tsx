"use client";

import { memo, useEffect, useState } from "react";

import Link from "next/link";
import { AnimatedThemeToggleButton } from "@/components/ui/animated-theme-toggle-button";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

function Header() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center gap-4">
        {loading ? (
          <span className="text-sm text-muted-foreground">Loading...</span>
        ) : session ? (
          <>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-foreground hover:text-muted-foreground"
            >
              Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="text-sm font-medium text-foreground hover:text-muted-foreground"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/sign-in"
              className="text-sm font-medium text-foreground hover:text-muted-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Sign Up
            </Link>
          </>
        )}
        <AnimatedThemeToggleButton variant="horizontal" />
      </div>
    </header>
  );
}

export default memo(Header);
