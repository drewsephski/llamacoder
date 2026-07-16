import { CheckCircle2, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { GalleryProjectSummary } from "@/features/gallery/contracts";
import { GalleryProjectThumbnail } from "@/features/gallery/components/gallery-project-thumbnail";

export function GalleryProjectCard({
  project,
}: {
  project: GalleryProjectSummary;
}) {
  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-background transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
      <Link
        href={`/gallery/${project.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-muted/30">
          <GalleryProjectThumbnail
            thumbnailUrl={project.thumbnailUrl}
            slug={project.slug}
            title={project.title}
          />
          <div className="absolute inset-0 bg-transparent transition-colors group-hover:bg-primary/[0.025]" />
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold tracking-tight text-foreground">
                {project.title}
              </h2>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                {project.creator.image ? (
                  <Image
                    src={project.creator.image}
                    alt=""
                    width={24}
                    height={24}
                    unoptimized
                    className="size-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground">
                    {project.creator.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="truncate">by {project.creator.name}</span>
              </div>
            </div>

            <span className="mt-0.5 inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
              {project.allowRemixes ? (
                <>
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span className="hidden sm:inline">Remix allowed</span>
                </>
              ) : (
                <>
                  <Eye className="size-4" />
                  <span className="hidden sm:inline">View only</span>
                </>
              )}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
