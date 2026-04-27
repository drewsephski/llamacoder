import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getPrisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(getPrisma(), {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    modelName: "Session",
    storeSessionInDatabase: true,
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    modelName: "User",
    additionalFields: {
      name: {
        type: "string",
        required: false,
      },
    },
  },
  account: {
    modelName: "Account",
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
