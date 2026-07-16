"use client";

import type { Message } from "@prisma/client";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  LockKeyhole,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import ShareIcon from "@/components/icons/share-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getMessageGeneratedFiles } from "@/features/generation/message-files";

const CodeRunner = dynamic(() => import("@/components/code-runner"), {
  ssr: false,
});

type Publication = {
  id: string;
  slug: string;
  title: string;
  description: string;
  allowRemixes: boolean;
  isPublished: boolean;
  url: string;
};

const normalizeTitle = (value: string) => value.slice(0, 80);
const normalizeDescription = (value: string) => value.slice(0, 280);

export function Share({
  message,
  projectTitle,
  projectDescription,
}: {
  message?: Message;
  projectTitle: string;
  projectDescription: string;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(normalizeTitle(projectTitle));
  const [description, setDescription] = useState(
    normalizeDescription(projectDescription),
  );
  const [allowRemixes, setAllowRemixes] = useState(false);
  const [publication, setPublication] = useState<Publication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const previewFiles = useMemo(
    () =>
      message
        ? getMessageGeneratedFiles(message).map((file) => ({
            path: file.path,
            content: file.code,
          }))
        : [],
    [message],
  );

  useEffect(() => {
    setTitle(normalizeTitle(projectTitle));
    setDescription(normalizeDescription(projectDescription));
    setPublication(null);
  }, [message?.id, projectDescription, projectTitle]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen || !message) return;

    setIsLoading(true);
    setPublication(null);
    void fetch(
      `/api/gallery/publication?chatId=${encodeURIComponent(message.chatId)}`,
    )
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as {
          publication: Publication | null;
        };
        if (!data.publication) return;
        setPublication(data.publication);
        setTitle(data.publication.title);
        setDescription(data.publication.description);
        setAllowRemixes(data.publication.allowRemixes);
      })
      .catch(() => {
        toast.error("Unable to load publication settings");
      })
      .finally(() => setIsLoading(false));
  };

  const publish = async () => {
    if (!message || !title.trim() || !description.trim()) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: message.id,
          title,
          description,
          allowRemixes,
        }),
      });
      const data = (await response.json().catch(() => null)) as {
        publication?: Publication;
        message?: string;
      } | null;
      if (!response.ok || !data?.publication) {
        toast.error(data?.message ?? "Unable to publish this project");
        return;
      }
      setPublication(data.publication);
      toast.success("Project published to the gallery");
    } finally {
      setIsSaving(false);
    }
  };

  const copyLink = async () => {
    if (!publication) return;
    const url = new URL(publication.url, window.location.origin).href;
    await navigator.clipboard.writeText(url);
    toast.success("Gallery link copied");
  };

  const unpublish = async () => {
    if (!publication) return;
    setIsUnpublishing(true);
    try {
      const response = await fetch(`/api/gallery/${publication.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        toast.error(data?.message ?? "Unable to unpublish this project");
        return;
      }
      setPublication({ ...publication, isPublished: false });
      toast.success("Project unpublished");
    } finally {
      setIsUnpublishing(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        disabled={!message}
        variant="outline"
        size="sm"
        onClick={() => handleOpenChange(true)}
      >
        <ShareIcon className="size-3" />
        Publish
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[92vh] gap-3 overflow-y-auto sm:max-w-2xl sm:p-5">
          <DialogHeader>
            <DialogTitle className="text-xl">Publish to gallery</DialogTitle>
            <DialogDescription>
              Create a public page for this version of your app.
            </DialogDescription>
          </DialogHeader>

          {previewFiles.length > 0 && (
            <div className="h-56 overflow-hidden rounded-xl border border-border bg-muted/30 sm:h-60">
              <div className="size-full">
                <CodeRunner files={previewFiles} />
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex min-h-52 items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Loading publication settings…
            </div>
          ) : (
            <div className="space-y-4">
              <label className="grid gap-2 text-sm font-medium">
                Title
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={80}
                  className="h-10"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Description
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={280}
                  rows={2}
                  className="resize-none"
                />
              </label>

              <div className="flex items-center justify-between gap-6 border-y border-border py-3">
                <div>
                  <label
                    htmlFor="allow-remixes"
                    className="text-sm font-semibold"
                  >
                    Allow remixes
                  </label>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    Other people can copy this version into their own Squid
                    workspace.
                  </p>
                </div>
                <Switch
                  id="allow-remixes"
                  checked={allowRemixes}
                  onCheckedChange={setAllowRemixes}
                  aria-label="Allow other people to remix this project"
                />
              </div>

              <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />
                Your prompt and generated app will be public. You can update or
                unpublish it later.
              </p>

              {publication?.isPublished && (
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="size-4" />
                    Published! Your project is live.
                  </div>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <Input
                      readOnly
                      value={publication.url}
                      aria-label="Public gallery URL"
                      className="min-w-0 flex-1 bg-background"
                    />
                    <Button type="button" variant="outline" onClick={copyLink}>
                      <Copy className="size-4" />
                      Copy link
                    </Button>
                    <Button asChild type="button" variant="outline">
                      <a
                        href={publication.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View project
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between sm:space-x-0">
            <div>
              {publication?.isPublished && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={unpublish}
                  disabled={isUnpublishing}
                  className="text-destructive hover:text-destructive"
                >
                  {isUnpublishing ? "Unpublishing…" : "Unpublish"}
                </Button>
              )}
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={publish}
                disabled={
                  isSaving || isLoading || !title.trim() || !description.trim()
                }
              >
                {isSaving
                  ? "Publishing…"
                  : publication?.isPublished
                    ? "Update project"
                    : "Publish project"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
