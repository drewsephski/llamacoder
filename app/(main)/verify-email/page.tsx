import Link from "next/link";
import { getSafeCallbackUrl } from "@/lib/safe-redirect";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata = createNoIndexMetadata({
  title: "Verify Your Email",
  description:
    "Verify your email address to activate your Squid Agent account.",
  path: "/verify-email",
});

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; callbackUrl?: string }>;
}) {
  const { email, callbackUrl } = await searchParams;
  const safeCallbackUrl = getSafeCallbackUrl(callbackUrl, "/");
  const signInHref = `/sign-in?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-primary">One last step</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Verify your email
        </h1>
        <p className="mt-4 text-muted-foreground">
          We sent a one-hour verification link
          {email ? ` to ${email}` : " to your inbox"}. Your five starter credits
          are added only after verification.
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          After verifying, you can close this page or continue to sign in.
        </p>
        <Link
          href={signInHref}
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Continue to sign in
        </Link>
      </section>
    </main>
  );
}
