"use client";

import { ArrowRight, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export function GalleryToolbar({
  initialQuery,
  remixable,
  sort,
}: {
  initialQuery: string;
  remixable: boolean;
  sort: "newest" | "oldest";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    params.delete("page");
    router.push(`${pathname}${params.size ? `?${params}` : ""}`);
  };

  return (
    <form
      action={pathname}
      method="get"
      className="grid gap-3 md:grid-cols-[minmax(0,1fr)_150px_148px]"
    >
      <div className="relative">
        <label htmlFor="gallery-search" className="sr-only">
          Search projects
        </label>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="gallery-search"
          name="q"
          defaultValue={initialQuery}
          placeholder="Search projects"
          className="h-12 rounded-xl pl-11 pr-12 text-sm"
        />
        <button
          type="submit"
          aria-label="Search gallery"
          className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowRight className="size-4" />
        </button>
      </div>

      <label className="relative">
        <span className="sr-only">Sort projects</span>
        <select
          value={sort}
          onChange={(event) => updateParams({ sort: event.target.value })}
          className="h-12 w-full appearance-none rounded-xl border border-input bg-background px-4 pr-10 text-sm font-medium shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        >
          <path
            d="m6 8 4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </label>

      <div className="flex h-12 items-center justify-between rounded-xl border border-input bg-background px-4 shadow-sm">
        <label htmlFor="remixable-filter" className="text-sm font-medium">
          Remixable
        </label>
        <Switch
          id="remixable-filter"
          checked={remixable}
          onCheckedChange={(checked) =>
            updateParams({ remixable: checked ? "true" : null })
          }
          aria-label="Show only remixable projects"
        />
      </div>
      {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
      {remixable && <input type="hidden" name="remixable" value="true" />}
    </form>
  );
}
