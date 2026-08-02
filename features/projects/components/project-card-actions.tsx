"use client";

import { useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { DeleteProjectModal } from "@/features/projects/components/delete-project-modal";
import { duplicateProject } from "@/features/projects/server/actions";
import { toast } from "sonner";
import { CometSpinner } from "@/components/loading-ui/comet-spinner";

interface ProjectCardActionsProps {
  projectId: string;
  projectTitle: string;
}

export function ProjectCardActions({
  projectId,
  projectTitle,
}: ProjectCardActionsProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  async function handleDuplicate() {
    setIsDuplicating(true);
    try {
      await duplicateProject(projectId);
      toast.success("Project duplicated!");
    } catch (error) {
      console.error("Failed to duplicate project:", error);
      toast.error("Failed to duplicate project");
    } finally {
      setIsDuplicating(false);
    }
  }

  return (
    <>
      <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity motion-reduce:transition-none sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        <button
          type="button"
          aria-label={`Duplicate ${projectTitle}`}
          onClick={handleDuplicate}
          disabled={isDuplicating}
          className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 sm:size-8"
          title="Duplicate"
        >
          {isDuplicating ? (
            <CometSpinner
              className="size-3.5"
              aria-label={`Duplicating ${projectTitle}`}
            />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          type="button"
          aria-label={`Delete ${projectTitle}`}
          onClick={() => setIsDeleteModalOpen(true)}
          className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 sm:size-8"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <DeleteProjectModal
        projectId={projectId}
        projectTitle={projectTitle}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
}
