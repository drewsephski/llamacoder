import { notFound } from "next/navigation";

import { GalleryPreviewRunner } from "@/features/gallery/components/gallery-preview-runner";
import { getPublicGalleryProject } from "@/features/gallery/server/queries";
import { getShowcaseGame } from "@/features/gallery/showcase-games";
import { getShowcaseLanding } from "@/features/gallery/showcase-landings";

export default async function GalleryPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const showcaseLanding = getShowcaseLanding(slug);
  if (showcaseLanding) {
    return (
      <div className="h-dvh min-h-[320px] w-full overflow-hidden bg-background">
        <GalleryPreviewRunner files={showcaseLanding.files} />
      </div>
    );
  }
  const showcaseGame = getShowcaseGame(slug);
  if (showcaseGame) {
    return (
      <div className="h-dvh min-h-[320px] w-full overflow-hidden bg-slate-950">
        <GalleryPreviewRunner files={showcaseGame.files} />
      </div>
    );
  }

  const result = await getPublicGalleryProject(slug);
  if (!result) notFound();

  return (
    <div className="h-dvh min-h-[320px] w-full overflow-hidden bg-background">
      <GalleryPreviewRunner
        files={result.files.map((file) => ({
          path: file.path,
          content: file.code,
        }))}
      />
    </div>
  );
}
