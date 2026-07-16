import { notFound } from "next/navigation";

import { GalleryPreviewRunner } from "@/features/gallery/components/gallery-preview-runner";
import { getPublicGalleryProject } from "@/features/gallery/server/queries";

export default async function GalleryPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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
