"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createProjectResponseSchema,
  type CreateProjectRequest,
} from "@/features/projects/contracts";
import { fetchJson } from "@/features/shared/client/http";
import { userQueryKeys } from "@/features/user/client/queries";

export const projectQueryKeys = {
  all: ["projects"] as const,
};

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectRequest) =>
      fetchJson("/api/create-chat", createProjectResponseSchema, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.credits });
    },
  });
}
