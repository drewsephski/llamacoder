"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchJson } from "@/features/shared/client/http";
import { authClient } from "@/lib/auth-client";
import {
  projectEligibilitySchema,
  userCreditsSchema,
} from "@/features/user/contracts";

export const userQueryKeys = {
  all: ["user"] as const,
  credits: ["user", "credits"] as const,
  session: ["user", "session"] as const,
  eligibility: (model: string) => ["user", "eligibility", model] as const,
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

export function useUserSession() {
  return useQuery({
    queryKey: userQueryKeys.session,
    queryFn: async () => (await authClient.getSession()).data,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useProjectEligibility(model: string) {
  return useQuery({
    queryKey: userQueryKeys.eligibility(model),
    queryFn: () =>
      fetchJson(
        `/api/user/can-create-project?model=${encodeURIComponent(model)}`,
        projectEligibilitySchema,
      ),
    staleTime: 10_000,
    gcTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
