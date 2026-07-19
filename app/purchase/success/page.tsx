import { CheckCircle2, Download } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getForSaleProductByKey } from "@/features/for-sale/products";
import { reconcilePagePurchase } from "@/features/for-sale/server/purchases";
import { auth } from "@/lib/auth";

export default async function PurchaseSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const { session_id: sessionId } = await searchParams;
  if (!sessionId) redirect("/");

  const result = await reconcilePagePurchase(sessionId, session.user.id);
  if (!result.fulfilled)
    throw new Error("This payment is not ready for download.");
  const product = getForSaleProductByKey(result.purchase.productKey);
  if (!product) throw new Error("Purchased page is unavailable.");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf8] px-6 py-16 text-neutral-950">
      <section className="w-full max-w-xl rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Payment complete
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {product.name} is yours
        </h1>
        <p className="mx-auto mt-3 max-w-md leading-7 text-neutral-600">
          Download the standalone React app for this page. Your purchase does
          not expose source for any other Squid page or project.
        </p>
        <Button
          asChild
          className="mt-8 h-11 w-full bg-neutral-950 text-white hover:bg-neutral-800"
        >
          <a href={`/api/page-purchases/${sessionId}/download`}>
            <Download className="size-4" />
            Download React app
          </a>
        </Button>
        <Link
          className="mt-5 inline-block text-sm text-neutral-500 underline-offset-4 hover:underline"
          href={product.route}
        >
          Return to the page
        </Link>
      </section>
    </main>
  );
}
