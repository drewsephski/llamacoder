"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { fetchJson } from "@/features/shared/client/http";
import { userQueryKeys } from "@/features/user/client/queries";
import type { CheckoutInput } from "@/features/billing/contracts";

const checkoutResponseSchema = z.object({
  url: z.string().url(),
});

export function useStripeCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckoutInput) =>
      fetchJson(
        "pack" in data
          ? "/api/stripe/credits-checkout"
          : "/api/stripe/checkout",
        checkoutResponseSchema,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.credits });
    },
  });
}
