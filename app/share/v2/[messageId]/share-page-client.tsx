"use client";

import CodeRunner from "@/components/code-runner";
import { Button } from "@/components/ui/button";
import { Copy, Download, GitFork, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

type SharedFile = {
  path: string;
  content: string;
};

type SharePageClientProps = {
  messageId: string;
  title: string;
  prompt: string;
  creatorName: string;
  files: SharedFile[];
};

export function SharePageClient({
  messageId,
  title,
  prompt,
  creatorName,
  files,
}: SharePageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [didCopy, setDidCopy] = useState(false);

  useEffect(() => {
    recordShareEvent(messageId, "view");
  }, [messageId]);

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);
    setDidCopy(true);
    recordShareEvent(messageId, "copy_prompt");
    toast.success("Prompt copied");
    window.setTimeout(() => setDidCopy(false), 1600);
  };

  const handleRemix = () => {
    startTransition(async () => {
      recordShareEvent(messageId, "remix_click");

      const response = await fetch("/api/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });
      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        router.push(`/?ref=${messageId}`);
        return;
      }

      if (!response.ok) {
        toast.error(data?.message || "Unable to remix this app");
        return;
      }

      router.push(`/chats/${data.chatId}`);
    });
  };

  const downloadHref = `/api/export/${messageId}?starter=1`;

  return (
    <div className="flex h-full w-full grow flex-col bg-background">
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col gap-5 border-b border-border bg-background px-5 py-5 lg:w-[360px] lg:border-b-0 lg:border-r">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3" />
              Built with Squid
            </div>
            <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
            <p className="text-sm text-muted-foreground">By {creatorName}</p>
          </div>

          <div className="rounded-md border border-border bg-muted/30 p-3">
            <p className="line-clamp-5 text-sm text-muted-foreground">
              {prompt}
            </p>
          </div>

          <div className="grid gap-2">
            <Button onClick={handleRemix} disabled={isPending}>
              <GitFork className="size-4" />
              {isPending ? "Remixing..." : "Remix this app"}
            </Button>
            <Button variant="outline" onClick={handleCopyPrompt}>
              <Copy className="size-4" />
              {didCopy ? "Copied" : "Copy prompt"}
            </Button>
            <Button asChild variant="outline">
              <a
                href={downloadHref}
                onClick={() => recordShareEvent(messageId, "download_starter")}
              >
                <Download className="size-4" />
                Download starter
              </a>
            </Button>
          </div>

          <a
            className="mt-auto inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            href={`https://squidagent.app/?ref=${messageId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Build your own with Squid Agent
          </a>
        </aside>

        <main className="flex min-h-[520px] flex-1 items-center justify-center bg-muted/20">
          <CodeRunner files={files} />
        </main>
      </div>
    </div>
  );
}

function recordShareEvent(
  messageId: string,
  eventType:
    | "view"
    | "copy_prompt"
    | "download_starter"
    | "remix_click"
    | "remix_created",
) {
  fetch("/api/share-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messageId, eventType }),
    keepalive: true,
  }).catch(() => {
    // Share analytics should never block the public app experience.
  });
}
