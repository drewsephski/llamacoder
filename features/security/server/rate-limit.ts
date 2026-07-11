import "server-only";

import { getPrisma } from "@/lib/prisma";

export type RateLimitOperation =
  | "checkout"
  | "completion"
  | "create_project"
  | "generate_code"
  | "screenshot";

type RateLimitOptions = {
  userId: string;
  operation: RateLimitOperation;
  limit: number;
  windowMs: number;
};

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

export async function consumeRateLimit({
  userId,
  operation,
  limit,
  windowMs,
}: RateLimitOptions): Promise<RateLimitResult> {
  if (!Number.isSafeInteger(limit) || limit < 1 || windowMs < 1_000) {
    throw new Error("Invalid rate-limit configuration");
  }

  const now = Date.now();
  const windowStartMs = Math.floor(now / windowMs) * windowMs;
  const windowStart = new Date(windowStartMs);
  const expiresAt = new Date(windowStartMs + windowMs);
  const id = `${userId}:${operation}:${windowStartMs}`;
  const prisma = getPrisma();
  const bucket = await prisma.apiRateLimitBucket.upsert({
    where: { id },
    create: { id, userId, operation, windowStart, expiresAt },
    update: { count: { increment: 1 } },
    select: { count: true },
  });

  if (bucket.count === 1) {
    await prisma.apiRateLimitBucket.deleteMany({
      where: { expiresAt: { lt: new Date(windowStartMs - windowMs) } },
    });
  }

  if (bucket.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((expiresAt.getTime() - now) / 1000),
      ),
    };
  }

  return { allowed: true, remaining: limit - bucket.count };
}
