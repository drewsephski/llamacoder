import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AnimatedThemeToggleButton } from "@/components/ui/animated-theme-toggle-button";
import { Button } from "@/components/ui/button";
import { getCurrentSession } from "@/features/auth/server/session";
import { GalleryProjectCard } from "@/features/gallery/components/gallery-project-card";
import { GalleryThumbnailRefresh } from "@/features/gallery/components/gallery-thumbnail-refresh";
import { GalleryToolbar } from "@/features/gallery/components/gallery-toolbar";
import { gallerySearchSchema } from "@/features/gallery/contracts";
import { getGalleryProjects } from "@/features/gallery/server/queries";

export const metadata: Metadata = {
  title: "Made with Squid",
  description:
    "Explore real apps published by the Squid community and remix projects their creators have opened up.",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawSearchParams = await searchParams;
  const parsed = gallerySearchSchema.parse({
    q: typeof rawSearchParams.q === "string" ? rawSearchParams.q : "",
    remixable:
      typeof rawSearchParams.remixable === "string"
        ? rawSearchParams.remixable
        : undefined,
    sort:
      typeof rawSearchParams.sort === "string"
        ? rawSearchParams.sort
        : "newest",
    page: typeof rawSearchParams.page === "string" ? rawSearchParams.page : "1",
  });
  const session = await getCurrentSession();
  const { projects, totalPages } = await getGalleryProjects({
    page: parsed.page,
    query: parsed.q,
    remixable: parsed.remixable,
    sort: parsed.sort,
  });
  const hasPendingThumbnails = projects.some(
    (project) => project.thumbnailStatus === "pending",
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GalleryThumbnailRefresh
        canBackfill={Boolean(session) && process.env.NODE_ENV === "production"}
        pending={hasPendingThumbnails}
      />
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 font-semibold">
            <Image
              src="/squidagent-logo.svg"
              alt="Squid"
              width={30}
              height={30}
              className="size-8 object-contain"
            />
            <span>Squid</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm md:flex">
            <Link href="/gallery" className="font-medium text-primary">
              Gallery
            </Link>
            {session && (
              <Link
                href="/dashboard"
                className="font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild size="sm">
              <Link href="/">Build an app</Link>
            </Button>
            <AnimatedThemeToggleButton variant="horizontal" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-5 pb-20 pt-14 sm:px-6 sm:pt-20 lg:px-8">
        <div>
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-medium leading-none tracking-tight sm:text-6xl">
              Made with Squid
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Explore real apps published by the community. Open any project to
              try it, then remix the ones their creators have opened up.
            </p>
          </div>
          <Button asChild size="lg" className="mt-7 w-fit">
            <Link href="/">Build an app</Link>
          </Button>
        </div>

        <div className="mt-10 sm:mt-14">
          <GalleryToolbar
            initialQuery={parsed.q}
            remixable={parsed.remixable}
            sort={parsed.sort}
          />
        </div>

        {projects.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <GalleryProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="mt-16 border-y border-border py-20 text-center">
            <h2 className="text-xl font-semibold">
              No published projects yet.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {parsed.q || parsed.remixable
                ? "Try a different search or turn off the remixable filter."
                : "Publish a generated app and it will appear here for the community to explore."}
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Gallery pagination"
            className="mt-10 flex items-center justify-center gap-2"
          >
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => {
                const params = new URLSearchParams();
                if (parsed.q) params.set("q", parsed.q);
                if (parsed.remixable) params.set("remixable", "true");
                if (parsed.sort !== "newest") params.set("sort", parsed.sort);
                if (page > 1) params.set("page", String(page));
                return (
                  <Button
                    key={page}
                    asChild
                    size="icon"
                    variant={page === parsed.page ? "default" : "outline"}
                    aria-label={`Go to page ${page}`}
                  >
                    <Link href={`/gallery${params.size ? `?${params}` : ""}`}>
                      {page}
                    </Link>
                  </Button>
                );
              },
            )}
          </nav>
        )}
      </main>
    </div>
  );
}
