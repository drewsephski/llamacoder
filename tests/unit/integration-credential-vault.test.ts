import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  decryptIntegrationCredential,
  encryptIntegrationCredential,
  fingerprintCredential,
} from "@/features/integrations/server/credential-vault";

const originalKey = process.env.INTEGRATION_ENCRYPTION_KEY;

describe("integration credential vault", () => {
  beforeEach(() => {
    process.env.INTEGRATION_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString(
      "base64",
    );
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.INTEGRATION_ENCRYPTION_KEY;
    } else {
      process.env.INTEGRATION_ENCRYPTION_KEY = originalKey;
    }
  });

  it("round-trips a credential without storing plaintext", () => {
    const encrypted = encryptIntegrationCredential({
      value: "sk_live_sensitive_value",
      userId: "user_1",
      connectionId: "connection_1",
      kind: "api_key",
    });

    expect(encrypted.ciphertext).not.toContain("sk_live_sensitive_value");
    expect(
      decryptIntegrationCredential({
        credential: encrypted,
        userId: "user_1",
        connectionId: "connection_1",
        kind: "api_key",
      }),
    ).toBe("sk_live_sensitive_value");
  });

  it("binds ciphertext to its user, connection, and credential kind", () => {
    const encrypted = encryptIntegrationCredential({
      value: "credential-value",
      userId: "user_1",
      connectionId: "connection_1",
      kind: "api_key",
    });

    expect(() =>
      decryptIntegrationCredential({
        credential: encrypted,
        userId: "user_2",
        connectionId: "connection_1",
        kind: "api_key",
      }),
    ).toThrow();
  });

  it("fails closed when the encryption key is missing or invalid", () => {
    delete process.env.INTEGRATION_ENCRYPTION_KEY;
    expect(() =>
      encryptIntegrationCredential({
        value: "credential-value",
        userId: "user_1",
        connectionId: "connection_1",
        kind: "api_key",
      }),
    ).toThrow(/INTEGRATION_ENCRYPTION_KEY is required/);

    process.env.INTEGRATION_ENCRYPTION_KEY = "too-short";
    expect(() =>
      encryptIntegrationCredential({
        value: "credential-value",
        userId: "user_1",
        connectionId: "connection_1",
        kind: "api_key",
      }),
    ).toThrow(/32-byte/);
  });

  it("creates a short non-secret audit fingerprint", () => {
    expect(fingerprintCredential("same-secret")).toBe(
      fingerprintCredential("same-secret"),
    );
    expect(fingerprintCredential("same-secret")).not.toBe(
      fingerprintCredential("different-secret"),
    );
    expect(fingerprintCredential("same-secret")).toHaveLength(12);
  });
});
