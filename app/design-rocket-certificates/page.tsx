import { Instrument_Serif, Inter } from "next/font/google";

import { DesignRocketCertificatesPage } from "@/components/design-rocket-certificates-page";
import { publicShowcaseMetadata } from "@/lib/public-pages";

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

export const metadata = publicShowcaseMetadata("/design-rocket-certificates");

export default function DesignRocketCertificatesRoute() {
  return (
    <DesignRocketCertificatesPage
      fontClassName={`${inter.className} ${instrumentSerif.className}`}
    />
  );
}
