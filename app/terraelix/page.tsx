import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";

import TerraElixPage from "@/components/terraelix-page";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-terra-dm-sans",
  display: "swap",
  weight: ["400", "500"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-terra-inter",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "TerraElix — The power of nature in every capsule",
  description:
    "Plant-based supplements for daily balance, clean energy, and a more grounded wellness ritual.",
};

export default function TerraElixRoute() {
  return (
    <TerraElixPage fontClassName={`${dmSans.variable} ${inter.variable}`} />
  );
}
