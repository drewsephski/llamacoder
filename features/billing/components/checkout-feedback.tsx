"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { userQueryKeys } from "@/features/user/client/queries";

const CHECKOUT_QUERY_PARAMS = [
  "subscription_success",
  "subscription_updated",
  "subscription_canceled",
  "credits_success",
  "credits_canceled",
  "checkout_error",
  "session_id",
] as const;

export function CheckoutFeedback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    const snapshot = searchParams.toString();
    if (!snapshot || handledRef.current === snapshot) return;

    const checkoutError = searchParams.get("checkout_error");
    const subscriptionSuccess = searchParams.get("subscription_success");
    const subscriptionUpdated = searchParams.get("subscription_updated");
    const subscriptionCanceled = searchParams.get("subscription_canceled");
    const creditsSuccess = searchParams.get("credits_success");
    const creditsCanceled = searchParams.get("credits_canceled");
    const hasSessionId = searchParams.has("session_id");

    if (
      !checkoutError &&
      !subscriptionSuccess &&
      !subscriptionUpdated &&
      !subscriptionCanceled &&
      !creditsSuccess &&
      !creditsCanceled &&
      !hasSessionId
    ) {
      return;
    }

    handledRef.current = snapshot;

    if (checkoutError) {
      toast.error(checkoutError);
    } else if (subscriptionSuccess) {
      toast.success("Subscription activated!", {
        description: "Your plan and credits are updating now.",
      });
    } else if (subscriptionUpdated) {
      toast.success("Plan updated!", {
        description: "Your subscription changes are syncing now.",
      });
    } else if (subscriptionCanceled) {
      toast.message("Checkout canceled", {
        description: "No changes were made to your subscription.",
      });
    } else if (creditsSuccess) {
      toast.success("Credits purchased!", {
        description: "Your credit balance is updating now.",
      });
    } else if (creditsCanceled) {
      toast.message("Checkout canceled", {
        description: "No credits were purchased.",
      });
    } else if (hasSessionId) {
      toast.success("Payment received", {
        description: "Syncing your account now.",
      });
    }

    void queryClient.invalidateQueries({ queryKey: userQueryKeys.credits });

    const nextParams = new URLSearchParams(searchParams.toString());
    for (const param of CHECKOUT_QUERY_PARAMS) {
      nextParams.delete(param);
    }

    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `/dashboard?${nextQuery}` : "/dashboard");
  }, [queryClient, router, searchParams]);

  return null;
}
