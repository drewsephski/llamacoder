"use client";

import { useState, type ComponentProps, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { CometSpinner } from "@/components/loading-ui/comet-spinner";
import { useStripePortal } from "@/features/billing/client/use-stripe-portal";
import { executeStripeRedirect } from "@/features/billing/client/stripe-redirect";

type StripePortalButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "onClick" | "type"
> & {
  children: ReactNode;
};

export function StripePortalButton({
  children,
  disabled,
  ...buttonProps
}: StripePortalButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const portalMutation = useStripePortal();

  const handleOpenPortal = async () => {
    await executeStripeRedirect({
      execute: () => portalMutation.mutateAsync(),
      setIsRedirecting,
      fallbackErrorMessage: "Unable to open subscription management.",
    });
  };

  return (
    <Button
      {...buttonProps}
      type="button"
      onClick={handleOpenPortal}
      disabled={disabled || isRedirecting}
    >
      {isRedirecting ? (
        <>
          <CometSpinner className="size-4" aria-hidden="true" />
          Opening portal
        </>
      ) : (
        children
      )}
    </Button>
  );
}
