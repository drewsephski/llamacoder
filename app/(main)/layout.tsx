import type { Metadata } from "next";
import Providers from "@/app/(main)/providers";
import { Toaster } from "sonner";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";

import "./homepage.css";

const appBaseUrl = SITE_URL;
const appHomeTitle = "AI React App Builder with Exportable Code";
const appHomeSocialTitle = `${appHomeTitle} | Squid Agent`;
const appHomeDescription =
  "Build production-ready React apps from prompts, screenshots, or live sites. Squid Agent researches, plans, verifies, restores, and exports code you own.";

export const metadata: Metadata = {
  title: {
    default: appHomeTitle,
    template: "%s | Squid Agent",
  },
  description: appHomeDescription,
  alternates: { canonical: "/" },
  keywords: [
    "AI app builder",
    "AI React app builder",
    "Squid Agent",
    "React app builder",
    "React code generator",
    "screenshot to React",
    "website to React",
    "export React app from AI",
    "research first coding",
    "plan mode",
    "AI design system",
    "preview verification",
    "exportable React code",
  ],
  openGraph: {
    type: "website",
    url: appBaseUrl,
    title: appHomeSocialTitle,
    description: appHomeDescription,
    images: [
      {
        url: `${appBaseUrl}${DEFAULT_OG_IMAGE}`,
        width: 1200,
        height: 630,
        alt: "Squid Agent AI React app builder workflow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: appHomeSocialTitle,
    description: appHomeDescription,
    images: [`${appBaseUrl}${DEFAULT_OG_IMAGE}`],
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
