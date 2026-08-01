"use client";

import { useState } from "react";
import { Plug, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/reui/badge";
import { Frame, FramePanel } from "@/components/reui/frame";
import { IconTile } from "@/components/reui/icon-tile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buildIntegrationProviderSummaries } from "@/features/integrations/catalog";
import { ProviderCatalog } from "@/features/integrations/components/provider-catalog";
import { MAX_PROJECT_API_SELECTIONS } from "@/features/projects/contracts";

const catalogProviders = buildIntegrationProviderSummaries();

export function ApiSelectionDialog({
  selectedProviderIds,
  onSelectionChange,
  standaloneTrigger = false,
}: {
  selectedProviderIds: string[];
  onSelectionChange: (providerIds: string[]) => void;
  standaloneTrigger?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draftProviderIds, setDraftProviderIds] = useState<string[]>([]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) setDraftProviderIds(selectedProviderIds);
  }

  function toggleProvider(providerId: string) {
    setDraftProviderIds((current) => {
      if (current.includes(providerId)) {
        return current.filter((candidate) => candidate !== providerId);
      }
      if (current.length >= MAX_PROJECT_API_SELECTIONS) {
        toast.info(`Choose up to ${MAX_PROJECT_API_SELECTIONS} APIs per app.`);
        return current;
      }
      return [...current, providerId];
    });
  }

  function applySelection() {
    onSelectionChange(draftProviderIds);
    setOpen(false);
  }

  const selectedProviders = draftProviderIds.flatMap((providerId) => {
    const provider = catalogProviders.find(
      (candidate) => candidate.id === providerId,
    );
    return provider ? [provider] : [];
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={
            standaloneTrigger
              ? "integration-modal-trigger"
              : "api-selection-trigger inline-flex h-8 items-center gap-1 rounded-lg px-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-1.5 sm:px-2"
          }
          aria-label={
            standaloneTrigger
              ? `Open Integrations${selectedProviderIds.length ? `, ${selectedProviderIds.length} selected` : ""}`
              : `Choose APIs${selectedProviderIds.length ? `, ${selectedProviderIds.length} selected` : ""}`
          }
          title={
            standaloneTrigger
              ? "Open integrations modal"
              : "Choose APIs for this app"
          }
        >
          <Plug className="size-3.5" />
          <span className={standaloneTrigger ? undefined : "hidden sm:inline"}>
            {standaloneTrigger ? "Integrations" : "APIs"}
          </span>
          {selectedProviderIds.length > 0 && (
            <Badge variant="primary-light" radius="full" size="sm">
              {selectedProviderIds.length}
            </Badge>
          )}
        </button>
      </DialogTrigger>
      <DialogContent size="workspace" className="max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconTile variant="soft" size="sm">
              <Plug />
            </IconTile>{" "}
            Integrations
          </DialogTitle>
          <DialogDescription>
            Select the services Squid should plan and generate around. APIs that
            require credentials can be connected securely after the project is
            created.
          </DialogDescription>
        </DialogHeader>

        <ProviderCatalog
          providers={catalogProviders}
          selectedProviderIds={draftProviderIds}
          onSelect={toggleProvider}
        />

        <Frame spacing="xs" className="min-h-12 bg-muted/20">
          <FramePanel className="p-3 shadow-none">
            {selectedProviders.length ? (
              <div className="flex flex-wrap gap-2">
                {selectedProviders.map((provider) => (
                  <Badge
                    key={provider.id}
                    variant="outline"
                    radius="full"
                    className="gap-1.5"
                  >
                    {provider.name}
                    <button
                      type="button"
                      onClick={() => toggleProvider(provider.id)}
                      aria-label={`Remove ${provider.name}`}
                      className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs leading-6 text-muted-foreground">
                No APIs selected. Squid can still recommend one during planning.
              </p>
            )}
          </FramePanel>
        </Frame>

        <DialogFooter className="gap-2 sm:space-x-0">
          {draftProviderIds.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDraftProviderIds([])}
            >
              Clear all
            </Button>
          )}
          <Button type="button" size="sm" onClick={applySelection}>
            {draftProviderIds.length
              ? `Use ${draftProviderIds.length} API${draftProviderIds.length === 1 ? "" : "s"}`
              : "Done"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
