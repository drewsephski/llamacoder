import Spinner from "@/components/spinner";
import { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export default function LoadingButton({
  children,
  className,
  ...rest
}: ComponentProps<"button">) {
  const { pending } = useFormStatus();

  return (
    <Button {...rest} disabled={pending || rest.disabled} className={className}>
      <Spinner loading={pending}>{children}</Spinner>
    </Button>
  );
}
