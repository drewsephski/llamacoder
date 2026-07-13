import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createDelivery: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({
    integrationWebhookDelivery: { create: mocks.createDelivery },
  }),
}));

import { POST } from "@/app/api/integrations/webhooks/github/route";

describe("GitHub integration webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GITHUB_WEBHOOK_SECRET = "webhook-secret";
    mocks.createDelivery.mockResolvedValue({ id: "delivery_1" });
  });

  it("rejects unsigned payloads", async () => {
    const response = await POST(
      new Request("http://localhost/api/integrations/webhooks/github", {
        method: "POST",
        body: "{}",
      }),
    );
    expect(response.status).toBe(401);
    expect(mocks.createDelivery).not.toHaveBeenCalled();
  });

  it("accepts and records signed non-installation events", async () => {
    const payload = JSON.stringify({ zen: "keep it logically awesome" });
    const signature = createHmac("sha256", "webhook-secret")
      .update(payload)
      .digest("hex");
    const response = await POST(
      new Request("http://localhost/api/integrations/webhooks/github", {
        method: "POST",
        headers: {
          "x-hub-signature-256": `sha256=${signature}`,
          "x-github-delivery": "delivery_1",
          "x-github-event": "ping",
        },
        body: payload,
      }),
    );
    expect(response.status).toBe(200);
    expect(mocks.createDelivery).toHaveBeenCalledWith({
      data: expect.objectContaining({
        providerId: "github",
        deliveryId: "delivery_1",
        event: "ping",
      }),
    });
  });
});
