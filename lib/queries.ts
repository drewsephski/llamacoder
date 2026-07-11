"use client";

// Compatibility entrypoint. New code should import feature-owned hooks.
export {
  useProjectEligibility,
  useUserCredits,
  useUserSession,
} from "@/features/user/client/queries";
export { useCreateProject as useCreateChat } from "@/features/projects/client/use-create-project";
export { useStripeCheckout } from "@/features/billing/client/use-stripe-checkout";
