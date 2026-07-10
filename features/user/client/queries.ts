"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchJson } from "@/features/shared/client/http";
import { userCreditsSchema } from "@/features/user/contracts";

export const userQueryKeys = {
  all: ["user"] as const,
  credits: ["user", "credits"] as const,
};

export function useUserCredits() {
  return useQuery({
    queryKey: userQueryKeys.credits,
    queryFn: () => fetchJson("/api/user/credits", userCreditsSchema),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
