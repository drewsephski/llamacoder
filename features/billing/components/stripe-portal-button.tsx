"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useStripePortal } from "@/features/billing/client/use-stripe-portal";
import { getErrorMessage } from "@/features/shared/errors";

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
    setIsRedirecting(true);

    try {
      const { url } = await portalMutation.mutateAsync();
      window.location.assign(url);
    } catch (error: unknown) {
      console.error("Portal error:", error);
      toast.error(
        getErrorMessage(error, "Unable to open subscription management."),
      );
      setIsRedirecting(false);
    }
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
