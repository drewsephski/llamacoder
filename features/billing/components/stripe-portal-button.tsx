"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        children
      )}
    </Button>
  );
}
