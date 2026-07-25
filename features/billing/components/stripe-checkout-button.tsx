"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useStripeCheckout } from "@/features/billing/client/use-stripe-checkout";
import { executeStripeRedirect } from "@/features/billing/client/stripe-redirect";
import type { CheckoutInput } from "@/features/billing/contracts";

type StripeCheckoutButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "onClick" | "type"
> & {
  checkout: CheckoutInput;
  children: ReactNode;
};

export function StripeCheckoutButton({
  checkout,
  children,
  disabled,
  ...buttonProps
}: StripeCheckoutButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const checkoutMutation = useStripeCheckout();

  const handleCheckout = async () => {
    await executeStripeRedirect({
      execute: () => checkoutMutation.mutateAsync(checkout),
      setIsRedirecting,
      fallbackErrorMessage: "Something went wrong. Please try again.",
    });
  };

  return (
    <Button
      {...buttonProps}
      type="button"
      onClick={handleCheckout}
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
