"use client";

import { Download } from "lucide-react";
import { usePlausible } from "next-plausible";

import { Button } from "@/components/ui/button";

export function PassportDownloadButton({
  href,
  messageId,
  status,
}: {
  href: string;
  messageId: string;
  status: string;
}) {
  const plausible = usePlausible();

  return (
    <Button asChild variant="outline" size="sm">
      <a
        href={href}
        download
        onClick={() => {
          plausible("Build Passport Downloaded", {
            props: { status, surface: "public_passport" },
          });
          fetch("/api/share-events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messageId, eventType: "passport_download" }),
            keepalive: true,
          }).catch(() => {
            // Analytics should never block an evidence download.
          });
        }}
      >
        <Download className="size-4" />
        Download JSON
      </a>
    </Button>
  );
}
