import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

function buildGalleryHref({
  query,
  remixable,
  sort,
  cursor,
}: {
  query: string;
  remixable: boolean;
  sort: "newest" | "oldest";
  cursor: string;
}) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (remixable) params.set("remixable", "true");
  if (sort !== "newest") params.set("sort", sort);
  params.set("cursor", cursor);
  return `/gallery?${params.toString()}`;
}

export function GalleryPagination({
  query,
  remixable,
  sort,
  previousCursor,
  nextCursor,
}: {
  query: string;
  remixable: boolean;
  sort: "newest" | "oldest";
  previousCursor: string | null;
  nextCursor: string | null;
}) {
  if (!previousCursor && !nextCursor) return null;

  return (
    <nav
      aria-label="Community project pages"
      className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6"
    >
      <div>
        {previousCursor && (
          <Button asChild variant="outline">
            <Link
              href={buildGalleryHref({
                query,
                remixable,
                sort,
                cursor: previousCursor,
              })}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Previous
            </Link>
          </Button>
        )}
      </div>
      <div>
        {nextCursor && (
          <Button asChild variant="outline">
            <Link
              href={buildGalleryHref({
                query,
                remixable,
                sort,
                cursor: nextCursor,
              })}
            >
              Next
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
