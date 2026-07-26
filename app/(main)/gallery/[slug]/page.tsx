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
import { SITE_URL } from "@/lib/seo";

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
      index: false,
    });
  }

  const projectReference = getGalleryProjectReference(slug);
  return buildGallerySocialMetadata({
    title: `${result.publication.title} — AI-Built React App ${projectReference}`,
    description: `${result.publication.description} Explore this AI-built React app in the Squid Agent gallery. Project ${projectReference}.`,
    canonicalPath: `/gallery/${encodeURIComponent(slug)}`,
    image: getPublishedGallerySocialImage({
      publication: result.publication,
      title: result.publication.title,
    }),
    index: false,
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
    return (
      <>
        <GalleryProjectStructuredData
          description={showcaseLanding.description}
          slug={slug}
          title={showcaseLanding.title}
        />
        <ShowcaseLandingPage landing={showcaseLanding} />
      </>
    );
  }
  const showcaseGame = getShowcaseGame(slug);
  if (showcaseGame)
    return (
      <>
        <GalleryProjectStructuredData
          description={showcaseGame.description}
          slug={slug}
          title={showcaseGame.title}
        />
        <ShowcaseGamePage game={showcaseGame} />
      </>
    );

  const result = await getPublicGalleryProject(slug);
  if (!result) notFound();

  const { publication, files } = result;
  return (
    <>
      <GalleryProjectStructuredData
        description={publication.description}
        slug={slug}
        title={publication.title}
      />
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
    </>
  );
}

function getGalleryProjectReference(slug: string) {
  return slug.split("-").at(-1)?.slice(0, 6).toUpperCase() ?? "PUBLIC";
}

function GalleryProjectStructuredData({
  description,
  slug,
  title,
}: {
  description: string;
  slug: string;
  title: string;
}) {
  const url = `${SITE_URL}/gallery/${encodeURIComponent(slug)}`;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: title,
      description,
      url,
      isPartOf: {
        "@type": "CollectionPage",
        name: "AI-built React app gallery",
        url: `${SITE_URL}/gallery`,
      },
      creator: { "@type": "Organization", name: "Squid Agent", url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${SITE_URL}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Gallery",
          item: `${SITE_URL}/gallery`,
        },
        { "@type": "ListItem", position: 3, name: title, item: url },
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
  );
}
