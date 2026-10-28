"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { userQueryKeys } from "@/features/user/client/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Gift = { id: string; amount: number; sender: string; message: string };

export function CreditGiftPopup() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState<string | null>(null);
  const userId = session?.user.id;
  const { data: gift } = useQuery({
    queryKey: ["credit-gift", userId],
    enabled: Boolean(userId && session?.user.emailVerified),
    queryFn: async () => {
      const response = await fetch("/api/user/credit-gift", { method: "POST" });
      if (!response.ok) throw new Error("Unable to load credit gift");
      const { gift } = (await response.json()) as { gift: Gift | null };
      if (gift) {
        await queryClient.invalidateQueries({
          queryKey: userQueryKeys.credits,
        });
        try {
          if (localStorage.getItem(`credit-gift:${userId}:${gift.id}`))
            return null;
        } catch {
          /* Still show the gift when browser storage is unavailable. */
        }
      }
      return gift;
    },
    staleTime: Infinity,
  });

  function dismiss() {
    if (!gift) return;
    setDismissed(gift.id);
    try {
      localStorage.setItem(`credit-gift:${userId}:${gift.id}`, "seen");
    } catch {
      /* In-memory dismissal remains available. */
    }
  }

  return (
    <Dialog
      open={Boolean(gift && dismissed !== gift.id)}
      onOpenChange={(open) => {
        if (!open) dismiss();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>A gift from {gift?.sender}</DialogTitle>
          <DialogDescription>
            {gift?.message} They’re ready to use, on top of your welcome
            credits.
          </DialogDescription>
        </DialogHeader>
        <Button onClick={dismiss}>Thanks, {gift?.sender}!</Button>
      </DialogContent>
    </Dialog>
  );
}
