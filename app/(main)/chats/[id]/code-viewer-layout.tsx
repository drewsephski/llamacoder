"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { ReactNode } from "react";

export default function CodeViewerLayout({
  children,
  isShowing,
  onCloseAction,
}: {
  children: ReactNode;
  isShowing: boolean;
  onCloseAction: () => void;
}) {
  const isMobile = useMediaQuery("(max-width: 1023px)");

  return (
    <>
      {isMobile ? (
        <Drawer open={isShowing} onOpenChange={onCloseAction}>
          <DrawerContent>
            <VisuallyHidden.Root>
              <DrawerTitle>Code</DrawerTitle>
              <DrawerDescription>Description</DrawerDescription>
            </VisuallyHidden.Root>

            <div className="flex h-[92dvh] flex-col overflow-y-auto">
              {children}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <div
          className={`${isShowing ? "w-[70%]" : "w-0"} hidden h-full overflow-hidden py-5 transition-[width] lg:flex`}
        >
          <div className="ml-3 flex h-full w-full min-w-0 flex-col rounded-l-xl shadow-lg shadow-muted-foreground/20">
            <div className="flex h-full w-full flex-col overflow-hidden rounded-l-xl shadow shadow-foreground/10">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
