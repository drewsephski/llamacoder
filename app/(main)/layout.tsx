import type { Metadata } from "next";
import Providers from "@/app/(main)/providers";
import { Toaster } from "sonner";

const appBaseUrl = "https://squidagent.app";
const appHomeTitle = "Squid Agent | AI App Builder for Exportable React Apps";
const appHomeDescription =
  "Research live sources, plan your build, generate exportable React apps, verify quality, recover versions, connect APIs, and keep code ownership and checkpoints clear.";

export const metadata: Metadata = {
  title: {
    absolute: appHomeTitle,
  },
  description: appHomeDescription,
  alternates: { canonical: "/" },
  keywords: [
    "AI app builder",
    "Squid Agent",
    "React app builder",
    "React code generator",
    "React app export",
    "React code exporter",
    "AI website generator",
    "research first coding",
    "plan mode",
    "AI design system",
    "preview verification",
    "exportable React code",
  ],
  openGraph: {
    type: "website",
    url: appBaseUrl,
    title: appHomeTitle,
    description: appHomeDescription,
    images: [
      {
        url: `${appBaseUrl}/api/og?card=site&v=3`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: appHomeTitle,
    description: appHomeDescription,
    images: [`${appBaseUrl}/api/og?card=site&v=3`],
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <div className="flex min-h-full flex-1 flex-col bg-background text-foreground antialiased">
        {children}

        <Toaster />
      </div>
    </Providers>
  );
}
