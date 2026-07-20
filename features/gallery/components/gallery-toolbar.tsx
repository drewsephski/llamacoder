"use client";

import { ArrowRight, ArrowUpDown, Clock, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as Select from "@radix-ui/react-select";

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
    <>
      <style>{`
        .gallery-sort-trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 48px;
          width: 100%;
          padding: 0 12px;
          border-radius: 12px;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: hsl(var(--foreground));
          box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
          transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          outline: none;
        }
        .gallery-sort-trigger:hover {
          background: hsl(var(--muted) / 0.75);
          border-color: hsl(var(--border) / 0.7);
        }
        .gallery-sort-trigger[data-state="open"],
        .gallery-sort-trigger:focus-visible {
          background: hsl(var(--background));
          border-color: rgba(59,130,246,0.35);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.07);
        }
        .gallery-sort-trigger-label {
          flex: 1;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .gallery-sort-content {
          border-radius: 12px;
          overflow: hidden;
          background: hsl(var(--popover));
          box-shadow: 0 16px 36px -14px rgba(0,0,0,0.28), 0 3px 12px rgba(0,0,0,0.06);
          border: 1px solid hsl(var(--border) / 0.6);
          transform-origin: var(--radix-select-content-transform-origin);
          animation: gallerySelectIn 0.16s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
          z-index: 50;
        }
        .gallery-sort-content[data-state="closed"] {
          animation: gallerySelectOut 0.12s ease-in;
        }
        @keyframes gallerySelectIn {
          from { opacity: 0; transform: translateY(4px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes gallerySelectOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(4px) scale(0.98); }
        }
        .gallery-sort-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 8px;
          margin: 2px;
          cursor: pointer;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: hsl(var(--foreground));
          transition: background 0.14s ease;
          outline: none;
        }
        .gallery-sort-item[data-highlighted] {
          background: linear-gradient(90deg, rgba(59,130,246,0.08), rgba(99,102,241,0.03));
        }
        .gallery-sort-item[data-state="checked"] {
          color: rgb(59 130 246);
        }
        .gallery-sort-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 5px;
          background: hsl(var(--muted) / 0.6);
          flex-shrink: 0;
        }
        .gallery-sort-icon svg {
          width: 12px;
          height: 12px;
          color: hsl(var(--muted-foreground));
        }
        .gallery-sort-item[data-state="checked"] .gallery-sort-icon {
          background: rgb(59 130 246 / 0.1);
        }
        .gallery-sort-item[data-state="checked"] .gallery-sort-icon svg {
          color: rgb(59 130 246);
        }
      `}</style>

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

        <Select.Root
          value={sort}
          onValueChange={(value) => updateParams({ sort: value })}
        >
          <Select.Trigger
            className="gallery-sort-trigger"
            aria-label="Sort projects"
          >
            <span className="sr-only">Sort projects</span>
            <Select.Value>
              <span className="gallery-sort-trigger-label">
                {sort === "newest" ? "Newest" : "Oldest"}
              </span>
            </Select.Value>
            <Select.Icon>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="size-4 shrink-0 text-muted-foreground"
              >
                <path
                  d="m6 8 4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content
              position="popper"
              side="bottom"
              align="start"
              sideOffset={6}
              className="gallery-sort-content"
            >
              <Select.Viewport className="p-1">
                <Select.Item value="newest" className="gallery-sort-item">
                  <span className="gallery-sort-icon">
                    <Clock />
                  </span>
                  <Select.ItemText>Newest</Select.ItemText>
                </Select.Item>
                <Select.Item value="oldest" className="gallery-sort-item">
                  <span className="gallery-sort-icon">
                    <ArrowUpDown />
                  </span>
                  <Select.ItemText>Oldest</Select.ItemText>
                </Select.Item>
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

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
    </>
  );
}
