import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getPrisma } from "./prisma";

const getBaseUrl = () => {
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }
  // Vercel production deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Vercel production custom domain
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  // Default to localhost
  return "http://localhost:3000";
};

export const auth = betterAuth({
  database: prismaAdapter(getPrisma(), {
    provider: "postgresql",
  }),
  baseURL: getBaseUrl(),
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
