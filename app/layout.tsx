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

let title = "Squid Coder – AI Code Generator";
let description = "Generate your next app with advanced AI models";
let url = "https://squidcoder.io/";
let ogimage = "https://squidcoder.io/og-image.png";
let sitename = "squidcoder.io";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: "/favicon.ico",
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
    <html lang="en" className={`h-full ${dmSans.variable}`}>
      <head>
        <PlausibleProvider domain="squidcoder.io" />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
