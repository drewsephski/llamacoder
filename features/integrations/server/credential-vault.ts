import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

export type EncryptedCredential = {
  ciphertext: string;
  iv: string;
  authTag: string;
  keyVersion: number;
};

const ALGORITHM = "aes-256-gcm";
const KEY_VERSION = 1;

function getEncryptionKey() {
  const configured = process.env.INTEGRATION_ENCRYPTION_KEY?.trim();
  if (!configured) {
    throw new Error(
      "INTEGRATION_ENCRYPTION_KEY is required to store integration credentials.",
    );
  }

  const decoded = /^[a-f0-9]{64}$/i.test(configured)
    ? Buffer.from(configured, "hex")
    : Buffer.from(configured, "base64");

  if (decoded.length !== 32) {
    throw new Error(
      "INTEGRATION_ENCRYPTION_KEY must be a 32-byte base64 or 64-character hex value.",
    );
  }

  return decoded;
}

function buildAdditionalData({
  userId,
  connectionId,
  kind,
}: {
  userId: string;
  connectionId: string;
  kind: string;
}) {
  return Buffer.from(`squid:${userId}:${connectionId}:${kind}:${KEY_VERSION}`);
}

export function encryptIntegrationCredential({
  value,
  userId,
  connectionId,
  kind,
}: {
  value: string;
  userId: string;
  connectionId: string;
  kind: string;
}): EncryptedCredential {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  cipher.setAAD(buildAdditionalData({ userId, connectionId, kind }));
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    keyVersion: KEY_VERSION,
  };
}

export function decryptIntegrationCredential({
  credential,
  userId,
  connectionId,
  kind,
}: {
  credential: EncryptedCredential;
  userId: string;
  connectionId: string;
  kind: string;
}) {
  if (credential.keyVersion !== KEY_VERSION) {
    throw new Error("Unsupported integration credential key version.");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(credential.iv, "base64"),
  );
  decipher.setAAD(buildAdditionalData({ userId, connectionId, kind }));
  decipher.setAuthTag(Buffer.from(credential.authTag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(credential.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export function fingerprintCredential(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}
