"use client";

import { Loader2, LockKeyhole, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteProjectModal } from "@/features/projects/components/delete-project-modal";

export function GalleryProjectActions({
  chatId,
  projectTitle,
  publicationId,
}: {
  chatId: string;
  projectTitle: string;
  publicationId: string;
}) {
  const router = useRouter();
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);

  async function makePrivate() {
    setIsUnpublishing(true);
    try {
      const response = await fetch(`/api/gallery/${publicationId}`, {
        method: "DELETE",
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          body &&
          typeof body === "object" &&
          "message" in body &&
          typeof body.message === "string"
            ? body.message
            : "Unable to make this project private";
        throw new Error(message);
      }

      setIsPrivacyDialogOpen(false);
      toast.success("Project is now private");
      router.refresh();
    } catch (error) {
      console.error("Failed to make gallery project private:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to make this project private",
      );
    } finally {
      setIsUnpublishing(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setIsPrivacyDialogOpen(true)}
          className="h-8 border-b-0 px-2.5 text-muted-foreground transition-colors hover:translate-y-0 hover:border-b-0 hover:bg-transparent hover:text-foreground hover:brightness-100 active:translate-y-0 active:border-b-0"
        >
          <LockKeyhole className="size-3.5" />
          Make private
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={`Delete ${projectTitle}`}
          title="Delete project"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="size-8 border-b-0 text-muted-foreground transition-colors hover:translate-y-0 hover:border-b-0 hover:bg-transparent hover:text-red-400 hover:brightness-100 active:translate-y-0 active:border-b-0"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <Dialog open={isPrivacyDialogOpen} onOpenChange={setIsPrivacyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make this project private?</DialogTitle>
            <DialogDescription>
              It will disappear from the public gallery, but remain available in
              your dashboard. You can publish it again later.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm font-medium">
            {projectTitle}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isUnpublishing}
              onClick={() => setIsPrivacyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isUnpublishing}
              onClick={makePrivate}
            >
              {isUnpublishing ? (
                <>
                  <Loader2 className="animate-spin" />
                  Making private…
                </>
              ) : (
                <>
                  <LockKeyhole />
                  Make private
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteProjectModal
        projectId={chatId}
        projectTitle={projectTitle}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDeleted={() => router.refresh()}
      />
    </>
  );
}
