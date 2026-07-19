import JSZip from "jszip";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getForSaleProductByKey } from "@/features/for-sale/products";
import { buildPurchasedPageBundle } from "@/features/for-sale/server/page-bundle";
import { reconcilePagePurchase } from "@/features/for-sale/server/purchases";
import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { sessionId } = await params;
  await reconcilePagePurchase(sessionId, session.user.id);

  const purchase = await getPrisma().pagePurchase.findUnique({
    where: { stripeCheckoutSessionId: sessionId },
  });
  if (
    !purchase ||
    purchase.userId !== session.user.id ||
    purchase.status !== "paid"
  ) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }
  const product = getForSaleProductByKey(purchase.productKey);
  if (!product)
    return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const zip = new JSZip();
  for (const file of buildPurchasedPageBundle(product))
    zip.file(file.path, file.content);
  const content = await zip.generateAsync({ type: "arraybuffer" });
  await getPrisma().pagePurchase.update({
    where: { id: purchase.id },
    data: { lastDownloadedAt: new Date() },
  });

  return new NextResponse(content, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${product.key}-react-app.zip"`,
      "Cache-Control": "private, no-store",
    },
  });
}
