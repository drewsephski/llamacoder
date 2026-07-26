import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublicGalleryProject } from "@/features/gallery/server/queries";
import {
  buildGallerySocialMetadata,
  getPublishedGallerySocialImage,
  getShowcaseGallerySocialImage,
} from "@/features/gallery/social-metadata";
import { SharePageClient } from "@/app/share/v2/[messageId]/share-page-client";
import { ShowcaseGamePage } from "@/features/gallery/components/showcase-game-page";
import { ShowcaseLandingPage } from "@/features/gallery/components/showcase-landing-page";
import { getShowcaseGame } from "@/features/gallery/showcase-games";
import { getShowcaseLanding } from "@/features/gallery/showcase-landings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const showcaseLanding = getShowcaseLanding(slug);
  if (showcaseLanding) {
    return buildGallerySocialMetadata({
      title: `${showcaseLanding.title} · Squid Landing Pages`,
      description: showcaseLanding.description,
      canonicalPath: `/gallery/${encodeURIComponent(slug)}`,
      image: getShowcaseGallerySocialImage(showcaseLanding),
    });
  }
  const showcaseGame = getShowcaseGame(slug);
  if (showcaseGame) {
    return buildGallerySocialMetadata({
      title: `${showcaseGame.title} · Squid Arcade`,
      description: showcaseGame.description,
      canonicalPath: `/gallery/${encodeURIComponent(slug)}`,
      image: getShowcaseGallerySocialImage(showcaseGame),
    });
  }
  const result = await getPublicGalleryProject(slug);
  if (!result) {
    return buildGallerySocialMetadata({
      title: "Project not found",
      description: "Build and share React apps with Squid Agent.",
      canonicalPath: `/gallery/${encodeURIComponent(slug)}`,
    });
  }

  return buildGallerySocialMetadata({
    title: result.publication.title,
    description: result.publication.description,
    canonicalPath: `/gallery/${encodeURIComponent(slug)}`,
    image: getPublishedGallerySocialImage({
      publication: result.publication,
      title: result.publication.title,
    }),
  });
}

export default async function GalleryProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const showcaseLanding = getShowcaseLanding(slug);
  if (showcaseLanding) {
    return <ShowcaseLandingPage landing={showcaseLanding} />;
  }
  const showcaseGame = getShowcaseGame(slug);
  if (showcaseGame) return <ShowcaseGamePage game={showcaseGame} />;

  const result = await getPublicGalleryProject(slug);
  if (!result) notFound();

  const { publication, files } = result;
  return (
    <div className="flex min-h-dvh w-full">
      <SharePageClient
        messageId={publication.messageId}
        title={publication.title}
        prompt={publication.description}
        creatorName={publication.user.name ?? "Squid creator"}
        files={files.map((file) => ({
          path: file.path,
          content: file.code,
        }))}
        allowRemixes={publication.allowRemixes}
        galleryHref="/gallery"
      />
    </div>
  );
}
