"use client";

import {
  ArrowRight,
  Check,
  Download,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { beginForSaleCheckout } from "@/features/for-sale/checkout";
import { getForSaleProduct } from "@/features/for-sale/products";

export function ForSaleBanner() {
  const pathname = usePathname();
  const product = getForSaleProduct(pathname);
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedRoute, setDismissedRoute] = useState<string | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!product || dismissedRoute === product.route) return null;

  const startCheckout = () => {
    setCheckoutMessage(null);
    startTransition(async () => {
      try {
        const { url } = await beginForSaleCheckout(product);
        window.location.assign(url);
      } catch (error) {
        setCheckoutMessage(
          error instanceof Error ? error.message : "Unable to start checkout.",
        );
      }
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setCheckoutMessage(null);
      }}
    >
      <aside
        aria-label="Landing page for sale"
        className="fixed bottom-3 left-1/2 z-40 flex w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 items-center gap-2 rounded-full border border-black/10 bg-white/90 p-1.5 pl-4 text-neutral-950 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl sm:bottom-5"
      >
        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-2">
          <p className="truncate text-xs font-medium sm:text-sm">
            This landing page is available
          </p>
          <span
            className="hidden text-neutral-300 sm:inline"
            aria-hidden="true"
          >
            ·
          </span>
          <p className="text-xs font-semibold text-neutral-500">
            {product.priceLabel}
          </p>
        </div>
        <Button
          className="h-8 shrink-0 rounded-full bg-neutral-950 px-3 text-xs text-white hover:bg-neutral-800 sm:px-4"
          onClick={() => setIsOpen(true)}
          size="sm"
        >
          Make it yours
          <ArrowRight className="size-3.5" />
        </Button>
        <button
          aria-label="Dismiss sale banner"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          onClick={() => setDismissedRoute(product.route)}
          type="button"
        >
          <X className="size-3.5" />
        </button>
      </aside>

      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto border-neutral-200 bg-[#fbfaf8] p-0 text-neutral-950 sm:max-w-xl sm:p-0 [&>button]:z-10 [&>button]:rounded-full [&>button]:bg-white/90 [&>button]:p-2 [&>button]:opacity-100 [&>button]:shadow-sm">
        <div className="relative aspect-[16/8] w-full overflow-hidden rounded-t-xl bg-neutral-100">
          <Image
            alt={product.assetLabel}
            className="object-cover object-top"
            fill
            sizes="(max-width: 640px) 95vw, 576px"
            src={product.assetHref}
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            <Sparkles className="size-3" />
            Ready to make your own
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <DialogHeader>
            <div className="flex items-start justify-between gap-5 pr-6">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  Premium landing page
                </p>
                <DialogTitle className="text-2xl tracking-tight sm:text-3xl">
                  {product.name}
                </DialogTitle>
              </div>
              <p className="whitespace-nowrap text-2xl font-semibold tracking-tight">
                {product.priceLabel}
              </p>
            </div>
            <DialogDescription className="pt-2 text-sm leading-6 text-neutral-600">
              {product.description} Start with a polished foundation and adapt
              it to your brand in a fraction of the time.
            </DialogDescription>
          </DialogHeader>

          <div className="my-5 grid gap-2.5 rounded-xl border border-neutral-200/80 bg-white p-4 text-sm text-neutral-700 sm:grid-cols-2">
            {[
              "Distinctive, premium design",
              "Responsive page foundation",
              "Easy to customize",
              "Page-specific asset included",
            ].map((benefit) => (
              <div className="flex items-center gap-2" key={benefit}>
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <Check className="size-3" />
                </span>
                {benefit}
              </div>
            ))}
          </div>

          <Button
            className="h-11 w-full bg-neutral-950 text-white shadow-sm hover:bg-neutral-800"
            disabled={isPending}
            onClick={startCheckout}
          >
            <ShoppingBag className="size-4" />
            {isPending
              ? "Starting…"
              : `Get this page for ${product.priceLabel}`}
          </Button>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <Button asChild className="text-neutral-600" variant="ghost">
              <a download href={product.assetHref}>
                <Download className="size-4" />
                Download preview asset
              </a>
            </Button>
            <p className="flex items-center justify-center text-center text-xs leading-5 text-neutral-500">
              Secure one-time checkout via Stripe
            </p>
          </div>

          <p
            className="mt-2 min-h-5 text-center text-xs leading-5 text-neutral-500"
            role="status"
          >
            {checkoutMessage}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
