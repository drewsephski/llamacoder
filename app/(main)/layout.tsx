import type { Metadata } from "next";
import Providers from "@/app/(main)/providers";
import { Toaster } from "sonner";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";

import "./homepage.css";

const appBaseUrl = SITE_URL;
const appHomeTitle = "Verified AI React Prototype Builder";
const appHomeSocialTitle = `${appHomeTitle} | Squid Agent`;
const appHomeDescription =
  "Turn prompts, screenshots, or live sites into React prototypes with revision-specific source, runtime, and export evidence.";

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
    "AI prototype builder",
    "React prototype generator",
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
    "AI app source audit",
    "build passport",
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
        alt: "Squid Agent AI React prototype builder workflow",
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
