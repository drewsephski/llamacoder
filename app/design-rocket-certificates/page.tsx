import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";

import { DesignRocketCertificatesPage } from "@/components/design-rocket-certificates-page";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Design Rocket Certificates — Lead AI transformation",
  description:
    "Learn to lead AI transformation across your organization with Design Rocket Certificates.",
};

export default function DesignRocketCertificatesRoute() {
  return (
    <DesignRocketCertificatesPage
      fontClassName={`${inter.className} ${instrumentSerif.className}`}
    />
  );
}
