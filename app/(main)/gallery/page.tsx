import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AnimatedThemeToggleButton } from "@/components/ui/animated-theme-toggle-button";
import { Button } from "@/components/ui/button";
import { getCurrentSession } from "@/features/auth/server/session";
import { GalleryProjectCard } from "@/features/gallery/components/gallery-project-card";
import { GalleryThumbnailRefresh } from "@/features/gallery/components/gallery-thumbnail-refresh";
import { GalleryToolbar } from "@/features/gallery/components/gallery-toolbar";
import { ShowcaseGameCard } from "@/features/gallery/components/showcase-game-card";
import { ShowcaseLandingCard } from "@/features/gallery/components/showcase-landing-card";
import { gallerySearchSchema } from "@/features/gallery/contracts";
import { getGalleryProjects } from "@/features/gallery/server/queries";
import { getShowcaseGameSummaries } from "@/features/gallery/showcase-games";
import { getShowcaseLandingSummaries } from "@/features/gallery/showcase-landings";

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
  });
  const session = await getCurrentSession();
  const showcaseGames = !parsed.remixable
    ? getShowcaseGameSummaries(parsed.q)
    : [];
  const showcaseLandings = !parsed.remixable
    ? getShowcaseLandingSummaries(parsed.q)
    : [];
  const { projects } = await getGalleryProjects({
    query: parsed.q,
    remixable: parsed.remixable,
    sort: parsed.sort,
    viewerId: session?.user.id,
  });
  const hasPendingThumbnails = projects.some(
    (project) => project.thumbnailStatus === "pending",
  );
  const priorityThumbnailIndex = projects.findIndex(
    (project) => project.thumbnailUrl !== null,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GalleryThumbnailRefresh
        canBackfill={Boolean(session) && process.env.NODE_ENV === "production"}
        pending={hasPendingThumbnails}
      />
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5 font-semibold"
          >
            <Image
              src="/squidagent-logo.svg"
              alt="Squid"
              width={30}
              height={30}
              className="size-8 object-contain"
            />
            <span className="hidden min-[360px]:inline">Squid</span>
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

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Button asChild size="sm">
              <Link href="/">
                <span className="min-[400px]:hidden">Build</span>
                <span className="hidden min-[400px]:inline">Build an app</span>
              </Link>
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
          <section
            className="mt-8"
            aria-labelledby="community-projects-heading"
          >
            <div className="mb-5 border-b border-border pb-3">
              <h2
                id="community-projects-heading"
                className="text-lg font-semibold tracking-tight"
              >
                Community projects
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <GalleryProjectCard
                  key={project.id}
                  project={project}
                  priority={index === priorityThumbnailIndex}
                />
              ))}
            </div>
          </section>
        ) : showcaseGames.length === 0 && showcaseLandings.length === 0 ? (
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
        ) : null}

        {showcaseGames.length > 0 && (
          <section className="mt-12" aria-labelledby="squid-arcade-heading">
            <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Playable showcases
                </p>
                <h2
                  id="squid-arcade-heading"
                  className="mt-1.5 text-2xl font-semibold tracking-tight"
                >
                  Squid Arcade
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-right">
                Three complex React games built without image assets or a game
                engine. Open one to play and copy its full build prompt.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {showcaseGames.map((game) => (
                <ShowcaseGameCard key={game.id} game={game} />
              ))}
            </div>
          </section>
        )}

        {showcaseLandings.length > 0 && (
          <section className="mt-12" aria-labelledby="landing-pages-heading">
            <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Premium page showcases
                </p>
                <h2
                  id="landing-pages-heading"
                  className="mt-1.5 text-2xl font-semibold tracking-tight"
                >
                  Landing pages
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-right">
                Three complete React landing pages with distinct structures,
                working interactions, and copyable build prompts.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {showcaseLandings.map((landing) => (
                <ShowcaseLandingCard key={landing.id} landing={landing} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
