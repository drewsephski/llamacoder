import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft } from "lucide-react";

import {
  MarketingFooter,
  MarketingHeader,
} from "@/components/marketing-chrome";
import { resolvePublicArtifact } from "@/features/public-artifacts/server/access";
import { BuildPassportView } from "@/features/verification/components/build-passport-view";
import { PassportDownloadButton } from "@/features/verification/components/passport-download-button";
import { getBuildPassportForMessage } from "@/features/verification/server/build-passport";

export const metadata: Metadata = {
  title: "Build Passport",
  description:
    "Revision-specific source, runtime, export, and service evidence for a Squid prototype.",
  robots: { index: false, follow: false },
};

export default async function BuildPassportPage({
  params,
}: {
  params: Promise<{ messageId: string }>;
}) {
  const { messageId: reference } = await params;
  const artifact = await getArtifact(reference);
  if (!artifact) notFound();
  const passport = await getBuildPassportForMessage(artifact.message);
  const encodedReference = encodeURIComponent(reference);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <MarketingHeader />
      <div className="border-b border-border bg-muted/20">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <Link
            href={`/share/v2/${encodedReference}`}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to prototype
          </Link>
          <PassportDownloadButton
            href={`/api/passports/${encodedReference}`}
            messageId={artifact.message.id}
            status={passport.overallStatus}
          />
        </div>
      </div>
      <main>
        <BuildPassportView passport={passport} />
      </main>
      <MarketingFooter />
    </div>
  );
}

const getArtifact = cache(resolvePublicArtifact);
