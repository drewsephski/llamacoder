import { NextRequest } from "next/server";
import { getPrisma } from "@/lib/prisma";

const ANONYMOUS_LIMIT = 1;

/**
 * Generate a hash from IP and fingerprint using Web Crypto API.
 * Works in all runtimes including Edge.
 */
async function generateFingerprint(ip: string, userAgent: string): Promise<string> {
  const data = `${ip}:${userAgent}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

/**
 * Check if an anonymous user can make a generation.
 * Anonymous users get exactly 1 free generation.
 *
 * @returns { allowed: true } if user can proceed
 * @returns { allowed: false, reason: "LIMIT_REACHED" } if user has used their free generation
 */
export async function checkAnonymousUsageLimit(
  request: NextRequest
): Promise<{ allowed: boolean; reason?: "LIMIT_REACHED" }> {
  const prisma = getPrisma();

  // Extract IP (handle common proxy headers)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";

  // Extract user agent for fingerprinting
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Generate fingerprint
  const fingerprintHash = await generateFingerprint(ip, userAgent);

  try {
    // Check for existing usage record
    const existing = await prisma.anonymousUsage.findFirst({
      where: {
        OR: [{ ipHash: ip.slice(0, 32) }, { fingerprintHash }],
      },
    });

    if (existing) {
      // User has used their free generation
      if (existing.generationsUsed >= ANONYMOUS_LIMIT) {
        return { allowed: false, reason: "LIMIT_REACHED" };
      }

      // Increment usage
      await prisma.anonymousUsage.update({
        where: { id: existing.id },
        data: { generationsUsed: { increment: 1 } },
      });

      return { allowed: true };
    }

    // First time - create record
    await prisma.anonymousUsage.create({
      data: {
        ipHash: ip.slice(0, 32),
        fingerprintHash,
        generationsUsed: 1,
      },
    });

    return { allowed: true };
  } catch (error) {
    console.error("[AnonymousCheck] Error checking anonymous usage:", error);
    // Fail open to avoid blocking legitimate users on errors
    return { allowed: true };
  }
}

/**
 * Get remaining anonymous generations for a request.
 * Used for UI display purposes.
 */
export async function getAnonymousRemainingGenerations(
  request: NextRequest
): Promise<number> {
  const prisma = getPrisma();

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const fingerprintHash = await generateFingerprint(ip, userAgent);

  try {
    const existing = await prisma.anonymousUsage.findFirst({
      where: {
        OR: [{ ipHash: ip.slice(0, 32) }, { fingerprintHash }],
      },
    });

    if (!existing) {
      return ANONYMOUS_LIMIT;
    }

    return Math.max(0, ANONYMOUS_LIMIT - existing.generationsUsed);
  } catch (error) {
    console.error("[AnonymousCheck] Error getting remaining generations:", error);
    return ANONYMOUS_LIMIT;
  }
}
