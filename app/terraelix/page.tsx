import { DM_Sans, Inter } from "next/font/google";

import TerraElixPage from "@/components/terraelix-page";
import { publicShowcaseMetadata } from "@/lib/public-pages";

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

export const metadata = publicShowcaseMetadata("/terraelix");

export default function TerraElixRoute() {
  return (
    <TerraElixPage fontClassName={`${dmSans.variable} ${inter.variable}`} />
  );
}
