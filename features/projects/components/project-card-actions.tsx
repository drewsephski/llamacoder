"use client";

import { useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { DeleteProjectModal } from "@/features/projects/components/delete-project-modal";
import { duplicateProject } from "@/features/projects/server/actions";
import { toast } from "sonner";

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
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          aria-label={`Duplicate ${projectTitle}`}
          onClick={handleDuplicate}
          disabled={isDuplicating}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          title="Duplicate"
        >
          {isDuplicating ? (
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          type="button"
          aria-label={`Delete ${projectTitle}`}
          onClick={() => setIsDeleteModalOpen(true)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
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
