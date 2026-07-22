"use client";

import type { SupabaseAuthMode } from "@/features/integrations/supabase-backend";

export function SupabaseAuthModeSelector({
  value,
  onChange,
  disabled = false,
  compact = false,
}: {
  value: SupabaseAuthMode;
  onChange: (mode: SupabaseAuthMode) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const optionClassName = (selected: boolean, prototype: boolean) =>
    `rounded-lg border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 ${
      compact ? "p-3" : "p-3"
    } ${
      selected
        ? prototype
          ? "border-amber-500/60 bg-amber-500/[0.06]"
          : "border-blue-500/60 bg-blue-500/[0.06]"
        : "border-border/60 bg-background/70 hover:border-primary/40"
    }`;

  return (
    <div
      className={compact ? "grid gap-2 sm:grid-cols-2" : "grid gap-2"}
      role="radiogroup"
      aria-label="Supabase authentication mode"
    >
      <button
        type="button"
        role="radio"
        aria-checked={value === "prototype_instant_signup"}
        disabled={disabled}
        onClick={() => onChange("prototype_instant_signup")}
        className={optionClassName(value === "prototype_instant_signup", true)}
      >
        <span className="block font-semibold">
          {compact ? "Instant signup" : "Prototype/demo — instant signup"}
          <span className="ml-1 font-normal text-amber-700 dark:text-amber-300">
            Recommended for testing
          </span>
        </span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          Users can start immediately while you build and test. Email ownership
          is not verified, so switch to production mode before launch.
        </span>
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === "verified_email"}
        disabled={disabled}
        onClick={() => onChange("verified_email")}
        className={optionClassName(value === "verified_email", false)}
      >
        <span className="block font-semibold">
          {compact ? "Verified email" : "Verified email — production mode"}
        </span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          Use before launch. Requires working email delivery for confirmation
          and recovery.
        </span>
      </button>
    </div>
  );
}
