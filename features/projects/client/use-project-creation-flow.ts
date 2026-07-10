"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { useGenerationHandoff } from "@/features/generation/client/generation-handoff-context";
import { fetchProjectEligibility } from "@/features/projects/client/api";
import { useCreateProject } from "@/features/projects/client/use-create-project";
import { getErrorMessage } from "@/features/shared/errors";
import { getModelCreditHoldCost } from "@/lib/billing/config";
import { fetchCompletionStream } from "@/features/generation/client/completion-stream";
import { createProjectRequestSchema } from "@/features/projects/contracts";
import { isActiveModelId } from "@/lib/constants";

type ProjectCreationFlowOptions = {
  isAuthenticated: boolean;
  screenshotData?: string;
  screenshotUrl?: string;
  onProjectLimit: (limit: number) => void;
  onOpenPricing: () => void;
};

export function useProjectCreationFlow({
  isAuthenticated,
  onOpenPricing,
  onProjectLimit,
  screenshotData,
  screenshotUrl,
}: ProjectCreationFlowOptions) {
  const router = useRouter();
  const { setStreamPromise } = useGenerationHandoff();
  const createProject = useCreateProject();
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [isPending, startTransition] = useTransition();

  const submit = async (formData: FormData) => {
    const parsedRequest = createProjectRequestSchema.safeParse({
      prompt: formData.get("prompt"),
      model: formData.get("model"),
      quality: formData.get("quality"),
      screenshotData,
      screenshotUrl,
    });

    if (!parsedRequest.success) {
      toast.error(
        parsedRequest.error.issues[0]?.message ||
          "Please complete the project form.",
      );
      return;
    }
    const { prompt, model, quality } = parsedRequest.data;
    if (!isActiveModelId(model)) {
      toast.error("Selected model is not supported");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to create a project");
      router.push("/sign-in?callbackUrl=/");
      return;
    }

    setIsCheckingEligibility(true);
    try {
      const eligibility = await fetchProjectEligibility(model);
      if (!eligibility.canCreate) {
        if (eligibility.error === "PROJECT_LIMIT_REACHED") {
          onProjectLimit(eligibility.projectLimit);
          return;
        }

        const cost = eligibility.modelCost || getModelCreditHoldCost(model);
        toast.error(
          `This model costs ${cost} credit${cost === 1 ? "" : "s"}. You have ${eligibility.credits}. Buy more credits to continue.`,
        );
        onOpenPricing();
        return;
      }
    } catch (error) {
      console.error("Error checking project eligibility:", error);
      toast.error(getErrorMessage(error, "Unable to check project access"));
      return;
    } finally {
      setIsCheckingEligibility(false);
    }

    startTransition(async () => {
      try {
        const result = await createProject.mutateAsync({
          prompt,
          model,
          quality,
          screenshotUrl: parsedRequest.data.screenshotUrl,
          screenshotData: parsedRequest.data.screenshotData,
        });
        const streamPromise = fetchCompletionStream({
          messageId: result.lastMessageId,
          model,
          screenshotData: parsedRequest.data.screenshotData,
        });

        setStreamPromise(streamPromise);
        router.push(`/chats/${result.chatId}`);
      } catch (error) {
        const message = getErrorMessage(error, "Failed to create project");
        if (message.includes("free projects")) {
          onProjectLimit(0);
          return;
        }
        toast.error(message);
      }
    });
  };

  return { isCheckingEligibility, isPending, submit };
}
