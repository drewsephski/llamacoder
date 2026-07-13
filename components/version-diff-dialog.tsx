"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark, Check, FileDiff, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { GeneratedFile } from "@/lib/generated-files";

type ChangedFile = {
  path: string;
  kind: "added" | "modified" | "removed";
  before: string;
  after: string;
  addedLines: number;
  removedLines: number;
};

function changedFiles(before: GeneratedFile[], after: GeneratedFile[]) {
  const previous = new Map(before.map((file) => [file.path, file.code]));
  const current = new Map(after.map((file) => [file.path, file.code]));
  return Array.from(new Set([...previous.keys(), ...current.keys()]))
    .flatMap<ChangedFile>((path) => {
      const oldCode = previous.get(path) ?? "";
      const newCode = current.get(path) ?? "";
      if (oldCode === newCode) return [];
      const oldLines = oldCode.split("\n");
      const newLines = newCode.split("\n");
      const oldSet = new Set(oldLines);
      const newSet = new Set(newLines);
      return [
        {
          path,
          kind: !previous.has(path)
            ? "added"
            : !current.has(path)
              ? "removed"
              : "modified",
          before: oldCode,
          after: newCode,
          addedLines: newLines.filter((line) => !oldSet.has(line)).length,
          removedLines: oldLines.filter((line) => !newSet.has(line)).length,
        },
      ];
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

export function VersionDiffDialog({
  projectId,
  messageId,
  before,
  after,
  initialLabel,
  initialBookmarked,
  canRestore,
  onRestoreFiles,
}: {
  projectId: string;
  messageId: string;
  before: GeneratedFile[];
  after: GeneratedFile[];
  initialLabel?: string | null;
  initialBookmarked?: boolean;
  canRestore: boolean;
  onRestoreFiles: (paths: string[]) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const files = useMemo(() => changedFiles(before, after), [before, after]);
  const [activePath, setActivePath] = useState(files[0]?.path ?? "");
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [label, setLabel] = useState(initialLabel ?? "");
  const [bookmarked, setBookmarked] = useState(initialBookmarked ?? false);
  const [saving, setSaving] = useState(false);
  const active = files.find((file) => file.path === activePath) ?? files[0];

  useEffect(() => {
    setActivePath(files[0]?.path ?? "");
    setSelectedPaths([]);
    setLabel(initialLabel ?? "");
    setBookmarked(initialBookmarked ?? false);
  }, [files, initialBookmarked, initialLabel, messageId]);

  const saveMetadata = async (nextBookmarked = bookmarked) => {
    setSaving(true);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/versions/${messageId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: label.trim() || null,
            bookmarked: nextBookmarked,
          }),
        },
      );
      if (!response.ok) throw new Error("Unable to save version details");
      toast.success("Version details saved");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save version details",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <FileDiff className="size-3.5" /> Review changes
      </Button>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Version review</DialogTitle>
          <DialogDescription>
            Inspect the exact source changes, bookmark this checkpoint, or
            restore selected files without overwriting newer work.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 gap-4 md:grid-cols-[240px_1fr]">
          <div className="grid content-start gap-3">
            <div className="flex gap-2">
              <Input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Version label"
                maxLength={80}
              />
              <Button
                type="button"
                size="icon"
                variant={bookmarked ? "default" : "outline"}
                aria-label={bookmarked ? "Remove bookmark" : "Bookmark version"}
                onClick={() => {
                  const next = !bookmarked;
                  setBookmarked(next);
                  void saveMetadata(next);
                }}
              >
                <Bookmark
                  className={`size-4 ${bookmarked ? "fill-current" : ""}`}
                />
              </Button>
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={() => void saveMetadata()}
            >
              <Check className="size-3.5" /> Save label
            </Button>
            <div className="max-h-[52vh] overflow-y-auto rounded-lg border">
              {files.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">
                  No source changes in this checkpoint.
                </p>
              ) : (
                files.map((file) => (
                  <button
                    type="button"
                    key={file.path}
                    onClick={() => setActivePath(file.path)}
                    className={`flex w-full items-start gap-2 border-b p-3 text-left text-xs last:border-b-0 ${active?.path === file.path ? "bg-muted" : "hover:bg-muted/50"}`}
                  >
                    {canRestore && (
                      <input
                        type="checkbox"
                        aria-label={`Select ${file.path} to restore`}
                        checked={selectedPaths.includes(file.path)}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          setSelectedPaths((paths) =>
                            event.target.checked
                              ? [...paths, file.path]
                              : paths.filter((path) => path !== file.path),
                          )
                        }
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono font-medium">
                        {file.path}
                      </span>
                      <span className="mt-1 block text-muted-foreground">
                        {file.kind} ·{" "}
                        <span className="text-emerald-600">
                          +{file.addedLines}
                        </span>{" "}
                        <span className="text-red-600">
                          -{file.removedLines}
                        </span>
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
            {canRestore && (
              <Button
                type="button"
                disabled={selectedPaths.length === 0}
                onClick={async () => {
                  await onRestoreFiles(selectedPaths);
                  setOpen(false);
                }}
              >
                <RotateCcw className="size-3.5" /> Restore{" "}
                {selectedPaths.length || "selected"} file
                {selectedPaths.length === 1 ? "" : "s"}
              </Button>
            )}
          </div>

          <div className="grid min-h-0 gap-2">
            {active ? (
              <>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono">{active.path}</span>
                  <span>
                    <span className="text-emerald-600">
                      +{active.addedLines}
                    </span>{" "}
                    ·{" "}
                    <span className="text-red-600">-{active.removedLines}</span>
                  </span>
                </div>
                <div className="grid max-h-[58vh] min-h-[360px] overflow-hidden rounded-lg border md:grid-cols-2">
                  <pre className="overflow-auto border-b bg-red-500/5 p-3 text-[11px] leading-5 md:border-b-0 md:border-r">
                    <code>{active.before || "(file did not exist)"}</code>
                  </pre>
                  <pre className="overflow-auto bg-emerald-500/5 p-3 text-[11px] leading-5">
                    <code>{active.after || "(file removed)"}</code>
                  </pre>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
