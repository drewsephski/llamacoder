import type { Metadata, Viewport } from "next";
import PlausibleProvider from "next-plausible";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const title = "Squid Agent - Research, Build, Verify, and Ship React Apps";
const description =
  "Research the live web, approve a plan, build and verify React apps, restore versions, connect APIs, deploy to Vercel, and export code you own.";
const url = "https://squidagent.app/";
const ogimage = "https://squidagent.app/api/og?card=site&v=2";
const sitename = "Squid Agent";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default: title,
    template: "%s | Squid Agent",
  },
  description,
  applicationName: "Squid Agent",
  alternates: {
    canonical: url,
  },
  keywords: [
    "AI app builder",
    "exportable React code",
    "React app generator",
    "AI React builder",
    "AI web research",
    "AI app planning",
    "React app plan mode",
    "transparent AI credits",
    "Lovable alternative",
    "Bolt alternative",
    "v0 alternative",
  ],
  icons: {
    icon: [{ url: "/squidagent-logo.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full ${dmSans.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <PlausibleProvider domain="squidagent.app" />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
