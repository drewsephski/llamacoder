import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildStripeEvent, readJson } from "../fixtures/builders";

const {
  fulfillCheckoutSessionMock,
  fulfillPaidInvoiceMock,
  hasProcessedStripeEventMock,
  recordProcessedStripeEventMock,
  recordOperationalEventMock,
  stripeMock,
  syncSubscriptionFromStripeMock,
} = vi.hoisted(() => ({
  fulfillCheckoutSessionMock: vi.fn(),
  fulfillPaidInvoiceMock: vi.fn(),
  hasProcessedStripeEventMock: vi.fn(),
  recordProcessedStripeEventMock: vi.fn(),
  recordOperationalEventMock: vi.fn(),
  syncSubscriptionFromStripeMock: vi.fn(),
  stripeMock: {
    webhooks: { constructEvent: vi.fn() },
    invoices: { retrieve: vi.fn() },
  },
}));

vi.mock("@/lib/stripe", () => ({
  stripe: stripeMock,
  getStripeWebhookSecret: () => "whsec_unit",
}));

vi.mock("@/lib/billing/stripe-fulfillment", () => ({
  fulfillCheckoutSession: fulfillCheckoutSessionMock,
  fulfillPaidInvoice: fulfillPaidInvoiceMock,
  hasProcessedStripeEvent: hasProcessedStripeEventMock,
  recordProcessedStripeEvent: recordProcessedStripeEventMock,
  syncSubscriptionFromStripe: syncSubscriptionFromStripeMock,
}));

vi.mock("@/lib/observability", () => ({
  recordOperationalEvent: recordOperationalEventMock,
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
    recordOperationalEventMock.mockResolvedValue(undefined);
    syncSubscriptionFromStripeMock.mockResolvedValue({ synced: true });
  });

  it("rejects missing, invalid, and malformed signed payloads", async () => {
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
      error: "Webhook signature verification failed",
    });

    stripeMock.webhooks.constructEvent.mockImplementationOnce(() => {
      throw new SyntaxError("Unexpected end of JSON input");
    });
    response = await POST(request('{"id":', "sig"));
    expect(response.status).toBe(400);
    await expect(readJson(response)).resolves.toEqual({
      error: "Webhook signature verification failed",
    });
    expect(stripeMock.webhooks.constructEvent).toHaveBeenLastCalledWith(
      '{"id":',
      "sig",
      "whsec_unit",
    );
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

  it("retries an event after a transient fulfillment failure", async () => {
    const event = buildStripeEvent("checkout.session.completed", {
      id: "cs_retry",
    });
    stripeMock.webhooks.constructEvent.mockReturnValue(event);
    fulfillCheckoutSessionMock
      .mockRejectedValueOnce(new Error("database temporarily unavailable"))
      .mockResolvedValueOnce({ fulfilled: true });

    let response = await POST(request("retry-payload", "sig"));
    expect(response.status).toBe(500);
    expect(recordProcessedStripeEventMock).not.toHaveBeenCalled();
    expect(recordOperationalEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "stripe_webhook_failed",
        operation: "checkout.session.completed",
        status: "error",
        metadata: { eventId: event.id },
      }),
    );

    response = await POST(request("retry-payload", "sig"));
    expect(response.status).toBe(200);
    expect(fulfillCheckoutSessionMock).toHaveBeenCalledTimes(2);
    expect(recordProcessedStripeEventMock).toHaveBeenCalledOnce();
  });

  it("logs and retries idempotency lookup failures", async () => {
    const event = buildStripeEvent("checkout.session.completed", {
      id: "cs_lookup_retry",
    });
    stripeMock.webhooks.constructEvent.mockReturnValue(event);
    hasProcessedStripeEventMock
      .mockRejectedValueOnce(new Error("database temporarily unavailable"))
      .mockResolvedValueOnce(false);

    let response = await POST(request("{}", "sig"));
    expect(response.status).toBe(500);
    expect(fulfillCheckoutSessionMock).not.toHaveBeenCalled();
    expect(recordOperationalEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "stripe_webhook_failed",
        metadata: { eventId: event.id },
      }),
    );

    response = await POST(request("{}", "sig"));
    expect(response.status).toBe(200);
    expect(fulfillCheckoutSessionMock).toHaveBeenCalledOnce();
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

  it("covers asynchronous checkout and invoice-payment success events", async () => {
    const asyncCheckoutEvent = buildStripeEvent(
      "checkout.session.async_payment_succeeded",
      { id: "cs_async" },
      { id: "evt_async_checkout" },
    );
    stripeMock.webhooks.constructEvent.mockReturnValueOnce(asyncCheckoutEvent);

    let response = await POST(request("{}", "sig"));
    expect(response.status).toBe(200);
    expect(fulfillCheckoutSessionMock).toHaveBeenCalledWith(
      asyncCheckoutEvent.data.object,
      asyncCheckoutEvent.id,
    );

    const invoicePaymentEvent = buildStripeEvent(
      "invoice_payment.paid",
      { id: "inpay_1", invoice: "in_1" },
      { id: "evt_invoice_payment" },
    );
    const invoice = { id: "in_1", status: "paid" };
    stripeMock.webhooks.constructEvent.mockReturnValueOnce(invoicePaymentEvent);
    stripeMock.invoices.retrieve.mockResolvedValueOnce(invoice);

    response = await POST(request("{}", "sig"));
    expect(response.status).toBe(200);
    expect(stripeMock.invoices.retrieve).toHaveBeenCalledWith("in_1", {
      expand: ["lines.data"],
    });
    expect(fulfillPaidInvoiceMock).toHaveBeenCalledWith(
      invoice,
      invoicePaymentEvent.id,
    );
  });

  it.each(["customer.subscription.created", "customer.subscription.updated"])(
    "reconciles current state for %s",
    async (type) => {
      const event = buildStripeEvent(
        type,
        { id: "sub_1", customer: "cus_1" },
        { id: `evt_${type}` },
      );
      stripeMock.webhooks.constructEvent.mockReturnValueOnce(event);

      const response = await POST(request("{}", "sig"));

      expect(response.status).toBe(200);
      expect(syncSubscriptionFromStripeMock).toHaveBeenCalledWith({
        subscriptionId: "sub_1",
        fallbackCustomerId: "cus_1",
      });
      expect(recordProcessedStripeEventMock).toHaveBeenCalledWith(event);
    },
  );

  it("reconciles failed and deleted subscriptions from Stripe", async () => {
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

    expect(syncSubscriptionFromStripeMock).toHaveBeenCalledWith({
      subscriptionId: "sub_1",
      fallbackCustomerId: undefined,
    });

    const deletedEvent = buildStripeEvent("customer.subscription.deleted", {
      id: "sub_1",
      customer: "cus_1",
    });
    stripeMock.webhooks.constructEvent.mockReturnValueOnce(deletedEvent);

    await POST(request("{}", "sig"));

    expect(syncSubscriptionFromStripeMock).toHaveBeenCalledWith({
      subscriptionId: "sub_1",
      fallbackCustomerId: "cus_1",
    });
    expect(fulfillPaidInvoiceMock).not.toHaveBeenCalled();
  });

  it("does not let an out-of-order failed invoice overwrite current access", async () => {
    const event = buildStripeEvent(
      "invoice.payment_failed",
      {
        id: "in_stale",
        customer: "cus_1",
        parent: {
          subscription_details: {
            subscription: "sub_1",
          },
        },
      },
      { id: "evt_stale_failure" },
    );
    stripeMock.webhooks.constructEvent.mockReturnValueOnce(event);
    syncSubscriptionFromStripeMock.mockResolvedValueOnce({
      subscriptionId: "sub_1",
      status: "active",
    });

    const response = await POST(request("{}", "sig"));

    expect(response.status).toBe(200);
    expect(syncSubscriptionFromStripeMock).toHaveBeenCalledWith({
      subscriptionId: "sub_1",
      fallbackCustomerId: "cus_1",
    });
    expect(recordProcessedStripeEventMock).toHaveBeenCalledWith(event);
  });

  it("fails an invoice-payment event closed when its invoice is missing", async () => {
    const event = buildStripeEvent(
      "invoice_payment.paid",
      { id: "inpay_missing" },
      { id: "evt_invoice_payment" },
    );
    stripeMock.webhooks.constructEvent.mockReturnValueOnce(event);

    const response = await POST(request("{}", "sig"));

    expect(response.status).toBe(500);
    expect(fulfillPaidInvoiceMock).not.toHaveBeenCalled();
    expect(recordProcessedStripeEventMock).not.toHaveBeenCalled();
  });
});
