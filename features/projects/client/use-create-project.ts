"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createProjectResponseSchema,
  type CreateProjectRequest,
} from "@/features/projects/contracts";
import { fetchJson } from "@/features/shared/client/http";
import { userQueryKeys } from "@/features/user/client/queries";

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) =>
      fetchJson("/api/create-chat", createProjectResponseSchema, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.credits });
    },
  });
}
