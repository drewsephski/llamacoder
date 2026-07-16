"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type SearchResult = {
  id: string;
  url: string;
  type: "page" | "heading" | "text";
  content: string;
  breadcrumbs?: string[];
};

function isSearchResult(value: unknown): value is SearchResult {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.url === "string" &&
    typeof candidate.content === "string" &&
    (candidate.type === "page" ||
      candidate.type === "heading" ||
      candidate.type === "text")
  );
}

function parseResults(value: unknown): SearchResult[] {
  return Array.isArray(value) ? value.filter(isSearchResult) : [];
}

function plainText(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function DocsSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
  }, []);

  const setDialogOpen = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setQuery("");
      setResults([]);
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?query=${encodeURIComponent(normalized)}&limit=12`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Search request failed");
        setResults(parseResults(await response.json()));
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex h-10 min-w-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:min-w-48"
          aria-label="Search documentation"
        >
          <Search className="size-4" />
          <span className="hidden sm:inline">Search docs</span>
          <kbd className="ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] sm:inline">
            ⌘K
          </kbd>
        </button>
      </DialogTrigger>

      <DialogContent className="top-[12vh] block w-[calc(100vw-2rem)] max-w-2xl translate-y-0 gap-0 overflow-hidden rounded-2xl p-0 sm:w-full sm:rounded-2xl sm:p-0">
        <DialogTitle className="sr-only">Search documentation</DialogTitle>
        <DialogDescription className="sr-only">
          Search Squid Agent guides, examples, and prompt collections.
        </DialogDescription>
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-5 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search guides, examples, and prompt collections…"
            className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <span className="w-8" aria-hidden="true" />
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {query.trim().length < 2 ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">
              Enter at least two characters to search the docs.
            </p>
          ) : loading ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">
              Searching…
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">
              No documentation matched “{query.trim()}”.
            </p>
          ) : (
            <ul className="space-y-1">
              {results.map((result) => (
                <li key={`${result.id}-${result.url}-${result.type}`}>
                  <Link
                    href={result.url}
                    onClick={close}
                    className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted"
                  >
                    <div className="min-w-0 flex-1">
                      {result.breadcrumbs?.length ? (
                        <p className="mb-1 truncate text-[11px] font-medium uppercase tracking-wide text-primary">
                          {result.breadcrumbs.map(plainText).join(" / ")}
                        </p>
                      ) : null}
                      <p className="line-clamp-2 text-sm leading-5 text-foreground">
                        {plainText(result.content)}
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
