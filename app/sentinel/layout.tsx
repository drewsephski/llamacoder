import { Sora } from "next/font/google";
import { publicShowcaseMetadata } from "@/lib/public-pages";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sentinel-sora",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = publicShowcaseMetadata("/sentinel");

export default function SentinelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={`${sora.variable} min-h-full`}>{children}</div>;
}
