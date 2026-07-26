import Spinner from "@/components/spinner";

export default function GalleryLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <Spinner className="block size-8" variant="page" />
      <p className="text-sm text-muted-foreground">Loading gallery...</p>
    </div>
  );
}
