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

            <div className="flex h-[92dvh] min-w-0 flex-col overflow-hidden">
              {children}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <div
          className={`${
            isShowing ? "min-w-0 flex-1" : "w-0"
          } hidden h-full overflow-hidden py-5 pl-3 transition-[width,flex-basis] lg:flex`}
        >
          <div className="flex h-full w-full min-w-0 flex-col rounded-l-xl shadow-lg shadow-muted-foreground/20">
            <div className="flex h-full w-full flex-col overflow-hidden rounded-l-xl shadow shadow-foreground/10">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
