import type { ForSaleProduct } from "@/features/for-sale/types";

export type CheckoutResult = {
  status: "stubbed";
  productRoute: string;
};

/**
 * Checkout boundary for sale-page purchases. Replace this implementation with
 * a server action or checkout endpoint when Stripe products are configured.
 */
export async function beginForSaleCheckout(
  product: ForSaleProduct,
): Promise<CheckoutResult> {
  return Promise.resolve({ status: "stubbed", productRoute: product.route });
}
