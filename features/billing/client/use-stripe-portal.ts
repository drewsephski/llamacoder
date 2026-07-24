"use client";

import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { fetchJson } from "@/features/shared/client/http";

const portalResponseSchema = z.object({
  url: z.string().url(),
});

export function useStripePortal() {
  return useMutation({
    mutationFn: () =>
      fetchJson("/api/stripe/portal", portalResponseSchema, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
  });
}
