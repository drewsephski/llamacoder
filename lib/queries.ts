"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "./auth-client";

// Query Keys
export const queryKeys = {
  user: {
    credits: ["user", "credits"] as const,
    session: ["user", "session"] as const,
    canCreate: ["user", "can-create"] as const,
  },
  projects: ["projects"] as const,
};

// Query Functions
async function fetchUserCredits() {
  const response = await fetch("/api/user/credits");
  if (!response.ok) {
    throw new Error("Failed to fetch credits");
  }
  return response.json();
}

async function fetchUserSession() {
  const result = await authClient.getSession();
  return result.data;
}

async function fetchCanCreateProject() {
  const response = await fetch("/api/user/can-create-project");
  if (!response.ok) {
    throw new Error("Failed to check eligibility");
  }
  return response.json();
}

// Query Hooks
export function useUserCredits() {
  return useQuery({
    queryKey: queryKeys.user.credits,
    queryFn: fetchUserCredits,
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

export function useUserSession() {
  return useQuery({
    queryKey: queryKeys.user.session,
    queryFn: fetchUserSession,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useCanCreateProject() {
  return useQuery({
    queryKey: queryKeys.user.canCreate,
    queryFn: fetchCanCreateProject,
    staleTime: 10_000, // 10 seconds
    gcTime: 60_000, // 1 minute
    refetchOnWindowFocus: true,
  });
}

// Mutation Hooks
export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      prompt: string;
      model: string;
      quality: string;
      screenshotUrl?: string;
      screenshotData?: string;
    }) => {
      const response = await fetch("/api/create-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create chat");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate projects list after creating a chat
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      // Refresh credits as project creation may consume credits
      queryClient.invalidateQueries({ queryKey: queryKeys.user.credits });
    },
  });
}

export function useStripeCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { plan?: string; pack?: string }) => {
      const url = data.pack
        ? "/api/stripe/credits-checkout"
        : "/api/stripe/checkout";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate credits after successful checkout
      queryClient.invalidateQueries({ queryKey: queryKeys.user.credits });
    },
  });
}
