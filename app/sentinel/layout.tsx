import type { Metadata } from "next";
import { Sora } from "next/font/google";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sentinel-sora",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sentinel AI — Security, implemented correctly",
  description:
    "Enterprise security systems built in days with zero-trust architecture and AI-powered surveillance.",
};

export default function SentinelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={`${sora.variable} min-h-full`}>{children}</div>;
}
