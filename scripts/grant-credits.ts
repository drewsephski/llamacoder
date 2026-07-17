import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

type CliOptions = {
  amount?: number;
  email?: string;
  reason?: string;
  userId?: string;
};

function readOption(args: string[], name: string) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function parseOptions(args: string[]): CliOptions {
  const rawAmount = readOption(args, "--amount");
  const amount = rawAmount ? Number(rawAmount) : undefined;

  return {
    amount,
    email: readOption(args, "--email")?.trim().toLowerCase(),
    reason: readOption(args, "--reason")?.trim(),
    userId: readOption(args, "--user-id")?.trim(),
  };
}

function validateOptions(options: CliOptions) {
  if (Boolean(options.email) === Boolean(options.userId)) {
    throw new Error("Provide exactly one of --email or --user-id.");
  }
  if (!Number.isSafeInteger(options.amount) || (options.amount ?? 0) <= 0) {
    throw new Error("--amount must be a positive whole number.");
  }
  if (!options.reason) {
    throw new Error("--reason is required for the credit audit trail.");
  }
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  validateOptions(options);

  const [{ addCredits }, { getPrisma }] = await Promise.all([
    import("../lib/billing/credits"),
    import("../lib/prisma"),
  ]);
  const prisma = getPrisma();

  try {
    const user = await prisma.user.findUnique({
      where: options.email
        ? { email: options.email }
        : { id: options.userId as string },
      select: { id: true },
    });
    if (!user) throw new Error("User not found.");

    const result = await addCredits({
      userId: user.id,
      amount: options.amount as number,
      type: "bonus",
      description: options.reason as string,
    });
    if (!result.success) {
      throw new Error(result.error ?? "Credit grant failed.");
    }

    console.log(
      `Granted ${options.amount} credits. New balance: ${result.newBalance}.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Credit grant failed.",
  );
  process.exitCode = 1;
});
