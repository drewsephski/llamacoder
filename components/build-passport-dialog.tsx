"use client";

import { ClipboardCheck } from "lucide-react";
import { usePlausible } from "next-plausible";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { BuildPassport } from "@/features/verification/build-passport";
import { BuildPassportView } from "@/features/verification/components/build-passport-view";

export function BuildPassportDialog({ passport }: { passport: BuildPassport }) {
  const plausible = usePlausible();
  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          plausible("Build Passport Opened", {
            props: { status: passport.overallStatus, surface: "workspace" },
          });
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="code-toolbar-adaptive-button inline-flex h-8 gap-1.5 px-2.5 text-xs"
        >
          <ClipboardCheck className="size-3.5" />
          <span className="code-toolbar-adaptive-label">Build passport</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        size="workspace"
        className="max-h-[90vh] overflow-y-auto p-0"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Build passport</DialogTitle>
          <DialogDescription>
            Revision-specific source, runtime, export, and service evidence.
          </DialogDescription>
        </DialogHeader>
        <BuildPassportView passport={passport} />
      </DialogContent>
    </Dialog>
  );
}
