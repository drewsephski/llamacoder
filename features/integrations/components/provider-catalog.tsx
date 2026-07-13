"use client";

import { useMemo, useState } from "react";
import { Ban, KeyRound, Search, Server, ShieldCheck, Zap } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { IntegrationProviderSummary } from "@/features/integrations/contracts";
import { cn } from "@/lib/utils";

type CatalogFilter = "all" | "instant" | "connected";

const filters: { value: CatalogFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "instant", label: "No key needed" },
  { value: "connected", label: "Needs setup" },
];

function setupPresentation(provider: IntegrationProviderSummary) {
  if (provider.setup === "blocked") {
    return { label: "Unavailable", icon: Ban, className: "text-destructive" };
  }
  if (provider.setup === "instant") {
    return {
      label: "Works instantly",
      icon: Zap,
      className: "text-emerald-700 dark:text-emerald-300",
    };
  }
  if (provider.setup === "oauth") {
    return {
      label: "Connect account",
      icon: ShieldCheck,
      className: "text-blue-700 dark:text-blue-300",
    };
  }
  return {
    label: "API key required",
    icon: KeyRound,
    className: "text-amber-700 dark:text-amber-300",
  };
}

export function ProviderCatalog({
  providers,
  selectedProviderId,
  selectedProviderIds,
  onSelect,
}: {
  providers: IntegrationProviderSummary[];
  selectedProviderId?: string;
  selectedProviderIds?: string[];
  onSelect: (providerId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CatalogFilter>("all");
  const visibleProviders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return providers.filter((provider) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "instant" && provider.setup === "instant") ||
        (filter === "connected" &&
          provider.setup !== "instant" &&
          provider.setup !== "blocked");
      const matchesQuery =
        !normalizedQuery ||
        [
          provider.name,
          provider.description,
          provider.category,
          ...provider.capabilities,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesFilter && matchesQuery;
    });
  }, [filter, providers, query]);

  return (
    <div className="mt-4 grid gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-9"
          placeholder="Search APIs by name or feature"
          aria-label="Search APIs"
        />
      </div>
      <div className="flex flex-wrap gap-2" aria-label="API catalog filters">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            aria-pressed={filter === item.value}
            className={cn(
              "min-h-8 rounded-full border px-3 text-xs font-medium transition-colors",
              filter === item.value
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      {visibleProviders.length ? (
        <div className="grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {visibleProviders.map((provider) => {
            const setup = setupPresentation(provider);
            const SetupIcon = setup.icon;
            const selected = selectedProviderIds
              ? selectedProviderIds.includes(provider.id)
              : provider.id === selectedProviderId;
            const blocked = provider.setup === "blocked";
            return (
              <button
                key={provider.id}
                type="button"
                disabled={blocked}
                aria-pressed={selected}
                onClick={() => onSelect(provider.id)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border/70 hover:border-foreground/30 hover:bg-muted/40",
                  blocked &&
                    "cursor-not-allowed opacity-60 hover:bg-transparent",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{provider.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {provider.description}
                    </p>
                  </div>
                  {provider.runtime === "server" && (
                    <Server
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      aria-label="Server runtime"
                    />
                  )}
                </div>
                <div
                  className={cn(
                    "mt-3 flex items-center gap-1.5 text-xs font-medium",
                    setup.className,
                  )}
                >
                  <SetupIcon className="size-3.5" />
                  {setup.label}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          No reviewed APIs match that search.
        </div>
      )}
    </div>
  );
}
