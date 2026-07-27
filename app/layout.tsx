import type { Metadata, Viewport } from "next";
import PlausibleProvider from "next-plausible";
import { DM_Sans } from "next/font/google";

import { ForSaleBanner } from "@/features/for-sale/components/for-sale-banner";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import { sitewideStructuredData } from "@/lib/site-structured-data";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const title = "Squid Agent: AI React App Builder";
const description =
  "Research the live web, approve a plan, build and verify React apps, restore versions, connect APIs, deploy to Vercel, and export code you own.";
const url = `${SITE_URL}/`;
const ogimage = `${SITE_URL}${DEFAULT_OG_IMAGE}`;
const browserIconPng192 = "/squidagent-logo-192.png";
const browserIconPng512 = "/squidagent-logo-512.png";

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
  applicationName: SITE_NAME,
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/squidagent-logo.svg", type: "image/svg+xml", sizes: "any" },
      { url: browserIconPng192, type: "image/png", sizes: "192x192" },
      { url: browserIconPng512, type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    images: [
      {
        url: ogimage,
        width: 1200,
        height: 630,
        alt: DEFAULT_OG_IMAGE_ALT,
        type: "image/png",
      },
    ],
    title,
    description,
    url: url,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: ogimage,
        width: 1200,
        height: 630,
        alt: DEFAULT_OG_IMAGE_ALT,
        type: "image/png",
      },
    ],
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
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="O4gKckTzoHrR2FUZoZUz8w"
          async
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(sitewideStructuredData).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground antialiased">
        {children}
        <ForSaleBanner />
      </body>
    </html>
  );
}
