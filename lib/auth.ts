import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getPrisma } from "./prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const STARTER_CREDITS = 5;

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
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async (data, request) => {
      console.log("[sendResetPassword] Starting email send to:", data.user.email);
      console.log("[sendResetPassword] Token:", data.token);
      console.log("[sendResetPassword] RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);
      
      const resetUrl = `${getBaseUrl()}/reset-password?token=${data.token}`;
      console.log("[sendResetPassword] Reset URL:", resetUrl);

      try {
        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "Squid Coder <onboarding@resend.dev>",
          to: data.user.email,
          subject: "Reset your password",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #111; font-size: 24px; margin-bottom: 16px;">Reset your password</h1>
              <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                Click the button below to reset your password for Squid Coder.
              </p>
              <a href="${resetUrl}" 
                 style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; font-size: 16px;">
                Reset Password
              </a>
              <p style="color: #777; font-size: 14px; margin-top: 24px;">
                Or copy and paste this URL: ${resetUrl}
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 32px;">
                This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
              </p>
            </div>
          `,
        });
        console.log("[sendResetPassword] Email sent successfully:", result);
      } catch (error) {
        console.error("[sendResetPassword] Failed to send email:", error);
        throw error;
      }
    },
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
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const prisma = getPrisma();
          try {
            await prisma.$transaction([
              prisma.user.update({
                where: { id: user.id },
                data: { credits: STARTER_CREDITS },
              }),
              prisma.creditHistory.create({
                data: {
                  userId: user.id,
                  amount: STARTER_CREDITS,
                  type: "subscription",
                  description: "Welcome bonus - starter credits",
                },
              }),
            ]);
          } catch (error) {
            console.error("[databaseHooks] Failed to set initial credits:", error);
            // Don't throw - allow user creation to succeed even if credits fail
          }
        },
      },
    },
  },
});
