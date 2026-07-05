import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildStripeEvent, readJson } from "../fixtures/builders";

const {
  fulfillCheckoutSessionMock,
  fulfillPaidInvoiceMock,
  hasProcessedStripeEventMock,
  markSubscriptionStatusMock,
  recordProcessedStripeEventMock,
  stripeMock,
  syncSubscriptionFromStripeMock,
} = vi.hoisted(() => ({
  fulfillCheckoutSessionMock: vi.fn(),
  fulfillPaidInvoiceMock: vi.fn(),
  hasProcessedStripeEventMock: vi.fn(),
  markSubscriptionStatusMock: vi.fn(),
  recordProcessedStripeEventMock: vi.fn(),
  syncSubscriptionFromStripeMock: vi.fn(),
  stripeMock: {
    webhooks: { constructEvent: vi.fn() },
    invoices: { retrieve: vi.fn() },
  },
}));

vi.mock("@/lib/stripe", () => ({
  stripe: stripeMock,
  STRIPE_WEBHOOK_SECRET: "whsec_unit",
}));

vi.mock("@/lib/billing/stripe-fulfillment", () => ({
  fulfillCheckoutSession: fulfillCheckoutSessionMock,
  fulfillPaidInvoice: fulfillPaidInvoiceMock,
  hasProcessedStripeEvent: hasProcessedStripeEventMock,
  markSubscriptionStatus: markSubscriptionStatusMock,
  recordProcessedStripeEvent: recordProcessedStripeEventMock,
  syncSubscriptionFromStripe: syncSubscriptionFromStripeMock,
}));

import { POST } from "@/app/api/stripe/webhook/route";

function request(payload = "{}", signature?: string) {
  return new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    headers: signature ? { "stripe-signature": signature } : undefined,
    body: payload,
  }) as never;
}

describe("/api/stripe/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hasProcessedStripeEventMock.mockResolvedValue(false);
    fulfillCheckoutSessionMock.mockResolvedValue({ fulfilled: true });
    fulfillPaidInvoiceMock.mockResolvedValue({ fulfilled: true });
    syncSubscriptionFromStripeMock.mockResolvedValue({ synced: true });
  });

  it("rejects missing and invalid signatures", async () => {
    let response = await POST(request("{}"));
    expect(response.status).toBe(400);
    await expect(readJson(response)).resolves.toMatchObject({
      error: "Missing stripe-signature header",
    });

    stripeMock.webhooks.constructEvent.mockImplementationOnce(() => {
      throw new Error("bad sig");
    });
    response = await POST(request("{}", "sig"));
    expect(response.status).toBe(400);
    await expect(readJson(response)).resolves.toMatchObject({
      error: expect.stringContaining("bad sig"),
    });
  });

  it("ignores duplicate events before dispatching fulfillment", async () => {
    const event = buildStripeEvent("checkout.session.completed", {
      id: "cs_1",
    });
    stripeMock.webhooks.constructEvent.mockReturnValueOnce(event);
    hasProcessedStripeEventMock.mockResolvedValueOnce(true);

    const response = await POST(request("{}", "sig"));

    expect(response.status).toBe(200);
    await expect(readJson(response)).resolves.toEqual({
      received: true,
      duplicate: true,
    });
    expect(fulfillCheckoutSessionMock).not.toHaveBeenCalled();
  });

  it("dispatches checkout and invoice events and records them after success", async () => {
    const checkoutEvent = buildStripeEvent("checkout.session.completed", {
      id: "cs_1",
    });
    stripeMock.webhooks.constructEvent.mockReturnValueOnce(checkoutEvent);

    let response = await POST(request("{}", "sig"));
    expect(response.status).toBe(200);
    expect(fulfillCheckoutSessionMock).toHaveBeenCalledWith(
      checkoutEvent.data.object,
      checkoutEvent.id,
    );
    expect(recordProcessedStripeEventMock).toHaveBeenCalledWith(checkoutEvent);

    const invoiceEvent = buildStripeEvent("invoice.paid", { id: "in_1" });
    stripeMock.webhooks.constructEvent.mockReturnValueOnce(invoiceEvent);
    response = await POST(request("{}", "sig"));
    expect(response.status).toBe(200);
    expect(fulfillPaidInvoiceMock).toHaveBeenCalledWith(
      invoiceEvent.data.object,
      invoiceEvent.id,
    );
  });

  it("marks failed and deleted subscriptions without granting credits", async () => {
    const failedEvent = buildStripeEvent("invoice.payment_failed", {
      id: "in_1",
      parent: {
        subscription_details: {
          subscription: "sub_1",
        },
      },
    });
    stripeMock.webhooks.constructEvent.mockReturnValueOnce(failedEvent);

    await POST(request("{}", "sig"));

    expect(markSubscriptionStatusMock).toHaveBeenCalledWith("sub_1", "past_due");

    const deletedEvent = buildStripeEvent("customer.subscription.deleted", {
      id: "sub_1",
    });
    stripeMock.webhooks.constructEvent.mockReturnValueOnce(deletedEvent);

    await POST(request("{}", "sig"));

    expect(markSubscriptionStatusMock).toHaveBeenCalledWith("sub_1", "canceled");
    expect(fulfillPaidInvoiceMock).not.toHaveBeenCalled();
  });
});
