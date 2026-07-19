"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useStripeCheckout } from "@/features/billing/client/use-stripe-checkout";
import type { CheckoutInput } from "@/features/billing/contracts";
import { getErrorMessage } from "@/features/shared/errors";

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
    setIsRedirecting(true);

    try {
      const { url } = await checkoutMutation.mutateAsync(checkout);
      window.location.assign(url);
    } catch (error: unknown) {
      console.error("Checkout error:", error);
      toast.error(
        getErrorMessage(error, "Something went wrong. Please try again."),
      );
      setIsRedirecting(false);
    }
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
