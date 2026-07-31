"use client";

import { AlertCircle } from "lucide-react";

import {
  PageStatusShell,
  type PageStatusVariant,
} from "@/components/page-status/page-status-shell";
import { Button } from "@/components/ui/button";

type PageErrorAction = {
  label: string;
  onClick: () => void;
};

export function PageErrorState({
  description,
  primaryAction,
  reference,
  secondaryAction,
  title,
  variant = "page",
}: {
  description: string;
  primaryAction: PageErrorAction;
  reference?: string;
  secondaryAction?: PageErrorAction;
  title: string;
  variant?: PageStatusVariant;
}) {
  return (
    <PageStatusShell variant={variant}>
      <div
        className="flex max-w-md flex-col items-center gap-4 text-center"
        role="alert"
      >
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle aria-hidden="true" className="size-6" />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{description}</p>
          {reference ? (
            <p className="font-mono text-xs text-muted-foreground">
              Error reference: {reference}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>
          {secondaryAction ? (
            <Button onClick={secondaryAction.onClick} variant="outline">
              {secondaryAction.label}
            </Button>
          ) : null}
        </div>
      </div>
    </PageStatusShell>
  );
}
