import { PrismaClient } from "@prisma/client";

const INTERACTIVE_TRANSACTION_MAX_WAIT_MS = 10_000;
const INTERACTIVE_TRANSACTION_TIMEOUT_MS = 30_000;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    transactionOptions: {
      maxWait: INTERACTIVE_TRANSACTION_MAX_WAIT_MS,
      timeout: INTERACTIVE_TRANSACTION_TIMEOUT_MS,
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const getPrisma = () => prisma;
