import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SkyElitePage } from "@/components/skyelite-page";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkyElite — Premium Private Jets",
  description: "Your dedication deserves recognition.",
};

export default function SkyEliteRoute() {
  return <SkyElitePage fontClassName={inter.className} />;
}
