import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { captcha } from "better-auth/plugins";
import { getPrisma } from "./prisma";
import { Resend } from "resend";
import { grantStarterCredits } from "@/features/auth/server/starter-credits";

const resend = new Resend(process.env.RESEND_API_KEY);

const normalizeUrl = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const withProtocol = /^(https?:)?\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    return `${url.protocol}//${url.host}`;
  } catch {
    return trimmed;
  }
};

function getBaseUrl() {
  const explicitBaseUrl = normalizeUrl(process.env.BETTER_AUTH_URL);
  if (explicitBaseUrl) {
    return explicitBaseUrl;
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
}

const getTrustedOrigins = () => {
  const envTrustedOrigins = [
    process.env.BETTER_AUTH_TRUSTED_ORIGINS,
    process.env.NEXT_PUBLIC_BETTER_AUTH_TRUSTED_ORIGINS,
  ]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) =>
      value
        .split(",")
        .map((origin) => normalizeUrl(origin.trim()) || origin.trim())
        .filter(Boolean),
    );

  return [...new Set(envTrustedOrigins)];
};

const resolvedBaseURL = getBaseUrl();
const resolvedTrustedOrigins = getTrustedOrigins();

if (process.env.NODE_ENV === "production") {
  console.info(
    `[better-auth] resolved config: baseURL=${resolvedBaseURL}, trustedOrigins=${resolvedTrustedOrigins.join(",") || "(none)"}`,
  );
}

export const auth = betterAuth({
  database: prismaAdapter(getPrisma(), {
    provider: "postgresql",
  }),
  baseURL: resolvedBaseURL,
  trustedOrigins: resolvedTrustedOrigins,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: Boolean(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
      ),
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async (data) => {
      const resetUrl = `${getBaseUrl()}/reset-password?token=${data.token}`;

      try {
        const result = await resend.emails.send({
          from:
            process.env.RESEND_FROM_EMAIL ||
            "Squid Agent <onboarding@resend.dev>",
          to: data.user.email,
          subject: "Reset your password",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #111; font-size: 24px; margin-bottom: 16px;">Reset your password</h1>
              <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                Click the button below to reset your password for Squid Agent.
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
        if (result.error) throw new Error(result.error.message);
      } catch (error) {
        console.error("[sendResetPassword] Failed to send email:", error);
        throw error;
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      if (
        process.env.NODE_ENV !== "production" &&
        process.env.E2E_SKIP_EMAIL_DELIVERY === "1"
      ) {
        return;
      }
      const result = await resend.emails.send({
        from:
          process.env.RESEND_FROM_EMAIL ||
          "Squid Agent <onboarding@resend.dev>",
        to: user.email,
        subject: "Verify your Squid Agent email",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="font-size: 24px; margin-bottom: 16px;">Verify your email</h1>
            <p style="color: #555; line-height: 1.5; margin-bottom: 24px;">
              Verify this address to activate your account and receive five starter credits.
            </p>
            <a href="${url}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Verify email
            </a>
            <p style="color: #777; font-size: 14px; margin-top: 24px;">This link expires in one hour.</p>
          </div>
        `,
      });
      if (result.error) throw new Error(result.error.message);
    },
    afterEmailVerification: async (user) => {
      await grantStarterCredits(user.id);
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
          if (!user.emailVerified) return;
          try {
            await grantStarterCredits(user.id);
          } catch (error) {
            console.error(
              "[databaseHooks] Failed to set initial credits:",
              error,
            );
            // Don't throw - allow user creation to succeed even if credits fail
          }
        },
      },
    },
  },
  plugins: process.env.TURNSTILE_SECRET_KEY
    ? [
        captcha({
          provider: "cloudflare-turnstile",
          secretKey: process.env.TURNSTILE_SECRET_KEY,
          endpoints: ["/sign-up/email"],
        }),
      ]
    : [],
});
