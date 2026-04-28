"use client";

import ShareIcon from "@/components/icons/share-icon";
import { toast } from "sonner";
import { Message } from "@prisma/client";
import { Button } from "@/components/ui/button";

export function Share({ message }: { message?: Message }) {
  async function shareAction() {
    if (!message) return;

    const baseUrl = window.location.href;
    const shareUrl = new URL(`/share/v2/${message.id}`, baseUrl);

    toast.success("App Published!", {
      description: `App URL copied to clipboard: ${shareUrl.href}`,
    });

    await navigator.clipboard.writeText(shareUrl.href);
  }

  return (
    <form action={shareAction} className="flex">
      <Button
        type="submit"
        disabled={!message}
        variant="outline"
        size="sm"
      >
        <ShareIcon className="size-3" />
        Share
      </Button>
    </form>
  );
}
