import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublicGalleryProject } from "@/features/gallery/server/queries";
import { SharePageClient } from "@/app/share/v2/[messageId]/share-page-client";
import { ShowcaseGamePage } from "@/features/gallery/components/showcase-game-page";
import { getShowcaseGame } from "@/features/gallery/showcase-games";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const showcaseGame = getShowcaseGame(slug);
  if (showcaseGame) {
    return {
      title: `${showcaseGame.title} · Squid Arcade`,
      description: showcaseGame.description,
    };
  }
  const result = await getPublicGalleryProject(slug);
  if (!result) return { title: "Project not found" };

  return {
    title: result.publication.title,
    description: result.publication.description,
    openGraph: {
      title: result.publication.title,
      description: result.publication.description,
      images: [
        `/api/og?prompt=${encodeURIComponent(result.publication.title)}`,
      ],
    },
  };
}

export default async function GalleryProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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
        prompt={publication.chat.prompt}
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
