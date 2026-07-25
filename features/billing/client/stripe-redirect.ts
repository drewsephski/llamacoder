import { getErrorMessage } from "@/features/shared/errors";
import { toast } from "sonner";

export async function executeStripeRedirect({
  execute,
  setIsRedirecting,
  fallbackErrorMessage,
}: {
  execute: () => Promise<{ url: string }>;
  setIsRedirecting: (value: boolean) => void;
  fallbackErrorMessage: string;
}) {
  setIsRedirecting(true);

  try {
    const { url } = await execute();
    window.location.assign(url);
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, fallbackErrorMessage));
    setIsRedirecting(false);
  }
}
